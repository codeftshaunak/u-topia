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
import { Search, ChevronDown, Info, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useReferrals, getDisplayStatus } from '@/hooks/useReferrals';
import { format } from 'date-fns';

// Status types matching the new terminology
type DisplayStatus = 'Signed Up' | 'Pending Activation' | 'Commissionable' | 'Inactive' | 'Reversed';
type FilterStatus = 'All' | DisplayStatus;

const statusDescriptions: Record<DisplayStatus, string> = {
  'Signed Up': 'User created an account but has not purchased a package',
  'Pending Activation': 'Package purchase initiated but not yet confirmed',
  'Commissionable': 'Package purchased and confirmed - eligible for commission',
  'Inactive': 'No qualifying activity',
  'Reversed': 'Purchase was reversed or invalidated',
};

export function ReferralTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const { referrals, isLoading, error } = useReferrals();

  const filteredReferrals = referrals.filter(referral => {
    const displayStatus = getDisplayStatus(referral);
    const displayName = referral.referredName || referral.referredEmail;
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || displayStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: DisplayStatus) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'Commissionable':
        return `${baseClasses} bg-emerald-500/10 text-emerald-600 border border-emerald-500/20`;
      case 'Signed Up':
        return `${baseClasses} bg-blue-500/10 text-blue-600 border border-blue-500/20`;
      case 'Pending Activation':
        return `${baseClasses} bg-amber-500/10 text-amber-600 border border-amber-500/20`;
      case 'Inactive':
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
      case 'Reversed':
        return `${baseClasses} bg-red-500/10 text-red-500 border border-red-500/20`;
      default:
        return baseClasses;
    }
  };

  if (isLoading) {
    return (
      <div className="feature-card p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-card p-6 md:p-8">
        <div className="text-center py-8 text-muted-foreground">
          Failed to load referrals. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="feature-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Referred Users</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Commissions are earned only after a referred user purchases a package.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">View your referrals and their commission status</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
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
              <DropdownMenuItem onClick={() => setFilterStatus('Commissionable')}>Commissionable</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Signed Up')}>Signed Up</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Pending Activation')}>Pending Activation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Inactive')}>Inactive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Reversed')}>Reversed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        {referrals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No referrals yet</p>
            <p className="text-sm">Share your referral link to start earning commissions!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 md:-mx-8">
            <div className="min-w-[700px] px-6 md:px-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Sign-up Date</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Package</TableHead>
                    <TableHead className="text-muted-foreground text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral, index) => {
                    const displayStatus = getDisplayStatus(referral) as DisplayStatus;
                    const displayName = referral.referredName || referral.referredEmail;
                    
                    return (
                      <TableRow 
                        key={referral.id} 
                        className={`border-border ${index % 2 === 0 ? 'bg-secondary/20' : ''}`}
                      >
                        <TableCell className="font-medium text-foreground">{displayName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(referral.signupDate), 'yyyy-MM-dd')}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={getStatusBadge(displayStatus)}>
                                {displayStatus}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{statusDescriptions[displayStatus]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {referral.packagePurchased || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {referral.commissionEarned > 0 ? (
                            <span className="text-emerald-600 font-medium">${referral.commissionEarned.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filteredReferrals.length === 0 && referrals.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No referrals found matching your criteria.
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Only "Commissionable" referrals generate commission earnings. A referral becomes commissionable after the referred user purchases and confirms a package.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
