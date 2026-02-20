export const dynamic = "force-dynamic";


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Upload,
  User,
  Check,
  Loader2,
  Bell,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  maleAvatars,
  femaleAvatars,
  Avatar as AvatarType,
} from "@/data/avatarLibrary";
import { useAuth } from "@/contexts/AuthContext";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/features/profile/profileApi";
import { useDeleteAccountMutation } from "@/store/features/auth/authApi";
const logoDark = "/u-topia-logo-dark.png";

interface NotificationPreferences {
  marketing: boolean;
  referral_updates: boolean;
  commission_alerts: boolean;
  platform_news: boolean;
}

const defaultPreferences: NotificationPreferences = {
  marketing: true,
  referral_updates: true,
  commission_alerts: true,
  platform_news: true,
};

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  const { data: profileData, isLoading: loading } = useGetProfileQuery(
    undefined,
    { skip: !user },
  );
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  // Sync RTK data into local form state once loaded
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!profileData?.profile) return;

    const p = profileData.profile;
    setFullName(p.fullName || "");
    setAvatarUrl(p.avatarUrl ?? null);

    if (p.notificationPreferences) {
      const prefs = p.notificationPreferences as Record<string, unknown>;
      setNotificationPreferences({
        marketing:
          typeof prefs.marketing === "boolean"
            ? prefs.marketing
            : defaultPreferences.marketing,
        referral_updates:
          typeof prefs.referral_updates === "boolean"
            ? prefs.referral_updates
            : defaultPreferences.referral_updates,
        commission_alerts:
          typeof prefs.commission_alerts === "boolean"
            ? prefs.commission_alerts
            : defaultPreferences.commission_alerts,
        platform_news:
          typeof prefs.platform_news === "boolean"
            ? prefs.platform_news
            : defaultPreferences.platform_news,
      });
    }

    const allAvatars = [...maleAvatars, ...femaleAvatars];
    const libraryAvatar = allAvatars.find((a) => a.url === p.avatarUrl);
    if (libraryAvatar) setSelectedAvatarId(libraryAvatar.id);
  }, [profileData, user, navigate]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    toast.info("Use the avatar gallery below to select a default avatar");
    const fileInput = event.target;
    fileInput.value = "";
  };

  const handleAvatarSelect = async (avatar: AvatarType) => {
    setAvatarUrl(avatar.url);
    setSelectedAvatarId(avatar.id);
    try {
      await updateProfile({ avatarUrl: avatar.url }).unwrap();
      toast.success("Avatar updated successfully");
    } catch {
      toast.error("Failed to update avatar");
      setAvatarUrl(null);
      setSelectedAvatarId(null);
    }
  };

  const handleNotificationChange = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile({ fullName, avatarUrl: avatarUrl ?? undefined, notificationPreferences }).unwrap();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    try {
      await deleteAccount().unwrap();
      toast.success("Account deleted successfully");
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.data?.error || "Failed to delete account");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          {/* Current Avatar Preview */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Your Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="relative w-full">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  JPG or PNG, max 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose what emails you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="commission_alerts">Commission Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you earn commissions
                    </p>
                  </div>
                  <Switch
                    id="commission_alerts"
                    checked={notificationPreferences.commission_alerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("commission_alerts", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="referral_updates">Referral Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Updates about your referral activity
                    </p>
                  </div>
                  <Switch
                    id="referral_updates"
                    checked={notificationPreferences.referral_updates}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("referral_updates", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="platform_news">Platform News</Label>
                    <p className="text-xs text-muted-foreground">
                      Important updates about U-topia
                    </p>
                  </div>
                  <Switch
                    id="platform_news"
                    checked={notificationPreferences.platform_news}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("platform_news", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing & Promotions</Label>
                    <p className="text-xs text-muted-foreground">
                      Special offers and promotional content
                    </p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notificationPreferences.marketing}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("marketing", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Avatar Library */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Avatar Library
                </CardTitle>
                <CardDescription>
                  Choose from our collection of avatars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="male" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="male">Male</TabsTrigger>
                    <TabsTrigger value="female">Female</TabsTrigger>
                  </TabsList>

                  <TabsContent value="male">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2 max-h-[300px] overflow-y-auto p-1">
                      {maleAvatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleAvatarSelect(avatar)}
                          className={`relative rounded-full p-1 transition-all hover:scale-105 ${
                            selectedAvatarId === avatar.id
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "hover:ring-2 hover:ring-muted-foreground/30"
                          }`}
                        >
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage src={avatar.url} alt={avatar.id} />
                          </Avatar>
                          {selectedAvatarId === avatar.id && (
                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="female">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2 max-h-[300px] overflow-y-auto p-1">
                      {femaleAvatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleAvatarSelect(avatar)}
                          className={`relative rounded-full p-1 transition-all hover:scale-105 ${
                            selectedAvatarId === avatar.id
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "hover:ring-2 hover:ring-muted-foreground/30"
                          }`}
                        >
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                            <AvatarImage src={avatar.url} alt={avatar.id} />
                          </Avatar>
                          {selectedAvatarId === avatar.id && (
                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-foreground">
                      Delete Account
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2 shrink-0">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Your Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            This action is{" "}
                            <strong>permanent and irreversible</strong>. All
                            your data will be deleted, including:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Your profile and personal information</li>
                            <li>Referral history and links</li>
                            <li>Commission records</li>
                            <li>Purchase history</li>
                          </ul>
                          <p className="pt-2">
                            To confirm, please type <strong>DELETE</strong>{" "}
                            below:
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) =>
                          setDeleteConfirmation(e.target.value.toUpperCase())
                        }
                        placeholder="Type DELETE to confirm"
                        className="font-mono"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteConfirmation("")}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== "DELETE" || deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete My Account"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <img src={logoDark} alt="U-topia" className="h-8 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} U-topia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProfileSettings;
