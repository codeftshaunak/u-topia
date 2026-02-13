import { PackagesSettings } from './PackagesSettings';
import { AdminWhitelistSettings } from './AdminWhitelistSettings';
import { PlatformSettings } from './PlatformSettings';
import { AuditLog } from './AuditLog';
import { Separator } from '@/components/ui/separator';

export function AdminSettings() {
  return (
    <div className="space-y-12">
      <PackagesSettings />
      
      <Separator />
      
      <AdminWhitelistSettings />
      
      <Separator />
      
      <PlatformSettings />
      
      <Separator />
      
      <AuditLog />
    </div>
  );
}
