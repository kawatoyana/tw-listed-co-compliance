import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Clock, FileDown, Trash2, Edit3, AlertCircle, Plus } from 'lucide-react';
import { ComplianceItem, TaskStatus } from '../types/compliance';

export interface CustomTask {
  id: string;
  title: string;
  timing: string;
  deadlineDate: string;
  mopsPath?: string;
  legalRef: string;
  status: TaskStatus;
  note?: string;
}

interface ChecklistTrackerProps {
  items: ComplianceItem[];
  tasks: Record<string, TaskStatus>;
  onUpdateStatus: (itemId: string, status: TaskStatus) => void;
  customTasks: CustomTask[];
  onUpdateCustomStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteCustomTask: (taskId: string) => void;
  onSelectItem: (item: ComplianceItem) => void;
}

export const ChecklistTracker: React.FC<ChecklistTrackerProps> = ({
  items,
  tasks,
  onUpdateStatus,
  customTasks,
  onUpdateCustomStatus,
  onDeleteCustomTask,
  onSelectItem,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Tracked regular items
  const trackedRegularItems = items.map(item => ({
    type: 'standard' as const,
    id: item.id,
    title: item.itemTitle,
    category: item.category,
    timing: item.timing,
    mopsPath: item.mopsPath,
    legalBasis: item.legalBasis,
    status: tasks[item.id] || 'pending',
    originalItem: item,
  }));

  // Tracked custom calculated items
  const trackedCustomItems = customTasks.map(ct => ({
    type: 'custom' as const,
    id: ct.id,
    title: ct.title,
    category: '事件推算待辦',
    timing: `${ct.deadlineDate} (${ct.timing})`,
    mopsPath: ct.mopsPath || '',
    legalBasis: ct.legalRef,
    status: ct.status,
  }));

  const allTracked = [...trackedCustomItems, ...trackedRegularItems];

  const total = allTracked.length;
  const completed = allTracked.filter(t => t.status === 'completed' || t.status === 'exempt').length;
  const inProgress = allTracked.filter(t => t.status === 'in_progress').length;
  const pending = allTracked.filter(t => t.status === 'pending').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = allTracked.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const handleExportCSV = () => {
    const headers = ['項目編號', '類別', '申報時程', '事項名稱', '狀態', '觀測站路徑', '法令依據'];
    const rows = allTracked.map(t => [
      `"${t.id}"`,
      `"${t.category}"`,
      `"${t.timing}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.mopsPath}"`,
      `"${t.legalBasis.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `上市發行人申報待辦清單_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Progress & Summary Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                公司申報業務落實與進度追蹤
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              實時掌握全公司各業務主管之定期申報與重大事件申報辦理狀態
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            匯出稽核追蹤 CSV
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              整體申報完成度
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {percentage}% ({completed}/{total} 項)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <span className="text-xs text-slate-400 mr-1">狀態篩選：</span>
          {[
            { id: 'ALL', label: `全部 (${total})` },
            { id: 'pending', label: `待處理 (${pending})` },
            { id: 'in_progress', label: `進行中 (${inProgress})` },
            { id: 'completed', label: `已完成 (${allTracked.filter(t => t.status === 'completed').length})` },
            { id: 'exempt', label: `免申報 (${allTracked.filter(t => t.status === 'exempt').length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterStatus === f.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            此篩選條件下無任何項目
          </div>
        ) : (
          filtered.map(task => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isExempt = task.status === 'exempt';

            return (
              <div
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Button */}
                  <div className="pt-0.5 shrink-0">
                    <button
                      onClick={() => {
                        const cycle: Record<TaskStatus, TaskStatus> = {
                          pending: 'in_progress',
                          in_progress: 'completed',
                          completed: 'exempt',
                          exempt: 'pending',
                        };
                        if (task.type === 'custom') {
                          onUpdateCustomStatus(task.id, cycle[task.status]);
                        } else {
                          onUpdateStatus(task.id, cycle[task.status]);
                        }
                      }}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {isInProgress && <Clock className="w-5 h-5 text-blue-500" />}
                      {isExempt && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                          免
                        </span>
                      )}
                      {task.status === 'pending' && (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 block"></span>
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium">
                        {task.timing}
                      </span>
                      <span className="text-xs text-slate-400">
                        {task.category}
                      </span>
                      {task.type === 'custom' && (
                        <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800">
                          自訂事件推算
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => {
                        if (task.type === 'standard' && task.originalItem) {
                          onSelectItem(task.originalItem);
                        }
                      }}
                      className={`text-sm font-semibold transition-colors ${
                        isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'
                      } ${task.type === 'standard' ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                    >
                      {task.title}
                    </h4>

                    {task.mopsPath && (
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        路徑：{task.mopsPath}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                    {(['pending', 'in_progress', 'completed', 'exempt'] as TaskStatus[]).map((st) => {
                      const labels: Record<TaskStatus, string> = {
                        pending: '待辦',
                        in_progress: '進行中',
                        completed: '已完',
                        exempt: '免報',
                      };
                      const isActive = task.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => {
                            if (task.type === 'custom') {
                              onUpdateCustomStatus(task.id, st);
                            } else {
                              onUpdateStatus(task.id, st);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {labels[st]}
                        </button>
                      );
                    })}
                  </div>

                  {task.type === 'custom' && (
                    <button
                      onClick={() => onDeleteCustomTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title="刪除此推算項目"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
