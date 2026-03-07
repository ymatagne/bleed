"use client";

import { SignupModalProvider } from "@/components/SignupModalProvider";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Tool from "@/components/Tool";
import HowBanksRobYou from "@/components/HowBanksRobYou";
import Evidence from "@/components/Evidence";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SendCalculator from "@/components/SendCalculator";
import StickyCTA from "@/components/StickyCTA";
import ReferralBanner from "@/components/ReferralBanner";

export default function Home() {
  return (
    <SignupModalProvider>
      <Nav />
      <ReferralBanner />
      <main>
        <Hero />
        <Ticker />
        <Tool />
        <HowBanksRobYou />
        <Evidence />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
      <SendCalculator />
      <StickyCTA />
    </SignupModalProvider>
  );
}
