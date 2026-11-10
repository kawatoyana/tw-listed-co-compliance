import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ComplianceItem } from '../types/compliance';

interface ComplianceCalendarProps {
  items: ComplianceItem[];
  onSelectItem: (item: ComplianceItem) => void;
}

export const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({ items, onSelectItem }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const currentM = new Date().getMonth() + 1;
    return currentM;
  });

  const [activeDayFilter, setActiveDayFilter] = useState<number | string | 'ALL'>('ALL');

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Key monthly milestone badges
  const monthHighlights: Record<number, string> = {
    1: '年度開局：董監進修、上市年費、Q4資金季報',
    2: '年度內稽計畫執行情形申報',
    3: '★ 3/15百億財報、3/31年度財報/內控聲明/三書表',
    4: '非主管全時員工薪資資訊與福利措施',
    5: '★ 5/15 第一季財務報告(Q1)、內控缺失追蹤',
    6: '企業環境、社會及公司治理(ESG)資訊揭露',
    7: '法人董監及持股10%以上法人股東資訊',
    8: '★ 8/14 第二季財務報告(Q2)、8/31永續報告書',
    9: '例行月度申報與自願性營收自結',
    10: 'Q3資金運用季報、董監持股質借申報',
    11: '★ 11/14 第三季財務報告(Q3)',
    12: '12/31 次一年度內部稽核計畫董事會通過申報',
  };

  // Filter items applicable to selected month
  const monthlyItems = items.filter(item => {
    if (!item.regularMonth) return false;
    return item.regularMonth.includes(selectedMonth);
  });

  // Filter by active day
  const displayedItems = monthlyItems.filter(item => {
    if (activeDayFilter === 'ALL') return true;
    return item.regularDay === activeDayFilter;
  });

  // Available days in this month
  const availableDays = Array.from(new Set(monthlyItems.map(i => i.regularDay).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Month Navigator Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              年度定期申報時程行事曆 (1 月 ~ 12 月)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            目前檢視：民國 115 年 (2026) {selectedMonth} 月份
          </span>
        </div>

        {/* 12 Months segmented buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {months.map(m => {
            const isSelected = selectedMonth === m;
            const isCurrentMonth = new Date().getMonth() + 1 === m;
            const isQuarterMonth = [3, 5, 8, 11].includes(m);
            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setActiveDayFilter('ALL');
                }}
                className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCurrentMonth
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{m} 月</span>
                {isCurrentMonth ? (
                  <span className={`block text-[9px] font-mono leading-none mt-0.5 ${isSelected ? 'text-blue-100 font-bold' : 'text-blue-700 font-bold'}`}>
                    ★ 本月
                  </span>
                ) : isQuarterMonth ? (
                  <span className={`block text-[9px] font-mono leading-none mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600 font-bold'}`}>
                    財報月
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Month milestone note */}
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">{selectedMonth} 月重點提要：</span>
          <span>{monthHighlights[selectedMonth] || '依例辦理各項月度定期資訊申報'}</span>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">申報基準日篩選：</span>
        <button
          onClick={() => setActiveDayFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
            activeDayFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          全月份全部項目 ({monthlyItems.length})
        </button>

        {availableDays.map(day => {
          const count = monthlyItems.filter(i => i.regularDay === day).length;
          const isSelected = activeDayFilter === day;
          const dayLabel = typeof day === 'number' ? `每月 ${day} 日` : String(day);
          return (
            <button
              key={String(day)}
              onClick={() => setActiveDayFilter(day as number | string)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {dayLabel} <span className="text-[11px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline items card list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedItems.map((item) => {
          const isHighRisk = item.keyRiskLevel === 'high';
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                      {item.timing}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.category.replace('定期辦理-', '')}
                    </span>
                  </div>

                  {isHighRisk && (
                    <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      <AlertCircle className="w-3 h-3" />
                      違規重罰點
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                  {item.itemTitle}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.contentSummary}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[220px] font-mono text-[11px]">
                  {item.mopsPath.split('/')[1] || item.mopsPath}
                </span>
                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium shrink-0">
                  詳情 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
