export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  Loader2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Shield,
} from "lucide-react";

// Badge images for tiers
const badgeBronze = "/badge-bronze.png";
const badgeSilver = "/badge-silver.png";
const badgeGold = "/badge-gold.png";
const badgePlatinum = "/badge-platinum.png";
const badgeDiamond = "/badge-diamond.png";

const badgeImages: Record<string, string> = {
  bronze: badgeBronze,
  silver: badgeSilver,
  gold: badgeGold,
  platinum: badgePlatinum,
  diamond: badgeDiamond,
};

interface PaymentData {
  sessionId: string;
  purchaseId: string;
  tier: string;
  tierName: string;
  priceUsd: number;
  assetId: string;
  assetName: string;
  depositAddress: string;
  depositTag?: string;
  expiresAt: string;
  instructions?: {
    title: string;
    steps: string[];
    note: string;
  };
}

interface PaymentStatus {
  sessionId: string;
  purchaseId: string;
  tier: string;
  amountUsd: number;
  assetId: string;
  depositAddress: string;
  status: "pending" | "confirming" | "completed" | "partial" | "failed" | "expired";
  message: string;
  fireblocksTxId?: string;
  txHash?: string;
  amountReceived?: number;
  amountCrypto?: string;
  expiresAt: string;
  createdAt: string;
}

interface SupportedAsset {
  id: string;
  name: string;
  symbol: string;
}

const Payment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [step, setStep] = useState<"select-asset" | "pay">("select-asset");
  const [isLoading, setIsLoading] = useState(false);
  const [supportedAssets, setSupportedAssets] = useState<SupportedAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const sessionId = searchParams.get("sessionId");
  const tier = searchParams.get("tier") || "bronze";

  // Load supported assets on mount
  useEffect(() => {
    fetchSupportedAssets();
  }, []);

  // If we have a sessionId, load existing session
  useEffect(() => {
    if (sessionId) {
      loadExistingSession(sessionId);
    }
  }, [sessionId]);

  // Poll for status updates
  useEffect(() => {
    if (!paymentData?.sessionId || !paymentStatus) return;
    if (["completed", "failed", "expired"].includes(paymentStatus.status)) return;

    const interval = setInterval(() => {
      pollStatus(paymentData.sessionId);
    }, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [paymentData?.sessionId, paymentStatus?.status]);

  // Countdown timer
  useEffect(() => {
    if (!paymentData?.expiresAt) return;
    if (paymentStatus?.status === "completed") return;

    const timer = setInterval(() => {
      const diff = new Date(paymentData.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
        return;
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData?.expiresAt, paymentStatus?.status]);

  const fetchSupportedAssets = async () => {
    try {
      const res = await fetch("/api/checkout", { credentials: "same-origin" });
      const data = await res.json();
      setSupportedAssets(data.supportedAssets || []);
    } catch {
      console.error("Failed to fetch supported assets");
    }
  };

  const loadExistingSession = async (sid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/checkout/fireblocks/session?sessionId=${sid}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Session not found");

      const data = await res.json();
      setPaymentData({
        sessionId: data.sessionId,
        purchaseId: data.purchaseId,
        tier: data.tier,
        tierName: data.tierName,
        priceUsd: data.priceUsd,
        assetId: data.assetId,
        assetName: data.assetName,
        depositAddress: data.depositAddress,
        depositTag: data.depositTag,
        expiresAt: data.expiresAt,
        instructions: data.instructions,
      });
      setSupportedAssets(data.supportedAssets || []);
      setSelectedAssetId(data.assetId);
      setStep("pay");

      // Fetch status
      await pollStatus(data.sessionId);
    } catch (error) {
      console.error("Failed to load session:", error);
      toast({
        title: "Session Not Found",
        description: "The payment session could not be loaded. Please start a new purchase.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    if (!selectedAssetId) {
      toast({ title: "Select a cryptocurrency", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, assetId: selectedAssetId }),
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment session");

      setPaymentData({
        sessionId: data.sessionId,
        purchaseId: data.purchaseId,
        tier: data.tier,
        tierName: data.tierName,
        priceUsd: data.priceUsd,
        assetId: data.assetId,
        assetName: data.assetName,
        depositAddress: data.depositAddress,
        depositTag: data.depositTag,
        expiresAt: data.expiresAt,
        instructions: data.instructions,
      });

      setStep("pay");

      // Update URL
      navigate(`/payment?sessionId=${data.sessionId}&tier=${tier}`, { replace: true });

      // Initial status
      setPaymentStatus({
        sessionId: data.sessionId,
        purchaseId: data.purchaseId,
        tier: data.tier,
        amountUsd: data.priceUsd,
        assetId: data.assetId,
        depositAddress: data.depositAddress,
        status: "pending",
        message: "Waiting for payment. Send cryptocurrency to the deposit address.",
        expiresAt: data.expiresAt,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollStatus = async (sid: string) => {
    try {
      const res = await fetch(`/api/checkout/fireblocks/status?sessionId=${sid}`, {
        credentials: "same-origin",
      });
      if (!res.ok) return;

      const data = await res.json();
      setPaymentStatus(data);

      if (data.status === "completed") {
        toast({ title: "Payment Confirmed!", description: "Your membership is now active." });
        setTimeout(() => navigate(`/purchase-success?tier=${data.tier}&session_id=${sid}`), 2000);
      }
    } catch {
      // Silent polling failure
    }
  };

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast({ title: "Copied!", description: `${label} copied to clipboard` });
      setTimeout(() => setCopiedField(null), 3000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 3000);
    }
  }, [toast]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
      pending:    { icon: <Clock className="h-5 w-5" />,       color: "text-blue-500",   bg: "bg-blue-500/10" },
      confirming: { icon: <Loader2 className="h-5 w-5 animate-spin" />, color: "text-yellow-500", bg: "bg-yellow-500/10" },
      completed:  { icon: <CheckCircle className="h-5 w-5" />, color: "text-green-500",  bg: "bg-green-500/10" },
      partial:    { icon: <AlertCircle className="h-5 w-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
      failed:     { icon: <AlertCircle className="h-5 w-5" />, color: "text-red-500",    bg: "bg-red-500/10" },
      expired:    { icon: <AlertCircle className="h-5 w-5" />, color: "text-gray-500",   bg: "bg-gray-500/10" },
    };
    return configs[status] || configs.pending;
  };

  // ─── Loading State ─────────────────────────────────────────────────────

  if (isLoading && !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your payment...</p>
        </div>
      </div>
    );
  }

  // ─── Step 1: Select Cryptocurrency ─────────────────────────────────────

  if (step === "select-asset" && !sessionId) {
    const tierNames: Record<string, string> = {
      bronze: "Bronze", silver: "Silver", gold: "Gold",
      platinum: "Platinum", diamond: "Diamond",
    };
    const tierPrices: Record<string, number> = {
      bronze: 100, silver: 250, gold: 500, platinum: 1000, diamond: 2500,
    };

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-6 py-12 max-w-2xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/purchase")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Packages
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {badgeImages[tier] && (
                  <img src={badgeImages[tier]} alt={tier} className="w-16 h-16 object-contain" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {tierNames[tier] || tier} Package — ${tierPrices[tier] || "?"} USD
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Select how you want to pay
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {supportedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAssetId === asset.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedAssetId === asset.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {asset.symbol}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.id}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {supportedAssets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading payment options...
                </div>
              )}

              <Button
                className="w-full py-6 text-lg"
                onClick={createSession}
                disabled={!selectedAssetId || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating payment session...
                  </>
                ) : (
                  `Pay with ${supportedAssets.find((a) => a.id === selectedAssetId)?.name || "Crypto"}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                Secured by Fireblocks institutional custody
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  // ─── Step 2: Payment Page (deposit address + QR + status) ──────────────

  if (!paymentData && !paymentStatus) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Session Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This session may have expired or is invalid.
          </p>
          <Button variant="outline" onClick={() => navigate("/purchase")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Purchase
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(paymentStatus?.status || "pending");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-6 py-12 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/purchase")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Packages
        </Button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column: QR + Address (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status Banner */}
            <div className={`${statusConfig.bg} rounded-xl p-4 flex items-center gap-3`}>
              <span className={statusConfig.color}>{statusConfig.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold capitalize ${statusConfig.color}`}>
                  {paymentStatus?.status || "Pending"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentStatus?.message || "Waiting for payment..."}
                </p>
              </div>
              {paymentStatus?.status === "completed" && (
                <Button size="sm" onClick={() => navigate(`/purchase-success?tier=${paymentData?.tier}`)}>
                  Continue
                </Button>
              )}
            </div>

            {/* Deposit Card */}
            {paymentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Send {paymentData.assetName}</span>
                    {timeLeft && timeLeft !== "Expired" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        Expires in {timeLeft}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-lg">
                      <QRCodeSVG
                        value={paymentData.depositAddress}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                  </div>

                  {/* Deposit Address */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Deposit Address
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-muted rounded-lg border text-sm font-mono break-all select-all">
                        {paymentData.depositAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => copyToClipboard(paymentData.depositAddress, "Address")}
                      >
                        {copiedField === "Address" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Memo/Tag (if required) */}
                  {paymentData.depositTag && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Memo / Tag <span className="text-red-500">(Required)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-lg border text-sm font-mono">
                          {paymentData.depositTag}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() => copyToClipboard(paymentData.depositTag!, "Memo")}
                        >
                          {copiedField === "Memo" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Amount reminder */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Amount to send</p>
                    <p className="text-2xl font-bold text-primary">${paymentData.priceUsd} USD</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      in {paymentData.assetName} ({paymentData.assetId})
                    </p>
                  </div>

                  {/* Refresh button */}
                  {paymentStatus?.status !== "completed" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => pollStatus(paymentData.sessionId)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Check Payment Status
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Order Summary + Instructions (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {paymentData?.tier && badgeImages[paymentData.tier] && (
                    <img
                      src={badgeImages[paymentData.tier]}
                      alt={paymentData.tier}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{paymentData?.tierName}</p>
                    <p className="text-2xl font-bold text-primary">${paymentData?.priceUsd} USD</p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{paymentData?.assetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${statusConfig.color}`}>
                      {paymentStatus?.status || "pending"}
                    </span>
                  </div>
                  {paymentStatus?.amountReceived && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Received</span>
                      <span className="font-medium">${paymentStatus.amountReceived.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentStatus?.txHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tx Hash</span>
                      <span className="font-mono text-xs truncate max-w-[120px]" title={paymentStatus.txHash}>
                        {paymentStatus.txHash.slice(0, 8)}...{paymentStatus.txHash.slice(-6)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            {paymentData?.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{paymentData.instructions.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {paymentData.instructions.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {paymentData.instructions.note && (
                    <p className="mt-4 text-xs text-muted-foreground bg-yellow-500/10 p-3 rounded-lg">
                      <strong>Note:</strong> {paymentData.instructions.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your payment is secured by Fireblocks institutional-grade custody.
                Payments are detected automatically via blockchain monitoring.
                This address is unique to your session.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Payment;
