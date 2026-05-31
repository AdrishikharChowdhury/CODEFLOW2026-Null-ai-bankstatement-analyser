import {ClerkProvider} from "@clerk/nextjs";
import { shadcn } from '@clerk/ui/themes';
import type { Metadata } from "next";
import { Noto_Serif_Hentaigana, Geist } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils";
import SyncUser from "@/components/SyncUser";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@aejkatappaja/phantom-ui/ssr.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSerifHentaigana = Noto_Serif_Hentaigana({ variable: "--font-noto-serif-hentaigana", subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Financialo",
  description: "A Bank Statement Analyser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full w-full scroll-smooth", "antialiased", notoSerifHentaigana.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
         <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: {
              colorBackground: "hsl(var(--card))",
              colorForeground: "hsl(var(--card-foreground))",
              colorInput: "hsl(var(--input))",
              colorPrimary: "hsl(var(--primary))",
              colorPrimaryForeground: "hsl(var(--primary-foreground))",
              colorInputForeground: "hsl(var(--card-foreground))",
              colorMuted: "hsl(var(--muted))",
              colorMutedForeground: "hsl(var(--muted-foreground))",
              colorNeutral: "hsl(var(--foreground))",
              colorDanger: "hsl(var(--destructive))",
              colorRing: "hsl(var(--ring))",
            },
            userProfile: {
              elements: {
                cardBox: "bg-card text-card-foreground shadow-xl border border-border",
                modalBackdrop: "bg-black/60 backdrop-blur-sm",
                rootBox: "bg-card",
                page: "bg-card",
                navbar: "bg-muted border-r border-border",
                profileSection: "bg-card",
                profilePage: "bg-card",
              },
            },
          }}
        >
          <ThemeProvider>
            <SyncUser />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}