'use client';

import { useState, useEffect, useMemo } from 'react';
import { NAME_MAP, getDisplayName } from '@/lib/nameMap';
import { useCronosIds } from '@/hooks/useCronosIds';

interface HolderData {
  address: string;
  percentage: number;
  holdingDays: number;
  hasSold: boolean;
  tier: string;
  balance: string;
}

const cryImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
  '/cry18.png', '/cry23.png', '/cry25.png',
];

export default function JeetersPage() {
  const [allHolders, setAllHolders] = useState<HolderData[]>([]);

  useEffect(() => {
    const load = () => {
      fetch(`/holders-live.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.holders) setAllHolders(data.holders);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const jeeters = useMemo(
    () => allHolders.filter(h => h.hasSold || h.tier === 'jeeter'),
    [allHolders]
  );

  const jeeterAddresses = useMemo(() => jeeters.map(j => j.address), [jeeters]);
  const { cronosIds } = useCronosIds(jeeterAddresses);

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyb3Z5OHgydDRrbTB0anl4YXFuNXVvdXQxc2sxZHJ4MjFiYnUzMnFvdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vX9WcCiWwUF7G/source.gif"
              alt="Crying"
              className="w-40 h-40 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-red-400">Hall of Shame</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-2">
            These wallets sold or transferred $HODL tokens. Permanently disqualified from all airdrops.
          </p>
          <p className="text-gray-600 text-sm">The chain sees everything. No second chances.</p>
        </div>

        {jeeters.length > 0 ? (
          <>
            {/* Stats bar */}
            <div className="glass-card rounded-xl p-4 mb-8 border border-red-500/20 bg-red-500/5 text-center">
              <span className="text-red-400 font-black text-3xl">{jeeters.length}</span>
              <span className="text-gray-500 text-sm ml-2">
                {jeeters.length === 1 ? 'wallet has' : 'wallets have'} been disqualified
              </span>
            </div>

            <div className="space-y-4">
              {jeeters.map((j, i) => {
                const displayName = getDisplayName(j.address, cronosIds);
                const hardcodedName = NAME_MAP[j.address.toLowerCase()];
                const cronosId = cronosIds[j.address.toLowerCase()];

                return (
                  <div
                    key={j.address}
                    className="glass-card rounded-xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    <div className="h-0.5 bg-gradient-to-r from-red-500 to-red-700" />
                    <div className="p-5 flex items-center gap-4">
                      <img
                        src={cryImages[i % cryImages.length]}
                        alt="Jeeter"
                        className="w-14 h-14 rounded-full object-cover bg-black/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="tier-jeeter px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase">
                            Jeeter
                          </span>
                          {hardcodedName && (
                            <span className="text-white font-bold text-sm">{hardcodedName}</span>
                          )}
                          {!hardcodedName && cronosId && (
                            <span className="text-purple-400 font-bold text-sm">{cronosId}</span>
                          )}
                          <span className="text-xs text-gray-600">
                            Held {j.holdingDays}d before selling
                          </span>
                        </div>
                        <a
                          href={`https://cronoscan.com/address/${j.address}#tokentxns`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          {j.address}
                        </a>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Was holding <span className="text-white font-medium">{j.percentage}%</span> of supply</span>
                          {parseFloat(j.balance) > 0 && (
                            <span>Still holds <span className="text-gray-400 font-medium">{parseFloat(j.balance).toLocaleString()}</span> tokens</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-red-500/5 border-t border-red-500/10 text-center">
                      <span className="text-xs text-red-400 font-bold">Forfeited all future airdrops permanently</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-red-500/10">
            <img src="/jeeter.png" alt="Jeeter" className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <div className="text-xl font-bold text-gray-400 mb-2">No jeeters yet</div>
            <div className="text-sm text-gray-600">Everyone is holding strong. Sellers will appear here automatically.</div>
          </div>
        )}
      </div>
    </section>
  );
}
