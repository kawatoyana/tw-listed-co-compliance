import { ComplianceCategory } from './compliance';

export interface ReminderSetting {
  enabled: boolean;
  advanceDays: number[]; // e.g. [3, 7, 30]
  customAdvanceDays?: number;
  soundEnabled: boolean;
  highRiskOnly: boolean;
  categories: ComplianceCategory[];
  reminderTime: string; // e.g. "09:00"
  notifyOnWeekend: boolean;
  browserPermission: 'default' | 'granted' | 'denied';
}

export interface UpcomingDeadlineAlert {
  id: string;
  itemId?: string;
  customTaskId?: string;
  title: string;
  timing: string;
  deadlineDate: string; // YYYY-MM-DD
  daysRemaining: number;
  category: string;
  keyRiskLevel?: 'high' | 'medium' | 'normal';
  triggeredDay: number; // which rule matched (e.g. 3, 7, 30)
  mopsPath?: string;
  legalBasis?: string;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSetting = {
  enabled: true,
  advanceDays: [3, 7, 30],
  customAdvanceDays: 1,
  soundEnabled: true,
  highRiskOnly: false,
  categories: [
    '定期辦理-每月',
    '定期辦理-每季',
    '定期辦理-每年',
    '不定期辦理事項',
  ],
  reminderTime: '09:00',
  notifyOnWeekend: false,
  browserPermission: 'default',
};
