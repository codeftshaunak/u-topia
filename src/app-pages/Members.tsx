export const dynamic = "force-dynamic";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, DollarSign, ArrowUpRight, Copy, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NetworkVisualization from "@/components/community/NetworkVisualization";
const cardEarnings = "/card-portfolio.jpg";
const cardPending = "/card-shares.jpg";

const members = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "TechStart AI",
    avatar: "SC",
    status: "online",
    goals: 8,
    completed: 6,
    streak: 12,
    location: "San Francisco, CA",
    joinDate: "Jan 2024",
    bio: "Building AI-powered productivity tools. Previously at Google and Meta.",
    expertise: ["AI/ML", "Product Strategy", "Team Building"],
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Co-founder",
    company: "GreenTech Solutions",
    avatar: "MR",
    status: "online",
    goals: 5,
    completed: 3,
    streak: 8,
    location: "Austin, TX",
    joinDate: "Feb 2024",
    bio: "Sustainable technology entrepreneur focused on clean energy solutions.",
    expertise: ["Clean Energy", "Hardware", "Fundraising"],
  },
  {
    id: 3,
    name: "Alex Johnson",
    role: "Solo Founder",
    company: "DevTools Pro",
    avatar: "AJ",
    status: "away",
    goals: 12,
    completed: 10,
    streak: 25,
    location: "New York, NY",
    joinDate: "Dec 2023",
    bio: "Building developer tools that make coding more efficient and enjoyable.",
    expertise: ["Developer Tools", "SaaS", "Growth Hacking"],
  },
  {
    id: 4,
    name: "Emma Davis",
    role: "Founder",
    company: "EduTech Innovations",
    avatar: "ED",
    status: "offline",
    goals: 7,
    completed: 4,
    streak: 5,
    location: "London, UK",
    joinDate: "Mar 2024",
    bio: "Revolutionizing online education with immersive learning experiences.",
    expertise: ["EdTech", "UX Design", "Content Strategy"],
  },
  {
    id: 5,
    name: "David Kim",
    role: "CTO & Co-founder",
    company: "HealthTrack",
    avatar: "DK",
    status: "online",
    goals: 9,
    completed: 7,
    streak: 15,
    location: "Seattle, WA",
    joinDate: "Jan 2024",
    bio: "Digital health platform connecting patients with personalized care.",
    expertise: ["HealthTech", "Mobile Development", "Data Science"],
  },
];

export default function Members() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Network</h1>
        <p className="text-muted-foreground">Connect and collaborate with fellow shareholders</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings Card */}
        <div className="relative overflow-hidden rounded-xl h-40 group">
          <img 
            src={cardEarnings} 
            alt="Earnings background" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative h-full p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Total Earnings</span>
              <DollarSign className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">$12,450</div>
              <p className="text-sm text-white/80 flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-medium">+8.2%</span>
                <span className="ml-1">this month</span>
              </p>
            </div>
          </div>
        </div>

        {/* Available to Withdraw Card */}
        <div className="relative overflow-hidden rounded-xl h-40 group">
          <img 
            src={cardPending} 
            alt="Withdraw background" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="relative h-full p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Available to Withdraw</span>
              <Wallet className="h-5 w-5 text-white/70" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">$1,250</div>
              <Button 
                size="sm" 
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  toast({
                    title: "Withdrawal Requested",
                    description: "Your withdrawal request is being processed.",
                  });
                }}
              >
                Withdraw Funds
              </Button>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <Card className="overflow-hidden h-40">
          <div className="h-full p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Referral Code</span>
              <Copy className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-3 py-2 font-mono text-lg font-bold tracking-widest text-center mb-2">
                UTOPIA-2847X
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText("UTOPIA-2847X");
                  toast({
                    title: "Copied!",
                    description: "Referral code copied to clipboard.",
                  });
                }}
              >
                Copy Code
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Network Visualization */}
      <NetworkVisualization />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter by Role</Button>
            <Button variant="outline">Sort by Activity</Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-elevated transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                    member.status === 'online' ? 'bg-green-500' : 
                    member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">{member.name}</h3>
                    <Badge variant={member.status === 'online' ? 'default' : 'secondary'} className="flex-shrink-0">
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm text-primary font-medium">{member.company}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Group Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Group Statistics</CardTitle>
          <CardDescription>Overview of team engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{members.length}</div>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {members.filter(m => m.status === 'online').length}
              </div>
              <p className="text-sm text-muted-foreground">Online Now</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}