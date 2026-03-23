'use client';

export default function Rules() {
  const rules = [
    {
      icon: '1',
      title: 'Buy & Hold',
      description: 'Buy $HODL tokens. 10% buy + 10% sell tax — all of it gets airdropped to holders.',
      color: 'from-gold-400 to-gold-600',
      image: '/rule-buy.png',
    },
    {
      icon: '2',
      title: 'Never Sell',
      description: 'If you sell ANY amount, at ANY time — you\'re OUT. No second chances with that wallet.',
      color: 'from-red-400 to-red-600',
      image: '/rule-hodl.png',
    },
    {
      icon: '3',
      title: 'Collect Airdrops',
      description: 'Every 10 days, the pool is distributed. Hold more = earn more. Simple.',
      color: 'from-diamond-400 to-diamond-600',
      image: '/rule-airdrop.png',
    },
    {
      icon: '4',
      title: 'Earn Boosts',
      description: 'After 30 days: +10% boost. After 60 days: +20%. Up to 100%. The longer you hold, the more you earn.',
      color: 'from-purple-400 to-purple-600',
      image: '/rule-boost.png',
    },
  ];

  return (
    <section id="rules" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">The Rules Are Simple</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            No funds are burned. You will receive them back. If you just hold? Simple.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 group"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={rule.image}
                  alt={rule.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rule.color} flex items-center justify-center text-black font-black text-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {rule.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{rule.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Warning banner */}
        <div className="mt-12 glass-card rounded-2xl p-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-6">
            <img
              src="/rule-jeet.png"
              alt="Jeeter"
              className="w-40 h-40 rounded-xl object-cover flex-shrink-0 hidden sm:block"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">&#9888;</span>
                <h4 className="text-red-400 font-bold text-lg">Sold? You&apos;re Out.</h4>
              </div>
              <p className="text-gray-400">
                If you sell or transfer any tokens from your wallet, you are permanently disqualified from airdrops.
                Want back in? Buy from a fresh wallet address. The chain sees everything.
              </p>
            </div>
          </div>
        </div>

        {/* Minimum hold period */}
        <div className="glass-card rounded-2xl p-6 border border-gold-400/20 mt-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">&#9203;</span>
            <div>
              <h4 className="text-gold-400 font-bold text-lg mb-1">10-Day Minimum Hold</h4>
              <p className="text-gray-400">
                To be eligible for airdrops you must hold for at least 10 days. You can&apos;t buy 1 day before an airdrop and collect — the chain tracks when you bought.
              </p>
            </div>
          </div>
        </div>
        {/* Rotating Token Phases */}
        <div className="glass-card rounded-2xl overflow-hidden mt-6">
          <div className="p-6 border-b border-gold-400/10">
            <h3 className="text-xl font-bold text-white text-center">Rotating Token Phases</h3>
          </div>
          <div className="p-6 space-y-3">
            {[
              { phase: 'Phase 1', desc: 'Voted by community', color: 'border-pink-400/30', phaseColor: 'text-pink-400' },
              { phase: 'Phase 2', desc: 'Decided by founder', color: 'border-gray-600', phaseColor: 'text-gray-400' },
              { phase: 'Phase 3', desc: 'Voted by community', color: 'border-pink-400/30', phaseColor: 'text-pink-400' },
              { phase: 'Phase 4', desc: 'Decided by founder', color: 'border-gray-600', phaseColor: 'text-gray-400' },
            ].map((p) => (
              <div key={p.phase} className={`flex items-center gap-4 p-3 rounded-lg bg-black/40 border-l-2 ${p.color}`}>
                <span className={`font-bold text-sm w-16 ${p.phaseColor}`}>{p.phase}</span>
                <span className="text-sm text-gray-400">{p.desc}</span>
              </div>
            ))}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-black/40 border-l-2 border-gray-700">
              <span className="font-bold text-sm w-16 text-gray-500">Phase 5+</span>
              <span className="text-sm text-gray-500">Pattern continues — alternating every 2 weeks between community vote and founder</span>
            </div>
          </div>
          <div className="p-4 mx-6 mb-6 rounded-lg bg-gold-400/5 border border-gold-400/20">
            <p className="text-sm text-gray-400">
              <span className="text-gold-400 font-bold">Voting: </span>
              Rotating token is voted by the community. Each person can suggest one token to be voted on. Previously bought tokens cannot be suggested again.
              Diamond Hands get <span className="text-diamond-400 font-bold">3 votes</span>,
              Gold Hands get <span className="text-gold-400 font-bold">2 votes</span>,
              Silver Hands get <span className="text-white font-bold">1 vote</span>.
            </p>
          </div>
        </div>

        {/* Treasury Example */}
        <div className="glass-card rounded-2xl overflow-hidden mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
              { label: 'Total Treasury', value: '300 CRO', color: 'text-white' },
              { label: 'Next Airdrop (20%)', value: '60 CRO', color: 'text-gold-400' },
              { label: 'Stays in Treasury', value: '240 CRO', color: 'text-gray-300' },
              { label: 'Distribution', value: 'Every ~10d', color: 'text-diamond-400' },
            ].map((stat) => (
              <div key={stat.label} className="p-5 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                <div className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="p-6 space-y-4 border-t border-white/5">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-black/40">
              <span className="text-yellow-400 text-lg mt-0.5">&#9889;</span>
              <p className="text-sm text-gray-400">
                <span className="text-yellow-400 font-bold">No funds are burned: </span>
                You will receive them back. If you just hold? Simple. All taxes go to buybacks and airdrops — nothing is wasted.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-black/40">
              <span className="text-diamond-400 text-lg mt-0.5">&#128142;</span>
              <p className="text-sm text-gray-400">
                <span className="text-diamond-400 font-bold">Diamond Path: </span>
                $HODL holders who still hold after 30 days get a 10% boost every month, up to 100%. Who&apos;s the real Diamond Hand?
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-black/40">
              <span className="text-green-400 text-lg mt-0.5">&#9989;</span>
              <p className="text-sm text-gray-400">
                <span className="text-green-400 font-bold">Tax Reduction Schedule: </span>
                Launch tax starts at 10%. Drops 1% every 10 days down to 5%. Further reductions decided by majority of Diamond Hand holders.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-black/40">
              <span className="text-gray-400 text-lg mt-0.5">&#128172;</span>
              <p className="text-sm text-gray-400">
                <span className="text-purple-400 font-bold">Community-Driven: </span>
                Tax adjustments, phase token selection, and project direction are decided among Diamond Hand holders. Your voice matters — join the conversation and help shape what comes next.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
