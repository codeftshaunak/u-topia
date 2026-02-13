import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminActivityRow {
  id: string;
  timestamp: Date;
  userEmail: string;
  eventType: string;
  status: "success" | "pending" | "failed";
  amount?: number;
}

export function useAdminActivity(limit = 200) {
  const [activities, setActivities] = useState<AdminActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: dbError } = await supabase
        .from("platform_activity")
        .select("id, created_at, event_type, status, user_email, amount")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (dbError) throw dbError;

      const mapped: AdminActivityRow[] = (data || []).map((row: any) => ({
        id: row.id,
        timestamp: new Date(row.created_at),
        userEmail: row.user_email || "—",
        eventType: row.event_type,
        status: (row.status === "success" || row.status === "failed" || row.status === "pending"
          ? row.status
          : "success") as AdminActivityRow["status"],
        amount: row.amount ?? undefined,
      }));

      setActivities(mapped);
    } catch (e: any) {
      console.error("useAdminActivity error", e);
      setError("Failed to load activity");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivity();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-activity-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_activity' },
        () => fetchActivity()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivity]);

  return useMemo(
    () => ({ activities, isLoading, error, refetch: fetchActivity }),
    [activities, isLoading, error, fetchActivity]
  );
}
