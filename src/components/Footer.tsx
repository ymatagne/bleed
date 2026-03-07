export default function Footer() {
  return (
    <footer className="border-t border-border-light py-12 px-6 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Bleed" className="w-5 h-5" />
          <span className="font-bold tracking-tight text-loop-deep">bleed</span>
          <span className="text-xs text-text-dim">by Loop</span>
        </div>
        <p className="text-sm text-text-dim">
          © {new Date().getFullYear()}{" "}
          <a href="https://bankonloop.com" target="_blank" rel="noopener noreferrer" className="hover:text-loop transition-colors">
            Loop Financial Inc.
          </a>{" "}
          All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-text-dim">
          <a href="https://bankonloop.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-loop transition-colors">
            Privacy
          </a>
          <a href="https://bankonloop.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-loop transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
