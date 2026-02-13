import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MembershipTier {
  level: number;
  name: string;
  price: number;
  color: string;
  colorLight: string;
  gradient: string;
  icon: string;
}

export const membershipTiers: MembershipTier[] = [
  { 
    level: 1, 
    name: "Bronze", 
    price: 100, 
    color: "hsl(30, 60%, 45%)", 
    colorLight: "rgba(180, 120, 60, 0.4)",
    gradient: "from-amber-700 to-amber-900",
    icon: "🥉"
  },
  { 
    level: 2, 
    name: "Silver", 
    price: 250, 
    color: "hsl(210, 15%, 60%)", 
    colorLight: "rgba(160, 170, 180, 0.4)",
    gradient: "from-slate-400 to-slate-600",
    icon: "🥈"
  },
  { 
    level: 3, 
    name: "Gold", 
    price: 500, 
    color: "hsl(45, 93%, 47%)", 
    colorLight: "rgba(234, 179, 8, 0.4)",
    gradient: "from-yellow-400 to-amber-500",
    icon: "🥇"
  },
  { 
    level: 4, 
    name: "Platinum", 
    price: 1000, 
    color: "hsl(200, 20%, 70%)", 
    colorLight: "rgba(180, 200, 210, 0.4)",
    gradient: "from-cyan-200 to-slate-400",
    icon: "💎"
  },
  { 
    level: 5, 
    name: "Diamond", 
    price: 2500, 
    color: "hsl(200, 80%, 65%)", 
    colorLight: "rgba(100, 200, 255, 0.4)",
    gradient: "from-sky-300 to-blue-500",
    icon: "👑"
  },
];

interface MembershipBadgeProps {
  tier: MembershipTier;
  size?: "sm" | "md" | "lg";
  showPrice?: boolean;
  className?: string;
}

export function MembershipBadge({ tier, size = "md", showPrice = false, className }: MembershipBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  return (
    <Badge
      className={cn(
        "font-semibold border-0 shadow-md transition-all duration-200 hover:scale-105",
        `bg-gradient-to-r ${tier.gradient} text-white`,
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: `0 4px 12px ${tier.colorLight}`,
      }}
    >
      <span className="mr-1">{tier.icon}</span>
      {tier.name}
      {showPrice && <span className="ml-1 opacity-80">${tier.price}</span>}
    </Badge>
  );
}

export function getTierByLevel(level: number): MembershipTier | undefined {
  return membershipTiers.find(t => t.level === level);
}

export function getCurrentUserTier(userLevel: number = 3): MembershipTier {
  return membershipTiers.find(t => t.level === userLevel) || membershipTiers[0];
}
