export default function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blood" />
          <span className="font-bold tracking-tight">bleed</span>
          <span className="text-xs text-text-dim">by Loop</span>
        </div>
        <p className="text-sm text-text-dim">
          © {new Date().getFullYear()}{" "}
          <a href="https://bankonloop.com" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">
            Loop Financial Inc.
          </a>{" "}
          All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-text-dim">
          <a href="https://bankonloop.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">
            Privacy
          </a>
          <a href="https://bankonloop.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
