'use client';

export default function CryingJeeter({ side = 'left', className = '' }: { side?: 'left' | 'right'; className?: string }) {
  const flip = side === 'right' ? 'scale(-1, 1)' : '';
  return (
    <svg
      width="140"
      height="200"
      viewBox="0 0 140 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip }}
    >
      <defs>
        <radialGradient id={`jt-skin-${side}`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#c9a87c" />
          <stop offset="100%" stopColor="#a07850" />
        </radialGradient>
        <filter id={`jt-shadow-${side}`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Body — hunched, defeated posture */}
      <ellipse cx="70" cy="160" rx="35" ry="35" fill="#3a1515" opacity="0.9" />
      {/* Tattered shirt */}
      <ellipse cx="70" cy="155" rx="32" ry="30" fill="#8b1a1a" opacity="0.8" />
      <text x="55" y="162" fontSize="10" fill="#ff6b6b" fontWeight="bold" opacity="0.6">SELL</text>

      {/* Arms reaching up / covering face */}
      <path d="M 40 140 Q 30 120 38 100" stroke={`url(#jt-skin-${side})`} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 100 140 Q 110 120 102 100" stroke={`url(#jt-skin-${side})`} strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Hands near face */}
      <circle cx="38" cy="97" r="7" fill={`url(#jt-skin-${side})`} />
      <circle cx="102" cy="97" r="7" fill={`url(#jt-skin-${side})`} />

      {/* Head */}
      <circle cx="70" cy="75" r="30" fill={`url(#jt-skin-${side})`} />

      {/* Sad eyebrows — angled down */}
      <line x1="52" y1="60" x2="63" y2="65" stroke="#5a3a20" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="60" x2="77" y2="65" stroke="#5a3a20" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes — squeezed shut crying */}
      <path d="M 55 70 Q 60 74 65 70" stroke="#3a2010" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 75 70 Q 80 74 85 70" stroke="#3a2010" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Tear streams — multiple drops */}
      <path d="M 58 74 Q 56 85 54 95" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M 82 74 Q 84 85 86 95" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </path>
      {/* Tear drops falling */}
      <circle cx="54" cy="98" r="3" fill="#60a5fa" opacity="0.6">
        <animate attributeName="cy" values="95;115;95" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="86" cy="98" r="3" fill="#60a5fa" opacity="0.6">
        <animate attributeName="cy" values="95;115;95" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      </circle>
      {/* Extra tear drops */}
      <circle cx="56" cy="88" r="2" fill="#60a5fa" opacity="0.5">
        <animate attributeName="cy" values="85;110;85" dur="2.2s" begin="0.3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="84" cy="88" r="2" fill="#60a5fa" opacity="0.5">
        <animate attributeName="cy" values="85;110;85" dur="2.2s" begin="0.9s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" begin="0.9s" repeatCount="indefinite" />
      </circle>

      {/* Mouth — wide open crying */}
      <ellipse cx="70" cy="87" rx="8" ry="6" fill="#3a1010" />
      <path d="M 63 85 Q 70 95 77 85" stroke="#5a2020" strokeWidth="1" fill="#3a1010" />

      {/* Sweat / stress marks */}
      <line x1="45" y1="50" x2="42" y2="45" stroke="#60a5fa" strokeWidth="1.5" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="95" y1="50" x2="98" y2="45" stroke="#60a5fa" strokeWidth="1.5" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" begin="1s" repeatCount="indefinite" />
      </line>

      {/* Red chart going down (portfolio crash) */}
      <g opacity="0.5" transform="translate(15, 25) scale(0.5)">
        <rect x="0" y="0" width="50" height="35" rx="4" fill="#1a0505" stroke="#ff4444" strokeWidth="1" opacity="0.7" />
        <polyline points="5,8 15,12 25,10 35,20 45,30" stroke="#ff4444" strokeWidth="2" fill="none" />
        <polygon points="42,28 48,32 45,26" fill="#ff4444" />
      </g>
    </svg>
  );
}
