import React, { useState } from 'react';
import { X, Bell, BellRing, Volume2, VolumeX, ShieldAlert, Check, Calendar, Clock, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';
import { ReminderSetting, UpcomingDeadlineAlert } from '../types/reminder';
import { ComplianceCategory, TaskStatus } from '../types/compliance';
import { playNotificationChime, requestBrowserNotificationPermission, dispatchNotification } from '../utils/notificationService';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSetting;
  onSaveSettings: (newSettings: ReminderSetting) => void;
  upcomingAlerts: UpcomingDeadlineAlert[];
  onSelectItemById?: (itemId: string) => void;
  onShowToast: (message: string) => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  upcomingAlerts,
  onSelectItemById,
  onShowToast,
}) => {
  const [localSettings, setLocalSettings] = useState<ReminderSetting>(settings);
  const [permissionStatus, setPermissionStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [testSent, setTestSent] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState<string>(
    localSettings.customAdvanceDays ? String(localSettings.customAdvanceDays) : '1'
  );

  if (!isOpen) return null;

  // Toggle specific advance day (3, 7, 30, etc.)
  const toggleAdvanceDay = (day: number) => {
    setLocalSettings(prev => {
      const exists = prev.advanceDays.includes(day);
      const updated = exists
        ? prev.advanceDays.filter(d => d !== day)
        : [...prev.advanceDays, day].sort((a, b) => a - b);
      return { ...prev, advanceDays: updated };
    });
  };

  // Toggle category
  const toggleCategory = (cat: ComplianceCategory) => {
    setLocalSettings(prev => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  // Request browser permission
  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermissionStatus(res);
    setLocalSettings(prev => ({
      ...prev,
      browserPermission: res as 'default' | 'granted' | 'denied',
    }));
    if (res === 'granted') {
      onShowToast('已成功取得瀏覽器推播通知權限！');
    } else if (res === 'denied') {
      onShowToast('瀏覽器推播權限已被拒絕，系統將自動以應用內警示提醒。');
    }
  };

  // Test notification
  const handleSendTestNotification = () => {
    if (localSettings.soundEnabled) {
      playNotificationChime();
    }

    const nativeSent = dispatchNotification('【上市法規提醒測試】法定申報倒數通知', {
      body: '提醒：距每月 10 日「營業收入與資金貸與」法定申報截止日僅剩 3 天，請及早作業！',
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);

    if (nativeSent) {
      onShowToast('已發送原生瀏覽器推播通知與警示音！');
    } else {
      onShowToast('已發送應用內即時推播測試與提示音效！');
    }
  };

  const handleSave = () => {
    const customDaysNum = parseInt(customDaysInput, 10);
    const updated: ReminderSetting = {
      ...localSettings,
      customAdvanceDays: !isNaN(customDaysNum) && customDaysNum > 0 ? customDaysNum : undefined,
    };
    onSaveSettings(updated);
    onShowToast('推播提醒設置已儲存並生效！');
    onClose();
  };

  const availableAdvanceOptions = [
    { days: 3, label: '3 天前', desc: '即期緊迫 (法務與會計最後審核)' },
    { days: 7, label: '7 天前', desc: '1 週前 (跨部門數據彙總與簽核)' },
    { days: 14, label: '14 天前', desc: '2 週前 (董事會/委員會前置)' },
    { days: 30, label: '30 天前', desc: '1 個月前 (年度財報/股東會/ESG長週期專案)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>法定申報截止日 · 推播提醒設置</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
                  防呆預警
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                設定申報到期日前的主動通知頻率，避免錯失重大時限面臨罰鍰或處分
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 flex-1 text-xs sm:text-sm">
          {/* Main Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                啟用申報到期推播預警系統
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                系統將根據預設天數與各項業務法定基準日進行比對並主動提醒
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {localSettings.enabled && (
            <>
              {/* Section 1: Advance Days Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>截止日前提醒時機（可多選）</span>
                  </div>
                  <span className="text-xs text-slate-400">目前已選 {localSettings.advanceDays.length} 項</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableAdvanceOptions.map(opt => {
                    const isSelected = localSettings.advanceDays.includes(opt.days);
                    return (
                      <button
                        type="button"
                        key={opt.days}
                        onClick={() => toggleAdvanceDay(opt.days)}
                        className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono text-xs">
                              {opt.label}
                            </span>
                            <span>提醒</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {opt.desc}
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Days Input */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0">
                    自訂額外提醒天數：
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      className="w-16 px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500">天前</span>
                  </div>
                  <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">
                    （例如設定 1 天前進行最後倒數確認）
                  </span>
                </div>
              </div>

              {/* Section 2: Scope & High Risk Filter */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>提醒範疇與風險過濾</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.highRiskOnly}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, highRiskOnly: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                        僅提醒重大高風險申報項目（違反涉及停止買賣、變更交易或最高 480 萬罰鍰）
                      </span>
                      <p className="text-[11px] text-slate-400">
                        濾除低風險例行備查事項，專注於法規紅線
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">
                    涵蓋之業務類別：
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '定期辦理-每月' as ComplianceCategory,
                      '定期辦理-每季' as ComplianceCategory,
                      '定期辦理-每年' as ComplianceCategory,
                      '不定期辦理事項' as ComplianceCategory,
                    ].map(cat => {
                      const isCatSelected = localSettings.categories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                            isCatSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Notification Channels & Sounds */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <span>推播管道與提示音</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>{testSent ? '✓ 已觸發測試' : '發送測試推播'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Browser notification permission */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        瀏覽器系統推播權限
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        狀態：
                        {permissionStatus === 'granted' && <span className="text-emerald-600 font-bold ml-1">已授權 (正常接收)</span>}
                        {permissionStatus === 'denied' && <span className="text-rose-500 font-bold ml-1">已封鎖 (請至瀏覽器設定解除)</span>}
                        {permissionStatus === 'default' && <span className="text-amber-500 font-bold ml-1">尚未授權</span>}
                        {permissionStatus === 'unsupported' && <span className="text-slate-400 ml-1">瀏覽器不支援原生推播</span>}
                      </div>
                    </div>

                    {permissionStatus !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="mt-2.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium self-start"
                      >
                        授權瀏覽器推播
                      </button>
                    )}
                  </div>

                  {/* Sound Chime toggle */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        播放專屬提醒音效
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        即期截止日前響起雙音清脆提示
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                      className={`p-2 rounded-lg border ${
                        localSettings.soundEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400'
                      }`}
                    >
                      {localSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Live Upcoming Deadlines Preview */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>即將到期之法定事項即時預覽</span>
                  </div>
                  <span className="text-xs text-slate-400">符合提醒條件共 {upcomingAlerts.length} 項</span>
                </div>

                {upcomingAlerts.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                    目前選定之天數範疇內暫無即將到期的未完成申報事項
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {upcomingAlerts.slice(0, 6).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate text-xs">
                              {alert.title}
                            </span>
                            {alert.keyRiskLevel === 'high' && (
                              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.2 rounded border border-rose-200 font-bold shrink-0">
                                重罰風險
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>截止日：{alert.deadlineDate}</span>
                            <span>·</span>
                            <span>{alert.timing}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            alert.daysRemaining <= 3
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                              : alert.daysRemaining <= 7
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          }`}>
                            剩餘 {alert.daysRemaining} 天
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            取消
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
            >
              確認並套用推播設置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
