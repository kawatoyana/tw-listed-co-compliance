import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ExternalLink, CheckCircle, Clock, Check, Eye, X, Sparkles, RotateCcw } from 'lucide-react';
import { ComplianceItem, ComplianceCategory, IssuerCategory, BusinessTopic, TaskStatus } from '../types/compliance';

interface ComplianceTableProps {
  items: ComplianceItem[];
  onSelectItem: (item: ComplianceItem) => void;
  tasks: Record<string, TaskStatus>;
  onUpdateStatus: (itemId: string, status: TaskStatus) => void;
  selectedCategoryFilter?: string;
  onSelectCategoryFilter?: (cat: string) => void;
  selectedStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({
  items,
  onSelectItem,
  tasks,
  onUpdateStatus,
  selectedCategoryFilter = 'ALL',
  onSelectCategoryFilter,
  selectedStatusFilter = 'ALL',
  onSelectStatusFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [onlyHighRisk, setOnlyHighRisk] = useState<boolean>(false);

  // Extract unique issuers and topics
  const issuerTypes: IssuerCategory[] = useMemo(() => {
    const set = new Set<IssuerCategory>();
    items.forEach(i => set.add(i.issuerType));
    return Array.from(set);
  }, [items]);

  const allTopics: BusinessTopic[] = useMemo(() => {
    const set = new Set<BusinessTopic>();
    items.forEach(i => i.topics.forEach(t => set.add(t)));
    return Array.from(set);
  }, [items]);

  // Quick search recommendation tags
  const quickSearchTags = [
    '董事會',
    '董監事',
    '營業收入',
    '財務報告',
    '股東常會',
    '重大訊息',
    '內部人股權轉讓',
    '庫藏股買回',
    '取得或處分資產',
    '永續報告書',
    '內部控制聲明',
    '證交法第178條',
  ];

  // Tokenized multi-keyword query logic
  const searchTokens = useMemo(() => {
    return searchTerm
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 0);
  }, [searchTerm]);

  // Filtered Items synchronized with category filter and search
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Category filter synchronization
      if (selectedCategoryFilter === 'CURRENT_MONTH') {
        const currentM = new Date().getMonth() + 1;
        const inCurrentMonth = item.regularMonth && item.regularMonth.includes(currentM);
        if (!inCurrentMonth) return false;
      } else if (selectedCategoryFilter === 'HIGH_RISK') {
        if (item.keyRiskLevel !== 'high') return false;
      } else if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }

      // 2. Issuer filter
      if (selectedIssuer !== 'ALL' && item.issuerType !== selectedIssuer) {
        return false;
      }

      // 3. Topic filter
      if (selectedTopic !== 'ALL' && !item.topics.includes(selectedTopic as BusinessTopic)) {
        return false;
      }

      // 4. Status filter (e.g. from the progress donut chart or status dropdown)
      if (selectedStatusFilter && selectedStatusFilter !== 'ALL') {
        const curStatus = tasks[item.id] || 'pending';
        if (curStatus !== selectedStatusFilter) return false;
      }

      // 5. High risk only toggle
      if (onlyHighRisk && item.keyRiskLevel !== 'high') {
        return false;
      }

      // 6. Full text search: matches item title, legal basis, topics, timing, mopsPath, content summary, and notices
      if (searchTokens.length > 0) {
        const itemText = [
          item.itemTitle,
          item.legalBasis,
          item.timing,
          item.mopsPath,
          item.topics.join(' '),
          item.contentSummary,
          item.complianceNotice,
          item.applicableSpecialNote || '',
          item.category,
        ]
          .join(' ')
          .toLowerCase();

        // Every token entered must match somewhere in the item (AND condition)
        const allTokensMatch = searchTokens.every(token => itemText.includes(token));
        if (!allTokensMatch) return false;
      }

      return true;
    });
  }, [items, selectedCategoryFilter, selectedStatusFilter, selectedIssuer, selectedTopic, onlyHighRisk, searchTokens, tasks]);

  // Highlight matching text helper
  const highlightMatches = (text: string) => {
    if (searchTokens.length === 0) return text;

    // Build regex pattern for all tokens
    const escapedTokens = searchTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const isMatch = searchTokens.some(t => t.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark
            key={idx}
            className="bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 px-0.5 rounded font-bold"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Color config for category badges
  const getCategoryBadgeClass = (category: ComplianceCategory) => {
    switch (category) {
      case '定期辦理-每月':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
      case '定期辦理-每季':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case '定期辦理-每年':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case '定期辦理-每日每週':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case '不定期辦理事項':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case '即將上市申報事項':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategoryFilter !== 'ALL' ||
    (selectedStatusFilter && selectedStatusFilter !== 'ALL') ||
    selectedIssuer !== 'ALL' ||
    selectedTopic !== 'ALL' ||
    onlyHighRisk;

  const handleResetFilters = () => {
    setSearchTerm('');
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter('ALL');
    }
    if (onSelectStatusFilter) {
      onSelectStatusFilter('ALL');
    }
    setSelectedIssuer('ALL');
    setSelectedTopic('ALL');
    setOnlyHighRisk(false);
  };

  return (
    <div className="space-y-4">
      {/* Filtering Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Instant Full-Text Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400" />
            <input
              type="text"
              placeholder="即時全文檢索：輸入項目名稱、法規依據 (如證交法/營業細則)、觀測站路徑或關鍵字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all shadow-inner"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="清除搜尋字詞"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                即時比對
              </span>
            </div>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status filter */}
            <select
              value={selectedStatusFilter || 'ALL'}
              onChange={(e) => onSelectStatusFilter && onSelectStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">全部狀態 (全部)</option>
              <option value="completed">已完成 (Completed)</option>
              <option value="in_progress">進行中 (In Progress)</option>
              <option value="pending">未開始 (Pending)</option>
              <option value="exempt">免申報 (Exempt)</option>
            </select>

            {/* Issuer filter */}
            <select
              value={selectedIssuer}
              onChange={(e) => setSelectedIssuer(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">全部發行種類 (全部)</option>
              {issuerTypes.map(it => (
                <option key={it} value={it}>{it}</option>
              ))}
            </select>

            {/* Topic filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">全部業務範疇 (全選)</option>
              {allTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* High-risk Toggle Button */}
            <button
              onClick={() => setOnlyHighRisk(!onlyHighRisk)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                onlyHighRisk
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              僅看重罰/停牌項目
            </button>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-0.5">
          <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> 熱門檢索：
          </span>
          {quickSearchTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchTerm(tag)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                searchTerm === tag
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* Synchronized Status & Results Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            檢索結果共{' '}
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums text-sm font-bold">
              {filteredItems.length}
            </strong>{' '}
            項業務事項
          </span>

          {hasActiveFilters && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300">
              <span>已同步過濾：</span>
              {selectedCategoryFilter !== 'ALL' && (
                <span className="font-semibold">
                  {selectedCategoryFilter === 'CURRENT_MONTH'
                    ? `[當月申報項目 (${new Date().getMonth() + 1}月)]`
                    : `[${selectedCategoryFilter.replace('定期辦理-', '')}]`}
                </span>
              )}
              {searchTerm && <span className="font-semibold">關鍵字「{searchTerm}」</span>}
              {selectedStatusFilter && selectedStatusFilter !== 'ALL' && (
                <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300">
                  狀態: {selectedStatusFilter === 'completed' ? '已完成' : selectedStatusFilter === 'in_progress' ? '進行中' : selectedStatusFilter === 'exempt' ? '免申報' : '未開始'}
                </span>
              )}
              {selectedIssuer !== 'ALL' && <span>發行人: {selectedIssuer}</span>}
              {onlyHighRisk && <span className="text-rose-600 font-bold">限重大</span>}
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-200 underline flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" /> 重設所有條件
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> 每月定期
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 每季定期
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 年度定期
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 不定期重大事件
          </span>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold tracking-wider">
                <th className="py-3 px-3.5 w-16 text-center">狀態</th>
                <th className="py-3 px-3.5 w-28 whitespace-nowrap">類別 (顏色區分)</th>
                <th className="py-3 px-3.5 w-44 whitespace-nowrap">申報時程 / 截止日期</th>
                <th className="py-3 px-4 min-w-[240px]">申報事項名稱 (全文檢索)</th>
                <th className="py-3 px-4 min-w-[260px] hidden md:table-cell">公開資訊觀測站 (MOPS) 路徑</th>
                <th className="py-3 px-4 min-w-[240px] hidden lg:table-cell">法令依據與字號</th>
                <th className="py-3 px-3 w-20 text-center">檢視</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      查無符合「{searchTerm || selectedCategoryFilter}」條件之業務事項
                    </p>
                    <p className="text-xs mt-1 text-slate-500">
                      請嘗試簡化關鍵字或點擊下方按鈕重設所有篩選
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      清除所有搜尋與類別篩選
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const currentStatus = tasks[item.id] || 'pending';
                  const isHighRisk = item.keyRiskLevel === 'high';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Status indicator / quick toggle */}
                      <td 
                        className="py-3 px-2 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus: Record<TaskStatus, TaskStatus> = {
                            pending: 'in_progress',
                            in_progress: 'completed',
                            completed: 'exempt',
                            exempt: 'pending'
                          };
                          onUpdateStatus(item.id, nextStatus[currentStatus]);
                        }}
                      >
                        <button
                          title={`目前狀態: ${currentStatus} (點擊切換)`}
                          className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {currentStatus === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {currentStatus === 'in_progress' && <Clock className="w-4 h-4 text-blue-500" />}
                          {currentStatus === 'exempt' && <span className="text-[10px] px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded">免</span>}
                          {currentStatus === 'pending' && <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 block"></span>}
                        </button>
                      </td>

                      {/* Category Badge with strict color distinction */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category.replace('定期辦理-', '')}
                        </span>
                      </td>

                      {/* Timing / Deadline */}
                      <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{highlightMatches(item.timing)}</span>
                          {isHighRisk && (
                            <span 
                              title="高風險違法重點監管事項"
                              className="inline-flex text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900"
                            >
                              重大
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Item Title & topics with Highlighted Matches */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {highlightMatches(item.itemTitle)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {highlightMatches(item.contentSummary.slice(0, 85))}...
                        </div>
                      </td>

                      {/* MOPS Path */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xs bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded border border-slate-200/60 dark:border-slate-800">
                          {highlightMatches(item.mopsPath)}
                        </div>
                      </td>

                      {/* Legal references with Highlighted Matches */}
                      <td className="py-3 px-4 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                        <div className="text-[11px] line-clamp-2 font-mono">
                          {highlightMatches(item.legalBasis)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <span className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-block transition-colors">
                          <Eye className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
