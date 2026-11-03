import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "../../components/MarketingShell";
import { WINDOWS_AGENT_VERSION, WINDOWS_INSTALLER_URL } from "../../release";

function Code({ children }: { children: React.ReactNode }) {
  return <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#07100c] p-4 font-mono text-xs leading-6 text-emerald-200 sm:text-sm"><code>{children}</code></pre>;
}

export default function SetupPage() {
  return <div className="min-h-screen bg-[#080d0d] text-[#e8f0ed]"><MarketingHeader /><main className="site-grid px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-5xl">
    <p className="site-section-label">SETUP GUIDE / 4 STEPS</p>
    <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Bring your first device online.</h1>
    <p className="mt-6 max-w-2xl text-base leading-8 text-[#a6b9ab]">On Windows, install the tray app on each computer you want to connect. You need Node.js, a Vortix account, and a device password you choose during setup.</p>
    <div className="mt-12 grid gap-4 lg:grid-cols-2">
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">01 / ACCOUNT</span><h2 className="mt-6 text-2xl font-semibold">Create your account</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Sign in with Clerk before opening the dashboard. Each device you add will belong to your account.</p><Link href="/sign-up" className="mt-6 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200">Create account →</Link></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">02 / WINDOWS APP</span><h2 className="mt-6 text-2xl font-semibold">Download the tray app</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Install <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-4">Node.js</a> first. Then download the Vortix {WINDOWS_AGENT_VERSION} installer on the PC you want to connect.</p><a href={WINDOWS_INSTALLER_URL} download className="site-button mt-6">Download for Windows ↓</a></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">03 / CONNECT</span><h2 className="mt-6 text-2xl font-semibold">Secure and connect</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Open the installer and choose <strong className="text-white">Install Vortix</strong>. Set a device password in the tray app. New devices need a one-time pairing code from your signed-in dashboard before they can connect.</p><p className="mt-4 text-xs leading-6 text-[#82988a]">The tray icon shows the connection state. Double-click it to pause or resume the agent. Closing its status window leaves the agent running.</p></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">04 / DASHBOARD</span><h2 className="mt-6 text-2xl font-semibold">Pair the device</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Choose <strong className="text-white">Add device → Create code</strong>, then enter the code in the tray app. It expires in ten minutes and can be used once. Your device appears here when connected. Then speak or type a command.</p><Link href="/dashboard" className="mt-6 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200">Open dashboard →</Link></div>
    </div>
    <div id="update-agent" className="mt-8 scroll-mt-24 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Prefer the command line?</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#b4b9aa]">The npm registry still has an older release. To install the same version as the Windows download from source, use the current repository package. Your saved device password remains in the same Windows account.</p>
      <Code>{`git clone https://github.com/Vaibhav262610/vortix.git\ncd vortix/cli_vortix\nnpm pack\nnpm install -g ./vortix-${WINDOWS_AGENT_VERSION}.tgz\nvortix enable-autostart\nvortix tray`}</Code>
      <p className="mt-3 text-xs leading-6 text-[#9ca792]">If you already cloned the repository, run <code>git pull</code> at its root instead of cloning again. Close any old <code>vortix start</code> terminal before installing. On macOS or Linux, run the agent from the source repository with <code>node agent.js start</code>.</p>
    </div>
    <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-8"><h2 className="text-xl font-semibold">Running the full stack locally?</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#9aac9f]">Set the Clerk keys in both the backend and dashboard from the same Clerk application. Set <code className="text-emerald-300">NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080</code> in the dashboard. Then start the backend and dashboard in separate terminals, each from the repository root.</p><Code>{`# Terminal 1\ncd backend\nnpm ci\nnpm start\n\n# Terminal 2\ncd dashboard\nnpm ci\nnpm run dev`}</Code><p className="mt-3 text-xs leading-6 text-[#82988a]">For persistent production data, configure <code>DATABASE_URL</code> with PostgreSQL on the backend.</p></div>
  </div></main><MarketingFooter /></div>;
}
