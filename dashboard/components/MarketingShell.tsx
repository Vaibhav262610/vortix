import Link from "next/link";
import { WINDOWS_INSTALLER_URL } from "../release";

export function MarketingHeader() {
  return <header className="relative z-20 border-b border-white/10 bg-[#080d0d]/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-y-4 px-5 py-4 sm:px-8">
      <Link href="/" className="flex items-center gap-3 text-sm font-extrabold tracking-[0.25em] text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/30 bg-emerald-400 text-lg font-black tracking-normal text-[#071b11] shadow-[0_0_28px_rgba(52,211,153,0.25)]">V</span>
        VORTIX
      </Link>
      <a href={WINDOWS_INSTALLER_URL} download aria-label="Download Vortix for Windows" className="ml-auto rounded-lg bg-emerald-400 px-3.5 py-2.5 text-xs font-bold text-[#062014] transition hover:bg-emerald-300 sm:hidden">Download ↓</a>
      <nav aria-label="Main navigation" className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#a3b4a9] sm:order-none sm:ml-auto sm:w-auto sm:gap-7">
        <Link href="/#workflow" className="hover:text-white">How it works</Link>
        <Link href="/#capabilities" className="hover:text-white">Features</Link>
        <Link href="/setup" className="hover:text-white">Setup</Link>
        <Link href="/contact" className="hidden hover:text-white lg:inline">Contact</Link>
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <a href={WINDOWS_INSTALLER_URL} download className="hidden rounded-lg bg-emerald-400 px-3.5 py-2.5 font-bold text-[#062014] transition hover:bg-emerald-300 sm:inline-flex">Download for Windows ↓</a>
      </nav>
    </div>
  </header>;
}

export function MarketingFooter() {
  return <footer className="border-t border-white/10 bg-[#080d0d] px-5 py-10 sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-xs text-[#819789]">
      <div><span className="font-bold tracking-[0.22em] text-white">VORTIX</span><span className="ml-4">Remote device workspace</span></div>
      <div className="flex gap-6"><Link href="/setup" className="hover:text-white">Setup</Link><Link href="/contact" className="hover:text-white">Contact</Link><a href="https://github.com/Vaibhav262610/vortix" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub ↗</a></div>
    </div>
  </footer>;
}
