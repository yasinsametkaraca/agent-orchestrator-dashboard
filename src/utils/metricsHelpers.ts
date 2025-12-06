import type { SystemMetricsDaySnapshot } from '@/types/domain';

export interface AgentUsageBreakdown {
  content: number;
  code: number;
  other: number;
  total: number;
}

export interface AgentUsagePercentages {
  contentPct: number;
  codePct: number;
  otherPct: number;
}

const normalizeAgentKey = (key: string): string => key.trim().toLowerCase();

export const getAgentUsageBreakdown = (
  tasksPerAgent: Record<string, number> | undefined | null
): AgentUsageBreakdown => {
  const breakdown: AgentUsageBreakdown = {
    content: 0,
    code: 0,
    other: 0,
    total: 0
  };

  if (!tasksPerAgent) {
    return breakdown;
  }

  for (const [key, rawCount] of Object.entries(tasksPerAgent)) {
    const count = Number.isFinite(rawCount) ? Math.max(0, rawCount) : 0;
    if (!count) continue;

    const normalizedKey = normalizeAgentKey(key);

    if (normalizedKey.includes('content')) {
      breakdown.content += count;
    } else if (normalizedKey.includes('code')) {
      breakdown.code += count;
    } else {
      breakdown.other += count;
    }
  }

  breakdown.total = breakdown.content + breakdown.code + breakdown.other;
  return breakdown;
};

export const getAgentUsagePercentages = (
  breakdown: AgentUsageBreakdown
): AgentUsagePercentages => {
  if (!breakdown.total || breakdown.total <= 0) {
    return { contentPct: 0, codePct: 0, otherPct: 0 };
  }

  const rawContentPct = (breakdown.content / breakdown.total) * 100;
  const rawCodePct = (breakdown.code / breakdown.total) * 100;

  const contentPct = Math.round(rawContentPct);
  const codePct = Math.round(rawCodePct);

  const cappedContentPct = Math.min(Math.max(contentPct, 0), 100);
  const cappedCodePct = Math.min(Math.max(codePct, 0), 100);
  const otherPct = Math.max(0, 100 - cappedContentPct - cappedCodePct);

  return {
    contentPct: cappedContentPct,
    codePct: cappedCodePct,
    otherPct
  };
};

export interface DailyTaskSeries {
  labels: string[];
  values: number[];
}

export const buildDailyTaskSeriesFromLastDays = (
  lastDays: SystemMetricsDaySnapshot[] | undefined | null,
  locale = 'en-US'
): DailyTaskSeries => {
  if (!lastDays || !lastDays.length) {
    return { labels: [], values: [] };
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit'
  });

  const labels: string[] = [];
  const values: number[] = [];

  for (const snapshot of lastDays) {
    const date = new Date(snapshot.date);
    const label = Number.isNaN(date.getTime()) ? snapshot.date : formatter.format(date);
    labels.push(label);
    values.push(snapshot.total_tasks);
  }

  return { labels, values };
};
