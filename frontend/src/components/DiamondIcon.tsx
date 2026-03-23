'use client';

export default function DiamondIcon({ size = 64, className = '', id = 'main' }: { size?: number; className?: string; id?: string }) {
  const gId = `d-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Brilliant cut diamond gradients */}
        <linearGradient id={`${gId}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f4ff" />
          <stop offset="15%" stopColor="#b8e8ff" />
          <stop offset="30%" stopColor="#7dd3fc" />
          <stop offset="45%" stopColor="#c4b5fd" />
          <stop offset="60%" stopColor="#e0e7ff" />
          <stop offset="75%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id={`${gId}-crown`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#c7d2fe" />
          <stop offset="50%" stopColor="#e0f2fe" />
          <stop offset="75%" stopColor="#faf5ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${gId}-fire`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id={`${gId}-center-flash`} cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gId}-rainbow`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.15" />
          <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.08" />
          <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.05" />
        </radialGradient>

        {/* Intense multi-layer glow */}
        <filter id={`${gId}-mega-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur3" />
          <feFlood floodColor="#bae6fd" floodOpacity="0.4" result="blueFlood" />
          <feComposite in="blueFlood" in2="blur2" operator="in" result="blueGlow" />
          <feFlood floodColor="#fbbf24" floodOpacity="0.2" result="goldFlood" />
          <feComposite in="goldFlood" in2="blur3" operator="in" result="goldGlow" />
          <feMerge>
            <feMergeNode in="goldGlow" />
            <feMergeNode in="blueGlow" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Star sparkle filter */}
        <filter id={`${gId}-sparkle-blur`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Outer halo glow */}
      <ellipse cx="100" cy="110" rx="70" ry="30" fill="#7dd3fc" opacity="0.08" filter={`url(#${gId}-mega-glow)`} />

      {/* Main diamond body — brilliant cut shape */}
      <g filter={`url(#${gId}-mega-glow)`}>
        {/* Crown (top) */}
        <polygon points="100,10 160,65 100,65 40,65" fill={`url(#${gId}-crown)`} />
        {/* Table (top flat) */}
        <polygon points="100,10 75,40 125,40" fill="white" opacity="0.9" />
        {/* Crown facets left */}
        <polygon points="100,10 40,65 75,40" fill={`url(#${gId}-body)`} opacity="0.85" />
        {/* Crown facets right */}
        <polygon points="100,10 160,65 125,40" fill={`url(#${gId}-body)`} opacity="0.7" />
        {/* Girdle band */}
        <polygon points="40,65 160,65 155,72 45,72" fill="#e0e7ff" opacity="0.6" />
        {/* Pavilion (bottom) — main facets */}
        <polygon points="45,72 100,190 100,72" fill={`url(#${gId}-body)`} opacity="0.6" />
        <polygon points="155,72 100,190 100,72" fill={`url(#${gId}-body)`} opacity="0.8" />
        {/* Pavilion sub-facets */}
        <polygon points="45,72 70,72 100,155" fill="#c7d2fe" opacity="0.4" />
        <polygon points="155,72 130,72 100,155" fill="#bae6fd" opacity="0.5" />
        <polygon points="70,72 100,72 100,155" fill="#e0f2fe" opacity="0.3" />
        <polygon points="130,72 100,72 100,155" fill="#ddd6fe" opacity="0.35" />
        {/* Culet (bottom point glow) */}
        <polygon points="85,130 115,130 100,190" fill={`url(#${gId}-fire)`} opacity="0.25" />
      </g>

      {/* Rainbow refraction overlay */}
      <polygon points="100,10 160,65 155,72 100,190 45,72 40,65" fill={`url(#${gId}-rainbow)`} />

      {/* Internal brilliance — center flash */}
      <ellipse cx="100" cy="50" rx="30" ry="20" fill={`url(#${gId}-center-flash)`} />

      {/* Crown highlight reflections */}
      <polygon points="78,42 95,42 88,58 72,58" fill="white" opacity="0.5" />
      <polygon points="105,38 122,38 130,55 112,55" fill="white" opacity="0.35" />
      <polygon points="88,25 100,15 112,25 100,32" fill="white" opacity="0.7" />

      {/* Edge sparkle lines */}
      <line x1="100" y1="10" x2="100" y2="3" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="160" y1="65" x2="167" y2="62" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="40" y1="65" x2="33" y2="62" stroke="white" strokeWidth="1" opacity="0.6" />

      {/* Star sparkles around diamond */}
      {[
        { x: 170, y: 30, s: 8, delay: 0 },
        { x: 25, y: 45, s: 6, delay: 0.5 },
        { x: 165, y: 95, s: 5, delay: 1.0 },
        { x: 30, y: 100, s: 7, delay: 1.5 },
        { x: 100, y: 5, s: 6, delay: 0.8 },
        { x: 180, y: 60, s: 4, delay: 0.3 },
        { x: 15, y: 70, s: 4, delay: 1.2 },
      ].map((spark, i) => (
        <g key={i} opacity="0.9" filter={`url(#${gId}-sparkle-blur)`}>
          <line
            x1={spark.x - spark.s} y1={spark.y}
            x2={spark.x + spark.s} y2={spark.y}
            stroke="white" strokeWidth="1.5"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
          </line>
          <line
            x1={spark.x} y1={spark.y - spark.s}
            x2={spark.x} y2={spark.y + spark.s}
            stroke="white" strokeWidth="1.5"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
          </line>
          <line
            x1={spark.x - spark.s * 0.6} y1={spark.y - spark.s * 0.6}
            x2={spark.x + spark.s * 0.6} y2={spark.y + spark.s * 0.6}
            stroke="white" strokeWidth="1"
          >
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
          </line>
          <line
            x1={spark.x + spark.s * 0.6} y1={spark.y - spark.s * 0.6}
            x2={spark.x - spark.s * 0.6} y2={spark.y + spark.s * 0.6}
            stroke="white" strokeWidth="1"
          >
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin={`${spark.delay}s`} repeatCount="indefinite" />
          </line>
        </g>
      ))}

      {/* Animated rotating light refraction */}
      <polygon points="100,10 160,65 155,72 100,190 45,72 40,65" fill="white" opacity="0.08">
        <animate attributeName="opacity" values="0.03;0.12;0.03" dur="3s" repeatCount="indefinite" />
      </polygon>
    </svg>
  );
}
