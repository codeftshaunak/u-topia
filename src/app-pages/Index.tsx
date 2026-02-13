export const dynamic = "force-dynamic";


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MembershipTiers } from "@/components/MembershipTiers";
import TeamSection from "@/components/TeamSection";
const logoLight = "/u-topia-logo-light.png";
const logoDark = "/u-topia-logo-dark.png";
const heroVisual = "/hero-visual-new.png";
const membershipBadge = "/membership-badge.png";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Dark Background */}
      <div className="relative bg-[#0a0f1a] overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full blur-3xl opacity-20 bg-primary/30 animate-float" />
          <div className="absolute w-[400px] h-[400px] top-1/3 -right-20 rounded-full blur-3xl opacity-15 bg-blue-500/30 animate-float animation-delay-2000" />
          <div className="absolute w-[300px] h-[300px] bottom-20 left-1/4 rounded-full blur-3xl opacity-20 bg-primary/20 animate-float animation-delay-1000" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0f1a] pointer-events-none" />

        {/* Navigation */}
        <div className="relative z-20">
          <Header />
        </div>

        {/* Hero Content */}
        <section className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
            {/* Left content */}
            <div className="flex-1 max-w-2xl">
              {/* Badge */}
              <div 
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary animate-pulse"></span>
                  Earn through real platform activity
                </span>
              </div>
              
              {/* Headline */}
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 opacity-0 animate-fade-in-up leading-tight whitespace-nowrap"
                style={{ animationDelay: '200ms' }}
              >
                <span className="text-white">Build with </span>
                <span className="gradient-text">U-topia</span>
              </h1>
              
              {/* Subheadline */}
              <p 
                className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                A digital financial ecosystem that rewards growth, usage, and contribution. 
                Incentives aligned with real economic activity, not hype.
              </p>

              {/* Tagline */}
              <p 
                className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-8 sm:mb-10 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '350ms' }}
              >
                Real products. Real users. <span className="text-primary">Real rewards.</span>
              </p>

              {/* CTAs */}
              <div 
                className="flex flex-row gap-2 sm:gap-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '400ms' }}
              >
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Get Started
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
                <a 
                  href="https://drive.google.com/file/d/1LGOKXC00DI94vpzfBhKNPhxGH0hmHNzj/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-full transition-all">
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div 
                className="flex flex-wrap gap-6 sm:gap-8 md:gap-12 mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '500ms' }}
              >
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">100%</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Real Activity</p>
                </div>
                <div className="w-px bg-white/10 hidden md:block"></div>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Verified</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Transactions</p>
                </div>
                <div className="w-px bg-white/10 hidden md:block"></div>
                <div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Global</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Rewards Network</p>
                </div>
              </div>
            </div>

            {/* Right visual - Hero Image */}
            <div 
              className="flex-1 flex justify-center lg:justify-end opacity-0 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="relative animate-hero-float group cursor-pointer">
                <img 
                  src={heroVisual} 
                  alt="U-topia Financial Dashboard" 
                  className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl drop-shadow-[0_20px_60px_rgba(59,130,246,0.3)] transition-all duration-500 group-hover:drop-shadow-[0_25px_80px_rgba(0,180,216,0.5)]"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Light sections below */}
      <div className="bg-background">
        {/* Features Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 
              className="text-3xl md:text-4xl font-bold text-foreground mb-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '450ms' }}
            >
              Earn From <span className="gradient-text">Real Activity</span>
            </h2>
            <p 
              className="text-lg md:text-xl text-muted-foreground opacity-0 animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              The U-topia Affiliate Program allows participants to earn rewards by introducing users and businesses to U-topia's financial products and services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div 
              className="feature-card p-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '600ms' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Accounts & Financial Services
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn from user signups, account activations, and ongoing financial service usage within the platform.
              </p>
            </div>

            <div 
              className="feature-card p-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '700ms' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Payments & Merchant Transactions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate rewards from payment processing, merchant integrations, and transaction volume across the network.
              </p>
            </div>

            <div 
              className="feature-card p-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '800ms' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Card Usage & Subscriptions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Benefit from card activations, recurring subscription payments, and sustained user engagement.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <span 
                className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                Simple Process
              </span>
              <h2 
                className="text-3xl md:text-5xl font-bold text-foreground opacity-0 animate-fade-in-up"
                style={{ animationDelay: '150ms' }}
              >
                How It <span className="gradient-text">Works</span>
              </h2>
            </div>

            {/* Steps Container */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div 
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="relative step-card p-7 h-full">
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">
                        1
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Join the Program
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activate your participation tier and gain access to referral and reward tools.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div 
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="relative step-card p-7 h-full">
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">
                        2
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Introduce Users
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Share U-topia with individuals and merchants who benefit from our platform.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div 
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '400ms' }}
                >
                  <div className="relative step-card p-7 h-full">
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">
                        3
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Activity Happens
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Users transact, subscribe, and use real financial products.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div 
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '500ms' }}
                >
                  <div className="relative step-card p-7 h-full">
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">
                        4
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Rewards Calculated
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Commissions and bonuses are calculated from completed and verified activity.
                    </p>
                  </div>
                </div>

                {/* Step 5 - Final/Success */}
                <div 
                  className="group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '600ms' }}
                >
                  <div className="relative step-card-success p-7 h-full">
                    <div className="absolute -top-4 left-6">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/25 flex items-center justify-center mt-4 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-black mb-3">
                      Get Paid
                    </h3>
                    <p className="text-sm text-black leading-relaxed">
                      Eligible rewards are distributed following validation and compliance checks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Tiers Section */}
        <MembershipTiers />

        {/* Who This Is For Section */}
        <section className="relative py-28 overflow-hidden bg-background">
          {/* Subtle background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[500px] h-[500px] top-0 right-1/4 rounded-full blur-[150px] opacity-20 bg-primary/20" />
            <div className="absolute w-[400px] h-[400px] bottom-0 left-1/4 rounded-full blur-[120px] opacity-15 bg-cyan-500/15" />
          </div>
          
          <div className="relative container mx-auto px-6">
            {/* Header Content - Centered */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              {/* Section Tag */}
              <span 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Perfect For You
              </span>
              
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 opacity-0 animate-fade-in-up tracking-tight"
                style={{ animationDelay: '150ms' }}
              >
                Who This <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Is For</span>
              </h2>
              
              <p 
                className="text-lg md:text-xl text-muted-foreground mb-10 opacity-0 animate-fade-in-up leading-relaxed"
                style={{ animationDelay: '200ms' }}
              >
                If you believe in building networks around real products and genuine value creation, this program is designed for you.
              </p>
              
              {/* CTA Button */}
              <div 
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '250ms' }}
              >
                <Link to="/auth">
                  <Button size="lg" className="group gap-2 text-base px-8 py-6 rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                    Start Your Journey
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Cards Grid - 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Row 1 */}
              {/* Card 1 - Entrepreneurs */}
              <div 
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="audience-card audience-card-primary p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300">
                    <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Everyday Users</h3>
                  <p className="text-muted-foreground leading-relaxed">Individuals looking for an easy way to earn rewards by referring friends and family. Share U-topia, get rewarded when they join and use the platform.</p>
                </div>
              </div>
              
              {/* Card 2 - Business Owners */}
              <div 
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: '350ms' }}
              >
                <div className="audience-card audience-card-cyan p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-cyan-500/25 group-hover:to-cyan-500/10 transition-all duration-300">
                    <svg className="w-7 h-7 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Web3 Enthusiasts</h3>
                  <p className="text-muted-foreground leading-relaxed">Crypto-savvy users familiar with digital ecosystems who want to engage with a modern, rewarding referral system.</p>
                </div>
              </div>
              
              {/* Row 2 */}
              {/* Card 3 - Community Builders */}
              <div 
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: '400ms' }}
              >
                <div className="audience-card audience-card-amber p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-amber-500/25 group-hover:to-amber-500/10 transition-all duration-300">
                    <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Community Builders</h3>
                  <p className="text-muted-foreground leading-relaxed">People who love connecting with others and want to build a network while earning real rewards for each connection.</p>
                </div>
              </div>
              
              {/* Card 4 - Growth Partners */}
              <div 
                className="group opacity-0 animate-fade-in-up"
                style={{ animationDelay: '450ms' }}
              >
                <div className="audience-card audience-card-emerald p-8 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-emerald-500/25 group-hover:to-emerald-500/10 transition-all duration-300">
                    <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Ambitious Referral Partners</h3>
                  <p className="text-muted-foreground leading-relaxed">Users seeking a straightforward way to generate additional income by leveraging U-topia's simple referral program.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <span 
                className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                Got Questions?
              </span>
              <h2 
                className="text-3xl md:text-5xl font-bold text-foreground mb-6 opacity-0 animate-fade-in-up"
                style={{ animationDelay: '150ms' }}
              >
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
              <p 
                className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                Everything you need to know about the U-topia Affiliate Program
              </p>
            </div>

            {/* FAQ Accordion */}
            <Accordion 
              type="single" 
              defaultValue="item-1" 
              collapsible 
              className="space-y-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '250ms' }}
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
                    No. The U-topia Affiliate Program is not an investment, and it does not offer guaranteed income. Rewards are performance-based and depend on real platform activity, eligibility, and compliance checks.
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
                    Rewards are generated from verified activity on U-topia's platform, such as account usage, payments, subscriptions, and card activity. There are no rewards for sign-ups alone or inactive users.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem 
                value="item-3" 
                className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                  <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Do I earn commissions when someone just signs up?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>No.</strong> Commissions are earned only after the referred user purchases a package. Signing up alone does not generate commissions. The referred user must complete a package purchase (Bronze, Silver, Gold, Platinum, or Diamond) and the transaction must be confirmed.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem 
                value="item-4" 
                className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                  <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Do I need to sell products or handle payments?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    No. You do not process transactions or handle customer funds. U-topia's core products handle all financial activity. Affiliates focus on introductions and growth.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem 
                value="item-5" 
                className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                  <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    Is there a limit to how much I can earn?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Yes. Earning capacity is defined by participation tiers, referral depth limits, and reward caps. This ensures the program remains fair, sustainable, and transparent.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem 
                value="item-6" 
                className="glass-card border-none rounded-2xl overflow-hidden data-[state=open]:border-primary/30 transition-all duration-300 hover:border-primary/20"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                  <span className="text-left text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    When and how are payouts made?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Payout timing depends on the reward type. Some commissions are processed quickly after validation, while bonuses and incentives may follow scheduled payout cycles. All payouts are subject to verification and compliance checks.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-[#0a0f1a] to-[#0d1526]">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-primary/40 to-cyan-500/40" />
          </div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          
          <div className="relative container mx-auto px-6 text-center">
            <div 
              className="max-w-3xl mx-auto opacity-0 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-primary text-sm font-semibold mb-8 backdrop-blur-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.5 10c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5z"/>
                  <path d="M20.5 10H19V8.5c0-.83-.67-1.5-1.5-1.5S16 7.67 16 8.5V10h-2V8.5c0-.83-.67-1.5-1.5-1.5S11 7.67 11 8.5V10H9V8.5c0-.83-.67-1.5-1.5-1.5S6 7.67 6 8.5V10H4.5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5h16c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z"/>
                </svg>
                Start Today
              </span>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                Ready to <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Build</span> Your Future?
              </h2>
              
              <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                Join the U-topia Affiliate Program and start building with a platform designed for long-term growth.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <Button 
                    variant="hero" 
                    className="group gap-3 min-w-[200px]"
                  >
                    Create Account
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Button>
                </Link>
                
                <a 
                  href="https://drive.google.com/file/d/1LGOKXC00DI94vpzfBhKNPhxGH0hmHNzj/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-3 min-w-[200px] border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-2xl"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Program Overview
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

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
                  <li><a href="https://docsend.com/view/pehz2xqa23xw3pyc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors text-sm">Terms of Service</a></li>
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
    </div>
  );
};

export default Index;
