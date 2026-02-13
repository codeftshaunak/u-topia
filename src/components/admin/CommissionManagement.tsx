import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAdminCommissions } from '@/hooks/useAdminStats';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatUSD } from '@/hooks/useCommissions';

type CommissionStatus = 'pending' | 'approved' | 'paid' | 'held' | 'reversed';
type FilterStatus = 'All' | CommissionStatus;

const statusConfig: Record<CommissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: <Clock className="w-3 h-3" />
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: <CheckCircle className="w-3 h-3" />
  },
  paid: { 
    label: 'Paid', 
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: <DollarSign className="w-3 h-3" />
  },
  held: { 
    label: 'Held', 
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: <AlertCircle className="w-3 h-3" />
  },
  reversed: { 
    label: 'Reversed', 
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: <XCircle className="w-3 h-3" />
  },
};

export function CommissionManagement() {
  const { toast } = useToast();
  const { commissions, isLoading, error, updateCommissionStatus, refetch } = useAdminCommissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: CommissionStatus;
    count: number;
  }>({ open: false, action: 'approved', count: 0 });

  const filteredCommissions = commissions.filter(commission => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      commission.beneficiaryEmail.toLowerCase().includes(searchLower) ||
      commission.referredEmail.toLowerCase().includes(searchLower) ||
      (commission.beneficiaryName?.toLowerCase().includes(searchLower) || false);
    const matchesFilter = filterStatus === 'All' || commission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCommissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCommissions.map(c => c.id)));
    }
  };

  const handleBulkAction = async (newStatus: CommissionStatus) => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select commissions to update.',
        variant: 'destructive',
      });
      return;
    }

    setConfirmDialog({
      open: true,
      action: newStatus,
      count: selectedIds.size,
    });
  };

  const confirmBulkAction = async () => {
    setIsUpdating(true);
    const result = await updateCommissionStatus(
      Array.from(selectedIds),
      confirmDialog.action
    );

    if (result.success) {
      toast({
        title: 'Success',
        description: `${selectedIds.size} commission(s) updated to ${confirmDialog.action}.`,
      });
      setSelectedIds(new Set());
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update commissions.',
        variant: 'destructive',
      });
    }

    setIsUpdating(false);
    setConfirmDialog({ open: false, action: 'approved', count: 0 });
  };

  // Calculate summary stats
  const pendingCount = commissions.filter(c => c.status === 'pending').length;
  const pendingAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  if (isLoading) {
    return (
      <div className="feature-card p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-card p-6">
        <div className="text-center py-8 text-muted-foreground">
          Failed to load commissions. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="feature-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-sm text-amber-600">{formatUSD(pendingAmount)} awaiting</p>
        </div>
        <div className="feature-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Selected</p>
          <p className="text-2xl font-bold text-foreground">{selectedIds.size}</p>
          <p className="text-sm text-muted-foreground">commission(s)</p>
        </div>
        <div className="feature-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Records</p>
          <p className="text-2xl font-bold text-foreground">{commissions.length}</p>
          <p className="text-sm text-muted-foreground">in ledger</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="feature-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Commission Ledger</h3>
            <p className="text-sm text-muted-foreground">Manage and update commission statuses</p>
          </div>
          
          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('approved')}
              disabled={selectedIds.size === 0 || isUpdating}
              className="gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('paid')}
              disabled={selectedIds.size === 0 || isUpdating}
              className="gap-1 text-emerald-600 border-emerald-600/30 hover:bg-emerald-600/10"
            >
              <DollarSign className="w-4 h-4" />
              Mark Paid
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('held')}
              disabled={selectedIds.size === 0 || isUpdating}
              className="gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              Hold
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-secondary/50 border-border"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                Status: {filterStatus}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('All')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('approved')}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('paid')}>Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('held')}>Held</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('reversed')}>Reversed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        {commissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No commissions recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="min-w-[900px] px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === filteredCommissions.length && filteredCommissions.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground">Beneficiary</TableHead>
                    <TableHead className="text-muted-foreground">From Referral</TableHead>
                    <TableHead className="text-muted-foreground">Layer</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission, index) => {
                    const config = statusConfig[commission.status as CommissionStatus] || statusConfig.pending;
                    
                    return (
                      <TableRow 
                        key={commission.id} 
                        className={`border-border ${index % 2 === 0 ? 'bg-secondary/20' : ''}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(commission.id)}
                            onCheckedChange={() => toggleSelect(commission.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {commission.beneficiaryName || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">{commission.beneficiaryEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {commission.referredEmail}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            L{commission.layer}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {formatUSD(commission.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1 ${config.color} border`}>
                            {config.icon}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(commission.createdAt), 'yyyy-MM-dd')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filteredCommissions.length === 0 && commissions.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No commissions found matching your criteria.
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !isUpdating && setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {confirmDialog.count} commission(s) to "{confirmDialog.action}"?
              {confirmDialog.action === 'paid' && (
                <span className="block mt-2 text-amber-600">
                  Note: Marking as paid indicates the funds have been transferred to the affiliate.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAction} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
