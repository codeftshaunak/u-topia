/**
 * useReferralChartData – RTK Query backed hook.
 * Derives 7-day / 30-day / all-time chart data from the cached referrals
 * already fetched by useGetReferralsQuery (no extra network request).
 */
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetReferralsQuery } from "@/store/features/referrals/referralsApi";
import {
  format,
  subDays,
  startOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfMonth,
} from "date-fns";

export interface ChartDataPoint {
  name: string;
  referrals: number;
  verified: number;
}

type TimeRange = "7days" | "30days" | "all";

interface ReferralData {
  id: string;
  signupDate: string;
  status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_7DAYS: ChartDataPoint[] = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
].map((name) => ({ name, referrals: 0, verified: 0 }));

const EMPTY_30DAYS: ChartDataPoint[] = [
  "Week 1", "Week 2", "Week 3", "Week 4",
].map((name) => ({ name, referrals: 0, verified: 0 }));

function build7DayData(referrals: ReferralData[], now: Date): ChartDataPoint[] {
  return eachDayOfInterval({ start: subDays(now, 6), end: now }).map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart.getTime() + 86_400_000);
    const dayRefs = referrals.filter((r) => {
      const d = new Date(r.signupDate);
      return d >= dayStart && d < dayEnd;
    });
    return {
      name: format(day, "EEE"),
      referrals: dayRefs.length,
      verified: dayRefs.filter((r) => r.status === "active").length,
    };
  });
}

function build30DayData(referrals: ReferralData[], now: Date): ChartDataPoint[] {
  const weeks = eachWeekOfInterval(
    { start: subDays(now, 27), end: now },
    { weekStartsOn: 1 },
  ).slice(0, 4);

  return weeks.map((weekStart, index) => {
    const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
    const weekRefs = referrals.filter((r) => {
      const d = new Date(r.signupDate);
      return d >= weekStart && d < weekEnd;
    });
    return {
      name: `Week ${index + 1}`,
      referrals: weekRefs.length,
      verified: weekRefs.filter((r) => r.status === "active").length,
    };
  });
}

function buildAllTimeData(referrals: ReferralData[], now: Date): ChartDataPoint[] {
  if (!referrals.length) return [];
  const firstDate = new Date(referrals[referrals.length - 1].signupDate);
  return eachMonthOfInterval({ start: startOfMonth(firstDate), end: now })
    .slice(-12)
    .map((monthStart) => {
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        1,
      );
      const monthRefs = referrals.filter((r) => {
        const d = new Date(r.signupDate);
        return d >= monthStart && d < monthEnd;
      });
      return {
        name: format(monthStart, "MMM"),
        referrals: monthRefs.length,
        verified: monthRefs.filter((r) => r.status === "active").length,
      };
    });
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useReferralChartData() {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useGetReferralsQuery(undefined, {
    skip: !user,
  });

  const now = useMemo(() => new Date(), []);
  const referrals = useMemo(
    () => (data?.referrals ?? []) as ReferralData[],
    [data],
  );

  const data7Days = useMemo(
    () => (referrals.length ? build7DayData(referrals, now) : EMPTY_7DAYS),
    [referrals, now],
  );

  const data30Days = useMemo(
    () => (referrals.length ? build30DayData(referrals, now) : EMPTY_30DAYS),
    [referrals, now],
  );

  const dataAllTime = useMemo(
    () => buildAllTimeData(referrals, now),
    [referrals, now],
  );

  const getData = (timeRange: TimeRange): ChartDataPoint[] => {
    switch (timeRange) {
      case "7days":  return data7Days;
      case "30days": return data30Days;
      case "all":    return dataAllTime;
      default:       return data7Days;
    }
  };

  return {
    data7Days,
    data30Days,
    dataAllTime,
    getData,
    isLoading: isLoading && !data,
    refetch: () => { refetch(); },
  };
}
