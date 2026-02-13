import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Package, Pencil, Loader2, DollarSign } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface PackageEntry {
  id: string;
  name: string;
  price_usd: number;
  shares: number;
  dividend_cap_percent: number;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export function PackagesSettings() {
  const { toast } = useToast();
  const { userEmail } = useAdmin();
  const [packages, setPackages] = useState<PackageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<PackageEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formPrice, setFormPrice] = useState('');
  const [formShares, setFormShares] = useState('');
  const [formDividendCap, setFormDividendCap] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price_usd', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
      toast({
        title: 'Error',
        description: 'Failed to load packages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (pkg: PackageEntry) => {
    setEditingPackage(pkg);
    setFormPrice(pkg.price_usd.toString());
    setFormShares(pkg.shares.toString());
    setFormDividendCap(pkg.dividend_cap_percent.toString());
    setFormIsActive(pkg.is_active);
  };

  const closeEditModal = () => {
    setEditingPackage(null);
    setFormPrice('');
    setFormShares('');
    setFormDividendCap('');
    setFormIsActive(true);
  };

  const savePackage = async () => {
    if (!editingPackage) return;

    const price = parseFloat(formPrice);
    const shares = parseInt(formShares, 10);
    const dividendCap = parseFloat(formDividendCap);

    // Validation
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(shares) || shares <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Shares must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(dividendCap) || dividendCap < 0 || dividendCap > 10) {
      toast({
        title: 'Validation Error',
        description: 'Dividend cap must be between 0 and 10',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get current values for audit log
      const beforeData = {
        price_usd: editingPackage.price_usd,
        shares: editingPackage.shares,
        dividend_cap_percent: editingPackage.dividend_cap_percent,
        is_active: editingPackage.is_active,
      };

      const afterData = {
        price_usd: price,
        shares: shares,
        dividend_cap_percent: dividendCap,
        is_active: formIsActive,
      };

      // Check if price changed - if so, sync with Stripe first
      if (price !== editingPackage.price_usd) {
        toast({
          title: 'Syncing with Stripe...',
          description: 'Updating payment configuration',
        });

        const { data: stripeData, error: stripeError } = await supabase.functions.invoke(
          'sync-stripe-price',
          {
            body: {
              package_id: editingPackage.id,
              price_usd: price,
              name: editingPackage.name,
            },
          }
        );

        if (stripeError || stripeData?.error) {
          throw new Error(stripeData?.error || stripeError?.message || 'Failed to sync with Stripe');
        }

        console.log('Stripe sync successful:', stripeData);
      }

      // Update package in database
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          price_usd: price,
          shares: shares,
          dividend_cap_percent: dividendCap,
          is_active: formIsActive,
          updated_by: userEmail,
        })
        .eq('id', editingPackage.id);

      if (updateError) throw updateError;

      // Log the action
      const { error: logError } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_email: userEmail || 'unknown',
          action: 'UPDATE_PACKAGE',
          target_table: 'packages',
          target_id: editingPackage.id,
          before: beforeData,
          after: afterData,
        });

      if (logError) console.error('Failed to log action:', logError);

      toast({
        title: 'Package Updated',
        description: `${editingPackage.name} package has been updated successfully (including Stripe pricing)`,
      });

      closeEditModal();
      fetchPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update package',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Package Management</h3>
          <p className="text-sm text-muted-foreground">Configure membership tiers and pricing</p>
        </div>
      </div>

      <div className="feature-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Dividend Cap %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    {pkg.price_usd.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>{pkg.shares.toLocaleString()}</TableCell>
                <TableCell>{pkg.dividend_cap_percent}%</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={pkg.is_active ? 'bg-green-500/10 text-green-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}
                  >
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(pkg)}
                    className="hover:bg-primary/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingPackage?.name} Package</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="1"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="Enter price..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                step="1"
                value={formShares}
                onChange={(e) => setFormShares(e.target.value)}
                placeholder="Enter shares..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dividendCap">Dividend Cap Percent (0-10)</Label>
              <Input
                id="dividendCap"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formDividendCap}
                onChange={(e) => setFormDividendCap(e.target.value)}
                placeholder="Enter dividend cap..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={savePackage} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
