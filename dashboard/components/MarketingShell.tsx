import Link from "next/link";

export function MarketingHeader() {
  return <header className="relative z-20 border-b border-white/10 bg-[#080d0d]/90"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 text-sm font-extrabold tracking-[0.25em] text-white"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-lg font-black tracking-normal text-[#071b11]">V</span> VORTIX</Link><nav aria-label="Main navigation" className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#a3b4a9] sm:gap-7"><Link href="/#workflow" className="hover:text-white">Workflow</Link><Link href="/#capabilities" className="hover:text-white">Capabilities</Link><Link href="/setup" className="hover:text-white">Setup</Link><Link href="/contact" className="hover:text-white">Contact</Link><Link href="/dashboard" className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-300 hover:bg-emerald-400/20">Dashboard ↗</Link></nav></div></header>;
}

export function MarketingFooter() {
  return <footer className="border-t border-white/10 bg-[#080d0d] px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-xs text-[#819789]"><div><span className="font-bold tracking-[0.22em] text-white">VORTIX</span><span className="ml-4">Remote device workspace</span></div><div className="flex gap-6"><Link href="/setup" className="hover:text-white">Setup</Link><Link href="/contact" className="hover:text-white">Contact</Link><a href="https://github.com/Vaibhav262610/vortix" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub ↗</a></div></div></footer>;
}
