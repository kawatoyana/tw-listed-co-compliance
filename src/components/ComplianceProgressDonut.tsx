import React, { useState } from 'react';
import { PieChart, CheckCircle2, Clock, CircleDashed, AlertCircle, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

interface ComplianceProgressDonutProps {
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  exemptCount?: number;
  selectedStatus?: string; // 'ALL' | 'completed' | 'in_progress' | 'pending' | 'exempt'
  onSelectStatus?: (status: string) => void;
  onNavigateToChecklist?: () => void;
}

export const ComplianceProgressDonut: React.FC<ComplianceProgressDonutProps> = ({
  totalCount,
  completedCount,
  inProgressCount,
  pendingCount,
  exemptCount = 0,
  selectedStatus = 'ALL',
  onSelectStatus,
  onNavigateToChecklist,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const safeTotal = totalCount > 0 ? totalCount : 1;

  // Percentage calculations
  const completedPercent = Math.round((completedCount / safeTotal) * 100);
  const inProgressPercent = Math.round((inProgressCount / safeTotal) * 100);
  const exemptPercent = Math.round((exemptCount / safeTotal) * 100);
  const pendingPercent = Math.max(0, 100 - completedPercent - inProgressPercent - exemptPercent);

  // SVG Geometry constants
  const size = 136;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2; // (136 - 14) / 2 = 61
  const center = size / 2; // 68
  const circumference = 2 * Math.PI * radius; // ~383.27

  // Length calculations for segments
  const cRatio = completedCount / safeTotal;
  const pRatio = inProgressCount / safeTotal;
  const exRatio = exemptCount / safeTotal;
  const pendRatio = Math.max(0, 1 - cRatio - pRatio - exRatio);

  const cLength = circumference * cRatio;
  const pLength = circumference * pRatio;
  const exLength = circumference * exRatio;
  const pendLength = circumference * pendRatio;

  // Segment offsets (anticlockwise stacking from 12 o'clock)
  const cOffset = 0;
  const pOffset = -cLength;
  const exOffset = -(cLength + pLength);
  const pendOffset = -(cLength + pLength + exLength);

  const statusCategories = [
    {
      id: 'completed',
      label: '已完成',
      count: completedCount,
      percent: completedPercent,
      color: '#10b981', // emerald-500
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/80',
      icon: CheckCircle2,
    },
    {
      id: 'in_progress',
      label: '進行中',
      count: inProgressCount,
      percent: inProgressPercent,
      color: '#3b82f6', // blue-500
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/80',
      icon: Clock,
    },
    {
      id: 'pending',
      label: '未開始',
      count: pendingCount,
      percent: pendingPercent,
      color: '#cbd5e1', // slate-300
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      activeRing: 'ring-2 ring-slate-400 bg-slate-100',
      icon: CircleDashed,
    },
  ];

  if (exemptCount > 0) {
    statusCategories.push({
      id: 'exempt',
      label: '免申報',
      count: exemptCount,
      percent: exemptPercent,
      color: '#a855f7', // purple-500
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/80',
      icon: AlertCircle,
    });
  }

  const handleStatusClick = (statusId: string) => {
    if (!onSelectStatus) return;
    if (selectedStatus === statusId) {
      onSelectStatus('ALL');
    } else {
      onSelectStatus(statusId);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all">
      {/* Top Header of the Widget */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>發行人合規申報進度總覽</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                環形統計
              </span>
            </h3>
          </div>
        </div>

        {selectedStatus !== 'ALL' && onSelectStatus && (
          <button
            onClick={() => onSelectStatus('ALL')}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重設狀態篩選</span>
          </button>
        )}
      </div>

      {/* Main Content: Ring Donut on Left + Status Breakdown on Right */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* SVG Circular Progress Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 drop-shadow-2xs"
          >
            {/* Background Base Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segment 3: 未開始 (Pending) */}
            {pendLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={hoveredSegment === 'pending' ? '#94a3b8' : '#cbd5e1'}
                strokeWidth={hoveredSegment === 'pending' ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${pendLength} ${circumference - pendLength}`}
                strokeDashoffset={pendOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('pending')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleStatusClick('pending')}
              />
            )}

            {/* Segment 4: 免申報 (Exempt) if any */}
            {exLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={hoveredSegment === 'exempt' ? '#9333ea' : '#a855f7'}
                strokeWidth={hoveredSegment === 'exempt' ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${exLength} ${circumference - exLength}`}
                strokeDashoffset={exOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('exempt')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleStatusClick('exempt')}
              />
            )}

            {/* Segment 2: 進行中 (In Progress) */}
            {pLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={hoveredSegment === 'in_progress' ? '#2563eb' : '#3b82f6'}
                strokeWidth={hoveredSegment === 'in_progress' ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${pLength} ${circumference - pLength}`}
                strokeDashoffset={pOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('in_progress')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleStatusClick('in_progress')}
              />
            )}

            {/* Segment 1: 已完成 (Completed) */}
            {cLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={hoveredSegment === 'completed' ? '#059669' : '#10b981'}
                strokeWidth={hoveredSegment === 'completed' ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${cLength} ${circumference - cLength}`}
                strokeDashoffset={cOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('completed')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleStatusClick('completed')}
              />
            )}
          </svg>

          {/* Central Percentage & Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 leading-none">
              {completedPercent}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
              合規達成率
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-400 mt-0.5">
              {completedCount} / {totalCount}
            </span>
          </div>
        </div>

        {/* Status Breakdown Legend & Interactive Filter Cards */}
        <div className="flex-1 w-full space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {statusCategories.map(st => {
              const Icon = st.icon;
              const isSelected = selectedStatus === st.id;
              const isHovered = hoveredSegment === st.id;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusClick(st.id)}
                  onMouseEnter={() => setHoveredSegment(st.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  title={`點擊篩選「${st.label}」項目 (${st.count} 項)`}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? st.activeRing
                      : isHovered
                      ? 'border-slate-300 bg-slate-50/70 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: st.color }}
                      />
                      <span>{st.label}</span>
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {st.count}
                      <span className="text-xs font-normal text-slate-500 ml-0.5">項</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {st.percent}%
                    </span>
                  </div>

                  {/* Tiny progress fill bar */}
                  <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${st.percent}%`,
                        backgroundColor: st.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Footnote & Shortcut to Checklist */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span>💡 點擊上方任一狀態卡片，可在下方總覽表即時過濾該狀態項目</span>
            </span>

            {onNavigateToChecklist && (
              <button
                type="button"
                onClick={onNavigateToChecklist}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5 whitespace-nowrap ml-2"
              >
                <span>前往待辦清單勾選</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
