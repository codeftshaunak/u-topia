import { useState } from 'react';
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
import { Package as PackageIcon, Pencil, Loader2, Plus, Trash2 } from 'lucide-react';
import { useGetPackagesQuery, useUpdatePackageMutation } from '@/store/features/packages/packagesApi';
import type { Package, CommissionLevel } from '@/store/features/packages/packagesApi';
import { getCommissionLevels, getTotalCommissionRate } from '@/hooks/usePackages';

export function PackagesSettings() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useGetPackagesQuery();
  const [updatePackage, { isLoading: isSaving }] = useUpdatePackageMutation();

  const packages = data?.packages ?? [];

  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formPrice, setFormPrice] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLevels, setFormLevels] = useState<CommissionLevel[]>([]);

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormPrice(pkg.priceUsd.toString());
    setFormIsActive(pkg.isActive);
    setFormLevels(getCommissionLevels(pkg).map(l => ({ ...l })));
  };

  const closeEditModal = () => {
    setEditingPackage(null);
    setFormPrice('');
    setFormIsActive(true);
    setFormLevels([]);
  };

  const addLevel = () => {
    const next = formLevels.length + 1;
    setFormLevels([...formLevels, { level: next, rate: 0 }]);
  };

  const removeLevel = (idx: number) => {
    const updated = formLevels
      .filter((_, i) => i !== idx)
      .map((l, i) => ({ ...l, level: i + 1 }));
    setFormLevels(updated);
  };

  const updateLevelRate = (idx: number, rate: number) => {
    setFormLevels(formLevels.map((l, i) => i === idx ? { ...l, rate } : l));
  };

  const savePackage = async () => {
    if (!editingPackage) return;

    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: 'Validation Error', description: 'Price must be greater than 0', variant: 'destructive' });
      return;
    }
    if (formLevels.some(l => isNaN(l.rate) || l.rate < 0)) {
      toast({ title: 'Validation Error', description: 'All commission rates must be 0 or greater', variant: 'destructive' });
      return;
    }

    try {
      await updatePackage({
        id: editingPackage.id,
        priceUsd: price,
        isActive: formIsActive,
        commissionLevels: formLevels.filter(l => l.rate > 0),
      }).unwrap();

      toast({ title: 'Package Updated', description: `${editingPackage.name} updated successfully.` });
      closeEditModal();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.data?.error ?? 'Failed to update package',
        variant: 'destructive',
      });
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
          <PackageIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Package Management</h3>
          <p className="text-sm text-muted-foreground">Configure membership tiers, pricing and commission levels</p>
        </div>
      </div>

      <div className="feature-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Commission Levels</TableHead>
              <TableHead>Total Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => {
              const levels = getCommissionLevels(pkg);
              const total = getTotalCommissionRate(pkg);
              return (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>${pkg.priceUsd.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {levels.map(l => (
                        <span key={l.level} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                          L{l.level}: {l.rate}%
                        </span>
                      ))}
                      {levels.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{total > 0 ? `${total}%` : '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={pkg.isActive ? 'bg-green-500/10 text-green-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(pkg)} className="hover:bg-primary/10">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editingPackage?.name} Package</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Price */}
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

            {/* Commission Levels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>UniLevel Commission Levels</Label>
                <Button variant="outline" size="sm" onClick={addLevel} className="gap-1 h-7 text-xs">
                  <Plus className="w-3 h-3" /> Add Level
                </Button>
              </div>
              {formLevels.length === 0 && (
                <p className="text-sm text-muted-foreground">No commission levels configured.</p>
              )}
              <div className="space-y-2">
                {formLevels.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16 shrink-0 text-muted-foreground">Level {l.level}</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.0001"
                      value={l.rate}
                      onChange={(e) => updateLevelRate(idx, parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => removeLevel(idx)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              {formLevels.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total: <span className="font-medium text-primary">{formLevels.reduce((s, l) => s + (l.rate || 0), 0).toFixed(4).replace(/\.?0+$/, '')}%</span>
                </p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch id="isActive" checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            <Button onClick={savePackage} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
