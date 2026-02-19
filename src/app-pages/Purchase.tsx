export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
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
const logoLight = "/u-topia-logo-light.png";
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

const Purchase = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
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

  // Capture referral code from URL and persist to localStorage
  const refCode = searchParams.get("ref");
  useEffect(() => {
    if (refCode) {
      localStorage.setItem("package_referral_code", refCode);
    }
  }, [refCode]);

  // Get stored referral code (from URL or localStorage)
  const storedRefCode = refCode || (typeof window !== "undefined" ? localStorage.getItem("package_referral_code") : null);

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
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase a package.",
        variant: "destructive",
      });
      // Preserve referral code through auth flow
      const refParam = storedRefCode ? `&ref=${storedRefCode}` : "";
      window.location.href = `/auth?redirect=/purchase?tier=${selectedPackage}${refParam}`;
      return;
    }

    // Navigate to payment page where user selects crypto and gets a unique deposit address
    const refParam = storedRefCode ? `&ref=${storedRefCode}` : "";
    window.location.href = `/payment?tier=${selectedPackage}${refParam}`;
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Package not found
          </h1>
          <p className="text-muted-foreground mt-2">
            The selected package is not available.
          </p>
          <Link to="/purchase?tier=bronze">
            <Button className="mt-6">View Bronze Package</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Referral Code Banner */}
      {storedRefCode && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-6 py-3 flex items-center justify-center gap-2 text-sm">
            <span className="text-primary font-medium">Referred by code:</span>
            <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {storedRefCode}
            </span>
            <span className="text-muted-foreground">— Your referrer will be rewarded when you purchase!</span>
          </div>
        </div>
      )}

      {/* Main Product Detail Section */}
      <section className="container mx-auto px-6 py-12 md:py-20">
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
              {formatPrice(currentPackage.priceUsd)}
            </p>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-12 py-7 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all mb-4"
            >
              Buy Now
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
      <section className="container mx-auto px-6 pb-20">
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
                      {formatPrice(pkg.priceUsd)}
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
      <section className="container mx-auto px-6 py-24">
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

      {/* Footer */}
      <footer className="bg-[#0a0f1a] py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoLight} alt="U-topia" className="h-8" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                U-topia puts YOU first – connecting modern banking, digital
                assets, and cross-chain opportunities in one universal wallet.
              </p>
            </div>

            {/* Follow U-topia */}
            <div>
              <h4 className="text-white font-semibold mb-5">Follow U-topia</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://t.me/+G6ntSwYCzjJkNzE0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/UCoinOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/u-topia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/ucoinofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/qZB83k5HmX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-5">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://docsend.com/view/3wjptrvw2c35gj8p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://docsend.com/view/pehz2xqa23xw3pyc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              © U-topia 2026, All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Purchase;
