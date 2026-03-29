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
      description: '+3% boost every 10 days you hold. 10d = +3%, 20d = +6%, 30d = +9%. The longer you hold, the more you earn.',
      color: 'from-purple-400 to-purple-600',
      image: '/rule-boost.png',
    },
  ];

  const tiers = [
    {
      name: 'Diamond Hands',
      image: '/Dhand.png',
      threshold: '1.8%+ of supply',
      poolShare: '55%',
      description: 'The elite. The unshakeable. Maximum rewards for maximum commitment.',
      gradient: 'from-diamond-400 via-purple-400 to-diamond-400',
      borderColor: 'border-diamond-400/30',
      bgColor: 'bg-diamond-400/5',
      accentColor: 'text-diamond-400',
      ringColor: 'ring-diamond-400/20',
    },
    {
      name: 'Gold Hands',
      image: '/Ghand.png',
      threshold: '1%+ of supply',
      poolShare: '30%',
      description: 'Strong conviction. You believe in the mission and it shows.',
      gradient: 'from-gold-400 via-gold-300 to-gold-500',
      borderColor: 'border-gold-400/30',
      bgColor: 'bg-gold-400/5',
      accentColor: 'text-gold-400',
      ringColor: 'ring-gold-400/20',
    },
    {
      name: 'Silver Hands',
      image: '/Shand.png',
      threshold: '0.5%+ of supply',
      poolShare: '15%',
      description: 'You\'re in the game. Hold strong and climb the ranks.',
      gradient: 'from-gray-300 via-gray-200 to-gray-400',
      borderColor: 'border-gray-400/30',
      bgColor: 'bg-gray-400/5',
      accentColor: 'text-gray-300',
      ringColor: 'ring-gray-400/20',
    },
    {
      name: 'Bronze Hands',
      image: '/Shand.png',
      threshold: 'Under 0.5% of supply',
      poolShare: '0%',
      description: 'You\'re holding but not enough for airdrop rewards yet. Keep accumulating to reach Silver and start earning.',
      gradient: 'from-amber-700 via-amber-600 to-amber-800',
      borderColor: 'border-amber-700/30',
      bgColor: 'bg-amber-700/5',
      accentColor: 'text-amber-600',
      ringColor: 'ring-amber-700/20',
    },
    {
      name: 'Jeeter',
      image: '/jeeter.png',
      threshold: 'Sold or transferred',
      poolShare: '0%',
      description: 'You sold. You\'re out. Permanently disqualified from all airdrops. No second chances.',
      gradient: 'from-red-500 via-red-400 to-red-600',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5',
      accentColor: 'text-red-400',
      ringColor: 'ring-red-500/20',
    },
  ];

  return (
    <section id="info" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Rules section */}
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

        {/* Tier System */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="diamond-text">Tier System</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              The pool splits equally between tiers. Within each tier, rewards scale by your holdings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card rounded-2xl overflow-hidden ${tier.borderColor} hover:ring-2 ${tier.ringColor} transition-all duration-300 group`}
              >
                <div className={`h-1 bg-gradient-to-r ${tier.gradient}`} />
                <div className="p-8">
                  <div className="flex items-center gap-5 mb-6">
                    <div className={`relative flex-shrink-0 w-24 h-24 rounded-2xl ${tier.bgColor} flex items-center justify-center overflow-hidden`}>
                      <img src={tier.image} alt={tier.name} className="w-20 h-20 object-contain" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                        {tier.name}
                      </h3>
                      <div className={`text-sm font-medium ${tier.accentColor} mt-0.5`}>{tier.threshold}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tier.description}</p>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pool Share</span>
                    <span className={`text-3xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                      {tier.poolShare}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Boost timeline */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="diamond-text">Loyalty Boost Timeline</span>
            </h3>
            <div className="glass-card rounded-2xl p-8">
              <div className="relative">
                <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gradient-to-r from-gray-700 via-gold-400/50 to-purple-400/50 rounded-full" />
                <div className="relative flex justify-between items-start">
                  {[
                    { day: '10d', boost: '+3%', color: 'text-gray-400', dot: 'bg-gray-400', ring: 'ring-gray-400/30' },
                    { day: '20d', boost: '+6%', color: 'text-gold-400', dot: 'bg-gold-400', ring: 'ring-gold-400/30' },
                    { day: '30d', boost: '+9%', color: 'text-gold-300', dot: 'bg-gold-300', ring: 'ring-gold-300/30' },
                    { day: '40d', boost: '+12%', color: 'text-diamond-400', dot: 'bg-diamond-400', ring: 'ring-diamond-400/30' },
                    { day: '50d', boost: '+15%', color: 'text-purple-400', dot: 'bg-purple-400', ring: 'ring-purple-400/30' },
                    { day: '60d+', boost: '+18%+', color: 'text-pink-400', dot: 'bg-pink-400', ring: 'ring-pink-400/30' },
                  ].map((milestone, i) => (
                    <div key={milestone.day} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${milestone.dot} ring-4 ${milestone.ring} ${i > 0 ? 'animate-sparkle' : ''}`}
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                      <div className={`text-lg font-bold ${milestone.color} mt-3`}>{milestone.boost}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{milestone.day}</div>
                    </div>
                  ))}
                </div>
              </div>
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

        {/* Tokenomics */}
        <div className="mt-16 glass-card rounded-2xl overflow-hidden p-8">
          <h3 className="text-2xl font-black mb-8">
            <span className="text-gold-400">Tokenomics</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Tax Distribution</h4>
              <div className="space-y-3">
                {[
                  { label: 'Launch Tax', value: '10%', dot: 'bg-gold-400' },
                  { label: 'Tax Reduction', value: '-1% every 10 days', dot: 'bg-diamond-400' },
                  { label: 'Minimum Tax', value: '5%', dot: 'bg-green-400' },
                  { label: 'Burned', value: 'ZERO', dot: 'bg-gray-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                      <span className="text-sm text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gold-400">{item.value}</span>
                  </div>
                ))}
              </div>
              <h4 className="text-lg font-bold text-white mt-6 mb-4">Buyback Split</h4>
              <div className="space-y-3">
                {[
                  { label: '$HODL buyback', value: '35%', dot: 'bg-gold-400' },
                  { label: '$CLG', value: '33%', dot: 'bg-purple-400' },
                  { label: 'Rotating tokens', value: '32%', dot: 'bg-pink-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                      <span className="text-sm text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gold-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-4">How It Works</h4>
              <div className="space-y-3">
                {[
                  { title: '100% Airdropped', desc: 'All taxes are used to buy tokens and airdrop them to holders. No funds are burned — you will receive them back. Exception: Dexscreener is paid with taxes, and any other possible costs are agreed with the Diamond holders first. If you just hold? Simple.', color: 'text-gold-400' },
                  { title: '~10 Day Cycles', desc: 'Every ~10 days, buybacks are executed and tokens airdropped. Equal amounts distributed to holders based on their tier (Diamond, Gold, Silver).', color: 'text-diamond-400' },
                  { title: 'Diamond Path', desc: '$HODL holders get a +3% boost every 10 days they hold. 10d = +3%, 20d = +6%, 30d = +9%, and so on. The longer you hold, the more you earn.', color: 'text-purple-400' },
                  { title: 'Rotating 32%', desc: '32% of buybacks go to rotating tokens. Each phase is voted by the community — one suggestion per person, no repeats from previous phases.', color: 'text-pink-400' },
                  { title: 'Sell = Permanent Ban', desc: 'If you sell or transfer any tokens, you are permanently disqualified from all future airdrops. The chain sees everything.', color: 'text-red-400' },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg bg-black/40">
                    <div className={`font-bold text-sm mb-1 ${item.color}`}>{item.title}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
