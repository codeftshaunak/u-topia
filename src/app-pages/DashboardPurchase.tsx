export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePackages, PackageKey } from "@/hooks/usePackages";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
const badgeBronze = "/badge-bronze.png";
const badgeSilver = "/badge-silver.png";
const badgeGold = "/badge-gold.png";
const badgePlatinum = "/badge-platinum.png";
const badgeDiamond = "/badge-diamond.png";

const badgeImages: Record<PackageKey, string> = {
  bronze: badgeBronze,
  silver: badgeSilver,
  gold: badgeGold,
  platinum: badgePlatinum,
  diamond: badgeDiamond,
};

const DashboardPurchase = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const {
    packages,
    isLoading,
    formatPrice,
    getPackageFeatures,
    getPackageHighlights,
    packageOrder,
  } = usePackages();

  const initialPackage = (searchParams.get("tier") as PackageKey) || "bronze";
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>(
    packageOrder.includes(initialPackage) ? initialPackage : "bronze",
  );

  useEffect(() => {
    const tier = searchParams.get("tier") as PackageKey;
    if (tier && packageOrder.includes(tier)) {
      setSelectedPackage(tier);
    }
  }, [searchParams]);

  const currentPackage = packages.find(
    (p) => p.name.toLowerCase() === selectedPackage,
  );
  const otherPackageKeys = packageOrder.filter(
    (key) => key !== selectedPackage,
  );

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedPackage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      if (data?.invoiceUrl) {
        // Redirect to NOWPayments invoice page
        window.location.href = data.invoiceUrl;
      } else if (data?.paymentId) {
        // Alternative: Show payment details in a modal or redirect to custom page
        toast({
          title: "Payment Created",
          description: "Redirecting to payment page...",
        });
        // You can implement a custom payment page here
        window.location.href = data.invoiceUrl || `/payment/${data.paymentId}`;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPackage) {
    return (
      <div className="space-y-8">
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Package not found
          </h1>
          <p className="text-muted-foreground mt-2">
            The selected package is not available.
          </p>
          <Link to="/dashboard/purchase?tier=bronze">
            <Button className="mt-6">View Bronze Package</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Product Detail Section */}
      <section className="py-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Column - Product Image */}
          <div className="relative">
            <div className="product-image-card p-8 md:p-12 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-2xl opacity-60" />
                <img
                  src={badgeImages[selectedPackage]}
                  alt={`${currentPackage.name} Package`}
                  className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              {currentPackage.name}{" "}
              <span className="gradient-text">Package</span>
            </h1>

            <p className="text-5xl md:text-6xl font-bold text-primary mb-8">
              {formatPrice(currentPackage.price_usd)}
            </p>

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-12 py-7 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all mb-4"
            >
              {isCheckoutLoading ? "Processing..." : "Buy Now"}
              {!isCheckoutLoading && (
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              )}
            </Button>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  Commission Eligibility:
                </strong>{" "}
                Package purchase is required to activate commission eligibility
                for your referrer. Once confirmed, you also become eligible to
                earn commissions on your referrals.
              </p>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                What's included
              </h3>
              <ul className="space-y-4">
                {getPackageFeatures(currentPackage).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Package Selector Section */}
      <section className="pb-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Explore Other <span className="gradient-text">Packages</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Select a package to view details
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherPackageKeys.map((key) => {
            const pkg = packages.find((p) => p.name.toLowerCase() === key);
            if (!pkg) return null;

            return (
              <button
                key={key}
                onClick={() => setSelectedPackage(key)}
                className="package-selector-card p-6 text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={badgeImages[key]}
                    alt={pkg.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {pkg.name}
                    </h3>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(pkg.price_usd)}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {getPackageHighlights(pkg).map((highlight, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about the U-topia Affiliate Program
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion
            type="single"
            defaultValue="item-1"
            collapsible
            className="space-y-4"
          >
            <AccordionItem
              value="item-1"
              className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Is this an investment or guaranteed income program?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  No. The U-topia Affiliate Program is not an investment, and it
                  does not offer guaranteed income. Rewards are
                  performance-based and depend on real platform activity,
                  eligibility, and compliance checks.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  How are rewards generated?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Rewards are generated from verified activity on U-topia's
                  platform, such as account usage, payments, subscriptions, and
                  card activity. There are no rewards for sign-ups alone or
                  inactive users.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Do I need to sell products or handle payments?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  No. You do not process transactions or handle customer funds.
                  U-topia's core products handle all financial activity.
                  Affiliates focus on introductions and growth.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Is there a limit to how much I can earn?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Earning capacity is defined by participation tiers,
                  referral depth limits, and reward caps. This ensures the
                  program remains fair, sustainable, and transparent.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  When and how are payouts made?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Payout timing depends on the reward type. Some commissions are
                  processed quickly after validation, while bonuses and
                  incentives may follow scheduled payout cycles. All payouts are
                  subject to verification and compliance checks.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default DashboardPurchase;
