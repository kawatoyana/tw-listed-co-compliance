import React, { useState } from 'react';
import { Calculator, Calendar, AlertOctagon, CheckCircle, PlusCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { EVENT_PRESETS } from '../data/complianceItems';
import { EventPreset, TaskStatus } from '../types/compliance';

interface DeadlineCalculatorProps {
  onAddCustomTasks: (tasks: { title: string; timing: string; deadlineDate: string; mopsPath?: string; legalRef: string }[]) => void;
}

export const DeadlineCalculator: React.FC<DeadlineCalculatorProps> = ({ onAddCustomTasks }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('agm_preset');
  
  // Default target date: 60 days in the future
  const [targetDateStr, setTargetDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 65);
    return d.toISOString().split('T')[0];
  });

  const [copied, setCopied] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const selectedPreset: EventPreset = EVENT_PRESETS.find(p => p.id === selectedPresetId) || EVENT_PRESETS[0];

  // Business day calculation helper
  const addBusinessDays = (startDate: Date, businessDays: number): Date => {
    const cur = new Date(startDate.getTime());
    let added = 0;
    const direction = businessDays >= 0 ? 1 : -1;
    const absDays = Math.abs(businessDays);

    while (added < absDays) {
      cur.setDate(cur.getDate() + direction);
      const dayOfWeek = cur.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return cur;
  };

  const calculateStepDate = (baseDateStr: string, offsetDays: number, unit: 'calendar_days' | 'business_days'): Date => {
    const base = new Date(baseDateStr);
    if (unit === 'calendar_days') {
      const res = new Date(base.getTime());
      res.setDate(res.getDate() + offsetDays);
      return res;
    } else {
      return addBusinessDays(base, offsetDays);
    }
  };

  const calculatedSteps = selectedPreset.steps.map((step) => {
    const dateObj = calculateStepDate(targetDateStr, step.offsetDays, step.unit);
    const dateFormatted = dateObj.toISOString().split('T')[0];
    const dayOfWeekStr = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
    return {
      ...step,
      calculatedDate: dateFormatted,
      dayOfWeek: `週${dayOfWeekStr}`,
    };
  });

  const handleCopyTimeline = () => {
    const lines = [
      `【${selectedPreset.name}】法定申報時程試算 (基準日: ${targetDateStr})`,
      '--------------------------------------------------',
      ...calculatedSteps.map(s => 
        `[${s.calculatedDate} (${s.dayOfWeek})] ${s.title}\n - 法定時限: ${s.timingDescription}\n - 執行要點: ${s.actionDetail}\n - 法令依據: ${s.legalReference}\n`
      )
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAllToTasks = () => {
    const tasksToAdd = calculatedSteps.map(s => ({
      title: `${selectedPreset.name} - ${s.title}`,
      timing: s.timingDescription,
      deadlineDate: s.calculatedDate,
      mopsPath: s.mopsPath,
      legalRef: s.legalReference,
    }));
    onAddCustomTasks(tasksToAdd);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            不定期重大事件 · 法定申報時程智能推算機
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          選擇欲辦理之重大企業決策事件，輸入預計召開日、決議日或生效基準日，系統自動扣除例假日以法定營業日/日曆日推算出各關鍵申報節點。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Preset selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              選擇辦理事件類別
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {EVENT_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {selectedPreset.description}
            </span>
          </div>

          {/* Target date input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              設定事件基準日期 (如：預計股東會開會日、董事會決議日)
            </label>
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              系統將以此日期為錨點，自動前推或後推各項申報時限
            </span>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500 font-mono">
            共推算出 <span className="font-bold text-slate-900 dark:text-white">{calculatedSteps.length}</span> 個法定程序節點
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTimeline}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已複製排程文字' : '複製推算排程'}
            </button>

            <button
              onClick={handleAddAllToTasks}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors shadow-xs"
            >
              {addedSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              {addedSuccess ? '已匯入待辦清單！' : '匯入至我的申報清單'}
            </button>
          </div>
        </div>
      </div>

      {/* Calculated Steps Chronological Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>法定排程里程碑依序展開</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
          {calculatedSteps.map((step, idx) => {
            const isZeroAnchor = step.offsetDays === 0;

            return (
              <div key={idx} className="relative pl-6">
                {/* Node marker */}
                <div 
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                    isZeroAnchor 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                />

                <div className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xs ${
                  isZeroAnchor 
                    ? 'border-blue-300 dark:border-blue-800 ring-1 ring-blue-500/20' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                        {step.calculatedDate} ({step.dayOfWeek})
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        [{step.timingDescription}]
                      </span>
                    </div>

                    {step.riskAlert && (
                      <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                        {step.riskAlert}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                    {step.actionDetail}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                    <span className="font-mono">
                      依據：{step.legalReference}
                    </span>
                    {step.mopsPath && (
                      <span className="font-mono text-blue-600 dark:text-blue-400 truncate max-w-xs">
                        路徑：{step.mopsPath}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
