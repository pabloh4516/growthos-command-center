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

  // Load user profile and organizations
  async function loadUserData(userId: string) {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Load organizations
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id, name, logo_url, timezone, currency, industry
          )
        `)
        .eq('user_id', userId);

      if (memberships && memberships.length > 0) {
        const orgs = memberships.map((m: any) => ({
          organization_id: m.organization_id,
          role: m.role,
          organization: m.organizations,
        }));
        setOrganizations(orgs);

        // Restore saved org or use first
        const savedOrgId = localStorage.getItem('growthOS_current_org');
        const savedOrg = orgs.find((o: any) => o.organization_id === savedOrgId);
        const activeOrg = savedOrg || orgs[0];

        setCurrentOrg(activeOrg.organization);
        setCurrentRole(activeOrg.role);
        localStorage.setItem('growthOS_current_org', activeOrg.organization_id);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadUserData(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
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
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string, name: string, orgName: string) {
    // 1. Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error || !data.user) return { error: error as Error | null };

    // 2. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName })
      .select()
      .single();

    if (orgError || !org) return { error: orgError as Error | null };

    // 3. Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: data.user.id,
        role: 'owner',
        accepted_at: new Date().toISOString(),
      });

    if (memberError) return { error: memberError as Error | null };

    // 4. Create AI settings for org
    await supabase
      .from('ai_settings')
      .insert({ organization_id: org.id });

    // 5. Create Utmify config for org
    await supabase
      .from('utmify_config')
      .insert({
        organization_id: org.id,
        webhook_url_generated: `${window.location.origin}/api/utmify/webhook?org=${org.id}`,
      });

    return { error: null };
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
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
        user,
        session,
        profile,
        organizations,
        currentOrg,
        currentRole,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
