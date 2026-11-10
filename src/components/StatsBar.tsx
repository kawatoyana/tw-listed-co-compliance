import React from 'react';
import { Calendar, Clock, AlertTriangle, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { ComplianceItem } from '../types/compliance';

interface StatsBarProps {
  items: ComplianceItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ items, selectedCategory, onSelectCategory }) => {
  const currentMonth = new Date().getMonth() + 1;
  const totalCount = items.length;
  
  // Current month items count
  const currentMonthCount = items.filter(i => i.regularMonth && i.regularMonth.includes(currentMonth)).length;
  const monthlyCount = items.filter(i => i.category === '定期辦理-每月').length;
  const quarterlyCount = items.filter(i => i.category === '定期辦理-每季').length;
  const annualCount = items.filter(i => i.category === '定期辦理-每年').length;
  const irregularCount = items.filter(i => i.category === '不定期辦理事項').length;
  const highRiskCount = items.filter(i => i.keyRiskLevel === 'high').length;

  const statCards = [
    {
      id: 'CURRENT_MONTH',
      label: `當月申報項目 (${currentMonth}月)`,
      count: currentMonthCount,
      sub: `${currentMonth}月份法定截止日程`,
      icon: Sparkles,
      borderStyle: 'border-blue-300 bg-blue-50/40',
      activeStyle: 'ring-2 ring-blue-600 bg-blue-100/70 border-blue-400',
      badgeClass: 'text-blue-700',
      categoryTarget: 'CURRENT_MONTH'
    },
    {
      id: 'ALL',
      label: '全部申報項目',
      count: totalCount,
      sub: '彙整證交所最新基準',
      icon: FileText,
      borderStyle: 'border-slate-200',
      activeStyle: 'ring-2 ring-slate-800 bg-slate-100',
      badgeClass: 'text-slate-600',
      categoryTarget: 'ALL'
    },
    {
      id: '定期辦理-每月',
      label: '每月定期申報',
      count: monthlyCount,
      sub: '5日、10日、15日、月底',
      icon: Calendar,
      borderStyle: 'border-cyan-200',
      activeStyle: 'ring-2 ring-cyan-500 bg-cyan-50',
      badgeClass: 'text-cyan-700',
      categoryTarget: '定期辦理-每月'
    },
    {
      id: '定期辦理-每季',
      label: '每季定期申報',
      count: quarterlyCount,
      sub: 'Q1~Q3財報、季後10日',
      icon: Clock,
      borderStyle: 'border-blue-200',
      activeStyle: 'ring-2 ring-blue-500 bg-blue-50',
      badgeClass: 'text-blue-700',
      categoryTarget: '定期辦理-每季'
    },
    {
      id: '定期辦理-每年',
      label: '年度定期申報',
      count: annualCount,
      sub: '年度財報、內控、ESG報告',
      icon: CheckCircle2,
      borderStyle: 'border-emerald-200',
      activeStyle: 'ring-2 ring-emerald-500 bg-emerald-50',
      badgeClass: 'text-emerald-700',
      categoryTarget: '定期辦理-每年'
    },
    {
      id: '不定期辦理事項',
      label: '不定期重大事件',
      count: irregularCount,
      sub: '股東會、重訊、收購',
      icon: AlertTriangle,
      borderStyle: 'border-amber-200',
      activeStyle: 'ring-2 ring-amber-500 bg-amber-50',
      badgeClass: 'text-amber-700',
      categoryTarget: '不定期辦理事項'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {statCards.map(c => {
        const Icon = c.icon;
        const isSelected = selectedCategory === c.categoryTarget;
        return (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.categoryTarget)}
            className={`text-left p-3.5 rounded-xl border bg-white transition-all shadow-2xs ${
              isSelected ? c.activeStyle : c.borderStyle + ' hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {c.label}
              </span>
              <Icon className={`w-4 h-4 ${c.badgeClass}`} />
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-900">
              {c.count}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {c.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
};
