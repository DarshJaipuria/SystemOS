import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: "SystemOS — Student Habit Tracker & Digital Wellness Monitor",
  description: "Track habits, monitor digital wellness, ace exams. A premium student wellness platform combining habit tracking, AI coaching, and gamified learning.",
  keywords: "habit tracker, student wellness, digital detox, pomodoro, exam readiness, health score",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SystemOS",
  },
  openGraph: {
    title: "SystemOS — Student Habit & Wellness Tracker",
    description: "Build better habits, improve digital wellness, and ace your exams.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
