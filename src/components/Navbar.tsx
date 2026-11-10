import React from 'react';
import { ShieldCheck, FileSpreadsheet, Calendar, Calculator, BookOpen, CheckSquare, Download, Bell, BellRing, Sparkles, FileText, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentTab: 'table' | 'calendar' | 'calculator' | 'checklist' | 'guide';
  onSelectTab: (tab: 'table' | 'calendar' | 'calculator' | 'checklist' | 'guide') => void;
  onExport: () => void;
  onOpenReminderSettings: () => void;
  onSelectCurrentMonth?: () => void;
  upcomingAlertsCount: number;
  completedCount: number;
  totalTaskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onExport,
  onOpenReminderSettings,
  onSelectCurrentMonth,
  upcomingAlertsCount,
  completedCount,
  totalTaskCount,
}) => {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1 (Top Row): Brand Title on Left + Actions on Right */}
        <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  上市有價證券發行人應辦事項總覽
                </span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  115年4月版
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono tracking-tight block">
                臺灣證券交易所 · 申報時程與法規遵循指引系統
              </span>
            </div>
          </div>

          {/* Action Zone: Only ONE Push Reminder Settings button + PDF + MOPS + CSV */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* The Single Retained Push Reminder Button */}
            <button
              onClick={onOpenReminderSettings}
              title="推播提醒設置（自訂 3 天、7 天、30 天前到期預警）"
              className="relative flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shadow-2xs"
            >
              {upcomingAlertsCount > 0 ? (
                <BellRing className="w-4 h-4 text-blue-600 animate-pulse" />
              ) : (
                <Bell className="w-4 h-4 text-slate-600" />
              )}
              <span className="hidden sm:inline">推播提醒設置</span>
              {upcomingAlertsCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {upcomingAlertsCount > 99 ? '99+' : upcomingAlertsCount}
                </span>
              )}
            </button>

            {/* Official PDF Download Link */}
            <a
              href="/assets/aistudio/_______11504_____1cacbb13.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
              title="下載證交所官方 143 頁完整指引 PDF"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>官方 PDF</span>
            </a>

            {/* MOPS Link */}
            <a
              href="https://mops.twse.com.tw"
              target="_blank"
              rel="noopener noreferrer"
              title="前往公開資訊觀測站 (MOPS) 申報端"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>MOPS 觀測站</span>
            </a>

            {/* CSV Export Button */}
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出申報總覽</span>
            </button>
          </div>
        </div>

        {/* Tier 2 (Bottom Row): The 5 Interactive Modules moved down into their own distinct row */}
        <div className="flex items-center justify-between overflow-x-auto py-2 text-sm gap-2">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'table'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              業務事項總覽
            </button>

            <button
              onClick={() => onSelectTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'calendar'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              定期申報日曆
            </button>

            <button
              onClick={() => onSelectTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'calculator'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              重大事件時程推算
            </button>

            <button
              onClick={() => onSelectTab('checklist')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'checklist'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              待辦申報清單
              {totalTaskCount > 0 && (
                <span className="text-xs font-mono ml-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  {completedCount}/{totalTaskCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                currentTab === 'guide'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              法令規範與罰則
            </button>
          </nav>

          {/* Quick link to current month filing items */}
          {onSelectCurrentMonth && (
            <button
              onClick={onSelectCurrentMonth}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>當月申報項目 ({currentMonth}月)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
