import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { AchievementProvider } from "@/context/AchievementContext";
import LayoutContent from "@/components/layout/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubtlePush - Focus App That Works With Your Brain",
  description: "A compassionate partner that helps you overcome motivational hurdles with personalized AI coaching, automated tracking, and a shame-free environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-50">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 m-0 p-0`}
      >
        <AuthProvider>
          <AchievementProvider>
            <LayoutContent>{children}</LayoutContent>
          </AchievementProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
