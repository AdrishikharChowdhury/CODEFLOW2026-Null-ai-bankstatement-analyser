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
         <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider>
            <SyncUser />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}