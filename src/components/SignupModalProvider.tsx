"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import SignupModal from "./SignupModal";

interface SignupModalContextType {
  openSignup: () => void;
}

const SignupModalContext = createContext<SignupModalContextType>({ openSignup: () => {} });

export function useSignupModal() {
  return useContext(SignupModalContext);
}

export function SignupModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSignup = useCallback(() => setOpen(true), []);

  return (
    <SignupModalContext.Provider value={{ openSignup }}>
      {children}
      <SignupModal open={open} onClose={() => setOpen(false)} />
    </SignupModalContext.Provider>
  );
}
