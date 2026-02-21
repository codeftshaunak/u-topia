export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralLink } from "@/hooks/useReferralLink";
import {
  TrendingUp,
  MessageSquare,
  Calendar,
  Newspaper,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  Image,
  Copy,
  DollarSign,
  Users,
} from "lucide-react";
import NetworkVisualization from "@/components/community/NetworkVisualization";
import RecentActivity from "@/components/community/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import { useCommissions, formatUSD } from "@/hooks/useCommissions";

const heroImage = "/hero-dashboard.jpg";
const utopiaLifestyle = "/utopia-lifestyle.avif";
const cardEarnings = "/card-portfolio.jpg";
const cardPending = "/card-shares.jpg";
const cardNetwork = "/card-network.jpg";
const cardTokens = "/card-valuation.jpg";
const heroPeople = "/hero-people.jpg";
const avatarVictoria = "/avatar-victoria.jpg";
const avatarMarcus = "/avatar-marcus.jpg";
const avatarElena = "/avatar-elena.jpg";
const avatarJames = "/avatar-james.jpg";
const avatarAisha = "/avatar-aisha.jpg";
const avatarRobert = "/avatar-robert.jpg";

const connections = [
  {
    id: 1,
    name: "Victoria Sterling",
    role: "Founding Member",
    avatar: avatarVictoria,
    status: "online",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Early Investor",
    avatar: avatarMarcus,
    status: "online",
  },
  {
    id: 3,
    name: "Elena Vasquez",
    role: "Board Advisor",
    avatar: avatarElena,
    status: "offline",
  },
  {
    id: 4,
    name: "James Whitmore",
    role: "Strategic Partner",
    avatar: avatarJames,
    status: "online",
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "Founding Member",
    avatar: avatarAisha,
    status: "offline",
  },
  {
    id: 6,
    name: "Robert Nakamura",
    role: "Early Investor",
    avatar: avatarRobert,
    status: "online",
  },
];

const newsUpdates = [
  {
    id: 1,
    title: "Q4 2024 Shareholder Report Released",
    excerpt:
      "Review our latest quarterly performance metrics and strategic initiatives for the upcoming year.",
    date: "Dec 8, 2024",
    type: "report",
  },
  {
    id: 2,
    title: "U-topia Secures Series B Funding",
    excerpt:
      "We're thrilled to announce $50M in Series B funding to accelerate our mission of banking for the future.",
    date: "Dec 5, 2024",
    type: "announcement",
  },
  {
    id: 3,
    title: "New Digital Asset Features Coming Q1 2025",
    excerpt:
      "Exciting new cryptocurrency integration and DeFi features are on the roadmap for early next year.",
    date: "Dec 2, 2024",
    type: "product",
  },
  {
    id: 4,
    title: "Annual Shareholder Meeting - Save the Date",
    excerpt:
      "Mark your calendars for our virtual annual meeting on January 15th, 2025.",
    date: "Nov 28, 2024",
    type: "event",
  },
];

const upcomingEvents = [
  {
    title: "Shareholder Q&A Session",
    date: "Dec 12, 3:00 PM",
    type: "meeting",
  },
  {
    title: "Product Roadmap Preview",
    date: "Dec 18, 10:00 AM",
    type: "webinar",
  },
  { title: "Annual Meeting", date: "Jan 15, 2:00 PM", type: "event" },
];

export default function Explore() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { referralLink } = useReferralLink();
  const { toast } = useToast();
  const { summary, isLoading: dataLoading } = useCommissions();

  const handleViewAllConnections = () => {
    navigate("/members");
  };

  const handleOpenMessages = () => {
    navigate("/messages");
  };

  const handleReadMore = (newsId: number) => {
    toast({
      title: "Opening Article",
      description: "Full article view coming soon.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl h-56">
        <img
          src={heroPeople}
          alt="U-topia community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative h-full flex items-center px-8">
          <div className="max-w-2xl">
            <Badge className="mb-3 bg-white/20 text-white border-white/30 hover:bg-white/30">
              Private Shareholder Portal
            </Badge>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Welcome to U-topia Shareholder Portal
            </h1>
            <p className="text-lg text-white/90 mb-4">
              Building the bank of the future, together. Access exclusive
              updates, connect with fellow shareholders, and shape our journey.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings Card */}
        <StatCard
          title="Total Earnings"
          value={formatUSD(summary?.total_earned || 0)}
          icon={DollarSign}
          backgroundImage={cardEarnings}
          isLoading={dataLoading}
        >
          <p className="text-sm text-white/80 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
            <span className="text-white/80">All-time earnings</span>
          </p>
        </StatCard>

        {/* Pending Card */}
        <StatCard
          title="Pending"
          value={formatUSD(summary?.pending || 0)}
          subtitle="Awaiting clearance"
          icon={Wallet}
          backgroundImage={cardPending}
          isLoading={dataLoading}
        />

        {/* Rank Level Card */}
        <div className="relative overflow-hidden rounded-xl h-40 group">
          <img
            src={cardTokens}
            alt="Tokens background"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative h-full p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">
                Rank Level
              </span>
              <TrendingUp className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10</div>
              {/* <p className="text-sm text-white/80 flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-medium">+15%</span>
                <span className="ml-1">value</span>
              </p> */}
            </div>
          </div>
        </div>

        {/* My Network Card */}
        <div className="relative overflow-hidden rounded-xl h-40 group">
          <img
            src={cardNetwork}
            alt="Network background"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative h-full p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">
                My Network
              </span>
              <Users className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">85</div>
              <p className="text-sm text-white/80 mt-1">Total Connections</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest News & Updates - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Latest News & Updates
                </CardTitle>
                <CardDescription>
                  Stay informed about U-topia's progress
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Featured Video */}
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/L39ezmt-UOc"
                  title="U-topia Featured Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                  Featured
                </Badge>
                <h4 className="font-semibold text-lg">Welcome to U-topia</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover how we're building the bank of the future for our
                  shareholders.
                </p>
              </div>
            </div>

            {/* Image Post Update */}
            <div className="rounded-xl overflow-hidden border border-border bg-card group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={utopiaLifestyle}
                  alt="U-topia App Showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-accent/10 text-accent border-accent/20">
                    <Image className="h-3 w-3 mr-1" />
                    Photo Update
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Dec 9, 2024
                  </span>
                </div>
                <h4 className="font-semibold text-lg group-hover:text-accent transition-colors">
                  U-topia App Now Live
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Experience seamless banking with our newly launched mobile
                  app. Traditional and non-custodial accounts, all in one place.
                </p>
              </div>
            </div>

            {newsUpdates.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => handleReadMore(news.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {news.type === "report" && "Report"}
                        {news.type === "announcement" && "Announcement"}
                        {news.type === "product" && "Product"}
                        {news.type === "event" && "Event"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {news.date}
                      </span>
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {news.excerpt}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Your Referral Code */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Copy className="h-4 w-4 text-primary" />
                </div>
                Your Referral Code
              </CardTitle>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-widest text-center">
                  {referralLink || "Loading..."}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!referralLink}
                  className="h-12 w-12 rounded-xl border-primary/20 hover:bg-primary/10"
                  onClick={() => {
                    if (referralLink) {
                      navigator.clipboard.writeText(referralLink);
                      toast({
                        title: "Copied!",
                        description: "Referral code copied to clipboard.",
                      });
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Share this code to earn commissions on referrals
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!referralLink}
                  className="w-full sm:flex-1 gap-2 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600"
                  onClick={() => {
                    if (referralLink) {
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(`Join U-topia using my referral code: ${referralLink}`)}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!referralLink}
                  className="w-full sm:flex-1 gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500"
                  onClick={() => {
                    if (referralLink) {
                      window.open(
                        `https://t.me/share/url?url=${encodeURIComponent("https://utopia.com")}&text=${encodeURIComponent(`Join U-topia using my referral code: ${referralLink}`)}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!referralLink}
                  className="w-full sm:flex-1 gap-2 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                  onClick={() => {
                    if (referralLink) {
                      window.open(
                        `mailto:?subject=${encodeURIComponent("Join U-topia!")}&body=${encodeURIComponent(`Join U-topia using my referral code: ${referralLink}\n\nSign up at: https://utopia.com`)}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available to Withdraw */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Available to Withdraw
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">$1,250.00</div>
              <p className="text-sm text-muted-foreground mt-1">
                From referral commissions
              </p>
              <Button
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  toast({
                    title: "Withdrawal Requested",
                    description: "Your withdrawal request has been submitted.",
                  });
                }}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>

          {/* Your Connections */}
          {/* <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Your Connections</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllConnections}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connections.slice(0, 5).map((connection) => (
                  <div key={connection.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={connection.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {connection.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                          connection.status === "online"
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {connection.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {connection.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}

          {/* Recent Activity */}
          {/* <RecentActivity /> */}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  toast({
                    title: "Calendar Coming Soon",
                    description: "Full event calendar will be available soon!",
                  });
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
