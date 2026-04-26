'use client';

const TWEET_URL = 'https://x.com/CronosLegends/status/2048479237154201839';
const AWERGHX_URL = 'https://x.com/Awerghx';
const DISCORD_URL = 'https://discord.gg/huWn4Tz4g4';

export default function CronosLegendsParticipation() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl overflow-hidden border border-gold-400/30 bg-gradient-to-br from-gold-400/5 via-orange-400/5 to-diamond-400/5 shadow-[0_0_60px_rgba(251,191,36,0.15)]">
          <div className="h-1 bg-gradient-to-r from-gold-400 via-orange-400 to-diamond-400" />

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-orange-500 flex items-center justify-center text-black font-black text-lg">
                A
              </div>
              <div>
                <div className="font-bold text-white">Announcement from Awerghx</div>
                <a
                  href={AWERGHX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gold-400 transition-colors"
                >
                  @Awerghx · Project founder
                </a>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black mb-4">
              <span className="diamond-text">Participation Round Is Open</span>
            </h3>

            <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
              Send <span className="text-gold-400 font-bold">0&ndash;2000 CRO</span> to participate.
              The wallet address is shared in Discord &mdash; create a support ticket and the team will
              hand it to you directly.
            </p>

            <p className="text-xs text-gray-500 mb-6 italic">
              Note: the announcement post lives on the Cronos Legends X account, but $HODL is an
              independent project by Awerghx and not part of Cronos Legends.
            </p>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-4 border border-gold-400/20 bg-gold-400/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Step 1</div>
                <div className="text-sm text-white font-semibold">Join the Discord</div>
              </div>
              <div className="rounded-xl p-4 border border-orange-400/20 bg-orange-400/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Step 2</div>
                <div className="text-sm text-white font-semibold">Open a ticket &rarr; get the 0x address</div>
              </div>
              <div className="rounded-xl p-4 border border-diamond-400/20 bg-diamond-400/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Step 3</div>
                <div className="text-sm text-white font-semibold">Send 0&ndash;2000 CRO &mdash; you&apos;re in</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-400 hover:to-purple-500 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105"
              >
                Open Ticket on Discord &rarr;
              </a>
              <a
                href={TWEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-all"
              >
                Read the Announcement on X
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Only send from a wallet you control. The team will never DM you first &mdash; always go through a Discord ticket.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
