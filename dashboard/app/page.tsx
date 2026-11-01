import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "../components/MarketingShell";

const steps = [
  ["01", "Connect a device", "Run the agent, then add the device to your account with its name and password."],
  ["02", "Describe the task", "Write what you want to do in plain language and let Vortix prepare the commands."],
  ["03", "Review the plan", "See every proposed command before you approve execution on the device."],
  ["04", "Follow the result", "Watch output and inspect recent command history from the dashboard."],
];

const capabilities = [
  ["01", "Command planning", "Turn a request into a visible, step-by-step command plan."],
  ["02", "Live device view", "See which of your devices are online and choose where to work."],
  ["03", "Storage rescue", "Find large folders and files on a connected device when storage runs low."],
  ["04", "Execution history", "Review commands, outcomes, and timing for your account."],
];

export default function LandingPage() {
  return <div className="min-h-screen overflow-x-hidden bg-[#080d0d] text-[#e8f0ed]">
    <MarketingHeader />
    <main>
      <section className="site-grid relative border-b border-white/10 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pb-32 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_77%_29%,rgba(43,188,129,0.14),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <div className="site-kicker mb-7"><span className="site-kicker-dot" /> REMOTE OPERATIONS, MADE CLEAR</div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.065em] sm:text-6xl lg:text-[5.5rem]">Your computer is full.<br /><span className="text-emerald-400">See what is taking space.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#aabbb4] sm:text-lg">Scan common folders on your connected computer, inspect large files remotely, and decide what to do next. Review every command before it runs.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/dashboard" className="site-button">Open dashboard <span aria-hidden="true">↗</span></Link><Link href="/setup" className="site-button-secondary">See setup guide <span aria-hidden="true">→</span></Link></div>
            <div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#81958a]"><span>Device agent</span><span className="text-emerald-500">/</span><span>WebSocket backend</span><span className="text-emerald-500">/</span><span>Web dashboard</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#335448] bg-[#101b18] shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-[#52675d]" /><i className="h-2 w-2 rounded-full bg-[#52675d]" /><i className="h-2 w-2 rounded-full bg-[#52675d]" /></div><span className="text-xs font-semibold tracking-[0.24em]">VORTIX / WORKSPACE</span></div><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">INTERFACE PREVIEW</span></div>
              <div className="grid min-h-[350px] sm:grid-cols-[175px_1fr]">
                <div className="border-b border-white/10 bg-[#0c1512] p-4 sm:border-b-0 sm:border-r"><p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#769286]">Your devices</p><div className="space-y-2">{[["LAB-PC-01", "Online · selected", true], ["LAB-PC-02", "Online", false], ["LAB-PC-03", "Offline", false]].map(([name, status, selected]) => <div key={String(name)} className={`rounded-xl border px-3 py-3 ${selected ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10"}`}><div className="flex items-center gap-2 text-xs font-semibold"><span className={`h-1.5 w-1.5 rounded-full ${status === "Offline" ? "bg-[#61736a]" : "bg-emerald-400"}`} /> {name}</div><p className="mt-1 pl-3.5 text-[10px] text-[#819989]">{status}</p></div>)}</div></div>
                <div className="flex flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Plan preview</p><h2 className="mt-2 text-lg font-semibold">Check disk space</h2></div><span className="rounded-md bg-[#294138] px-2 py-1 font-mono text-[10px] text-[#a0d7b7]">3 steps</span></div><div className="mt-6 space-y-2 font-mono text-[11px] text-[#c0d2c6] sm:text-xs">{["Check available storage", "Inspect large directories", "Report findings"].map((step, index) => <div key={step} className="rounded-lg border border-white/10 bg-[#0b1411] p-3"><span className="mr-3 text-emerald-400">0{index + 1}</span>{step}</div>)}</div><div className="mt-auto flex items-center justify-between gap-3 pt-8"><span className="text-[11px] text-[#829a89]">Review before running</span><span className="rounded-lg bg-emerald-500 px-3 py-2 text-[11px] font-bold text-[#062014]">Approve plan</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"><div className="grid gap-8 lg:grid-cols-[0.65fr_1fr] lg:gap-20"><div><p className="site-section-label">01 / WORKFLOW</p><h2 className="mt-5 max-w-md text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">From request to result, without the guesswork.</h2></div><p className="max-w-lg self-end text-base leading-8 text-[#9eb1a5]">Vortix keeps the device, the proposed action, and the response in view. You decide what runs.</p></div><div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{steps.map(([number, title, description]) => <div key={number} className="site-card min-h-56 p-6"><span className="font-mono text-xs text-emerald-400">{number} / 04</span><h3 className="mt-9 text-xl font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[#93a79a]">{description}</p></div>)}</div></section>
      <section id="capabilities" className="border-y border-white/10 bg-[#0c1512] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><p className="site-section-label">02 / CAPABILITIES</p><div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">The essentials, together.</h2><p className="max-w-md text-sm leading-7 text-[#94a99a]">Purposeful tools for working on your own connected devices.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-2">{capabilities.map(([number, title, description]) => <div key={number} className="site-card flex min-h-44 gap-5 p-6 sm:p-8"><span className="font-mono text-sm text-emerald-400">{number}</span><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-[#96aa9f]">{description}</p></div></div>)}</div></div></section>
      <section className="site-grid px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] border border-emerald-400/20 bg-[linear-gradient(120deg,#18372b,#102019)] p-8 sm:p-12 lg:flex-row lg:items-end lg:p-16"><div><p className="site-section-label">GET STARTED</p><h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Take your workspace with you.</h2><p className="mt-5 max-w-lg leading-7 text-[#b0c7b7]">Set up the agent, add your first device, and start with a simple diagnostic task.</p></div><Link href="/setup" className="site-button shrink-0">Set up Vortix <span aria-hidden="true">↗</span></Link></div></section>
    </main><MarketingFooter />
  </div>;
}
