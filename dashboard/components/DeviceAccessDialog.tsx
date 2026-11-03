"use client";

type Props = {
  isNew: boolean;
  deviceName: string;
  legacyClaim: boolean;
  pairingCode: string;
  connected: boolean;
  claimName: string;
  password: string;
  onCreateCode: () => void;
  onLegacyClaim: () => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function DeviceAccessDialog(props: Props) {
  const { isNew, deviceName, legacyClaim, pairingCode, connected, claimName, password,
    onCreateCode, onLegacyClaim, onNameChange, onPasswordChange, onSubmit, onClose } = props;
  const pairing = isNew && !legacyClaim;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    role="dialog" aria-modal="true" aria-labelledby="device-access-title">
    <div className="glass w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8">
      <h2 id="device-access-title" className="mb-3 text-lg font-semibold text-white">
        {pairing ? "Pair a device" : isNew ? "Connect an older device" : "Enter device password"}
      </h2>
      {pairing ? <>
        <p className="mb-5 text-sm leading-6 text-white/60">Create a one-time code, then enter it in the Windows tray app under <strong className="text-white">Enter pairing code</strong>, or run <code>vortix pair</code> on the device and paste it at the prompt. It expires in ten minutes.</p>
        {pairingCode && <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-widest text-emerald-300">Pairing code</p>
          <code className="mt-2 block select-all break-all text-lg font-semibold text-white">{pairingCode}</code>
          <button type="button" className="mt-3 text-xs text-emerald-300 underline"
            onClick={() => void navigator.clipboard.writeText(pairingCode).catch(() => {})}>Copy code</button>
        </div>}
        <p className="mb-5 text-xs text-white/50">After the agent connects, the device appears in your dashboard. Keep this code private.</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80">Close</button>
          <button type="button" disabled={!connected} onClick={onCreateCode}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm text-white disabled:opacity-50">{pairingCode ? "New code" : "Create code"}</button>
        </div>
        <button type="button" onClick={onLegacyClaim} className="mt-5 text-left text-xs text-white/50 underline">
          Connecting an agent registered before pairing codes? Use its name and password.
        </button>
      </> : <>
        <p className="mb-4 text-sm text-white/60">{isNew
          ? "Enter the name and password of an agent registered before pairing codes."
          : <>Device: <span className="font-mono text-emerald-400">{deviceName}</span></>}</p>
        {isNew && <label className="mb-3 block text-xs text-white/60">Device name
          <input type="text" value={claimName} onChange={event => onNameChange(event.target.value)} autoFocus
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </label>}
        <label className="mb-4 block text-xs text-white/60">Device password
          <input type="password" value={password} onChange={event => onPasswordChange(event.target.value)}
            onKeyDown={event => { if (event.key === "Enter") onSubmit(); }} autoFocus={!isNew}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={!password || (isNew && !claimName.trim())}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm text-white disabled:opacity-50">{isNew ? "Connect" : "Unlock"}</button>
        </div>
      </>}
    </div>
  </div>;
}
