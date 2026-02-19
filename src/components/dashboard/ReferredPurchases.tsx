import { usePackageReferrals } from "@/hooks/usePackageReferrals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  ShoppingBag,
  Award,
  Loader2,
  UserCheck,
} from "lucide-react";

const tierColors: Record<string, string> = {
  bronze: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  silver: "bg-gray-400/10 text-gray-400 border-gray-400/20",
  gold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  platinum: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  diamond: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  paid: "bg-blue-500/10 text-blue-500",
};

export function ReferredPurchases() {
  const { referredUsers, stats, isLoading, error } = usePackageReferrals();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground text-sm">
            Failed to load referred purchases.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Referred Purchases
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stats?.totalReferredPurchases || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold mt-1 text-emerald-500">
                  ${stats?.totalRewardsEarned?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Approved Rewards
                </p>
                <p className="text-2xl font-bold mt-1 text-primary">
                  ${stats?.approvedRewards?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Paid Out
                </p>
                <p className="text-2xl font-bold mt-1 text-blue-500">
                  ${stats?.paidRewards?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referred Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Referred Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Referred Purchases Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Share your package referral link and earn rewards when someone
                purchases a package through your link.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Package
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Your Reward
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {referredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {user.buyerName
                              ? user.buyerName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.buyerEmail[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user.buyerName || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.buyerEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            tierColors[user.tier] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.tier.charAt(0).toUpperCase() +
                            user.tier.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">
                          ${user.purchaseAmountUsd.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-sm font-bold text-emerald-500">
                            +${user.rewardAmountUsd.toFixed(2)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {user.rewardPercent}% reward
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[user.rewardStatus] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.rewardStatus.charAt(0).toUpperCase() +
                            user.rewardStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.purchaseDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
