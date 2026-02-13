import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  format,
  subDays,
  startOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfWeek,
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

export function useReferralChartData() {
  const { user } = useAuth();
  const [data7Days, setData7Days] = useState<ChartDataPoint[]>([]);
  const [data30Days, setData30Days] = useState<ChartDataPoint[]>([]);
  const [dataAllTime, setDataAllTime] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all referrals for this user from custom API
      const response = await fetch("/api/referrals", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Error fetching referral chart data");
        setIsLoading(false);
        return;
      }

      const { referrals } = await response.json();

      if (!referrals || referrals.length === 0) {
        // Return empty data
        const emptyDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (name) => ({
            name,
            referrals: 0,
            verified: 0,
          }),
        );
        setData7Days(emptyDays);
        setData30Days([
          { name: "Week 1", referrals: 0, verified: 0 },
          { name: "Week 2", referrals: 0, verified: 0 },
          { name: "Week 3", referrals: 0, verified: 0 },
          { name: "Week 4", referrals: 0, verified: 0 },
        ]);
        setDataAllTime([]);
        setIsLoading(false);
        return;
      }

      const now = new Date();

      // 7-day data (by day)
      const last7Days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now,
      });

      const sevenDayData = last7Days.map((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayReferrals = referrals.filter((r: ReferralData) => {
          const created = new Date(r.signupDate);
          return created >= dayStart && created < dayEnd;
        });

        const verified = dayReferrals.filter(
          (r: ReferralData) => r.status === "active",
        ).length;

        return {
          name: format(day, "EEE"),
          referrals: dayReferrals.length,
          verified,
        };
      });

      setData7Days(sevenDayData);

      // 30-day data (by week)
      const last30Days = eachWeekOfInterval(
        {
          start: subDays(now, 27),
          end: now,
        },
        { weekStartsOn: 1 },
      );

      const thirtyDayData = last30Days.slice(0, 4).map((weekStart, index) => {
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const weekReferrals = referrals.filter((r: ReferralData) => {
          const created = new Date(r.signupDate);
          return created >= weekStart && created < weekEnd;
        });

        const verified = weekReferrals.filter(
          (r: ReferralData) => r.status === "active",
        ).length;

        return {
          name: `Week ${index + 1}`,
          referrals: weekReferrals.length,
          verified,
        };
      });

      setData30Days(thirtyDayData);

      // All-time data (by month)
      if (referrals.length > 0) {
        const firstReferral = new Date(referrals[0].signupDate);
        const months = eachMonthOfInterval({
          start: startOfMonth(firstReferral),
          end: now,
        });

        const allTimeData = months.slice(-12).map((monthStart) => {
          const monthEnd = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth() + 1,
            1,
          );

          const monthReferrals = referrals.filter((r: ReferralData) => {
            const created = new Date(r.signupDate);
            return created >= monthStart && created < monthEnd;
          });

          const verified = monthReferrals.filter(
            (r: ReferralData) => r.status === "active",
          ).length;

          return {
            name: format(monthStart, "MMM"),
            referrals: monthReferrals.length,
            verified,
          };
        });

        setDataAllTime(allTimeData);
      }
    } catch (err) {
      console.error("Error in fetchChartData:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const getData = (timeRange: TimeRange): ChartDataPoint[] => {
    switch (timeRange) {
      case "7days":
        return data7Days;
      case "30days":
        return data30Days;
      case "all":
        return dataAllTime;
      default:
        return data7Days;
    }
  };

  return {
    data7Days,
    data30Days,
    dataAllTime,
    getData,
    isLoading,
    refetch: fetchChartData,
  };
}
