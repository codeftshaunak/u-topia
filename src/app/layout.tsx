import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../index.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { DemoProvider } from "@/contexts/DemoContext";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: "U-topia Affiliate Hub | Ambassador Rewards Program",
  description: "Join U-topia Affiliate Hub and unlock exclusive rewards through our Ambassador Rewards Program. Earn commissions across your network.",
  authors: [{ name: "U-topia" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "U-topia Affiliate Hub",
    description: "Join our Ambassador Rewards Program and unlock exclusive rewards",
    type: "website",
    images: [
      {
        url: "https://lovable.dev/opengraph-image-p98pqg.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Utopia",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
