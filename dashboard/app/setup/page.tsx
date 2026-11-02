import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "../../components/MarketingShell";

function Code({ children }: { children: React.ReactNode }) {
  return <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#07100c] p-4 font-mono text-xs leading-6 text-emerald-200 sm:text-sm"><code>{children}</code></pre>;
}

export default function SetupPage() {
  return <div className="min-h-screen bg-[#080d0d] text-[#e8f0ed]"><MarketingHeader /><main className="site-grid px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-5xl">
    <p className="site-section-label">SETUP GUIDE / 4 STEPS</p>
    <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Bring your first device online.</h1>
    <p className="mt-6 max-w-2xl text-base leading-8 text-[#a6b9ab]">You need Node.js 20.19+, 22.12+, or 24+, an account, and a computer where the Vortix agent can run. These commands use the source repository.</p>
    <div className="mt-12 grid gap-4 lg:grid-cols-2">
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">01 / ACCOUNT</span><h2 className="mt-6 text-2xl font-semibold">Create your account</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Sign in with Clerk before opening the dashboard. Each device you add will belong to your account.</p><Link href="/sign-up" className="mt-6 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200">Create account →</Link></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">02 / AGENT</span><h2 className="mt-6 text-2xl font-semibold">Install and set a password</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">On the device you want to control, clone the repository and set a unique device password.</p><Code>{`git clone https://github.com/Vaibhav262610/vortix.git\ncd vortix/agent\nnpm ci\nnode agent.js login`}</Code></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">03 / CONNECT</span><h2 className="mt-6 text-2xl font-semibold">Start the agent</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Start the agent from its folder. It uses the default hosted backend unless you set <code className="text-emerald-300">BACKEND_URL</code> for your own server.</p><Code>{`node agent.js start`}</Code><p className="mt-3 text-xs leading-6 text-[#82988a]">For a local backend in PowerShell: <code>$env:BACKEND_URL=&apos;ws://localhost:8080&apos;</code>. On macOS or Linux: <code>export BACKEND_URL=ws://localhost:8080</code>.</p></div>
      <div className="site-card p-6 sm:p-8"><span className="font-mono text-xs text-emerald-400">04 / DASHBOARD</span><h2 className="mt-6 text-2xl font-semibold">Add the device</h2><p className="mt-3 text-sm leading-7 text-[#9aac9f]">Open the dashboard and choose <strong className="text-white">Add device</strong>. Enter the computer name shown by the agent and its password. The first account to add a device becomes its owner.</p><Link href="/dashboard" className="mt-6 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200">Open dashboard →</Link></div>
    </div>
    <div id="update-agent" className="mt-8 scroll-mt-24 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Using the global npm agent?</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#b4b9aa]">The npm registry still has <code>vortix@1.2.3</code>, which lacks Storage Rescue. On the device you control, stop the running <code>vortix start</code> process first. Install the updated CLI from this repository, then start it again. Your saved device password remains in the same computer account.</p>
      <Code>{`git clone https://github.com/Vaibhav262610/vortix.git\ncd vortix/cli_vortix\nnpm pack\nnpm install -g ./vortix-1.2.4.tgz\nvortix start`}</Code>
      <p className="mt-3 text-xs leading-6 text-[#9ca792]">If you already cloned the repository, run <code>git pull</code> at its root instead of cloning again. If the old agent starts automatically, disable its auto-start before running the updated CLI.</p>
    </div>
    <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-8"><h2 className="text-xl font-semibold">Running the full stack locally?</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#9aac9f]">Set the Clerk keys in both the backend and dashboard from the same Clerk application. Set <code className="text-emerald-300">NEXT_PUBLIC_BACKEND_WS=ws://localhost:8080</code> in the dashboard. Then start the backend and dashboard in separate terminals, each from the repository root.</p><Code>{`# Terminal 1\ncd backend\nnpm ci\nnpm start\n\n# Terminal 2\ncd dashboard\nnpm ci\nnpm run dev`}</Code><p className="mt-3 text-xs leading-6 text-[#82988a]">For persistent production data, configure <code>DATABASE_URL</code> with PostgreSQL on the backend.</p></div>
  </div></main><MarketingFooter /></div>;
}
