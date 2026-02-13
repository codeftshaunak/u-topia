import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, UserPlus, DollarSign, Award, TrendingUp } from "lucide-react";

interface ActivityItem {
  id: number;
  type: "referral" | "earning" | "milestone" | "network";
  title: string;
  description: string;
  time: string;
  avatar?: string;
}

const recentActivities: ActivityItem[] = [
  {
    id: 1,
    type: "referral",
    title: "New Referral Joined",
    description: "Sarah M. joined using your code",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "earning",
    title: "Commission Earned",
    description: "You earned $45 from L2 network",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "milestone",
    title: "Network Milestone",
    description: "Your L1 network reached 12 members",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "network",
    title: "Network Growth",
    description: "3 new members in your L3 network",
    time: "2 days ago",
  },
];

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "referral":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "earning":
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case "milestone":
      return <Award className="h-4 w-4 text-amber-500" />;
    case "network":
      return <TrendingUp className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActivityBg = (type: ActivityItem["type"]) => {
  switch (type) {
    case "referral":
      return "bg-blue-500/10";
    case "earning":
      return "bg-green-500/10";
    case "milestone":
      return "bg-amber-500/10";
    case "network":
      return "bg-purple-500/10";
    default:
      return "bg-muted";
  }
};

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
