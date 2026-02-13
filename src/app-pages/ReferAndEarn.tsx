export const dynamic = "force-dynamic";


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { ReferralToolsCard } from "@/components/ReferralToolsCard";
const logoLight = "/u-topia-logo-light.png";
import { 
  Link2, 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Info 
} from "lucide-react";

const ReferAndEarn = () => {
  const steps = [
    {
      icon: Link2,
      title: "Share Your Referral Link",
      description: "Each user receives a unique referral link. This link tracks who you introduce to the platform.",
    },
    {
      icon: UserPlus,
      title: "New User Signs Up",
      description: "A referral is recorded when a user signs up using your link. However, signup alone does not generate commissions.",
    },
    {
      icon: ShieldCheck,
      title: "User Purchases a Package",
      description: "The referred user must purchase a package (Bronze, Silver, Gold, Platinum, or Diamond). This is the activation step.",
    },
    {
      icon: Activity,
      title: "Purchase Is Confirmed",
      description: "The transaction must be completed and settled. Pending, failed, or reversed purchases do not count.",
    },
    {
      icon: Calculator,
      title: "Commissions Are Calculated",
      description: "Once the purchase is confirmed, commissions are calculated based on your tier and distributed to eligible upline referrers.",
    },
  ];

  const commissionableConditions = [
    "Referrer has an active participation package",
    "Referred user signs up using your link",
    "Referred user purchases a package",
    "Purchase is completed and settled",
  ];

  const nonCommissionableEvents = [
    "Signup without package purchase",
    "Account creation without verification",
    "Pending, failed, or reversed purchases",
    "Inactive or unverified users",
  ];

  const downstreamRules = [
    "Same rules apply to all referral layers",
    "Each referred user must purchase their own package",
    "Your tier determines how many layers you earn from",
    "No commission from users who haven't purchased",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            Referral Program
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Refer & <span className="gradient-text">Earn</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Earn rewards by introducing people to real platform activity.
          </p>
          <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
            Invite users to join U-topia and earn rewards when they actively use the platform. Rewards are based on verified activity, not sign-ups alone.
          </p>
        </div>
      </section>

      {/* How Referring Works */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Core Logic
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How Referring <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="group step-card p-7 h-full"
              >
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">
                    {index + 1}
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground/70 italic mt-10">
            *Sign-ups alone do not generate rewards.
          </p>
        </div>
      </section>

      {/* When Do Referrals Become Commissionable */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Important
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              When Do Referrals Become <span className="gradient-text">Commissionable?</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              A referral becomes commissionable <strong>only after the referred user purchases a package</strong>. Signing up alone does not generate commissions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Commissionable Conditions */}
            <div className="feature-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">All Conditions Must Be Met</h3>
              </div>
              <ul className="space-y-4">
                {commissionableConditions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Commissionable Events */}
            <div className="feature-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Does NOT Generate Commissions</h3>
              </div>
              <ul className="space-y-4">
                {nonCommissionableEvents.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3 text-red-500" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Downstream Rules */}
          <div className="mt-6 feature-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Downstream Referral Rule</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              The same commission rules apply at every referral layer. For example, if User A refers User B, and User B refers User C:
            </p>
            <ul className="grid md:grid-cols-2 gap-4">
              {downstreamRules.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Referral Tools */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Action Center
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Referral <span className="gradient-text">Tools</span>
            </h2>
            <p className="text-muted-foreground mt-4">
              Use your referral tools to invite users and businesses you trust.
            </p>
          </div>

          <ReferralToolsCard />
        </div>
      </section>

      {/* How Rewards Are Tracked */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How Rewards Are <span className="gradient-text">Tracked</span>
            </h2>
          </div>

          <div className="feature-card p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Every referral and activity is tracked automatically. You can view referral status, activity progress, and reward eligibility from your dashboard.
            </p>
            <Link to="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                View Referral Dashboard
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Important Boundaries */}
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Important Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    Rewards are performance-based
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    Referral capacity depends on your package
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    Package purchase is the mandatory trigger for commissions
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    Rewards are subject to verification and compliance
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
                U-topia puts YOU first – connecting modern banking, digital assets, and cross-chain opportunities in one universal wallet.
              </p>
            </div>

            {/* Follow U-topia */}
            <div>
              <h4 className="text-white font-semibold mb-5">Follow U-topia</h4>
              <ul className="space-y-3">
                <li><a href="https://t.me/+G6ntSwYCzjJkNzE0" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Telegram</a></li>
                <li><a href="https://x.com/UCoinOfficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">X (Twitter)</a></li>
                <li><a href="https://www.linkedin.com/company/u-topia/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">LinkedIn</a></li>
                <li><a href="https://www.instagram.com/ucoinofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Instagram</a></li>
                <li><a href="https://discord.gg/qZB83k5HmX" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Discord</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><a href="https://docsend.com/view/3wjptrvw2c35gj8p" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="https://docsend.com/view/vkuhrcmbrhkqd7vp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} U-topia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReferAndEarn;
