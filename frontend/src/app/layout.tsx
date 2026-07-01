import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Vigil — AI Procurement Intelligence",
  description: "Autonomous procurement risk auditing, RAG search, and supplier communication platform.",
};

// Applies the persisted theme to <html> before first paint. This keeps the
// `dark` class consistent at hydration time and prevents a dark-mode flash.
// Must stay in sync with ThemeContext (key `vigil_theme`, default `light`).
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('vigil_theme') || 'light';
    document.documentElement.classList.toggle('dark', t === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="h-full bg-background text-foreground overflow-hidden transition-colors duration-200 w-full">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
