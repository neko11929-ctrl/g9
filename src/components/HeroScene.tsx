// Original artwork: a hooded wanderer seen from behind, a vast moon, drifting cloud, fog, water.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export default function HeroScene() {
  const r = rng(42);
  const stars = Array.from({ length: 70 }, () => ({ x: r() * 1600, y: r() * 420, r: 0.5 + r() * 1.3, o: 0.3 + r() * 0.6 }));
  const motes = Array.from({ length: 26 }, () => ({ x: r() * 1600, y: 520 + r() * 340, d: 8 + r() * 8, delay: -r() * 12, r: 1 + r() * 2 }));
  return (
    <svg
      className="scene absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05030a" />
          <stop offset=".55" stopColor="#170b34" />
          <stop offset="1" stopColor="#3a1d70" />
        </linearGradient>
        <radialGradient id="halo" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#b69bff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#6d35d6" stopOpacity=".22" />
          <stop offset="1" stopColor="#6d35d6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon" cx=".38" cy=".35" r=".8">
          <stop offset="0" stopColor="#fbf8ff" />
          <stop offset=".6" stopColor="#d9cdf5" />
          <stop offset="1" stopColor="#a995d8" />
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1556" />
          <stop offset="1" stopColor="#07040f" />
        </linearGradient>
        <linearGradient id="fogg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6bd8" stopOpacity="0" />
          <stop offset=".5" stopColor="#b7a6e6" stopOpacity=".22" />
          <stop offset="1" stopColor="#8a6bd8" stopOpacity="0" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id="soft2"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e9e2ff" opacity={s.o} />)}

      <circle className="moon-glow" cx="1090" cy="290" r="440" fill="url(#halo)" />
      <circle cx="1090" cy="290" r="165" fill="url(#moon)" />
      <g fill="#8e78c4" opacity=".28">
        <circle cx="1040" cy="250" r="28" /><circle cx="1140" cy="330" r="20" /><circle cx="1085" cy="215" r="12" /><circle cx="1120" cy="265" r="9" />
      </g>

      <g filter="url(#soft)" className="cloud-a" fill="#2a1760" opacity=".75">
        <ellipse cx="760" cy="250" rx="330" ry="34" /><ellipse cx="1000" cy="220" rx="260" ry="26" />
      </g>
      <g filter="url(#soft)" className="cloud-b" fill="#1b0e3d" opacity=".85">
        <ellipse cx="1280" cy="330" rx="360" ry="40" /><ellipse cx="420" cy="320" rx="300" ry="30" />
      </g>

      <path d="M0 600 L110 520 L230 570 L380 470 L520 560 L660 500 L820 585 L980 505 L1130 570 L1290 490 L1450 560 L1600 510 L1600 640 L0 640Z" fill="#1c0f3e" opacity=".85" />
      <path d="M0 640 L140 590 L300 625 L470 580 L640 630 L820 600 L1020 635 L1220 595 L1420 630 L1600 600 L1600 660 L0 660Z" fill="#0e0820" />

      <rect y="640" width="1600" height="260" fill="url(#water)" />
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <rect key={i} className="glint" x={1090 - (150 - i * 8) / 2} y={668 + i * 22} width={150 - i * 8} height="4" rx="2" fill="#d9cdf5" style={{ animationDelay: `${-i * 0.55}s` }} />
        ))}
      </g>

      <g className="fog"><rect x="-200" y="610" width="2000" height="70" fill="url(#fogg)" filter="url(#soft)" /></g>

      {/* rock and wanderer */}
      <path d="M300 760 C320 690 360 662 430 650 L560 650 C620 662 650 700 690 760Z" fill="#05030a" />
      <g transform="translate(490 655)">
        <path d="M-44 -178 C-62 -120 -74 -50 -84 0 L84 0 C74 -50 62 -120 44 -178 Q0 -198 -44 -178Z" fill="#0a0614" />
        <path d="M44 -178 C62 -120 74 -50 84 0" fill="none" stroke="#b7a6e6" strokeOpacity=".55" strokeWidth="2" />
        <circle cx="0" cy="-208" r="30" fill="#0d081a" />
        <path d="M30 -208 C34 -230 14 -243 -4 -241" fill="none" stroke="#b7a6e6" strokeOpacity=".6" strokeWidth="2" />
        <path className="hair" d="M-24 -226 C-6 -246 24 -240 30 -214 C40 -196 56 -190 82 -196 C60 -178 46 -170 36 -150 C32 -165 24 -172 12 -176 C0 -170 -16 -176 -26 -196Z" fill="#0d081a" />
        <path className="scarf" d="M-30 -168 C-4 -158 26 -162 54 -150 C86 -138 112 -148 140 -130 C112 -124 86 -114 58 -122 C28 -132 -2 -134 -30 -146Z" fill="#3a1d70" />
      </g>

      <g>
        {motes.map((m, i) => (
          <circle key={i} className="mote" cx={m.x} cy={m.y} r={m.r} fill="#cdbbff" filter="url(#soft2)" style={{ animationDuration: `${m.d}s`, animationDelay: `${m.delay}s` }} />
        ))}
      </g>
      <rect y="760" width="1600" height="140" fill="url(#fogg)" opacity=".6" className="fog" />
      <rect width="1600" height="900" fill="#06040c" opacity=".12" />
    </svg>
  );
}
