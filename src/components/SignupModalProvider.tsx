"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import SignupModal from "./SignupModal";
import { buildSignupUrl, persistAttributionParams } from "@/lib/attribution";

interface SignupModalContextType {
  openSignup: () => void;
}

const DEFAULT_SIGNUP_URL = "https://go.bankonloop.com/signup";
const SignupModalContext = createContext<SignupModalContextType>({ openSignup: () => {} });

export function useSignupModal() {
  return useContext(SignupModalContext);
}

export function SignupModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signupUrl, setSignupUrl] = useState(DEFAULT_SIGNUP_URL);

  useEffect(() => {
    persistAttributionParams();
  }, []);

  const openSignup = useCallback(() => {
    persistAttributionParams();
    setSignupUrl(buildSignupUrl());
    setOpen(true);
  }, []);

  return (
    <SignupModalContext.Provider value={{ openSignup }}>
      {children}
      <SignupModal open={open} onClose={() => setOpen(false)} signupUrl={signupUrl} />
    </SignupModalContext.Provider>
  );
}
