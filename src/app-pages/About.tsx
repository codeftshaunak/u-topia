export const dynamic = "force-dynamic";


import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CreditCard,
  Gift,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Users,
} from "lucide-react";
const heroAbout = "/hero-about.jpg";
const team1 = "/team-1.avif";
const team2 = "/team-2.avif";
const team3 = "/team-3.avif";
const team4 = "/team-4.avif";
const team5 = "/team-5.avif";
const team6 = "/team-6.avif";
const team7 = "/team-7.avif";
const lifestyleUbank = "/lifestyle-ubank.jpg";
const lifestyleUpay = "/lifestyle-upay.jpg";
const lifestyleUearn = "/lifestyle-uearn.jpg";
const lifestyleUshares = "/lifestyle-ucoin.jpg";

const teamMembers = [
  { name: "Emmanuel Quezada", role: "Founder & Chief Executive Officer", image: team1 },
  { name: "Owen Man Cheong Ma", role: "Co-Founder & Chief Revenue Officer", image: team2 },
  { name: "Maissa Ballout", role: "Chief Financial Officer", image: team3 },
  { name: "Ian Stirling", role: "Chief Strategy Officer", image: team4 },
  { name: "Danosch Zahedi", role: "Advisor", image: team5 },
  { name: "Hitesh Mishra", role: "Advisor", image: team6 },
  { name: "Alexia Chen", role: "Advisor", image: team7 },
];

const ecosystemFeatures = [
  {
    icon: Building2,
    title: "uBank",
    tagline: "Global Payments",
    description: "Borderless payments without high FX fees. Your crypto and fiat together.",
  },
  {
    icon: CreditCard,
    title: "uPay",
    tagline: "70% Savings",
    description: "Use digital assets at 140M+ merchants worldwide with uPay card.",
  },
  {
    icon: Gift,
    title: "uEarn",
    tagline: "Tokenized Rewards",
    description: "Transform loyalty rewards into liquid, transferable digital assets.",
  },
  {
    icon: TrendingUp,
    title: "uShares",
    tagline: "Equity Ownership",
    description: "Own a piece of U-topia with tokenized equity shares.",
  },
];

const lifestyleCards = [
  { title: "uBank", subtitle: "Global Payments", description: "Borderless payments without high FX fees", icon: Building2, image: lifestyleUbank },
  { title: "uPay", subtitle: "70% Savings", description: "Use digital assets at 140M+ merchants", icon: CreditCard, image: lifestyleUpay },
  { title: "uEarn", subtitle: "Tokenized Rewards", description: "Transform loyalty rewards into digital assets", icon: Gift, image: lifestyleUearn },
  { title: "uShares", subtitle: "Equity Ownership", description: "Own a piece of U-topia with tokenized shares", icon: TrendingUp, image: lifestyleUshares },
];

const keyBenefits = [
  { icon: Globe, title: "TradFi + DeFi", description: "Best of both worlds" },
  { icon: Zap, title: "Instant", description: "Real-time settlements" },
  { icon: Shield, title: "Secure", description: "Advanced protection" },
  { icon: Users, title: "Community", description: "User-first approach" },
];

export default function About() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl h-72 md:h-80">
        <img 
          src={heroAbout} 
          alt="U-topia community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative h-full flex items-center px-8 md:px-12">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Financial Freedom
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              A U-topia Built for <span className="text-primary">YOU</span>
            </h1>
            <p className="text-white/90 text-lg">
              Reimagining money so you can spend, save, earn, and invest your way. 
              The best of Web2 & Web3 — putting you first.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 px-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: "70%", label: "Fee Savings" },
            { value: "140M+", label: "Merchants" },
            { value: "7K+", label: "Assets" },
            { value: "Instant", label: "Settlements" },
          ].map((stat, i) => (
            <div key={i} className="py-4">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Ecosystem + Video Combined Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Ecosystem */}
            <div>
              <h2 className="text-lg font-semibold mb-6">The Ecosystem</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ecosystemFeatures.map((feature, index) => (
                  <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-xs text-primary">{feature.tagline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right - Video */}
            <div>
              <h2 className="text-lg font-semibold mb-6">Why We Built U-topia</h2>
              <div className="aspect-video rounded-xl overflow-hidden border bg-muted">
                <iframe
                  src="https://www.youtube.com/embed/wtK6RZoI_mQ"
                  title="Why We Built U-topia"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Why U-topia - Card Section with Hover Effect */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Why U-topia?</h2>
          <p className="text-sm text-muted-foreground mb-6">Financial freedom in your pocket</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lifestyleCards.map((card, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-2xl aspect-[3/4] group cursor-pointer"
              >
                {/* Background Image */}
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300" />
                
                {/* Content - Bottom Aligned */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/20 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-white text-lg mb-1">{card.title}</h3>
                  
                  {/* Subtitle */}
                  <p className="text-primary text-xs font-medium mb-1">{card.subtitle}</p>
                  
                  {/* Description - Hidden by default, shown on hover */}
                  <p className="text-white/80 text-xs leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Benefits Grid - 2x2 */}
        <section>
          <h2 className="text-lg font-semibold mb-6">Key Benefits</h2>
          <div className="grid grid-cols-2 gap-4">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 p-5 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Team */}
        <section>
          <h2 className="text-lg font-semibold mb-6">Leadership Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-3 overflow-hidden rounded-xl aspect-square">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-sm">{member.name}</h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
