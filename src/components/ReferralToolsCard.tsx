import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useReferralLink } from "@/hooks/useReferralLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Copy,
  Mail,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";

export function ReferralToolsCard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    referralLink,
    fullReferralUrl,
    fullPurchaseReferralUrl,
    isLoading,
    isRefreshing,
    regenerateLink,
  } = useReferralLink();
  const [copied, setCopied] = useState(false);
  const [copiedPurchase, setCopiedPurchase] = useState(false);
  const [linkMode, setLinkMode] = useState<"signup" | "purchase">("purchase");

  const activeUrl = linkMode === "purchase" ? fullPurchaseReferralUrl : fullReferralUrl;

  const handleCopyLink = async () => {
    if (!activeUrl) return;

    try {
      await navigator.clipboard.writeText(activeUrl);
      if (linkMode === "purchase") {
        setCopiedPurchase(true);
        setTimeout(() => setCopiedPurchase(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast({
        title: "Link Copied",
        description: linkMode === "purchase"
          ? "Package referral link copied to clipboard."
          : "Referral link copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    if (!activeUrl) return;

    const message = linkMode === "purchase"
      ? encodeURIComponent("Check out this U-topia package! Purchase using my referral link: " + activeUrl)
      : encodeURIComponent("Join U-topia using my referral link: " + activeUrl);
    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${message}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent("Join U-topia")}&body=${message}`;
        break;
      default:
        handleCopyLink();
        return;
    }

    window.open(url, "_blank");
  };

  // Not authenticated state
  if (!user) {
    return (
      <div className="feature-card p-8 md:p-10">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Log in to access your unique referral link and QR code.
          </p>
          <Button asChild>
            <a href="/auth">Log In to Get Your Link</a>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="feature-card p-8 md:p-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="feature-card p-8 md:p-10">
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Your Referral Tools
        </h3>
        <div className="flex items-center gap-2">
          {isRefreshing ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Refreshing...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Link Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setLinkMode("purchase")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            linkMode === "purchase"
              ? "bg-primary text-white shadow-md"
              : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Package Referral
        </button>
        <button
          onClick={() => setLinkMode("signup")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            linkMode === "signup"
              ? "bg-primary text-white shadow-md"
              : "bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary"
          }`}
        >
          <Copy className="w-4 h-4" />
          Signup Referral
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Referral Link Section */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            {linkMode === "purchase" ? "Package Referral Link" : "Signup Referral Link"}
          </label>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-sm text-muted-foreground overflow-x-auto">
              {activeUrl || "Loading..."}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              disabled={!activeUrl || isRefreshing}
              className="flex-shrink-0 h-12 w-12 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
            >
              {(linkMode === "purchase" ? copiedPurchase : copied) ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>

          {linkMode === "purchase" && (
            <p className="text-xs text-primary/80 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 mb-4">
              Share this link to earn rewards when someone purchases a package through it.
            </p>
          )}

          {/* Share Buttons */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Quick Share
            </label>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("whatsapp")}
                disabled={!activeUrl || isRefreshing}
                className="gap-2 rounded-xl border-border hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("email")}
                disabled={!activeUrl || isRefreshing}
                className="gap-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={!activeUrl || isRefreshing}
                className="gap-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Regenerate Button - hidden for now as links auto-refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerateLink}
            disabled={isRefreshing}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Generate New Link
          </Button>
        </div>

        {/* QR Code Section */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            QR Code
          </label>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm inline-block">
            {activeUrl ? (
              <QRCodeSVG
                value={activeUrl}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-secondary/50 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-3 max-w-[200px]">
            {linkMode === "purchase"
              ? "Share this QR code so others can scan and purchase a package using your referral."
              : "Each referral link and QR code can be used once for security and accurate tracking."}
          </p>
        </div>
      </div>
    </div>
  );
}
