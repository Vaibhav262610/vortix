import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "../components/MarketingShell";
import { WINDOWS_AGENT_VERSION, WINDOWS_INSTALLER_URL } from "../release";

const workflow = [
  { number: "01", title: "Install on your PC", description: "Download the Windows app, set a device password, and leave Vortix running in the tray." },
  { number: "02", title: "Connect your dashboard", description: "Add the device with its computer name and password. See when it is available." },
  { number: "03", title: "Speak or type a task", description: "Ask for a storage scan or a desktop action, then follow each step and its result." },
];

const capabilities = [
  { number: "01", label: "VOICE + TEXT", title: "Start with a sentence.", description: "Say what you need, or type it when speaking is not convenient. Your device is the destination for the task." },
  { number: "02", label: "SCREEN AWARENESS", title: "See the next step.", description: "Desktop actions use screen context to continue through supported app workflows, with visible checks along the way." },
  { number: "03", label: "STORAGE RESCUE", title: "Find what takes space.", description: "Scan accessible drives, surface large files and folders, and decide what to keep or remove yourself." },
  { number: "04", label: "DEVICE CONTROL", title: "Stay connected.", description: "A quiet Windows tray app shows connection state and lets you pause, resume, or quit the agent." },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 20 20" fill="none" className="shrink-0"><path d={diagonal ? "M4 16 16 4M6 4h10v10" : "M3 10h13m-5-5 5 5-5 5"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DownloadIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0"><path d="M10 2.5v10m0 0 4-4m-4 4-4-4M3.5 14.5v2h13v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ProductPreview() {
  return <div className="relative mx-auto min-w-0 w-full max-w-[610px] lg:ml-auto">
    <div className="pointer-events-none absolute -inset-12 rounded-full bg-emerald-400/10 blur-[80px]" />
    <div className="relative overflow-hidden rounded-[28px] border border-[#547961]/45 bg-[#0d1713] shadow-[0_35px_95px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#14221b] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-sm font-black text-[#062115]">V</span><div><p className="text-[11px] font-bold tracking-[0.16em] text-white">VORTIX</p><p className="text-[10px] text-[#8ba99a]">Device workspace</p></div></div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-emerald-300">PRODUCT PREVIEW</span>
      </div>
      <div className="grid sm:grid-cols-[155px_1fr]">
        <div className="hidden border-r border-white/10 bg-[#101b16] p-4 sm:block"><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#718f7d]">Workspace</p><div className="space-y-2 text-xs"><div className="rounded-lg bg-emerald-400/10 px-3 py-2.5 font-semibold text-emerald-200">Overview</div><div className="px-3 py-2.5 text-[#819c89]">Devices</div><div className="px-3 py-2.5 text-[#819c89]">Storage</div><div className="px-3 py-2.5 text-[#819c89]">History</div></div><div className="mt-24 border-t border-white/10 pt-4 text-[11px] text-[#83a48e]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#4ade80]" />Agent online</div></div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">YOUR DEVICE</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Ready when you are.</h2></div><span className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-200">ONLINE</span></div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#17231c] p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="7" y="2.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5m-3 0h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8db39a]">Voice request</p><p className="mt-1 text-sm font-medium leading-6 text-white">“Find what is filling my Downloads folder.”</p></div></div></div>
          <div className="relative mt-6 space-y-3 pl-1 before:absolute before:bottom-6 before:left-[15px] before:top-3 before:w-px before:bg-emerald-400/20"><div className="relative flex items-center gap-4"><span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 bg-[#163326] text-xs text-emerald-300">✓</span><span className="text-xs text-[#c8d9cb]">Connected to your Windows PC</span></div><div className="relative flex items-center gap-4"><span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400 text-xs font-bold text-[#072415]">2</span><span className="text-xs font-semibold text-white">Scanning accessible folders</span></div><div className="relative flex items-center gap-4"><span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#17231c] text-xs text-[#85a08d]">3</span><span className="text-xs text-[#91a998]">Review the largest results</span></div></div>
          <div className="mt-7 flex items-center justify-between rounded-xl border border-emerald-300/15 bg-emerald-400/5 px-4 py-3"><span className="text-xs font-medium text-[#a3bca8]">DESKTOP-01 <span className="mx-2 text-emerald-300/50">/</span> Windows tray agent</span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#4ade80]" /></div>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-7 -left-4 hidden w-56 rounded-2xl border border-emerald-300/25 bg-[#15241b] p-4 shadow-[0_25px_50px_rgba(0,0,0,0.4)] sm:block"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fac97]">WINDOWS TRAY</p><div className="mt-3 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-base font-black text-[#062115]">V</span><div><p className="text-sm font-semibold text-white">Vortix agent</p><p className="text-xs text-emerald-300">Connected</p></div></div></div>
  </div>;
}

export default function LandingPage() {
  return <div className="min-h-screen overflow-x-hidden bg-[#080d0d] text-[#e8f0ed]">
    <MarketingHeader />
    <main>
      <section className="site-grid relative overflow-hidden border-b border-white/10 px-5 pb-28 pt-16 sm:px-8 sm:pt-24 lg:pb-36 lg:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(40,130,83,0.12),transparent_32%),radial-gradient(circle_at_83%_45%,rgba(60,210,130,0.09),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="min-w-0 max-w-2xl">
            <div className="site-kicker mb-7"><span className="site-kicker-dot" /> YOUR DEVICE, WITHIN REACH</div>
            <h1 className="text-[clamp(2.65rem,6.2vw,5.75rem)] font-semibold leading-[1.02] tracking-[-0.075em] text-white">Your computer.<br /><span className="text-[#8df0ad]">Ready from anywhere.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#a5b9ab] sm:text-lg">Speak a task, inspect storage, or work through a desktop action from one dashboard. The Windows tray app keeps your device connected and shows when it is active.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href={WINDOWS_INSTALLER_URL} download className="site-button"><DownloadIcon /> Download for Windows</a><Link href="/dashboard" className="site-button-secondary">Open dashboard <ArrowIcon diagonal /></Link></div>
            <p className="mt-4 text-xs text-[#819689]">Agent {WINDOWS_AGENT_VERSION} <span className="mx-2 text-emerald-500">•</span> Windows <span className="mx-2 text-emerald-500">•</span> Requires Node.js</p>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs font-medium text-[#9fb3a4]"><span>Voice and text</span><span>Screen context</span><span>Storage insights</span></div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"><div className="grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-24"><div><p className="site-section-label">01 / HOW IT WORKS</p><h2 className="mt-5 max-w-lg text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">From this screen to your other screen.</h2><p className="mt-5 max-w-md text-base leading-8 text-[#9fb3a4]">Set up once, then reach your own computer from the Vortix dashboard whenever it is online.</p><Link href="/setup" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">Read the setup guide <ArrowIcon /></Link></div><div className="divide-y divide-white/10 border-y border-white/10">{workflow.map((step) => <div key={step.number} className="grid gap-4 py-7 sm:grid-cols-[58px_1fr] sm:py-8"><span className="font-mono text-sm text-emerald-400">{step.number}</span><div><h3 className="text-xl font-semibold tracking-tight text-white">{step.title}</h3><p className="mt-2 max-w-lg text-sm leading-7 text-[#94a99a]">{step.description}</p></div></div>)}</div></div></section>

      <section id="capabilities" className="border-y border-white/10 bg-[#0c1511] px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="site-section-label">02 / WHAT YOU CAN DO</p><h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">One place to work across devices.</h2></div><p className="max-w-sm text-sm leading-7 text-[#94a99a]">Vortix combines a connected computer, a focused dashboard, and clear feedback for every task.</p></div><div className="mt-12 grid gap-3 md:grid-cols-2">{capabilities.map((item) => <div key={item.number} className="group relative min-h-64 overflow-hidden rounded-[22px] border border-[#385344]/45 bg-[#111f17] p-7 transition hover:border-emerald-400/40 sm:p-8"><div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-emerald-400/5 blur-3xl transition group-hover:bg-emerald-400/10" /><div className="relative flex items-center justify-between"><span className="font-mono text-xs text-emerald-300">{item.number} / 04</span><span className="text-[10px] font-bold tracking-[0.16em] text-[#83a18b]">{item.label}</span></div><div className="relative mt-16"><h3 className="text-2xl font-semibold tracking-[-0.035em] text-white">{item.title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-[#9db2a1]">{item.description}</p></div></div>)}</div></div></section>

      <section id="download" className="site-grid px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[30px] border border-[#a8f1bf]/40 bg-[#baf3cb] text-[#092418] shadow-[0_30px_90px_rgba(20,110,65,0.12)] lg:grid-cols-[1.1fr_0.9fr]"><div className="p-8 sm:p-12 lg:p-16"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#20613c]">03 / GET THE WINDOWS APP</p><h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.06em] sm:text-5xl">Make another PC available in minutes.</h2><p className="mt-5 max-w-lg text-base leading-8 text-[#315e43]">Download the installer on the computer you want to connect. It installs the same Vortix agent build, starts the tray app, and enables sign-in startup.</p><a href={WINDOWS_INSTALLER_URL} download className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#0b2a1b] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#174b31]"><DownloadIcon /> Download Vortix {WINDOWS_AGENT_VERSION} <ArrowIcon /></a><p className="mt-4 text-xs text-[#477457]">Windows 10/11 · Node.js required · Per-user installation</p></div><div className="flex flex-col justify-center border-t border-[#20513a]/20 bg-[#a6e9bd]/60 p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b2a1b] text-xl font-black text-[#a9efc0]">V</span><div><p className="text-sm font-bold">Vortix for Windows</p><p className="text-xs text-[#477457]">Version {WINDOWS_AGENT_VERSION}</p></div></div><ol className="mt-9 space-y-6 text-sm text-[#315e43]"><li className="flex gap-4"><span className="font-mono font-bold text-[#0f6940]">01</span><span>Install <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 hover:text-[#082f1a]">Node.js</a> if it is not on this PC.</span></li><li className="flex gap-4"><span className="font-mono font-bold text-[#0f6940]">02</span><span>Open the downloaded installer and choose <strong>Install Vortix</strong>.</span></li><li className="flex gap-4"><span className="font-mono font-bold text-[#0f6940]">03</span><span>Set a device password in the tray, then add this PC in the dashboard.</span></li></ol><Link href="/setup" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#125a36] hover:text-[#082f1a]">Full setup instructions <ArrowIcon /></Link></div></div></section>
    </main>
    <MarketingFooter />
  </div>;
}
