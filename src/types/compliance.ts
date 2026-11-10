export type ComplianceCategory = 
  | '定期辦理-每月'
  | '定期辦理-每季'
  | '定期辦理-每年'
  | '定期辦理-每日每週'
  | '不定期辦理事項'
  | '即將上市申報事項';

export type IssuerCategory = 
  | '股票上市公司'
  | '股票即將上市公司'
  | '封閉式基金'
  | 'ETF與主動式基金'
  | '連結式ETF'
  | '不動產投資信託(REITs)'
  | '境外指數股票型基金'
  | '臺灣存託憑證(TDR)'
  | '指數投資證券(ETN)';

export type BusinessTopic = 
  | '財務報告與營收'
  | '重大訊息與法說會'
  | '股東會與除權息'
  | '董事監察人與公司治理'
  | '資產取得與投資'
  | '公司債與私募'
  | '內部控制與稽核'
  | '庫藏股與員工認股'
  | '基本資料與上市維護'
  | '基金與憑證專屬'
  | 'ESG永續';

export interface ComplianceItem {
  id: string;
  category: ComplianceCategory;
  issuerType: IssuerCategory;
  periodicity: '月度定期' | '季度定期' | '年度定期' | '每日每週' | '不定期' | '上市前置';
  timing: string;
  regularMonth?: number[]; // [1, 2, 3...] if regular
  regularDay?: number | string; // e.g. 5, 10, 15, '月底', etc.
  itemTitle: string;
  contentSummary: string;
  mopsPath: string;
  legalBasis: string;
  complianceNotice: string;
  topics: BusinessTopic[];
  keyRiskLevel?: 'high' | 'medium' | 'normal'; // high: heavy penalties or trading halt risk
  applicableSpecialNote?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'exempt';

export interface CompanyTask {
  itemId: string;
  status: TaskStatus;
  note?: string;
  completedAt?: string;
  assignedTo?: string;
}

export interface EventPreset {
  id: string;
  name: string;
  description: string;
  defaultLeadDays: number;
  steps: {
    title: string;
    offsetDays: number; // relative to event date: negative = before, positive = after
    unit: 'calendar_days' | 'business_days';
    timingDescription: string;
    actionDetail: string;
    mopsPath?: string;
    legalReference: string;
    riskAlert?: string;
  }[];
}
