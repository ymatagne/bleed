"use client";

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

export default function Home() {
  return (
    <>
      <Nav />
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
    </>
  );
}
