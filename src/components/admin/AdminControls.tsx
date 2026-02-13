import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Shield, Clock, DollarSign, Percent, Loader2 } from 'lucide-react';

interface AdminEntry {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export function AdminControls() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

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
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('admin_whitelist')
        .insert({ email: newEmail.toLowerCase().trim() });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Exists',
            description: 'This email is already in the admin list',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Admin Added',
        description: `${newEmail} has been added to the admin whitelist`,
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

  const toggleAdmin = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_whitelist')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? 'Admin Disabled' : 'Admin Enabled',
        description: `Admin access has been ${currentStatus ? 'disabled' : 'enabled'}`,
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
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the admin list?`)) return;

    try {
      const { error } = await supabase
        .from('admin_whitelist')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Admin Removed',
        description: `${email} has been removed from the admin whitelist`,
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Admin Whitelist Management */}
      <div className="feature-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Admin Whitelist</h3>
            <p className="text-sm text-muted-foreground">Manage admin access</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter admin email..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
            className="flex-1"
          />
          <Button onClick={addAdmin} disabled={isAdding}>
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No admins configured</p>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{admin.email}</span>
                  <Badge variant="outline" className={admin.is_active ? 'bg-green-500/10 text-green-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}>
                    {admin.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={admin.is_active}
                    onCheckedChange={() => toggleAdmin(admin.id, admin.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdmin(admin.id, admin.email)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Parameters (Read-only) */}
      <div className="feature-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Platform Parameters</h3>
            <p className="text-sm text-muted-foreground">Current configuration (read-only)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Payout Timing</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Commission:</div>
              <div className="text-foreground">24 hours</div>
              <div className="text-muted-foreground">Bonuses:</div>
              <div className="text-foreground">7 days</div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tier Prices</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Bronze:</div>
              <div className="text-primary font-medium">$99</div>
              <div className="text-muted-foreground">Silver:</div>
              <div className="text-primary font-medium">$199</div>
              <div className="text-muted-foreground">Gold:</div>
              <div className="text-primary font-medium">$499</div>
              <div className="text-muted-foreground">Platinum:</div>
              <div className="text-primary font-medium">$999</div>
              <div className="text-muted-foreground">Diamond:</div>
              <div className="text-primary font-medium">$2,499</div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Commission Rates</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Direct Referral:</div>
              <div className="text-foreground">10%</div>
              <div className="text-muted-foreground">Network Bonus:</div>
              <div className="text-foreground">5%</div>
              <div className="text-muted-foreground">Dividend Pool:</div>
              <div className="text-foreground">2%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
