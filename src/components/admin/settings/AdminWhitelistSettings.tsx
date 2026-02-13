import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Trash2, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AdminEntry {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export function AdminWhitelistSettings() {
  const { toast } = useToast();
  const { userEmail } = useAdmin();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'disable' | 'remove'; admin: AdminEntry } | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_whitelist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      toast({
        title: 'Error',
        description: 'Failed to load admin list',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdmin = async () => {
    const email = newEmail.toLowerCase().trim();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error: insertError } = await supabase
        .from('admin_whitelist')
        .insert({ 
          email, 
          created_by: userEmail,
          updated_by: userEmail,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          toast({
            title: 'Already Exists',
            description: 'This email is already in the admin list',
            variant: 'destructive',
          });
        } else {
          throw insertError;
        }
        return;
      }

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_email: userEmail || 'unknown',
        action: 'ADD_ADMIN',
        target_table: 'admin_whitelist',
        target_id: email,
        after: { email, is_active: true },
      });

      toast({
        title: 'Admin Added',
        description: `${email} has been added to the admin whitelist`,
      });
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      console.error('Error adding admin:', err);
      toast({
        title: 'Error',
        description: 'Failed to add admin',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const canModifyAdmin = (admin: AdminEntry): boolean => {
    // Check if this is the last active admin
    const activeAdmins = admins.filter(a => a.is_active);
    if (activeAdmins.length === 1 && admin.is_active) {
      return false;
    }
    return true;
  };

  const toggleAdmin = async (admin: AdminEntry) => {
    if (!canModifyAdmin(admin) && admin.is_active) {
      toast({
        title: 'Cannot Disable',
        description: 'Cannot disable the last active admin',
        variant: 'destructive',
      });
      return;
    }

    if (admin.is_active) {
      setConfirmDialog({ type: 'disable', admin });
    } else {
      await performToggle(admin);
    }
  };

  const performToggle = async (admin: AdminEntry) => {
    try {
      const { error } = await supabase
        .from('admin_whitelist')
        .update({ 
          is_active: !admin.is_active,
          updated_by: userEmail,
        })
        .eq('id', admin.id);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_email: userEmail || 'unknown',
        action: admin.is_active ? 'DISABLE_ADMIN' : 'ENABLE_ADMIN',
        target_table: 'admin_whitelist',
        target_id: admin.id,
        before: { is_active: admin.is_active },
        after: { is_active: !admin.is_active },
      });

      toast({
        title: admin.is_active ? 'Admin Disabled' : 'Admin Enabled',
        description: `Admin access has been ${admin.is_active ? 'disabled' : 'enabled'} for ${admin.email}`,
      });
      fetchAdmins();
    } catch (err) {
      console.error('Error toggling admin:', err);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
    setConfirmDialog(null);
  };

  const removeAdmin = async (admin: AdminEntry) => {
    if (!canModifyAdmin(admin)) {
      toast({
        title: 'Cannot Remove',
        description: 'Cannot remove the last active admin',
        variant: 'destructive',
      });
      return;
    }
    setConfirmDialog({ type: 'remove', admin });
  };

  const performRemove = async (admin: AdminEntry) => {
    try {
      const { error } = await supabase
        .from('admin_whitelist')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_email: userEmail || 'unknown',
        action: 'REMOVE_ADMIN',
        target_table: 'admin_whitelist',
        target_id: admin.id,
        before: { email: admin.email, is_active: admin.is_active },
      });

      toast({
        title: 'Admin Removed',
        description: `${admin.email} has been removed from the admin whitelist`,
      });
      fetchAdmins();
    } catch (err) {
      console.error('Error removing admin:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove admin',
        variant: 'destructive',
      });
    }
    setConfirmDialog(null);
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
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Admin Whitelist</h3>
          <p className="text-sm text-muted-foreground">Manage platform administrators</p>
        </div>
      </div>

      {/* Add Admin Form */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter admin email..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
          className="max-w-md"
        />
        <Button onClick={addAdmin} disabled={isAdding}>
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          {!isAdding && 'Add Admin'}
        </Button>
      </div>

      {/* Admin List */}
      <div className="feature-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No admins configured
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={admin.is_active ? 'bg-green-500/10 text-green-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}
                    >
                      {admin.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(admin.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {admin.created_by || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={admin.is_active}
                        onCheckedChange={() => toggleAdmin(admin)}
                        disabled={!canModifyAdmin(admin) && admin.is_active}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdmin(admin)}
                        disabled={!canModifyAdmin(admin)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === 'disable' ? 'Disable Admin?' : 'Remove Admin?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'disable'
                ? `Are you sure you want to disable admin access for ${confirmDialog?.admin.email}? They will no longer be able to access admin features.`
                : `Are you sure you want to remove ${confirmDialog?.admin.email} from the admin whitelist? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog?.type === 'disable') {
                  performToggle(confirmDialog.admin);
                } else if (confirmDialog?.type === 'remove') {
                  performRemove(confirmDialog.admin);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              {confirmDialog?.type === 'disable' ? 'Disable' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
