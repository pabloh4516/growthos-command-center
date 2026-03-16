import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  timezone: string;
  currency: string;
  industry: string | null;
}

interface OrganizationMember {
  organization_id: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  organization: Organization;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organizations: OrganizationMember[];
  currentOrg: Organization | null;
  currentRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, orgName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  switchOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationMember[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserData(userId: string) {
    try {
      // Load profile — non-blocking
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('Could not load profile:', profileError.message);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Load organizations — non-blocking
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id, name, logo_url, timezone, currency, industry
          )
        `)
        .eq('user_id', userId);

      if (memberError) {
        console.warn('Could not load organizations:', memberError.message);
        return; // Don't block — user can still use the app
      }

      if (memberships && memberships.length > 0) {
        const orgs = memberships.map((m: any) => ({
          organization_id: m.organization_id,
          role: m.role,
          organization: m.organizations,
        }));
        setOrganizations(orgs);

        const savedOrgId = localStorage.getItem('growthOS_current_org');
        const savedOrg = orgs.find((o: any) => o.organization_id === savedOrgId);
        const activeOrg = savedOrg || orgs[0];

        if (activeOrg?.organization) {
          setCurrentOrg(activeOrg.organization);
          setCurrentRole(activeOrg.role);
          localStorage.setItem('growthOS_current_org', activeOrg.organization_id);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      // Never block the app — loading will be set to false regardless
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          await loadUserData(s.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          await loadUserData(s.user.id);
        } else {
          setProfile(null);
          setOrganizations([]);
          setCurrentOrg(null);
          setCurrentRole(null);
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string, name: string, orgName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error || !data.user) return { error: error as Error | null };

    // Create organization — use try/catch to not block signup
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: orgName } as any)
        .select()
        .single();

      if (orgError || !org) {
        console.error('Failed to create org:', orgError);
        return { error: null }; // User created, org failed — they can retry
      }

      await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: data.user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        } as any);

      // Non-critical: AI settings and Utmify config
      await supabase.from('ai_settings').insert({ organization_id: org.id } as any).catch(() => {});
      await supabase.from('utmify_config').insert({
        organization_id: org.id,
        webhook_url_generated: `${window.location.origin}/api/utmify/webhook?org=${org.id}`,
      } as any).catch(() => {});

    } catch (err) {
      console.error('Signup org creation error:', err);
    }

    return { error: null };
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem('growthOS_current_org');
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  }

  function switchOrganization(orgId: string) {
    const org = organizations.find((o) => o.organization_id === orgId);
    if (org) {
      setCurrentOrg(org.organization);
      setCurrentRole(org.role);
      localStorage.setItem('growthOS_current_org', orgId);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, organizations, currentOrg, currentRole, loading,
        signIn, signUp, signInWithGoogle, signOut, resetPassword, switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
