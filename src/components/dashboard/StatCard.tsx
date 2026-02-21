import { ReactNode } from "react";
import { Loader2, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  backgroundImage: string;
  isLoading?: boolean;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  backgroundImage,
  isLoading = false,
  children,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl h-40 group">
      <img
        src={backgroundImage}
        alt={`${title} background`}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      <div className="relative h-full p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/90">{title}</span>
          <Icon className="h-5 w-5 text-white/70" />
        </div>
        <div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-white/70" />
              <div className="text-3xl font-bold text-white/70">...</div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-white">{value}</div>
              {subtitle && (
                <p className="text-sm text-white/80 mt-1">{subtitle}</p>
              )}
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
