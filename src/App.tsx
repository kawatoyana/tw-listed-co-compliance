import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { ComplianceTable } from './components/ComplianceTable';
import { ComplianceCalendar } from './components/ComplianceCalendar';
import { DeadlineCalculator } from './components/DeadlineCalculator';
import { ChecklistTracker, CustomTask } from './components/ChecklistTracker';
import { LegalRisksGuide } from './components/LegalRisksGuide';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { ComplianceProgressDonut } from './components/ComplianceProgressDonut';
import { COMPLIANCE_ITEMS } from './data/complianceItems';
import { ComplianceItem, TaskStatus } from './types/compliance';
import { ReminderSetting, DEFAULT_REMINDER_SETTINGS } from './types/reminder';
import { calculateUpcomingDeadlines } from './utils/notificationService';
import { Download, FileText, ExternalLink, ShieldCheck, CheckCircle2, BellRing, ArrowRight, Calendar, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const currentMonth = new Date().getMonth() + 1;

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'table' | 'calendar' | 'calculator' | 'checklist' | 'guide'>('table');
  
  // Category quick filter (shared between StatsBar and ComplianceTable)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Status quick filter (shared between ComplianceProgressDonut and ComplianceTable)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Selected item for modal details
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

  // Push Reminder Modal state (Triggered ONLY from the Navbar button)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Ensure clean light theme by removing any residual dark class
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('twse_compliance_theme');
    } catch (e) {
      // ignore
    }
  }, []);

  // Track standard tasks { [itemId]: status }
  const [tasks, setTasks] = useState<Record<string, TaskStatus>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('twse_compliance_tasks');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return {};
  });

  // Custom tasks (e.g., from AGM/Buyback deadline calculator)
  const [customTasks, setCustomTasks] = useState<CustomTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('twse_compliance_custom_tasks');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved custom tasks', e);
      }
    }
    return [];
  });

  // Reminder settings (advance days: 3, 7, 30, sound, high risk)
  const [reminderSettings, setReminderSettings] = useState<ReminderSetting>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('twse_compliance_reminder_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reminder settings', e);
      }
    }
    return DEFAULT_REMINDER_SETTINGS;
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Persist standard tasks
  useEffect(() => {
    localStorage.setItem('twse_compliance_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist custom tasks
  useEffect(() => {
    localStorage.setItem('twse_compliance_custom_tasks', JSON.stringify(customTasks));
  }, [customTasks]);

  // Persist reminder settings
  useEffect(() => {
    localStorage.setItem('twse_compliance_reminder_settings', JSON.stringify(reminderSettings));
  }, [reminderSettings]);

  // Calculate upcoming statutory deadlines based on active reminder settings
  const upcomingAlerts = useMemo(() => {
    return calculateUpcomingDeadlines(COMPLIANCE_ITEMS, customTasks, tasks, reminderSettings);
  }, [customTasks, tasks, reminderSettings]);

  // Toggle to show all alerts vs only urgent ones
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Extract items due within nearest window (<= 3 days, or matching minimum days, plus high-risk items <= 7 days)
  // If there are 10 items, all 10 are completely included
  const urgentAlertsToDisplay = useMemo(() => {
    if (upcomingAlerts.length === 0) return [];
    const urgentItems = upcomingAlerts.filter(a => a.daysRemaining <= 3 || (a.keyRiskLevel === 'high' && a.daysRemaining <= 7));
    if (urgentItems.length > 0) return urgentItems;
    const minDays = upcomingAlerts[0].daysRemaining;
    return upcomingAlerts.filter(a => a.daysRemaining === minDays);
  }, [upcomingAlerts]);

  // Sort alerts: "High Risk" (keyRiskLevel === 'high') items are automatically pinned to the top (置頂),
  // followed by nearest deadline (daysRemaining ascending)
  const sortedAlertsToRender = useMemo(() => {
    const baseList = showAllAlerts ? [...upcomingAlerts] : [...urgentAlertsToDisplay];
    return baseList.sort((a, b) => {
      const aIsHigh = a.keyRiskLevel === 'high';
      const bIsHigh = b.keyRiskLevel === 'high';
      // 1. High risk comes first (置頂)
      if (aIsHigh && !bIsHigh) return -1;
      if (!aIsHigh && bIsHigh) return 1;
      // 2. Nearest deadline
      if (a.daysRemaining !== b.daysRemaining) {
        return a.daysRemaining - b.daysRemaining;
      }
      return a.title.localeCompare(b.title, 'zh-TW');
    });
  }, [showAllAlerts, upcomingAlerts, urgentAlertsToDisplay]);

  // Count high risk items in the current render batch
  const highRiskCountInAlerts = useMemo(() => {
    return sortedAlertsToRender.filter(a => a.keyRiskLevel === 'high').length;
  }, [sortedAlertsToRender]);

  // Update standard task status
  const handleUpdateStatus = (itemId: string, status: TaskStatus) => {
    setTasks(prev => ({
      ...prev,
      [itemId]: status,
    }));
  };

  // Update custom task status
  const handleUpdateCustomStatus = (taskId: string, status: TaskStatus) => {
    setCustomTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // Delete custom task
  const handleDeleteCustomTask = (taskId: string) => {
    setCustomTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('已移除自訂待辦項目');
  };

  // Add custom tasks from calculator
  const handleAddCustomTasks = (
    newSteps: { title: string; timing: string; deadlineDate: string; mopsPath?: string; legalRef: string }[]
  ) => {
    const newItems: CustomTask[] = newSteps.map((step, idx) => ({
      id: `calc_${Date.now()}_${idx}`,
      title: step.title,
      timing: step.timing,
      deadlineDate: step.deadlineDate,
      mopsPath: step.mopsPath,
      legalRef: step.legalRef,
      status: 'pending',
    }));

    setCustomTasks(prev => [...prev, ...newItems]);
    showToast(`已成功將 ${newItems.length} 項法定申報里程碑加入「待辦申報清單」！`);
  };

  // Save Reminder Settings
  const handleSaveReminderSettings = (newSettings: ReminderSetting) => {
    setReminderSettings(newSettings);
  };

  // Switch to current month filing items filter
  const handleSelectCurrentMonth = () => {
    setSelectedCategoryFilter('CURRENT_MONTH');
    setCurrentTab('table');
    showToast(`已切換為「當月申報項目 (${currentMonth}月)」清單`);
  };

  // Completed & Status counts for header badge and progress donut chart
  const completedCount = useMemo(() => {
    const standardDone = Object.values(tasks).filter(s => s === 'completed').length;
    const customDone = customTasks.filter(t => t.status === 'completed').length;
    return standardDone + customDone;
  }, [tasks, customTasks]);

  const inProgressCount = useMemo(() => {
    const standardProg = Object.values(tasks).filter(s => s === 'in_progress').length;
    const customProg = customTasks.filter(t => t.status === 'in_progress').length;
    return standardProg + customProg;
  }, [tasks, customTasks]);

  const exemptCount = useMemo(() => {
    const standardEx = Object.values(tasks).filter(s => s === 'exempt').length;
    const customEx = customTasks.filter(t => t.status === 'exempt').length;
    return standardEx + customEx;
  }, [tasks, customTasks]);

  const totalTaskCount = useMemo(() => {
    return COMPLIANCE_ITEMS.length + customTasks.length;
  }, [customTasks]);

  const pendingCount = useMemo(() => {
    return Math.max(0, totalTaskCount - completedCount - inProgressCount - exemptCount);
  }, [totalTaskCount, completedCount, inProgressCount, exemptCount]);

  // Export full CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      '項次代碼',
      '申報類別',
      '適用發行人',
      '應辦業務項目名稱',
      '法定申報時限/基準日',
      '定期週期',
      '公開資訊觀測站(MOPS)申報路徑',
      '法令規章依據',
      '合規注意事項與罰則提醒',
      '業務主題分類',
      '重大法規風險等級',
      '當前執行狀態'
    ];

    const statusLabelMap: Record<TaskStatus, string> = {
      pending: '未開始',
      in_progress: '進行中',
      completed: '已完成',
      exempt: '不適用/已免除'
    };

    const rows = COMPLIANCE_ITEMS.map((item) => {
      const curStatus = tasks[item.id] || 'pending';
      return [
        `"${item.id}"`,
        `"${item.category}"`,
        `"${item.issuerType}"`,
        `"${item.itemTitle.replace(/"/g, '""')}"`,
        `"${item.timing.replace(/"/g, '""')}"`,
        `"${item.periodicity}"`,
        `"${item.mopsPath.replace(/"/g, '""')}"`,
        `"${item.legalBasis.replace(/"/g, '""')}"`,
        `"${item.complianceNotice.replace(/"/g, '""')}"`,
        `"${item.topics.join('; ')}"`,
        `"${item.keyRiskLevel === 'high' ? '高風險(停止買賣/高額違約金)' : item.keyRiskLevel === 'medium' ? '中度風險' : '一般項目'}"`,
        `"${statusLabelMap[curStatus]}"`
      ];
    });

    // Also include custom tasks if any
    customTasks.forEach((cTask, idx) => {
      rows.push([
        `"CUSTOM_${idx + 1}"`,
        `"重大事件專案"`,
        `"全體適用"`,
        `"${cTask.title.replace(/"/g, '""')}"`,
        `"${cTask.deadlineDate} (${cTask.timing})"`,
        `"專案里程碑"`,
        `"${(cTask.mopsPath || '詳見公開資訊觀測站相關路徑').replace(/"/g, '""')}"`,
        `"${cTask.legalRef.replace(/"/g, '""')}"`,
        `"依推算基準日辦理法定公告與申報"`,
        `"專案里程碑"`,
        `"高風險"`,
        `"${statusLabelMap[cTask.status]}"`
      ]);
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `上市有價證券發行人應辦業務事項總覽_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('已成功匯出繁體中文 Excel 相容 CSV 檔案！');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Sticky Top Navbar: Stacked Tier 1 (Brand + Actions) and Tier 2 (The 5 Module Links) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onExport={handleExportCSV}
        onOpenReminderSettings={() => setIsReminderModalOpen(true)}
        onSelectCurrentMonth={handleSelectCurrentMonth}
        upcomingAlertsCount={upcomingAlerts.length}
        completedCount={completedCount}
        totalTaskCount={totalTaskCount}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Statutory Deadline Alert Strip: Lists ALL urgent items (all 4, 10, or more) without truncation */}
        {reminderSettings.enabled && upcomingAlerts.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2 flex-wrap">
                    <span>法定申報到期預警：符合提醒設定共 {upcomingAlerts.length} 項</span>
                    {highRiskCountInAlerts > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold inline-flex items-center gap-1 shadow-2xs animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-white stroke-[2.5]" />
                        重大高風險 {highRiskCountInAlerts} 項已優先置頂
                      </span>
                    )}
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-200/90 text-amber-900 font-mono font-bold">
                      最急迫：剩餘 {sortedAlertsToRender[0]?.daysRemaining} 天到期（本批次共 {sortedAlertsToRender.length} 項）
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {upcomingAlerts.length > urgentAlertsToDisplay.length && (
                  <button
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="px-2.5 py-1.5 bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/60 rounded-lg text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap"
                  >
                    {showAllAlerts ? `收合為最急迫 (${urgentAlertsToDisplay.length}項)` : `完整展開全部 ${upcomingAlerts.length} 項`}
                  </button>
                )}

                <button
                  onClick={handleSelectCurrentMonth}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                >
                  在總覽表檢視當月申報 ({currentMonth}月)
                </button>
              </div>
            </div>

            {/* Render items in a responsive grid: High-risk items auto-pinned to top with bold highlight borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {sortedAlertsToRender.map(alert => {
                const isHighRisk = alert.keyRiskLevel === 'high';
                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      if (alert.itemId) {
                        const matched = COMPLIANCE_ITEMS.find(i => i.id === alert.itemId);
                        if (matched) setSelectedItem(matched);
                      } else {
                        setCurrentTab('checklist');
                      }
                    }}
                    className={
                      isHighRisk
                        ? 'p-3 bg-gradient-to-br from-rose-50/95 via-rose-50/40 to-amber-50/30 rounded-xl border-2 border-rose-500 shadow-xs ring-2 ring-rose-500/20 hover:border-rose-600 hover:shadow-md hover:ring-rose-500/30 transition-all cursor-pointer flex flex-col justify-between group'
                        : 'p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group'
                    }
                  >
                    <div>
                      {isHighRisk && (
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-2xs tracking-wide">
                            <AlertTriangle className="w-3 h-3 text-white stroke-[2.5]" /> 重大高風險 · 置頂
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black bg-rose-600 text-white shadow-2xs whitespace-nowrap shrink-0">
                            剩 {alert.daysRemaining} 天
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span
                          className={`font-bold text-xs transition-colors line-clamp-1 ${
                            isHighRisk
                              ? 'text-rose-950 font-black group-hover:text-rose-700'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {alert.title}
                        </span>
                        {!isHighRisk && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 whitespace-nowrap shrink-0">
                            剩 {alert.daysRemaining} 天
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-[11px] line-clamp-1 font-mono ${
                          isHighRisk ? 'text-rose-800/90 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {alert.timing}
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between text-[10px] mt-2 pt-1.5 border-t ${
                        isHighRisk ? 'border-rose-200/90 text-rose-700/80' : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="truncate font-medium">截止日: {alert.deadlineDate}</span>
                      <span
                        className={`font-bold flex items-center gap-0.5 shrink-0 group-hover:underline ${
                          isHighRisk ? 'text-rose-700' : 'text-blue-600'
                        }`}
                      >
                        {isHighRisk ? '立即處理' : '查看詳情'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Statistics & Circular Progress Ring (Shown on table and calendar views) */}
        {(currentTab === 'table' || currentTab === 'calendar') && (
          <div className="space-y-4">
            {/* Visual Circular Progress Donut / Ring Chart */}
            <ComplianceProgressDonut
              totalCount={totalTaskCount}
              completedCount={completedCount}
              inProgressCount={inProgressCount}
              pendingCount={pendingCount}
              exemptCount={exemptCount}
              selectedStatus={selectedStatusFilter}
              onSelectStatus={(status) => {
                setSelectedStatusFilter(status);
                if (currentTab !== 'table') {
                  setCurrentTab('table');
                }
              }}
              onNavigateToChecklist={() => setCurrentTab('checklist')}
            />

            {/* Category Statistics Metric Bar */}
            <StatsBar
              items={COMPLIANCE_ITEMS}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={(cat) => {
                setSelectedCategoryFilter(cat);
                if (currentTab !== 'table') {
                  setCurrentTab('table');
                }
              }}
            />
          </div>
        )}

        {/* Dynamic Tab Views */}
        <div className="transition-all duration-200">
          {currentTab === 'table' && (
            <ComplianceTable
              items={COMPLIANCE_ITEMS}
              onSelectItem={setSelectedItem}
              tasks={tasks}
              onUpdateStatus={handleUpdateStatus}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
            />
          )}

          {currentTab === 'calendar' && (
            <ComplianceCalendar
              items={COMPLIANCE_ITEMS}
              onSelectItem={setSelectedItem}
            />
          )}

          {currentTab === 'calculator' && (
            <DeadlineCalculator
              onAddCustomTasks={handleAddCustomTasks}
            />
          )}

          {currentTab === 'checklist' && (
            <ChecklistTracker
              items={COMPLIANCE_ITEMS}
              tasks={tasks}
              onUpdateStatus={handleUpdateStatus}
              customTasks={customTasks}
              onUpdateCustomStatus={handleUpdateCustomStatus}
              onDeleteCustomTask={handleDeleteCustomTask}
              onSelectItem={setSelectedItem}
            />
          )}

          {currentTab === 'guide' && (
            <LegalRisksGuide />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              資料來源：臺灣證券交易所 115 年 4 月印製「上市有價證券發行人應辦業務事項一覽表」
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>依證交所公告之最新法令規定為準</span>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('guide')}
              className="hover:text-blue-600 transition-colors"
            >
              檢視罰則指引
            </button>
            <span>·</span>
            <button
              onClick={handleExportCSV}
              className="hover:text-blue-600 transition-colors"
            >
              下載 CSV 檔案
            </button>
          </div>
        </div>
      </footer>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        taskStatus={selectedItem ? tasks[selectedItem.id] : undefined}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Push Notification & Reminder Settings Modal (Opened ONLY from the top Navbar button) */}
      <ReminderSettingsModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={reminderSettings}
        onSaveSettings={handleSaveReminderSettings}
        upcomingAlerts={upcomingAlerts}
        onSelectItemById={(id) => {
          const found = COMPLIANCE_ITEMS.find(i => i.id === id);
          if (found) {
            setSelectedItem(found);
            setIsReminderModalOpen(false);
          }
        }}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 text-xs font-medium animate-bounce-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
