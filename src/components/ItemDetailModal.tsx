import React, { useState } from 'react';
import { X, Copy, Check, AlertOctagon, ExternalLink, BookmarkPlus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ComplianceItem, TaskStatus } from '../types/compliance';

interface ItemDetailModalProps {
  item: ComplianceItem | null;
  onClose: () => void;
  taskStatus?: TaskStatus;
  onUpdateStatus: (itemId: string, status: TaskStatus) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  taskStatus,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(item.mopsPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    '定期辦理-每月': { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    '定期辦理-每季': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    '定期辦理-每年': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    '定期辦理-每日每週': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    '不定期辦理事項': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    '即將上市申報事項': { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  };

  const currentTheme = categoryColorMap[item.category] || categoryColorMap['定期辦理-每月'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 p-5 flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
                {item.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.issuerType}
              </span>
              {item.keyRiskLevel === 'high' && (
                <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  違約/停牌重點稽查項目
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {item.itemTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Statutory Timing / Deadline */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              申報時程與法定截止期限
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {item.timing}
            </div>
          </div>

          {/* MOPS Path & Action */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-blue-500" />
                公開資訊觀測站 (MOPS) 輸入路徑
              </span>
              <button
                onClick={handleCopyPath}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已複製路徑' : '複製路徑'}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-lg overflow-x-auto select-all border border-slate-800">
              {item.mopsPath}
            </div>
          </div>

          {/* Detailed Content & Submission requirements */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              申報內容摘要及申請(報)須檢送資料
            </span>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {item.contentSummary}
            </div>
          </div>

          {/* Compliance Notice & Risk Alert */}
          {item.complianceNotice && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-800 dark:text-amber-400">
                <AlertOctagon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                法規遵循要點與違規防呆提醒
              </div>
              <p className="leading-relaxed pl-6">
                {item.complianceNotice}
              </p>
            </div>
          )}

          {/* Legal references */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              法令依據與證交所函令
            </span>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
              {item.legalBasis}
            </div>
          </div>

          {/* Status checklist trigger in modal */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                申報追蹤狀態：
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                {(['pending', 'in_progress', 'completed', 'exempt'] as TaskStatus[]).map((st) => {
                  const labels: Record<TaskStatus, string> = {
                    pending: '待處理',
                    in_progress: '進行中',
                    completed: '已完成',
                    exempt: '免申報',
                  };
                  const isCurrent = taskStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(item.id, st)}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {labels[st]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
