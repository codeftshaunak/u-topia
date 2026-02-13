import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Settings, Loader2, Check, X, Clock, Link2, Megaphone } from 'lucide-react';

interface SettingEntry {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface EditState {
  [key: string]: {
    isEditing: boolean;
    value: string;
    isSaving: boolean;
  };
}

const settingIcons: Record<string, React.ReactNode> = {
  payout_timing_hours: <Clock className="w-4 h-4 text-primary" />,
  payout_cycle_days: <Clock className="w-4 h-4 text-primary" />,
  referral_link_single_use: <Link2 className="w-4 h-4 text-primary" />,
  campaign_enabled: <Megaphone className="w-4 h-4 text-primary" />,
};

const settingLabels: Record<string, string> = {
  payout_timing_hours: 'Payout Processing Time (hours)',
  payout_cycle_days: 'Payout Cycle Duration (days)',
  referral_link_single_use: 'Single-Use Referral Links',
  campaign_enabled: 'Campaign Mode Enabled',
};

export function PlatformSettings() {
  const { toast } = useToast();
  const { userEmail } = useAdmin();
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editState, setEditState] = useState<EditState>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      
      // Parse JSON values to strings for display, exclude deprecated settings
      const parsedData = (data || [])
        .filter(s => s.key !== 'environment_mode') // Remove deprecated test mode setting
        .map(s => ({
          ...s,
          value: typeof s.value === 'string' ? s.value : JSON.stringify(s.value).replace(/"/g, ''),
        }));
      
      setSettings(parsedData);
      
      // Initialize edit state
      const initialEditState: EditState = {};
      parsedData.forEach(s => {
        initialEditState[s.key] = { isEditing: false, value: s.value, isSaving: false };
      });
      setEditState(initialEditState);
    } catch (err) {
      console.error('Error fetching settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to load platform settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (key: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], isEditing: true, value },
    }));
  };

  const cancelEditing = (key: string) => {
    const original = settings.find(s => s.key === key);
    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], isEditing: false, value: original?.value || '' },
    }));
  };

  const updateValue = (key: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const saveSetting = async (key: string) => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return;

    const newValue = editState[key]?.value;
    
    // Validate based on setting type
    if (key === 'payout_timing_hours' || key === 'payout_cycle_days') {
      const num = parseInt(newValue, 10);
      if (isNaN(num) || num <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Value must be a positive number',
          variant: 'destructive',
        });
        return;
      }
    }

    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true },
    }));

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          value: newValue,
          updated_by: userEmail,
        })
        .eq('key', key);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_email: userEmail || 'unknown',
        action: 'UPDATE_SETTING',
        target_table: 'platform_settings',
        target_id: key,
        before: { value: setting.value },
        after: { value: newValue },
      });

      toast({
        title: 'Setting Updated',
        description: `${settingLabels[key] || key} has been updated`,
      });

      setEditState(prev => ({
        ...prev,
        [key]: { ...prev[key], isEditing: false, isSaving: false },
      }));
      
      fetchSettings();
    } catch (err) {
      console.error('Error saving setting:', err);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
      setEditState(prev => ({
        ...prev,
        [key]: { ...prev[key], isSaving: false },
      }));
    }
  };

  const toggleBooleanSetting = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    const setting = settings.find(s => s.key === key);
    
    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true },
    }));

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          value: newValue,
          updated_by: userEmail,
        })
        .eq('key', key);

      if (error) throw error;

      // Log the action
      await supabase.from('admin_audit_log').insert({
        admin_email: userEmail || 'unknown',
        action: 'UPDATE_SETTING',
        target_table: 'platform_settings',
        target_id: key,
        before: { value: currentValue },
        after: { value: newValue },
      });

      toast({
        title: 'Setting Updated',
        description: `${settingLabels[key] || key} has been ${newValue === 'true' ? 'enabled' : 'disabled'}`,
      });

      fetchSettings();
    } catch (err) {
      console.error('Error toggling setting:', err);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setEditState(prev => ({
        ...prev,
        [key]: { ...prev[key], isSaving: false },
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isBooleanSetting = (value: string) => value === 'true' || value === 'false';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Program Parameters</h3>
          <p className="text-sm text-muted-foreground">Configure platform behavior settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => {
          const state = editState[setting.key] || { isEditing: false, value: setting.value, isSaving: false };
          const isBoolean = isBooleanSetting(setting.value);

          return (
            <div key={setting.id} className="feature-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{settingIcons[setting.key] || <Settings className="w-4 h-4 text-muted-foreground" />}</div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-foreground">
                      {settingLabels[setting.key] || setting.key}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                    )}
                    
                    {isBoolean ? (
                      <div className="mt-3">
                        <Switch
                          checked={setting.value === 'true'}
                          onCheckedChange={() => toggleBooleanSetting(setting.key, setting.value)}
                          disabled={state.isSaving}
                        />
                      </div>
                    ) : state.isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={state.value}
                          onChange={(e) => updateValue(setting.key, e.target.value)}
                          className="w-24 h-8"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveSetting(setting.key)}
                          disabled={state.isSaving}
                          className="h-8 w-8 p-0"
                        >
                          {state.isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelEditing(setting.key)}
                          disabled={state.isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-semibold text-primary">{setting.value}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(setting.key, setting.value)}
                          className="h-6 px-2 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {setting.updated_by && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  Last updated by {setting.updated_by}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
