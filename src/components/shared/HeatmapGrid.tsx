import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeatmapCell {
  row: number;
  col: number;
  value: number;
  tooltip?: string;
}

interface HeatmapGridProps {
  data: HeatmapCell[];
  rowLabels: string[];
  colLabels: string[];
  maxValue?: number;
  className?: string;
}

export function HeatmapGrid({ data, rowLabels, colLabels, maxValue, className }: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  const getCellValue = (row: number, col: number) => data.find(d => d.row === row && d.col === col);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-16" />
              {colLabels.map((label, i) => (
                <th key={i} className="text-[10px] text-muted-foreground font-normal px-0.5 pb-1 text-center">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel, ri) => (
              <tr key={ri}>
                <td className="text-[10px] text-muted-foreground pr-2 text-right whitespace-nowrap">{rowLabel}</td>
                {colLabels.map((_, ci) => {
                  const cell = getCellValue(ri, ci);
                  const intensity = cell ? cell.value / max : 0;
                  return (
                    <td key={ci} className="p-0.5">
                      <div
                        className="w-full aspect-square rounded-sm cursor-pointer transition-opacity hover:opacity-80 min-w-[18px]"
                        style={{ backgroundColor: `hsl(221, 83%, 53%, ${Math.max(intensity * 0.9, 0.05)})` }}
                        onMouseEnter={() => cell && setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hoveredCell && hoveredCell.tooltip && (
        <div className="absolute top-0 right-0 bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg z-10">
          {hoveredCell.tooltip}
        </div>
      )}
    </div>
  );
}
