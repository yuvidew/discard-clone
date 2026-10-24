import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/components/providers/socket-provider";

// Figtree is the free fallback behind Discord's gg sans / ABC Ginto fonts (see --font-sans in globals.css).
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

// Geist Sans/Mono are exposed as CSS variables for use in Tailwind.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide title, description and social-card metadata (the OG image comes from opengraph-image.tsx).
export const metadata: Metadata = {
  title: "Discard clone",
  description: "Discard clone is a place to chat, hang out and play with friends and communities — group chat that's all fun and games.",
  openGraph: {
    title: "Discard clone",
    description: "Group chat that's all fun and games.",
    siteName: "Discard clone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discard clone",
    description: "Group chat that's all fun and games.",
  },
};

/**
 * @component RootLayout
 * @description Root layout: sets fonts and wraps the app in the theme, direction, tooltip and toast providers.
 */
const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        {/* Clerk reads request cookies, so with cacheComponents it must sit inside a Suspense boundary. Its shadcn theme follows the active light/dark CSS variables. */}
        <Suspense>
          <ClerkProvider appearance={{ theme: shadcn }}>
            {/* Theme (class-based, dark by default), plus direction, tooltip and toast contexts required by the shadcn components. */}
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              <SocketProvider>
                <DirectionProvider direction="ltr">
                  <TooltipProvider>
                    <QueryProvider>
                      <Toaster>
                        {children}
                      </Toaster>
                    </QueryProvider>
                  </TooltipProvider>
                </DirectionProvider>
              </SocketProvider>
            </ThemeProvider>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;