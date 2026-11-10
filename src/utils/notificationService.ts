import { ComplianceItem, TaskStatus } from '../types/compliance';
import { CustomTask } from '../components/ChecklistTracker';
import { ReminderSetting, UpcomingDeadlineAlert } from '../types/reminder';

/**
 * Play a pleasant two-tone audio chime using the Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Tone 1 (High bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2 (Higher resolve bell)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Web Audio not available or user blocked audio', e);
  }
}

/**
 * Request Web Notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

/**
 * Trigger a native or fallback notification
 */
export function dispatchNotification(
  title: string,
  options?: { body?: string; icon?: string; tag?: string }
): boolean {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options?.body,
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag || 'compliance-alert',
      });
      return true;
    } catch (e) {
      console.warn('Native notification failed, fall back to in-app toast', e);
      return false;
    }
  }
  return false;
}

/**
 * Calculate upcoming deadlines based on advance warning thresholds
 */
export function calculateUpcomingDeadlines(
  items: ComplianceItem[],
  customTasks: CustomTask[],
  tasks: Record<string, TaskStatus>,
  settings: ReminderSetting,
  referenceDate: Date = new Date()
): UpcomingDeadlineAlert[] {
  if (!settings.enabled) return [];

  const alerts: UpcomingDeadlineAlert[] = [];
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-12
  const currentDay = referenceDate.getDate();

  // Combine standard thresholds and custom if provided
  const activeThresholds = [...settings.advanceDays];
  if (settings.customAdvanceDays && !activeThresholds.includes(settings.customAdvanceDays)) {
    activeThresholds.push(settings.customAdvanceDays);
  }
  activeThresholds.sort((a, b) => b - a);
  const maxThreshold = Math.max(...activeThresholds, 0);

  // Helper to format date YYYY-MM-DD
  const formatDateStr = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 1. Process Custom Tasks (e.g. from AGM, Buyback, Asset deals)
  customTasks.forEach(cTask => {
    if (cTask.status === 'completed' || cTask.status === 'exempt') return;
    if (!cTask.deadlineDate) return;

    const deadline = new Date(cTask.deadlineDate + 'T23:59:59');
    const diffMs = deadline.getTime() - referenceDate.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining >= 0 && daysRemaining <= maxThreshold) {
      // Find matching triggered threshold
      const matchedThreshold = activeThresholds.find(t => daysRemaining <= t) || maxThreshold;
      alerts.push({
        id: `custom_${cTask.id}`,
        customTaskId: cTask.id,
        title: cTask.title,
        timing: cTask.timing,
        deadlineDate: cTask.deadlineDate,
        daysRemaining,
        category: '重大事件專案',
        keyRiskLevel: 'high',
        triggeredDay: matchedThreshold,
        mopsPath: cTask.mopsPath,
        legalBasis: cTask.legalRef,
      });
    }
  });

  // 2. Process Standard Compliance Items (Monthly, Quarterly, Annual deadlines)
  items.forEach(item => {
    const curStatus = tasks[item.id] || 'pending';
    if (curStatus === 'completed' || curStatus === 'exempt') return;
    if (settings.highRiskOnly && item.keyRiskLevel !== 'high') return;
    if (!settings.categories.includes(item.category)) return;

    let targetDateStr: string | null = null;

    // Monthly regular items
    if (item.category === '定期辦理-每月' && typeof item.regularDay !== 'undefined') {
      let targetDay = 0;
      let targetMonth = currentMonth;
      let targetYear = currentYear;

      if (typeof item.regularDay === 'number') {
        targetDay = item.regularDay;
        // If today has already passed this day of the month, the next deadline is next month
        if (currentDay > targetDay) {
          targetMonth += 1;
          if (targetMonth > 12) {
            targetMonth = 1;
            targetYear += 1;
          }
        }
      } else if (item.regularDay === '月底') {
        // Last day of current month
        targetDay = new Date(currentYear, currentMonth, 0).getDate();
      }

      if (targetDay > 0) {
        targetDateStr = formatDateStr(targetYear, targetMonth, targetDay);
      }
    }

    // Fixed key annual milestones
    if (item.category === '定期辦理-每年') {
      // Parse known statutory dates
      const annualDates: Record<string, { month: number; day: number }> = {
        'REG-A-03-15-1': { month: 3, day: 15 },
        'REG-A-03-31-1': { month: 3, day: 31 },
        'REG-A-03-31-2': { month: 3, day: 31 },
        'REG-A-03-31-3': { month: 3, day: 31 },
        'REG-A-04-30-1': { month: 4, day: 30 },
        'REG-A-05-15-1': { month: 5, day: 15 },
        'REG-A-06-30-1': { month: 6, day: 30 },
        'REG-A-08-14-1': { month: 8, day: 14 },
        'REG-A-08-31-1': { month: 8, day: 31 },
        'REG-A-11-14-1': { month: 11, day: 14 },
        'REG-A-12-31-1': { month: 12, day: 31 },
      };

      const matched = annualDates[item.id];
      if (matched) {
        let yr = currentYear;
        const testD = new Date(yr, matched.month - 1, matched.day, 23, 59, 59);
        if (referenceDate.getTime() > testD.getTime()) {
          yr += 1;
        }
        targetDateStr = formatDateStr(yr, matched.month, matched.day);
      }
    }

    if (targetDateStr) {
      const deadline = new Date(targetDateStr + 'T23:59:59');
      const diffMs = deadline.getTime() - referenceDate.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining >= 0 && daysRemaining <= maxThreshold) {
        const matchedThreshold = activeThresholds.find(t => daysRemaining <= t) || maxThreshold;
        alerts.push({
          id: `item_${item.id}`,
          itemId: item.id,
          title: item.itemTitle,
          timing: item.timing,
          deadlineDate: targetDateStr,
          daysRemaining,
          category: item.category,
          keyRiskLevel: item.keyRiskLevel,
          triggeredDay: matchedThreshold,
          mopsPath: item.mopsPath,
          legalBasis: item.legalBasis,
        });
      }
    }
  });

  // Sort by daysRemaining ascending (nearest deadlines first)
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
