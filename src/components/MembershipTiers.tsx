import Link from "next/link";
import { usePackages, PackageKey, getCommissionLevels } from "@/hooks/usePackages";
import { Skeleton } from "@/components/ui/skeleton";
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

const tierColors: Record<PackageKey, { glow: string; border: string; divider: string }> = {
  bronze: { glow: 'from-orange-500/20', border: 'hover:border-orange-500/40', divider: 'via-orange-500/50' },
  silver: { glow: 'from-gray-400/20', border: 'hover:border-gray-400/40', divider: 'via-gray-400/50' },
  gold: { glow: 'from-amber-500/20', border: 'hover:border-amber-500/40', divider: 'via-amber-500/50' },
  platinum: { glow: 'from-slate-400/20', border: 'hover:border-slate-400/40', divider: 'via-slate-400/50' },
  diamond: { glow: 'from-cyan-400/20', border: 'hover:border-cyan-400/40', divider: 'via-cyan-400/50' },
};

const linkColors: Record<PackageKey, string> = {
  bronze: 'text-gray-400 hover:text-primary',
  silver: 'text-gray-400 hover:text-primary',
  gold: 'text-amber-400 hover:text-primary',
  platinum: 'text-gray-400 hover:text-primary',
  diamond: 'text-cyan-400 hover:text-primary',
};

// Commission depth comes from pkg.commissionLevels — no static map needed

export function MembershipTiers() {
  const { packages, isLoading, formatPrice, packageOrder } = usePackages();

  if (isLoading) {
    return (
      <section className="relative bg-[#0a0f1a] py-28 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Skeleton className="h-8 w-40 mx-auto mb-8 bg-white/10" />
            <Skeleton className="h-12 w-64 mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-80 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#0a0f1a] py-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-32 left-1/4 rounded-full blur-[120px] opacity-20 bg-primary/40 animate-float" />
        <div className="absolute w-[400px] h-[400px] bottom-0 right-1/4 rounded-full blur-[100px] opacity-15 bg-cyan-500/30 animate-float animation-delay-2000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-primary text-sm font-semibold mb-8 opacity-0 animate-fade-in-up backdrop-blur-sm"
            style={{ animationDelay: '100ms' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Participation Levels
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold text-white mb-6 opacity-0 animate-fade-in-up tracking-tight"
            style={{ animationDelay: '150ms' }}
          >
            Choose Your <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Tier</span>
          </h2>
          <p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0 animate-fade-in-up leading-relaxed"
            style={{ animationDelay: '200ms' }}
          >
            Unlock greater earning potential with higher membership tiers
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6 opacity-0 animate-fade-in-up pt-6"
          style={{ animationDelay: '250ms' }}
        >
          {packageOrder.map((key, index) => {
            const pkg = packages.find(p => p.name.toLowerCase() === key);
            if (!pkg) return null;

            const isGold = key === 'gold';
            const colors = tierColors[key];

            return (
              <div
                key={key}
                className={`group relative ${isGold ? 'col-span-2 md:col-span-1 overflow-visible' : ''}`}
              >
                {isGold && (
                  <>
                    {/* Premium glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-400 to-primary rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />

                    {/* Most Popular Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="relative px-4 py-1.5 bg-gradient-to-r from-primary to-amber-500 rounded-full shadow-lg shadow-primary/40">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider whitespace-nowrap">Most Popular</span>
                        <div className="absolute -right-1 -top-1 w-3 h-3">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-300">
                            <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7l2-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!isGold && (
                  <div className={`absolute inset-0 bg-gradient-to-b ${colors.glow} to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                )}

                <div className={`relative h-full flex flex-col items-center ${isGold ? 'p-8 pt-10' : 'p-8'} rounded-3xl bg-gradient-to-b ${isGold ? 'from-[#1a2d4a] via-[#0f1f35] to-[#0a1628] border-2 border-primary/50 hover:border-primary' : 'from-[#0f1f35] to-[#0a1628] border border-white/[0.08]'} transition-all duration-500 ${colors.border} hover:-translate-y-3 hover:shadow-2xl backdrop-blur-sm`}>
                  {/* Glow ring behind badge */}
                  <div className={`absolute ${isGold ? 'top-16 w-32 h-32' : 'top-12 w-28 h-28'} rounded-full ${isGold ? 'bg-amber-500/15' : `bg-${key === 'bronze' ? 'orange' : key === 'silver' ? 'gray' : key === 'platinum' ? 'slate' : 'cyan'}-500/10`} blur-2xl ${isGold ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`} />

                  {/* Badge Image */}
                  <div className={`relative ${isGold ? 'w-28 h-28 md:w-32 md:h-32' : 'w-24 h-24 md:w-28 md:h-28'} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <img src={badgeImages[key]} alt={`${pkg.name} Badge`} className="w-full h-full object-contain drop-shadow-2xl" />
                  </div>

                  {/* Tier Name */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium">Depth {getCommissionLevels(pkg).length}</p>

                  {/* Divider */}
                  <div className={`w-16 h-px bg-gradient-to-r from-transparent ${colors.divider} to-transparent mb-4`} />

                  {/* Price */}
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent mb-4">
                    {formatPrice(pkg.priceUsd)}
                  </p>

                  {/* View Package Link */}
                  <Link
                    href={`/purchase?tier=${key}`}
                    className={`text-sm ${linkColors[key]} transition-colors font-medium flex items-center gap-1 mt-auto`}
                  >
                    View Package
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note with icon */}
        <div
          className="flex items-center justify-center gap-3 mt-16 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '350ms' }}
        >
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-gray-600" />
          <p className="text-sm text-gray-500 text-center">
            All tiers grant access to verified reward opportunities. Terms apply.
          </p>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-gray-600" />
        </div>
      </div>
    </section>
  );
}
