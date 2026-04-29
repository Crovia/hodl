export default function SunsetBanner() {
  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/40 text-yellow-100 px-4 py-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-yellow-300 text-lg mb-2">DiamondHands is sunset</p>
            <p className="text-sm leading-relaxed mb-3">
              Please send your <strong>$HODL allocation</strong> to the address below. We will manually send airdrops to everyone who has sent their allocation. We will continue to sell received $HODL — <strong>we do not recommend buying it</strong>.
            </p>
            <div className="bg-black/40 rounded-lg px-4 py-2 font-mono text-sm text-yellow-200 break-all mb-3 border border-yellow-500/20">
              0x36148b668edc1d380671467579ee851a72b9455c
            </div>
            <p className="text-sm text-yellow-200/80">
              <strong>Airdrops include:</strong> $BONE · $CLG · $DUSDCro
            </p>
            <p className="text-xs text-yellow-200/60 mt-1">
              News for $DUSDCro coming in the next day(s). Airdrops begin ASAP. Stay tuned 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
