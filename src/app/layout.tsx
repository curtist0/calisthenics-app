import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { WorkoutProvider } from "@/context/WorkoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaliTrack — Calisthenics Workout Tracker",
  description: "Track your bodyweight training progress with CaliTrack.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WorkoutProvider>
          <main className="min-h-screen pb-20">{children}</main>
          <Navigation />
        </WorkoutProvider>
      </body>
    </html>
  );
}
