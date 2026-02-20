export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
const logoLight = "/u-topia-logo-light.png";
import { useVerifyPurchaseMutation } from "@/store/features/purchase/purchaseApi";

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "membership";
  const sessionId = searchParams.get("session_id");
  const paymentId = searchParams.get("payment_id");

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const [verifyPurchase] = useVerifyPurchaseMutation();

  useEffect(() => {
    const run = async () => {
      const id = paymentId || sessionId;
      if (!id) {
        setVerifying(false);
        setVerified(true);
        return;
      }
      try {
        const data = await verifyPurchase({ paymentId: id, tier }).unwrap();
        setVerified(data?.verified ?? false);
        setEmailSent(data?.emailSent ?? false);
      } catch (err) {
        console.error("Failed to verify purchase:", err);
      } finally {
        setVerifying(false);
      }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, sessionId, tier]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a] border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logoLight} alt="U-topia" className="h-8 md:h-10" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Success Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {verifying ? (
            <>
              <div className="mb-8 flex justify-center">
                <Loader2 className="w-24 h-24 text-primary animate-spin" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Verifying Payment...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your purchase.
              </p>
            </>
          ) : (
            <>
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl" />
                  <CheckCircle2 className="relative w-24 h-24 text-green-500" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Payment Successful!
              </h1>

              <p className="text-lg text-muted-foreground mb-2">
                Thank you for your purchase.
              </p>

              <p className="text-muted-foreground mb-4">
                Your{" "}
                <span className="text-primary font-semibold">{tierName}</span>{" "}
                membership is now active.
              </p>

              {emailSent && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-500 mb-8">
                  <Mail className="w-4 h-4" />
                  <span>Confirmation email sent!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/purchase">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View Packages
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div>
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} U-topia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PurchaseSuccess;
