import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { History, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  target_table: string;
  target_id: string | null;
  before: unknown;
  after: unknown;
  created_at: string;
}

const actionColors: Record<string, string> = {
  UPDATE_PACKAGE: 'bg-blue-500/10 text-blue-500',
  ADD_ADMIN: 'bg-green-500/10 text-green-500',
  REMOVE_ADMIN: 'bg-red-500/10 text-red-500',
  ENABLE_ADMIN: 'bg-green-500/10 text-green-500',
  DISABLE_ADMIN: 'bg-yellow-500/10 text-yellow-500',
  UPDATE_SETTING: 'bg-purple-500/10 text-purple-500',
};

const actionLabels: Record<string, string> = {
  UPDATE_PACKAGE: 'Updated Package',
  ADD_ADMIN: 'Added Admin',
  REMOVE_ADMIN: 'Removed Admin',
  ENABLE_ADMIN: 'Enabled Admin',
  DISABLE_ADMIN: 'Disabled Admin',
  UPDATE_SETTING: 'Updated Setting',
};

export function AuditLog() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast({
        title: 'Error',
        description: 'Failed to load audit log',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatChanges = (before: unknown, after: unknown): string => {
    const beforeObj = before && typeof before === 'object' ? before as Record<string, unknown> : null;
    const afterObj = after && typeof after === 'object' ? after as Record<string, unknown> : null;
    
    if (!beforeObj && !afterObj) return '-';
    
    if (!beforeObj && afterObj) {
      return Object.entries(afterObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    if (beforeObj && !afterObj) {
      return `Removed: ${Object.entries(beforeObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}`;
    }
    
    if (beforeObj && afterObj) {
      const changes: string[] = [];
      Object.keys(afterObj).forEach(key => {
        if (beforeObj[key] !== afterObj[key]) {
          changes.push(`${key}: ${beforeObj[key]} → ${afterObj[key]}`);
        }
      });
      return changes.length > 0 ? changes.join(', ') : 'No changes';
    }
    
    return '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          <History className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Admin Changes</h3>
          <p className="text-sm text-muted-foreground">Last 20 admin actions on the platform</p>
        </div>
      </div>

      <div className="feature-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No admin actions recorded yet
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{log.admin_email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-0 ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}
                    >
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.target_table}
                    {log.target_id && <span className="text-xs ml-1">({log.target_id.slice(0, 8)}...)</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {formatChanges(log.before, log.after)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
