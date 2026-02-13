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
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
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

const connections = [
  {
    id: 1,
    name: "Victoria Sterling",
    role: "Founding Member",
    status: "online",
  },
  { id: 2, name: "Marcus Chen", role: "Early Investor", status: "online" },
  { id: 3, name: "Elena Vasquez", role: "Board Advisor", status: "offline" },
  {
    id: 4,
    name: "James Whitmore",
    role: "Strategic Partner",
    status: "online",
  },
  { id: 5, name: "Aisha Patel", role: "Founding Member", status: "offline" },
  { id: 6, name: "Robert Nakamura", role: "Early Investor", status: "online" },
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

export default function ShareholderPortal() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleViewAllConnections = () => {
    toast({ title: "Members", description: "Members page coming soon." });
  };

  const handleOpenMessages = () => {
    toast({ title: "Messages", description: "Messages feature coming soon." });
  };

  const handleReadMore = (newsId: number) => {
    toast({
      title: "Opening Article",
      description: "Full article view coming soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="relative container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Private Shareholder Portal
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to U-topia Shareholder Portal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Building the bank of the future, together. Access exclusive
              updates, connect with fellow shareholders, and shape our journey.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Earnings */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                $12,450
              </p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <ArrowUpRight className="h-3 w-3" />
                +8.2% this month
              </div>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                $2,180
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Awaiting clearance
              </p>
            </CardContent>
          </Card>

          {/* Rank Level */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                10{" "}
              </p>
              <p className="text-sm text-muted-foreground">Rank Level</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <ArrowUpRight className="h-3 w-3" />
                10{" "}
              </div>
            </CardContent>
          </Card>

          {/* My Network */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                85
              </p>
              <p className="text-sm text-muted-foreground">My Network</p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Total Connections
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest News - 2 columns */}
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
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Post */}
              <div className="rounded-xl overflow-hidden border border-border bg-card group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <Image className="h-12 w-12 text-primary/30" />
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
                    app. Traditional and non-custodial accounts, all in one
                    place.
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
            {/* Referral Code */}
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
                    UTOPIA-2847X
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-primary/20 hover:bg-primary/10"
                    onClick={() => {
                      navigator.clipboard.writeText("UTOPIA-2847X");
                      toast({
                        title: "Copied!",
                        description: "Referral code copied to clipboard.",
                      });
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
                    className="w-full sm:flex-1 gap-2 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600"
                    onClick={() => {
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent("Join U-topia using my referral code: UTOPIA-2847X")}`,
                        "_blank",
                      );
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1 gap-2 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500"
                    onClick={() => {
                      window.open(
                        `https://t.me/share/url?url=${encodeURIComponent("https://utopia.com")}&text=${encodeURIComponent("Join U-topia using my referral code: UTOPIA-2847X")}`,
                        "_blank",
                      );
                    }}
                  >
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1 gap-2 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                    onClick={() => {
                      window.open(
                        `mailto:?subject=${encodeURIComponent("Join U-topia!")}&body=${encodeURIComponent("Join U-topia using my referral code: UTOPIA-2847X\n\nSign up at: https://utopia.com")}`,
                        "_blank",
                      );
                    }}
                  >
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
                  className="w-full mt-4"
                  onClick={() => {
                    toast({
                      title: "Withdrawal Requested",
                      description:
                        "Your withdrawal request has been submitted.",
                    });
                  }}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>

            {/* Your Connections */}
            <Card>
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
                    <div
                      key={connection.id}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
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
            </Card>

            {/* Recent Activity */}
            <RecentActivity />

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
                      description:
                        "Full event calendar will be available soon!",
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
      </section>
    </div>
  );
}
