/* Written by hand: a sibling of review.jsx that reuses its generated iso kit verbatim.
 * There is no source scene in cloudthinker-landing-page; edit this file directly. */

export const LearningsScene = ({ className }) => {
  const Stage = React.useMemo(() => {
    const {
      createContext,
      useContext,
      useEffect,
      useLayoutEffect,
      useRef,
      useState,
    } = React;



    /*
     * Shared kit for the isometric motion scenes (homepage workflow, OnCall war
     * room). Ported from the claude.ai/design "Agentic OE Hero Animation" engine:
     * every scene is one SVG drawn as a pure function of authored time T, on a
     * 1920x1080 stage. Colours follow the design's light and dark palettes.
     */
    const C30 = 0.8660254;
    const S30 = 0.5;
    const OX = 900;
    const OY = 330;
    const TAU = Math.PI * 2;
    const P = (x, y, z = 0) => [
        OX + (x - y) * C30,
        OY + (x + y) * S30 - z,
    ];
    const pts = (a) => a
        .map((p) => P(p[0], p[1], p[2] ?? 0)
        .map((v) => v.toFixed(1))
        .join(','))
        .join(' ');
    const topMatrix = (cx, cy, z) => {
        const [sx, sy] = P(cx, cy, z);
        return `matrix(${C30},${S30},${-C30},${S30},${sx.toFixed(1)},${sy.toFixed(1)})`;
    };
    const PALS = {
        light: {
            bg: '#ffffff',
            ink: '#1e2a5a',
            mut: '#4f5b8a',
            line: '#3f5efb',
            top: '#f3f7ff',
            left: '#dde7ff',
            right: '#c2d3ff',
            ptop: '#eef3ff',
            pleft: '#d6e2ff',
            pright: '#b9cdff',
            grid: '#cddafc',
            accent: '#14a3e6',
            alert: '#ff5b4f',
            ok: '#16b47a',
            guide: '#93abf5',
            hub: '#d3e2ff',
            alertTop: '#ffe1dd',
            okTop: '#dcf5ea',
            hubHot: '#b8d1ff',
        },
        dark: {
            bg: '#000000',
            ink: '#f5f5f7',
            mut: '#a1a1a6',
            line: '#2997ff',
            top: '#0f1b2e',
            left: '#0a1526',
            right: '#07101d',
            ptop: '#0b1626',
            pleft: '#08111f',
            pright: '#060d18',
            grid: '#1b2f4d',
            accent: '#5ac8fa',
            alert: '#ff5b4f',
            ok: '#30d158',
            guide: '#2c4a73',
            hub: '#123056',
            alertTop: '#3a110e',
            okTop: '#0b2a1c',
            hubHot: '#1d4a80',
        },
    };
    const PalContext = createContext(PALS.dark);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const easeOutCubic = (t) => (t - 1) ** 3 + 1;
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    const easeOutBack = (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
    };
    const prog = (T, a, b) => clamp((T - a) / (b - a), 0, 1);
    const enter = (T, a, b) => easeOutCubic(prog(T, a, b));
    const travel = (T, a, b) => easeInOutCubic(prog(T, a, b));
    const pop = (T, a, b) => easeOutBack(prog(T, a, b));
    const fade = (T, a, b, c, d) => enter(T, a, b) * (1 - enter(T, c, d));
    const mix = (c1, c2, k) => {
        const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
        const a = h(c1);
        const b = h(c2);
        return ('#' +
            a
                .map((v, i) => Math.round(v + (b[i] - v) * k)
                .toString(16)
                .padStart(2, '0'))
                .join(''));
    };
    function Box({ x, y, z = 0, w, d, h, pal, top, stroke, sw = 1.6, op = 1, children, }) {
        const t = z + h;
        const s = stroke ?? pal.line;
        return (<g opacity={op}>
          <polygon points={pts([
                [x, y + d, z],
                [x + w, y + d, z],
                [x + w, y + d, t],
                [x, y + d, t],
            ])} fill={pal.left} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>
          <polygon points={pts([
                [x + w, y, z],
                [x + w, y + d, z],
                [x + w, y + d, t],
                [x + w, y, t],
            ])} fill={pal.right} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>
          <polygon points={pts([
                [x, y, t],
                [x + w, y, t],
                [x + w, y + d, t],
                [x, y + d, t],
            ])} fill={top ?? pal.top} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>
          {children ? (<g transform={topMatrix(x + w / 2, y + d / 2, t)}>{children}</g>) : null}
        </g>);
    }
    function Hex({ cx, cy, z, r, h, top, stroke, children, }) {
        const PAL = useContext(PalContext);
        const v = [...Array(6)].map((_, i) => {
            const a = (Math.PI / 3) * i + Math.PI / 6;
            return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        });
        const sides = [];
        for (let i = 0; i < 6; i++) {
            const am = (Math.PI / 3) * i + Math.PI / 3;
            if (Math.cos(am) + Math.sin(am) > 0.01) {
                sides.push({
                    a: v[i],
                    b: v[(i + 1) % 6],
                    k: Math.cos(am) - Math.sin(am),
                });
            }
        }
        return (<g>
          {sides.map((s, i) => (<polygon key={i} points={pts([
                    [s.a[0], s.a[1], z],
                    [s.b[0], s.b[1], z],
                    [s.b[0], s.b[1], z + h],
                    [s.a[0], s.a[1], z + h],
                ])} fill={s.k > 0 ? PAL.right : PAL.left} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round"/>))}
          <polygon points={pts(v.map((p) => [p[0], p[1], z + h]))} fill={top} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round"/>
          <g transform={topMatrix(cx, cy, z + h)}>{children}</g>
        </g>);
    }
    // Icons drawn in top-face coordinates, about +-26 units.
    const ICON = {
        cloud: (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
          <path d="M-24 10 H22 A12 12 0 0 0 18 -12 A16 16 0 0 0 -12 -14 A12 12 0 0 0 -24 10 Z"/>
        </g>),
        code: (c) => (<g fill="none" stroke={c} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-12 -14 L-26 0 L-12 14 M12 -14 L26 0 L12 14 M5 -18 L-5 18"/>
        </g>),
        chart: (c) => (<g fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-26 16 L-10 -2 L2 8 L26 -18"/>
          <path d="M-26 22 H26" opacity="0.5"/>
        </g>),
        apps: (c) => (<g fill={c}>
          {[
                [-22, -22],
                [4, -22],
                [-22, 4],
                [4, 4],
            ].map(([u, v], i) => (<rect key={i} x={u} y={v} width="18" height="18" rx="4"/>))}
        </g>),
        people: (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
          <circle cx="-10" cy="-8" r="7"/>
          <path d="M-24 16 A14 14 0 0 1 4 16"/>
          <circle cx="14" cy="-6" r="6"/>
          <path d="M6 16 A11 11 0 0 1 26 14"/>
        </g>),
        network: (c) => (<g stroke={c} strokeWidth="3" fill={c}>
          <path d="M0 0 L0 -24 M0 0 L22 -8 M0 0 L14 20 M0 0 L-14 20 M0 0 L-22 -8"/>
          <circle r="7"/>
          <circle cy="-24" r="4.5"/>
          <circle cx="22" cy="-8" r="4.5"/>
          <circle cx="14" cy="20" r="4.5"/>
          <circle cx="-14" cy="20" r="4.5"/>
          <circle cx="-22" cy="-8" r="4.5"/>
        </g>),
        review: (c) => (<g fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round">
          <circle cx="-4" cy="-4" r="11"/>
          <path d="M5 5 L15 15"/>
        </g>),
        cyber: (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinejoin="round">
          <path d="M0 -17 L14 -11 V1 C14 10 7 15 0 18 C-7 15 -14 10 -14 1 V-11 Z"/>
        </g>),
        resolve: (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
          <circle r="13"/>
          <circle r="4" fill={c}/>
          <path d="M0 -20 V-14 M0 14 V20 M-20 0 H-14 M14 0 H20"/>
        </g>),
        optimize: (c) => (<g fill={c}>
          <rect x="-15" y="-14" width="8" height="28" rx="2"/>
          <rect x="-3" y="-4" width="8" height="18" rx="2"/>
          <rect x="9" y="5" width="8" height="9" rx="2"/>
        </g>),
        customize: (c) => (<g stroke={c} strokeWidth="3" strokeLinecap="round" fill={c}>
          <path d="M-15 -8 H15 M-15 8 H15"/>
          <circle cx="-5" cy="-8" r="4.5"/>
          <circle cx="7" cy="8" r="4.5"/>
        </g>),
        lock: (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinejoin="round">
          <rect x="-14" y="-4" width="28" height="22" rx="4"/>
          <path d="M-8 -4 V-11 A8 8 0 0 1 8 -11 V-4" strokeLinecap="round"/>
        </g>),
        api: (c) => (<g fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-10 -18 C-18 -18 -16 -6 -22 0 C-16 6 -18 18 -10 18"/>
          <path d="M10 -18 C18 -18 16 -6 22 0 C16 6 18 18 10 18"/>
        </g>),
        check: (c) => (<g fill="none" stroke={c} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-12 0 L-3 9 L14 -10"/>
        </g>),
    };
    const Z = 18;
    const along = (route, f, rev) => {
        const r = rev ? [...route].reverse() : route;
        const L = [];
        let tot = 0;
        for (let i = 0; i < r.length - 1; i++) {
            const l = Math.hypot(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]);
            L.push(l);
            tot += l;
        }
        let d = f * tot;
        for (let i = 0; i < L.length; i++) {
            if (d <= L[i] || i === L.length - 1) {
                const k = L[i] ? Math.min(1, d / L[i]) : 0;
                return [
                    r[i][0] + (r[i + 1][0] - r[i][0]) * k,
                    r[i][1] + (r[i + 1][1] - r[i][1]) * k,
                ];
            }
            d -= L[i];
        }
        return r[r.length - 1];
    };
    function Packet({ T, route, a, b, rev, color, }) {
        const PAL = useContext(PalContext);
        if (T < a || T > b + 0.05)
            return null;
        const [x, y] = along(route, travel(T, a, b), rev);
        const s = 9;
        const op = prog(T, a, a + 0.12) * (1 - prog(T, b - 0.02, b + 0.05));
        return (<Box x={x - s} y={y - s} z={Z} w={s * 2} d={s * 2} h={12} op={op} pal={{
                line: PAL.line,
                top: color,
                left: mix(color, '#000000', 0.15),
                right: mix(color, '#000000', 0.3),
            }} top={color} stroke={mix(color, '#000000', 0.35)} sw={1}/>);
    }
    function Wire({ route, hot = 0, color, }) {
        const PAL = useContext(PalContext);
        const p = pts(route.map((r) => [r[0], r[1], Z]));
        return (<g>
          <polyline points={p} fill="none" stroke={PAL.line} strokeWidth="1.6" strokeLinejoin="round" opacity="0.55"/>
          {hot > 0 ? (<polyline points={p} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" opacity={hot}/>) : null}
        </g>);
    }
    function Label({ x, y, text, sub, anchor = 'start', }) {
        const PAL = useContext(PalContext);
        return (<g>
          <text x={x} y={y} fill={PAL.ink} fontSize="22" fontWeight="600" letterSpacing="1.6" textAnchor={anchor}>
            {text}
          </text>
          {sub ? (<text x={x} y={y + 32} fill={PAL.mut} fontSize="20" textAnchor={anchor}>
              {sub}
            </text>) : null}
        </g>);
    }
    /**
     * A dot-led pill sized to its text, so the padding stays even whatever font
     * the page loads.
     */
    function TextPill({ text, tone }) {
        const pal = useContext(PalContext);
        const color = tone ?? pal.accent;
        const ref = useRef(null);
        const [textW, setTextW] = useState(210);
        useLayoutEffect(() => {
            const measure = () => {
                if (ref.current)
                    setTextW(ref.current.getComputedTextLength());
            };
            measure();
            void document.fonts?.ready.then(measure);
        }, [text]);
        return (<>
          <rect x="0" y="-26" width={46 + textW + 26} height="52" rx="26" fill={pal.bg} stroke={color} strokeWidth="2"/>
          <circle cx="28" cy="0" r="7" fill={color}/>
          <text ref={ref} x="46" y="8" fontSize="22" fontWeight="600" fill={pal.ink}>
            {text}
          </text>
        </>);
    }
    /**
     * The step pills along the bottom of a stage. The current step lights up and
     * everything dims back before the loop restarts at `fadeAt`.
     */
    function StepPills({ steps, T, fadeAt, y = 980, }) {
        const pal = useContext(PalContext);
        const step = steps.reduce((acc, s, i) => (T >= s[1] ? i : acc), 0);
        const stepK = (T >= fadeAt ? 1 - enter(T, fadeAt, fadeAt + 0.45) : 1) *
            (step === 0 ? enter(T, 0, 0.35) : 1);
        const layout = steps.reduce((acc, [s]) => {
            const prev = acc[acc.length - 1];
            const x = prev ? prev.x + prev.w + 40 : 80;
            return [...acc, { x, w: s.length * 13.5 + 56 }];
        }, []);
        return (<g>
          {steps.map(([s], i) => {
                const on = i === step ? stepK : 0;
                const { x: left, w } = layout[i];
                return (<g key={s} transform={`translate(${left} ${y})`}>
                <rect width={w} height="52" rx="26" fill={mix(pal.bg, pal.hub, on)} stroke={mix(pal.guide, pal.line, on)} strokeWidth="1.5"/>
                <text x={w / 2} y="34" fontSize="23" fontWeight="500" textAnchor="middle" fill={mix(pal.mut, pal.ink, Math.max(on, i < step ? 0.6 : 0))}>
                  {s}
                </text>
                {i < steps.length - 1 ? (<line x1={w + 10} x2={w + 30} y1="26" y2="26" stroke={pal.guide} strokeWidth="1.5"/>) : null}
              </g>);
            })}
        </g>);
    }
    /**
     * Runs a scene on a 1920x1080 stage. It starts from the first frame when
     * mounted and loops every `loop` seconds until unmounted.
     */
    function IsoMotionStage({ loop, label, className, frame, }) {
        const [resolvedTheme, setResolvedTheme] = useState('dark');
        useEffect(() => {
          const read = () =>
            setResolvedTheme(
              document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            );
          read();
          const mo = new MutationObserver(read);
          mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
          return () => mo.disconnect();
        }, []);
        const [T, setT] = useState(0);
        useEffect(() => {
            let raf = 0;
            const t0 = performance.now();
            const tick = (now) => {
                setT(((now - t0) / 1000) % loop);
                raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            return () => cancelAnimationFrame(raf);
        }, [loop]);
        return (<PalContext.Provider value={resolvedTheme === 'light' ? PALS.light : PALS.dark}>
          <svg viewBox="0 0 1920 1080" role="img" aria-label={label} className={className} fontFamily="inherit" textRendering="geometricPrecision">
            {frame(T)}
          </svg>
        </PalContext.Provider>);
    }



    const LOOP = 15;
    const cF = 0;
    const cS = 2.2;
    const cLe = 3.8;
    const cSrc = 5.2;
    const cC = 6.4;
    const cG = 10.2;
    const cR = 11.8;
    const cL = 13.6;
    const STEPS = [
        ['Fix', cF],
        ['Spot', cS],
        ['Learn', cLe],
        ['Catch', cC],
        ['Grow', cG],
        ['Retire', cR],
    ];
    const RES = { x: -250, y: 250, s: 140, h: 10 };
    const SLAB = { s: 108, h: 15 };
    const SLABS = [cF + 0.2, cF + 0.7, cF + 1.2, cC + 3.5];
    const SHELF = { x: -420, y: -300, w: 340, d: 90, h: 12 };
    const CARD = { w: 50, d: 12, h: 62, gap: 14, y: -270 };
    const CARDS = [0, 1, 2, 3, 4].map((i) => ({
        x: SHELF.x + 17 + i * (CARD.w + CARD.gap),
    }));
    const STRONG = [0, 3];
    const WEAK = 2;
    const NEW = 3;
    const SRC = 4;
    const CONV = { x: -110, y: 60, s: 90, h: 44 };
    const REV = { x: 250, y: -250, s: 150, h: 36 };
    const MR = { x: 250, y: 250, s: 90, h: 40 };
    const A_B = [
        [RES.x, RES.y - RES.s / 2],
        [RES.x, SHELF.y + SHELF.d],
    ];
    const CONV_B = [
        [CONV.x, CONV.y - CONV.s / 2],
        [CONV.x, SHELF.y + SHELF.d],
    ];
    const B_C = [
        [SHELF.x + SHELF.w, REV.y],
        [REV.x - REV.s / 2, REV.y],
    ];
    const MR_C = [
        [MR.x, MR.y - MR.s / 2],
        [REV.x, REV.y + REV.s / 2],
    ];
    const MR_A = [
        [MR.x - MR.s / 2, MR.y],
        [RES.x + RES.s / 2, RES.y],
    ];
    const doc = (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-14 -20 H6 L16 -10 V20 H-14 Z"/>
        <path d="M-7 -4 H9 M-7 5 H9 M-7 14 H3"/>
      </g>);
    const FEED = [
        { at: SLABS[2] + 0.4, who: 'Fixed by your team', text: 'Same issue fixed 3 times', tone: 'ok' },
        { at: cLe + 0.9, who: 'Learning', text: '"Every query filters by tenant"' },
        { at: cSrc + 0.8, who: 'Source', text: 'AGENTS.md conventions' },
        { at: cC + 2.0, who: 'Caught', text: 'MR #733 flagged before merge', tone: 'alert' },
        { at: cG + 1.0, who: 'Strong', text: 'Cited 12 times this month', tone: 'ok' },
        { at: cR + 1.4, who: 'Retired', text: '1 unused rule', tone: 'note' },
    ];
    function LearningsFrame({ T }) {
        const pal = useContext(PalContext);
        const out = 1 - enter(T, cL, cL + 0.8);
        const bob = 5 * Math.sin(((TAU * T) / LOOP) * 2);
        const spotK = fade(T, cS, cS + 0.3, cLe + 0.6, cLe + 1.0);
        const spotPhase = ((T - cS) / 0.8) % 1;
        const resBack = fade(T, cC + 3.4, cC + 3.6, cC + 4.1, cC + 4.4);
        const slabs = SLABS.map((a) => enter(T, a, a + 0.35) * out);
        const shelfK = Math.max(fade(T, cLe + 0.5, cLe + 0.7, cSrc + 1.4, cSrc + 1.8), fade(T, cG, cG + 0.3, cG + 1.4, cG + 1.8));
        const convK = fade(T, cSrc - 0.2, cSrc + 0.1, cSrc + 1.2, cSrc + 1.6);
        const mrK = enter(T, cC, cC + 0.3) * out;
        const mrBad = enter(T, cC + 1.9, cC + 2.1) * (1 - enter(T, cC + 2.9, cC + 3.1));
        const mrOk = enter(T, cC + 2.9, cC + 3.1) * out;
        const citeK = fade(T, cC + 1.9, cC + 2.2, cC + 2.9, cC + 3.2);
        const revK = Math.max(fade(T, cC + 0.6, cC + 0.8, cC + 1.8, cC + 2.1), fade(T, cG, cG + 0.2, cG + 1.2, cG + 1.5));
        const strongK = enter(T, cG + 0.4, cG + 1.2) * out;
        const glow = strongK * (0.65 + 0.35 * Math.sin(TAU * T * 1.2));
        const weakK = enter(T, cR, cR + 0.5);
        const slide = travel(T, cR + 0.8, cR + 1.6);
        const card = CARDS.map((c, i) => {
            const appear = i === NEW
                ? pop(T, cLe + 0.7, cLe + 1.1) * out
                : i === SRC
                    ? pop(T, cSrc + 0.6, cSrc + 1.0) * out
                    : i === WEAK
                        ? enter(T, 0, 0.5)
                        : 1;
            const lit = i === NEW
                ? Math.max(fade(T, cLe + 0.7, cLe + 0.9, cLe + 2.0, cLe + 2.4), fade(T, cC + 0.8, cC + 1.0, cC + 2.9, cC + 3.2))
                : i === SRC
                    ? fade(T, cSrc + 0.6, cSrc + 0.8, cSrc + 1.8, cSrc + 2.2)
                    : 0;
            const strong = STRONG.includes(i) ? strongK : 0;
            const weak = i === WEAK ? weakK : 0;
            const gone = i === WEAK ? slide : 0;
            return { ...c, appear, lit, strong, weak, gone };
        });
        const pills = [
            { k: fade(T, cS + 0.3, cS + 0.5, cLe + 0.6, cLe + 0.8), text: 'Pattern: same fix 3 times', tone: pal.accent },
            { k: fade(T, cLe + 0.9, cLe + 1.1, cSrc + 0.6, cSrc + 0.8), text: 'New Learning written', tone: pal.accent },
            { k: fade(T, cSrc + 0.8, cSrc + 1.0, cC, cC + 0.2), text: 'AGENTS.md read as a source', tone: pal.accent },
            { k: fade(T, cC + 2.0, cC + 2.2, cG, cG + 0.2), text: 'MR #733 flagged before merge', tone: pal.alert },
            { k: fade(T, cG + 1.0, cG + 1.2, cR, cR + 0.2), text: 'Strong: cited 12 times', tone: pal.ok },
            { k: fade(T, cR + 1.4, cR + 1.6, cL - 0.1, cL + 0.4), text: '1 unused rule retired', tone: pal.mut },
        ];
        const toneOf = (t) => t === 'alert'
            ? pal.alert
            : t === 'ok'
                ? pal.ok
                : t === 'note'
                    ? pal.mut
                    : pal.accent;
        const mrTop = mix(mix(mix(pal.top, pal.hub, mrK * 0.7), pal.alertTop, mrBad), pal.okTop, mrOk);
        const mrStroke = mix(mix(mix(pal.line, pal.accent, mrK), pal.alert, mrBad), pal.ok, mrOk);
        const mrIcon = mrOk > 0.5 ? pal.ok : mrBad > 0.5 ? pal.alert : mrK > 0.5 ? pal.accent : pal.line;
        const label = (x, y, z, dx, dy) => {
            const [sx, sy] = P(x, y, z);
            return [sx + dx, sy + dy];
        };
        const [resLx, resLy] = label(RES.x + RES.s / 2, RES.y + RES.s / 2, 0, 0, 50);
        const [shLx, shLy] = label(SHELF.x, SHELF.y + SHELF.d, 0, -40, -30);
        const [cvLx, cvLy] = label(CONV.x + CONV.s / 2, CONV.y - CONV.s / 2, CONV.h, 30, 0);
        const [rvLx, rvLy] = label(REV.x + REV.s / 2, REV.y + REV.s / 2, 0, 0, 50);
        const [mrLx, mrLy] = label(MR.x + MR.s / 2, MR.y - MR.s / 2, 0, 30, -20);
        return (<g>
          <g transform="translate(80 150)">
            <Label x={0} y={0} text="REPOSITORY" sub="acme/api, last 30 days"/>
            {FEED.map((f, i) => {
                const k = enter(T, f.at, f.at + 0.35) * (1 - enter(T, cL, cL + 0.6));
                if (k <= 0)
                    return null;
                return (<g key={f.who} opacity={k} transform={`translate(${-12 * (1 - k)} ${80 + i * 74})`}>
                  <circle cx="7" cy="-7" r="6" fill={toneOf(f.tone)}/>
                  <text x="26" y="0" fontSize="20" fontWeight="600" fill={pal.ink}>
                    {f.who}
                  </text>
                  <text x="26" y="30" fontSize="20" fill={pal.mut}>
                    {f.text}
                  </text>
                </g>);
            })}
          </g>

          <g transform="translate(1170 545) scale(1.18) translate(-870 -247)">
            <Wire route={CONV_B} hot={convK} color={pal.accent}/>
            <Wire route={A_B} hot={fade(T, cLe, cLe + 0.15, cLe + 0.8, cLe + 1.0)} color={pal.accent}/>
            <Wire route={B_C} hot={Math.max(fade(T, cC + 0.8, cC + 0.95, cC + 1.5, cC + 1.7), fade(T, cG, cG + 0.15, cG + 1.3, cG + 1.5))} color={mix(pal.accent, pal.ok, strongK)}/>
            <Wire route={MR_C} hot={Math.max(fade(T, cC + 0.1, cC + 0.25, cC + 0.8, cC + 1.0), fade(T, cC + 1.4, cC + 1.55, cC + 2.0, cC + 2.2))} color={mix(pal.accent, pal.alert, enter(T, cC + 1.3, cC + 1.4))}/>
            <Wire route={MR_A} hot={fade(T, cC + 3.0, cC + 3.15, cC + 3.5, cC + 3.7)} color={pal.ok}/>

            <Box x={SHELF.x} y={SHELF.y} w={SHELF.w} d={SHELF.d} h={SHELF.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, shelfK * 0.6)} stroke={mix(pal.line, pal.accent, shelfK)}/>
            {card.map((c, i) => {
                const op = c.appear * (1 - 0.55 * c.weak) * (1 - c.gone);
                if (op <= 0.01)
                    return null;
                const h = Math.max(2, CARD.h * c.appear + 26 * c.strong);
                const y = CARD.y - 90 * c.gone;
                const z = SHELF.h;
                const tint = Math.max(c.lit, c.strong);
                const tone = c.strong > c.lit ? pal.ok : pal.accent;
                const top = mix(mix(pal.top, c.strong > c.lit ? pal.okTop : pal.hub, tint), pal.ptop, c.weak);
                const face = mix(mix(pal.left, c.strong > c.lit ? pal.okTop : pal.hubHot, tint * 0.8), pal.pleft, c.weak);
                const stroke = mix(mix(pal.line, tone, tint), pal.guide, c.weak);
                const ink = mix(mix(pal.line, tone, tint), pal.guide, c.weak);
                const fy = y + CARD.d;
                return (<g key={i} opacity={op}>
                  <Box x={c.x} y={y} z={z} w={CARD.w} d={CARD.d} h={h} pal={{ ...pal, left: face }} top={top} stroke={stroke} sw={1.6 + 1.2 * Math.max(c.lit, STRONG.includes(i) ? glow : 0)}/>
                  {h > 44 ? [14, 26, 38].map((dz, j) => (<polyline key={j} points={pts([
                            [c.x + 8, fy, z + h - dz],
                            [c.x + CARD.w - (j === 2 ? 18 : 8), fy, z + h - dz],
                        ])} stroke={ink} strokeWidth="2.4" strokeLinecap="round" fill="none"/>)) : null}
                </g>);
            })}

            <Box x={CONV.x - CONV.s / 2} y={CONV.y - CONV.s / 2} w={CONV.s} d={CONV.s} h={CONV.h} pal={pal} top={mix(pal.top, pal.hub, convK)} stroke={mix(pal.line, pal.accent, convK)}>
              {doc(convK > 0.3 ? pal.accent : pal.line)}
            </Box>

            <Box x={RES.x - RES.s / 2} y={RES.y - RES.s / 2} w={RES.s} d={RES.s} h={RES.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, Math.max(spotK, resBack) * 0.6)} stroke={mix(mix(pal.line, pal.accent, spotK), pal.ok, resBack)}/>
            {SLABS.map((a, i) => {
                const k = slabs[i];
                if (k <= 0.01)
                    return null;
                const z = RES.h + i * SLAB.h + 50 * (1 - k);
                const isTop = i === SLABS.length - 1 || slabs[i + 1] < 0.5;
                return (<Box key={i} x={RES.x - SLAB.s / 2} y={RES.y - SLAB.s / 2} z={z} w={SLAB.s} d={SLAB.s} h={SLAB.h} op={k} pal={pal} top={mix(pal.okTop, pal.hub, spotK)} stroke={mix(pal.ok, pal.accent, spotK)}>
                    {isTop ? (<g>
                        {spotK > 0.05 && spotPhase >= 0 ? (<circle r={14 + 34 * spotPhase} fill="none" stroke={pal.accent} strokeWidth="2.4" opacity={spotK * (1 - spotPhase)}/>) : null}
                        <g transform="scale(1.5)">{ICON.check(spotK > 0.5 ? pal.accent : pal.ok)}</g>
                      </g>) : null}
                  </Box>);
            })}

            <Box x={REV.x - REV.s / 2} y={REV.y - REV.s / 2} w={REV.s} d={REV.s} h={REV.h} pal={pal} top={mix(pal.hub, pal.hubHot, revK)} sw={2}/>
            <polyline points={pts([
                [REV.x, REV.y, REV.h],
                [REV.x, REV.y, 100 + bob],
            ])} stroke={pal.guide} strokeWidth="1.2" strokeDasharray="2 5" fill="none"/>
            <Hex cx={REV.x} cy={REV.y} z={100 + bob} r={46} h={24} top={mix(pal.top, pal.hub, revK)} stroke={mix(pal.line, pal.accent, revK)}>
              <g transform="scale(1.3)">{ICON.review(revK > 0.3 ? pal.accent : pal.line)}</g>
            </Hex>

            <Box x={MR.x - MR.s / 2} y={MR.y - MR.s / 2} w={MR.s} d={MR.s} h={MR.h} pal={pal} top={mrTop} stroke={mrStroke} sw={1.6 + 0.8 * Math.max(mrK, mrBad)}>
              {ICON.code(mrIcon)}
            </Box>

            {citeK > 0.02 ? (() => {
                const cz = MR.h + 26 + 18 * (1 - enter(T, cC + 1.9, cC + 2.3)) + bob * 0.6;
                const cx = MR.x - 36;
                const cy = MR.y - 36;
                const fy = cy + 8;
                return (<g opacity={citeK}>
                  <Box x={cx} y={cy} z={cz} w={40} d={8} h={50} pal={{ ...pal, left: pal.hubHot }} top={pal.hub} stroke={pal.accent} sw={2.2}/>
                  {[12, 22, 32].map((dz, j) => (<polyline key={j} points={pts([
                            [cx + 7, fy, cz + 50 - dz],
                            [cx + 40 - (j === 2 ? 15 : 7), fy, cz + 50 - dz],
                        ])} stroke={pal.accent} strokeWidth="2.4" strokeLinecap="round" fill="none"/>))}
                </g>);
            })() : null}

            <Packet T={T} route={A_B} a={cLe} b={cLe + 0.7} color={pal.accent}/>
            <Packet T={T} route={CONV_B} a={cSrc} b={cSrc + 0.6} color={pal.accent}/>
            <Packet T={T} route={MR_C} a={cC + 0.2} b={cC + 0.8} color={pal.accent}/>
            <Packet T={T} route={B_C} a={cC + 0.9} b={cC + 1.5} color={pal.accent}/>
            <Packet T={T} route={MR_C} a={cC + 1.4} b={cC + 2.0} rev color={pal.alert}/>
            <Packet T={T} route={MR_A} a={cC + 3.0} b={cC + 3.5} color={pal.ok}/>
            {[0, 0.4, 0.8].map((d) => (<Packet key={d} T={T} route={B_C} a={cG + d} b={cG + d + 0.5} rev color={pal.ok}/>))}

            <Label x={resLx} y={resLy} text="RESOLVED FINDINGS" sub="What your team fixed" anchor="middle"/>
            <Label x={shLx} y={shLy} text="LEARNINGS" sub="Rules distilled from real fixes" anchor="end"/>
            <Label x={cvLx} y={cvLy} text="YOUR CONVENTIONS" sub="AGENTS.md and more"/>
            <Label x={rvLx} y={rvLy} text="NEXT REVIEW" sub="Catches it the first time" anchor="middle"/>
            <Label x={mrLx} y={mrLy} text="NEW MR" sub="#733"/>
            <text x={mrLx} y={mrLy + 62} fontSize="20" fontWeight="600" fill={pal.alert} opacity={citeK}>
              Cites: every query filters by tenant
            </text>
          </g>

          {pills.map((p) => p.k > 0 ? (<g key={p.text} opacity={p.k} transform={`translate(1400 ${80 - 8 * (1 - p.k)})`}>
                <TextPill text={p.text} tone={p.tone}/>
              </g>) : null)}

          <StepPills steps={STEPS} T={T} fadeAt={cL + 0.3}/>
        </g>);
    }
    function LearningsStage({ className }) {
        return (<IsoMotionStage loop={LOOP} label="Your team resolves the same kind of finding three times across merge requests. CloudThinker spots the pattern and writes a Learning, a short rule, and reads your convention files such as AGENTS.md as Learning sources. When the next merge request repeats the mistake, Review flags it before merge and cites the Learning. Learnings that reviews keep citing grow strong, and ones nobody cites fade and retire, so the rules stay current." className={className} frame={(T) => <LearningsFrame T={T}/>}/>);
    }

    return LearningsStage;
  }, []);
  return (
    <div className={className ?? 'ct-iso-scene'}>
      <Stage className="ct-iso-svg" />
    </div>
  );
};
