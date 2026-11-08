/* Written by hand: a sibling of review.jsx that reuses its generated iso kit verbatim.
 * There is no source scene in cloudthinker-landing-page; edit this file directly. */

export const AtlasScene = ({ className }) => {
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




    /*
     * Codebase Atlas as a city. Areas are districts on one base plate,
     * components are buildings (taller means bigger), dependency links are thin
     * streets, and business flows are glowing transit lines across the rooftops
     * of the buildings they use. Merged changes land on buildings, which grow
     * and heat up, and the lines through them pulse. One change touches a
     * building a flow's rule depends on, so a red light shows on that line until
     * a fix turns it green. A 16s loop on an example repository.
     */
    const LOOP = 17;
    const cM = 0;
    const cMap = 1.4;
    const cLand = 3.0;
    const cFlow = 5.6;
    const cWeek = 8.6;
    const cPpl = 10.2;
    const cAsk = 12.4;
    const cL = 15.6;
    const STEPS = [
        ['Merge', cM],
        ['Map', cMap],
        ['Land', cLand],
        ['Flow', cFlow],
        ['Week', cWeek],
        ['People', cPpl],
        ['Ask', cAsk],
    ];
    const HEAT = '#ff9f0a';
    const FLOW_COLORS = {
        light: { upgrade: '#2563eb', refund: '#8b5cf6' },
        dark: { upgrade: '#4da3ff', refund: '#bf5af2' },
    };
    const SRC = { x: -560, y: -110, s: 100, h: 56 };
    const SRC_C = [SRC.x + SRC.s / 2, SRC.y + SRC.s / 2];
    const PLAT = { x: -370, y: -230, w: 460, d: 460, h: 14 };
    const GROUND = PLAT.h + 6;
    const DS = 210;
    const WEEK = { x: 180, s: 150, h: 20 };
    const ASK = { x: 520, s: 100, h: 36 };
    const AC = ASK.x + ASK.s / 2;
    const DISTRICTS = [
        { key: 'accounts', label: 'Accounts', ox: -360, oy: -220 },
        { key: 'billing', label: 'Billing', ox: -130, oy: -220 },
        { key: 'checkout', label: 'Checkout', ox: -360, oy: 10 },
        { key: 'catalog', label: 'Catalog', ox: -130, oy: 10 },
    ];
    const DISTRICT = Object.fromEntries(DISTRICTS.map((d) => [d.key, d]));
    const BUILDINGS = [
        { key: 'a1', d: 'accounts', u: 20, v: 20, s: 70, h: 90 },
        { key: 'a2', d: 'accounts', u: 115, v: 30, s: 60, h: 50 },
        { key: 'a3', d: 'accounts', u: 30, v: 115, s: 56, h: 60 },
        { key: 'b1', d: 'billing', u: 25, v: 25, s: 64, h: 70 },
        { key: 'b2', d: 'billing', u: 115, v: 30, s: 58, h: 110 },
        { key: 'b3', d: 'billing', u: 35, v: 115, s: 60, h: 40 },
        { key: 'c1', d: 'checkout', u: 20, v: 20, s: 56, h: 45 },
        { key: 'c2', d: 'checkout', u: 100, v: 25, s: 76, h: 120 },
        { key: 'c3', d: 'checkout', u: 30, v: 118, s: 56, h: 45 },
        { key: 'd1', d: 'catalog', u: 25, v: 25, s: 60, h: 50 },
        { key: 'd2', d: 'catalog', u: 112, v: 30, s: 64, h: 75 },
        { key: 'd3', d: 'catalog', u: 35, v: 118, s: 56, h: 35 },
    ].map((b, i) => {
        const d = DISTRICT[b.d];
        const x = d.ox + b.u;
        const y = d.oy + b.v;
        return { ...b, i, x, y, cx: x + b.s / 2, cy: y + b.s / 2 };
    });
    const BLD = Object.fromEntries(BUILDINGS.map((b) => [b.key, b]));
    const STREETS = [
        ['a1', 'a2'], ['a1', 'a3'], ['a2', 'b1'], ['b1', 'b2'], ['b1', 'b3'],
        ['a3', 'c1'], ['c1', 'c2'], ['c1', 'c3'], ['c2', 'd1'], ['d1', 'd2'],
        ['d1', 'd3'], ['b3', 'd1'], ['b2', 'd2'],
    ];
    const FLOWS = [
        { key: 'upgrade', label: 'Upgrade a trial', stops: ['a3', 'a1', 'a2', 'b1', 'b2'] },
        { key: 'refund', label: 'Refund an order', stops: ['c3', 'c1', 'c2', 'd1', 'b3'] },
    ];
    const RULE = 'b1';
    const DROPS = ['c3', 'b2', 'c1', 'd2', 'c2', 'a1', 'b3', 'c3', 'b3', 'd1', 'c3']
        .map((key, i) => ({ key, a: cLand + i * 0.2, b: cLand + i * 0.2 + 0.55, tone: 'heat' }))
        .concat([
        { key: RULE, a: cFlow + 0.1, b: cFlow + 0.65, tone: 'heat' },
        { key: RULE, a: cFlow + 1.7, b: cFlow + 2.25, tone: 'fix' },
    ]);
    const MAX_HITS = 3;
    const ruleBad = cFlow + 0.7;
    const ruleFixed = cFlow + 2.3;
    const UPKEEP = { light: '#7c8db5', dark: '#a3b1d6' };
    const BARS = [
        { key: 'new', label: 'New', pct: '60%', x: WEEK.x + 12, h: 120, at: cWeek + 0.3 },
        { key: 'fixed', label: 'Fixed', pct: '25%', x: WEEK.x + 60, h: 50, at: cWeek + 0.5 },
        { key: 'upkeep', label: 'Upkeep', pct: '15%', x: WEEK.x + 108, h: 30, at: cWeek + 0.7 },
    ];
    const BAR_W = 36;
    const FEED = [
        { at: cM + 0.5, who: 'Merged', text: '42 changes this week' },
        { at: cLand + 1.4, who: 'Focus', text: 'Checkout and Billing took most work', tone: 'heat' },
        { at: cFlow + 0.3, who: 'Business flow', text: 'Upgrade a trial touched by 3 changes', tone: 'flow' },
        { at: ruleBad + 0.1, who: 'Needs a look', text: '1 rule in Billing', tone: 'alert' },
        { at: cWeek + 0.6, who: 'Kind of work', text: '60% New, 25% Fixed, 15% Upkeep' },
        { at: cPpl + 0.6, who: 'People', text: '8 engineers across 4 areas' },
        { at: cAsk + 0.4, who: 'Ask', text: '"What moved this week?"', tone: 'ok' },
    ];
    const PEOPLE = {
        jordan: { name: 'Jordan', ini: 'JL', n: 9, light: '#db2777', dark: '#f472b6' },
        mina: { name: 'Mina', ini: 'MK', n: 6, light: '#0d9488', dark: '#2dd4bf' },
        sam: { name: 'Sam', ini: 'SR', n: 4, light: '#a16207', dark: '#facc15' },
        at: { ini: 'AT', light: '#64748b', dark: '#94a3b8' },
        pn: { ini: 'PN', light: '#64748b', dark: '#94a3b8' },
    };
    const ROSTER = ['jordan', 'mina', 'sam'];
    const STACKS = [
        { b: 'a1', who: ['mina', 'at'], more: 0 },
        { b: 'b3', who: ['jordan', 'sam'], more: 2 },
        { b: 'c3', who: ['jordan', 'mina'], more: 1 },
        { b: 'd2', who: ['jordan', 'pn'], more: 0, dx: 34, dy: 14 },
    ].map((st, i) => ({ ...st, at: cPpl + 0.1 + 0.12 * i }));
    const TRAIL = ['c3', 'd2', 'b3'];
    const cJordan = cPpl + 0.8;
    const PANEL_XY = [1584, 208];
    const CITY_T = [-13, 215];
    const CITY_S = 1.35;
    const WEEK_AT = [1470, 800];
    const ASK_AT = [1780, 830];
    const SIDE_S = 1.15;
    const place = (xy, k, world) => {
        const [cx, cy] = P(world[0], world[1], 0);
        return `translate(${xy[0]} ${xy[1]}) scale(${k}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})`;
    };
    const cityPt = (world) => {
        const [x, y] = P(world[0], world[1], world[2] ?? 0);
        return [CITY_T[0] + CITY_S * x, CITY_T[1] + CITY_S * y];
    };
    const sidePt = (xy, center, world) => {
        const [x, y] = P(world[0], world[1], world[2] ?? 0);
        const [cx, cy] = P(center[0], center[1], 0);
        return [xy[0] + SIDE_S * (x - cx), xy[1] + SIDE_S * (y - cy)];
    };
    const WEEK_C = [255, 0];
    const ASK_C = [570, 0];
    function Cube({ x, y, z, color, op = 1 }) {
        const PAL = useContext(PalContext);
        const s = 9;
        return (<Box x={x - s} y={y - s} z={z} w={s * 2} d={s * 2} h={12} op={op} pal={{
                line: PAL.line,
                top: color,
                left: mix(color, '#000000', 0.15),
                right: mix(color, '#000000', 0.3),
            }} top={color} stroke={mix(color, '#000000', 0.35)} sw={1}/>);
    }
    function Bubble({ x, y, lines, tone, anchor = 'end' }) {
        const pal = useContext(PalContext);
        const ref = useRef(null);
        const [w, setW] = useState(240);
        useLayoutEffect(() => {
            const measure = () => {
                if (ref.current)
                    setW(ref.current.getBBox().width);
            };
            measure();
            void document.fonts?.ready.then(measure);
        }, [lines.join('|')]);
        const bw = w + 44;
        const bh = 22 + lines.length * 28;
        const left = anchor === 'end' ? x - bw : x;
        return (<g transform={`translate(${left} ${y})`}>
          <rect width={bw} height={bh} rx="18" fill={tone === 'ask' ? pal.hub : pal.bg} stroke={tone === 'ask' ? pal.line : pal.ok} strokeWidth="2"/>
          <g ref={ref}>
            {lines.map((l, i) => (<text key={l} x="22" y={36 + i * 28} fontSize="20" fontWeight={tone === 'ask' ? 600 : 500} fill={pal.ink}>
                {l}
              </text>))}
          </g>
        </g>);
    }
    function Halo({ x, y, text, size = 18, weight = 600, fill, anchor = 'middle', spacing = 0 }) {
        const pal = useContext(PalContext);
        return (<text x={x} y={y} fontSize={size} fontWeight={weight} letterSpacing={spacing} textAnchor={anchor} fill={fill} stroke={pal.bg} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">
          {text}
        </text>);
    }
    function Avatar({ x, y, who, glow = 0 }) {
        const pal = useContext(PalContext);
        const dark = pal.bg !== '#ffffff';
        const p = PEOPLE[who];
        const c = dark ? p.dark : p.light;
        return (<g transform={`translate(${x} ${y})`}>
          {glow > 0.02 ? <circle r={22} fill={c} opacity={0.3 * glow}/> : null}
          <circle r="15" fill={c} stroke={pal.bg} strokeWidth="2.5"/>
          <text y="4.5" fontSize="12" fontWeight="700" letterSpacing="0.4" textAnchor="middle" fill={dark ? '#0b1220' : '#ffffff'}>
            {p.ini}
          </text>
        </g>);
    }
    function AtlasFrame({ T }) {
        const pal = useContext(PalContext);
        const FC = pal.bg === '#ffffff' ? FLOW_COLORS.light : FLOW_COLORS.dark;
        const personColor = (who) => PEOPLE[who][pal.bg === '#ffffff' ? 'light' : 'dark'];
        const barColor = (key) => key === 'new' ? pal.accent : key === 'fixed' ? pal.ok : UPKEEP[pal.bg === '#ffffff' ? 'light' : 'dark'];
        const out = 1 - enter(T, cL, cL + 0.8);
        const at = (p) => P(p[0], p[1], p[2] ?? 0);
        const srcK = Math.max(fade(T, cM, cM + 0.3, cM + 1.2, cM + 1.5), fade(T, cLand - 0.2, cLand, cLand + 2.4, cLand + 2.8), fade(T, cFlow, cFlow + 0.1, cFlow + 2.0, cFlow + 2.3));
        const platK = enter(T, cMap, cMap + 0.4) * out;
        const flowK = enter(T, cMap + 0.9, cMap + 1.4);
        const flowHot = enter(T, cFlow, cFlow + 0.4) * out;
        const badK = enter(T, ruleBad, ruleBad + 0.25) * (1 - enter(T, ruleFixed, ruleFixed + 0.25));
        const okK = enter(T, ruleFixed, ruleFixed + 0.25) * out;
        const weekK = enter(T, cWeek, cWeek + 0.3) * out;
        const pplK = enter(T, cPpl, cPpl + 0.3) * out;
        const askK = enter(T, cAsk, cAsk + 0.3) * out;
        const askPulse = askK * (0.5 + 0.5 * Math.sin(TAU * 1.2 * (T - cAsk)));
        const bob = 5 * Math.sin(((TAU * T) / LOOP) * 2);
        const state = Object.fromEntries(BUILDINGS.map((b) => {
            const d = DISTRICTS.findIndex((x) => x.key === b.d);
            const st = cMap + 0.12 * d + 0.05 * b.i;
            const mapK = pop(T, st, st + 0.45);
            const mine = DROPS.filter((x) => x.key === b.key && x.tone === 'heat');
            const landed = mine.reduce((acc, x) => acc + enter(T, x.b - 0.05, x.b + 0.2), 0);
            const ripple = DROPS.filter((x) => x.key === b.key).reduce((acc, x) => Math.max(acc, T >= x.b && T < x.b + 0.6 ? prog(T, x.b, x.b + 0.6) : 0), 0);
            const focus = b.d === 'checkout' || b.d === 'billing' ? askPulse * 0.25 : 0;
            const heat = clamp(landed / MAX_HITS + focus, 0, 1) * out;
            const h = 4 + ((b.h - 4) * mapK + 10 * landed) * out;
            return [b.key, { mapK: clamp(mapK, 0, 1) * out, heat, h, top: GROUND + h, ripple }];
        }));
        const flowFlash = (f) => DROPS.filter((x) => f.stops.includes(x.key)).reduce((acc, x) => Math.max(acc, fade(T, x.b, x.b + 0.1, x.b + 0.4, x.b + 0.7)), 0);
        const pills = [
            { k: fade(T, cM + 0.4, cM + 0.6, cMap + 0.4, cMap + 0.6), text: 'Merged: 42 changes flow in', tone: pal.accent },
            { k: fade(T, cMap + 0.6, cMap + 0.8, cLand + 0.6, cLand + 0.8), text: 'Map: 4 districts, 12 buildings', tone: pal.accent },
            { k: fade(T, cLand + 0.8, cLand + 1.0, cFlow + 0.2, cFlow + 0.4), text: 'Busiest: Checkout, Billing', tone: HEAT },
            { k: fade(T, cFlow + 0.4, cFlow + 0.6, ruleBad + 0.1, ruleBad + 0.3), text: 'Upgrade a trial: 3 changes', tone: FC.upgrade },
            { k: fade(T, ruleBad + 0.3, ruleBad + 0.5, ruleFixed, ruleFixed + 0.2), text: 'Billing rule: needs a look', tone: pal.alert },
            { k: fade(T, ruleFixed + 0.2, ruleFixed + 0.4, cWeek + 0.2, cWeek + 0.4), text: 'Fixed: the rule check passes', tone: pal.ok },
            { k: fade(T, cWeek + 0.4, cWeek + 0.6, cPpl + 0.2, cPpl + 0.4), text: 'New 60%, Fixed 25%, Upkeep 15%', tone: pal.accent },
            { k: fade(T, cPpl + 0.4, cPpl + 0.6, cJordan + 0.2, cJordan + 0.4), text: '8 engineers across 4 areas', tone: pal.accent },
            { k: fade(T, cJordan + 0.4, cJordan + 0.6, cAsk + 0.2, cAsk + 0.4), text: 'Jordan: 9 changes in 3 areas', tone: personColor('jordan') },
            { k: fade(T, cAsk + 0.4, cAsk + 0.6, cAsk + 2.0, cAsk + 2.2), text: 'Ask: What moved this week?', tone: pal.line },
            { k: fade(T, cAsk + 2.2, cAsk + 2.4, cL - 0.1, cL + 0.4), text: 'Updates every day', tone: pal.ok },
        ];
        const order = [...BUILDINGS].sort((a, b) => a.cx + a.cy - (b.cx + b.cy));
        const roof = (key) => [BLD[key].cx, BLD[key].cy, state[key].top + 2];
        const flowRoute = (f) => f.stops.map(roof);
        const along3 = (route, f) => {
            const L = [];
            let tot = 0;
            for (let i = 0; i < route.length - 1; i++) {
                const l = Math.hypot(route[i + 1][0] - route[i][0], route[i + 1][1] - route[i][1]);
                L.push(l);
                tot += l;
            }
            let d = f * tot;
            for (let i = 0; i < L.length; i++) {
                if (d <= L[i] || i === L.length - 1) {
                    const k = L[i] ? Math.min(1, d / L[i]) : 0;
                    return route[i].map((v, j) => v + (route[i + 1][j] - v) * k);
                }
                d -= L[i];
            }
            return route[route.length - 1];
        };
        const peopleOut = 1 - enter(T, cAsk + 0.6, cAsk + 1.0);
        const jK = enter(T, cJordan, cJordan + 0.3) * peopleOut;
        const trailK = enter(T, cJordan + 0.1, cJordan + 0.7);
        const outline = Object.fromEntries(BUILDINGS.map((b) => {
            const st = STACKS.find((x) => x.b === b.key);
            const popK = st ? fade(T, st.at, st.at + 0.1, st.at + 0.7, st.at + 1.0) : 0;
            const mine = TRAIL.includes(b.key) ? jK : 0;
            if (mine >= popK)
                return [b.key, { k: mine, c: personColor('jordan') }];
            return [b.key, { k: popK, c: personColor(st.who[0]) }];
        }));
        const rb = state[RULE];
        const [lx, ly] = at([BLD[RULE].cx, BLD[RULE].cy, rb.top + 2]);
        const lightK = Math.max(badK, okK);
        const lightC = mix(pal.alert, pal.ok, okK);
        return (<g>
          <g transform="translate(60 104) scale(1.15)">
            <Label x={0} y={0} text="ACME/CHECKOUT" sub="Last 7 days"/>
            {FEED.map((f, i) => {
                const k = enter(T, f.at, f.at + 0.35) * (1 - enter(T, cL, cL + 0.6));
                if (k <= 0)
                    return null;
                const dot = f.tone === 'alert'
                    ? pal.alert
                    : f.tone === 'ok'
                        ? pal.ok
                        : f.tone === 'heat'
                            ? HEAT
                            : f.tone === 'flow'
                                ? FC.upgrade
                                : pal.accent;
                return (<g key={f.who} opacity={k} transform={`translate(${-12 * (1 - k)} ${72 + i * 64})`}>
                  <circle cx="7" cy="-7" r="6" fill={dot}/>
                  <text x="26" y="0" fontSize="22" fontWeight="600" fill={pal.ink}>
                    {f.who}
                  </text>
                  <text x="26" y="29" fontSize="21" fill={pal.mut}>
                    {f.text}
                  </text>
                </g>);
            })}
          </g>

          <g transform="translate(60 724) scale(1.15)" opacity={0.35 + 0.65 * flowK * out}>
            <Label x={0} y={0} text="BUSINESS FLOWS" sub="Roads through the code they use"/>
            {FLOWS.map((f, i) => (<g key={f.key} transform={`translate(0 ${74 + i * 34})`}>
                <line x1="2" x2="34" y1="-7" y2="-7" stroke={FC[f.key]} strokeWidth="5" strokeLinecap="round"/>
                <text x="48" y="0" fontSize="20" fill={pal.ink}>{f.label}</text>
              </g>))}
          </g>

          <g transform={`translate(${CITY_T[0]} ${CITY_T[1]}) scale(${CITY_S})`}>
            <Box x={PLAT.x} y={PLAT.y} w={PLAT.w} d={PLAT.d} h={PLAT.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, platK * 0.2)} stroke={mix(pal.line, pal.accent, platK * 0.4)}/>
            {DISTRICTS.map((d) => {
                const heat = Math.max(...BUILDINGS.filter((b) => b.d === d.key).map((b) => state[b.key].heat));
                return (<Box key={d.key} x={d.ox} y={d.oy} z={PLAT.h} w={DS} d={DS} h={GROUND - PLAT.h} sw={1.2} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(mix(pal.ptop, pal.top, platK), mix(pal.top, HEAT, 0.12), heat * 0.6)} stroke={mix(pal.guide, pal.line, platK * 0.7)}/>);
            })}


            {STREETS.map((l, i) => {
                const a = BLD[l[0]];
                const b = BLD[l[1]];
                const k = enter(T, cMap + 0.5 + 0.05 * i, cMap + 0.9 + 0.05 * i) * out;
                if (k <= 0.01)
                    return null;
                return (<polyline key={l.join('-')} points={pts([
                        [a.cx, a.cy, GROUND],
                        [a.cx + (b.cx - a.cx) * k, a.cy + (b.cy - a.cy) * k, GROUND],
                    ])} fill="none" stroke={pal.line} strokeWidth="1.4" strokeDasharray="5 4" opacity={0.55}/>);
            })}

            {BUILDINGS.map((b) => {
                const s = state[b.key];
                if (s.heat <= 0.02)
                    return null;
                return (<g key={b.key + '-heat'} transform={topMatrix(b.cx, b.cy, GROUND)}>
                  {[1, 0.74].map((r, i) => (<circle key={r} r={(b.s * 0.55 + 26 * s.heat) * r + 3 * Math.sin(TAU * T + i)} fill={HEAT} opacity={(0.12 + 0.08 * i) * s.heat}/>))}
                </g>);
            })}

            {order.map((b) => {
                const s = state[b.key];
                const rule = b.key === RULE;
                const top = mix(mix(mix(pal.top, pal.hub, s.mapK * 0.4), mix(pal.top, HEAT, 0.45), s.heat), pal.alertTop, rule ? badK : 0);
                const ol = outline[b.key];
                const stroke = mix(mix(mix(mix(pal.guide, pal.line, s.mapK), HEAT, s.heat * 0.85), pal.alert, rule ? badK : 0), ol.c, ol.k);
                return (<g key={b.key}>
                  <Box x={b.x} y={b.y} z={GROUND} w={b.s} d={b.s} h={s.h} pal={pal} top={top} stroke={stroke} sw={1.6 + 1.4 * ol.k}>
                    {[-0.22, 0.22].map((u) => [-0.22, 0.22].map((v) => (<rect key={`${u}${v}`} x={u * b.s - 5} y={v * b.s - 5} width="10" height="10" rx="2" fill={mix(pal.guide, HEAT, s.heat)} opacity={0.5 + 0.5 * s.mapK}/>)))}
                  </Box>
                  {s.ripple > 0 ? (<g transform={topMatrix(b.cx, b.cy, s.top)}>
                      <circle r={12 + 30 * s.ripple} fill="none" stroke={HEAT} strokeWidth="3" opacity={1 - s.ripple}/>
                    </g>) : null}
                </g>);
            })}

            {FLOWS.map((f) => {
                const route = flowRoute(f);
                const c = FC[f.key];
                const hot = Math.max(flowHot * 0.6, flowFlash(f));
                const draw = flowK;
                if (draw <= 0.01)
                    return null;
                const end = along3(route, draw);
                const shown = [];
                for (let i = 0; i < route.length; i++) {
                    const p = along3(route, i / (route.length - 1));
                    if (i / (route.length - 1) <= draw)
                        shown.push(p);
                }
                shown.push(end);
                const line = pts(shown);
                return (<g key={f.key} opacity={out}>
                  <polyline points={line} fill="none" stroke={c} strokeWidth={10 + 6 * hot} strokeLinejoin="round" strokeLinecap="round" opacity={0.14 + 0.18 * hot}/>
                  <polyline points={line} fill="none" stroke={c} strokeWidth="3.6" strokeLinejoin="round" strokeLinecap="round" opacity={0.85}/>
                  {f.stops.map((k) => (<g key={k} transform={topMatrix(BLD[k].cx, BLD[k].cy, state[k].top + 2)} opacity={draw}>
                      <circle r="9" fill={pal.bg} stroke={c} strokeWidth="3"/>
                    </g>))}
                  {draw >= 1
                    ? [0, 1, 2].map((i) => {
                        const fr = (((T - cMap) * (0.18 + 0.12 * flowHot) + i / 3) % 1 + 1) % 1;
                        const [sx, sy] = at(along3(route, fr));
                        return (<g key={i}>
                          <circle cx={sx} cy={sy} r={9 + 4 * hot} fill={c} opacity={0.25}/>
                          <circle cx={sx} cy={sy} r="4.5" fill="#ffffff"/>
                        </g>);
                    })
                    : null}
                </g>);
            })}

            {lightK > 0.02 ? (<g opacity={lightK}>
                <line x1={lx} y1={ly} x2={lx} y2={ly - 34} stroke={lightC} strokeWidth="2.4"/>
                <circle cx={lx} cy={ly - 44} r={18 + 4 * Math.sin(TAU * 2 * T) * badK} fill={lightC} opacity={0.25}/>
                <circle cx={lx} cy={ly - 44} r="10" fill={lightC}/>
                <Halo x={lx} y={ly - 66} text={okK > 0.5 ? 'Rule passes' : 'Needs a look'} fill={lightC}/>
              </g>) : null}

            {DISTRICTS.map((d) => {
                const [sx, sy] = at([d.ox + DS - 40, d.oy + DS - 40, GROUND]);
                return <Halo key={d.key} x={sx} y={sy + 8} text={d.label.toUpperCase()} size={19} spacing={1.4} fill={mix(pal.mut, pal.ink, platK)}/>;
            })}

            {trailK > 0.02 && peopleOut > 0.02 ? (() => {
                const c = personColor('jordan');
                const route = [];
                for (let i = 0; i < TRAIL.length - 1; i++) {
                    const a = BLD[TRAIL[i]];
                    const b = BLD[TRAIL[i + 1]];
                    const za = state[TRAIL[i]].top + 6;
                    const zb = state[TRAIL[i + 1]].top + 6;
                    for (let j = 0; j <= 16; j++) {
                        const f = j / 16;
                        route.push([a.cx + (b.cx - a.cx) * f, a.cy + (b.cy - a.cy) * f, za + (zb - za) * f + 70 * Math.sin(Math.PI * f)]);
                    }
                }
                const n = Math.max(2, Math.round(route.length * trailK));
                const line = pts(route.slice(0, n));
                return (<g opacity={peopleOut}>
                  <polyline points={line} fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity={0.18}/>
                  <polyline points={line} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7" opacity={0.95}/>
                </g>);
            })() : null}

            {STACKS.map((st) => {
                const k = pop(T, st.at, st.at + 0.35) * peopleOut;
                if (k <= 0.02)
                    return null;
                const b = BLD[st.b];
                const [sx, sy] = at([b.cx, b.cy, state[st.b].top]);
                const items = st.who.length + (st.more ? 1 : 0);
                const x0 = -((items - 1) * 22) / 2;
                return (<g key={st.b} transform={`translate(${sx + (st.dx ?? 0)} ${sy - 50 + (st.dy ?? 0)}) scale(${k})`}>
                  {st.who.map((w, j) => {
                    const lift = w === 'jordan' ? jK : 0;
                    return <Avatar key={w} x={x0 + j * 22} y={-10 * lift} who={w} glow={lift}/>;
                  })}
                  {st.more ? (<g transform={`translate(${x0 + st.who.length * 22 + 4} 0)`}>
                      <rect x="-16" y="-12" width="32" height="24" rx="12" fill={pal.bg} stroke={pal.guide} strokeWidth="1.6"/>
                      <text y="5" fontSize="13" fontWeight="600" textAnchor="middle" fill={pal.mut}>+{st.more}</text>
                    </g>) : null}
                </g>);
            })}

            <Box x={SRC.x} y={SRC.y} w={SRC.s} d={SRC.s} h={SRC.h} pal={pal} top={mix(pal.top, pal.hub, srcK)} stroke={mix(pal.line, pal.accent, srcK)}>
              {ICON.code(srcK > 0.3 ? pal.accent : pal.line)}
            </Box>
            {[0, 1, 2, 3].map((i) => {
                const a = cM + 0.2 + 0.25 * i;
                const k = prog(T, a, a + 0.5);
                if (k <= 0 || k >= 1)
                    return null;
                return (<Cube key={'in' + i} x={SRC_C[0] + (i % 2 ? 18 : -18)} y={SRC_C[1] + (i < 2 ? -14 : 14)} z={SRC.h + 40 * (1 - easeInOutCubic(k))} color={pal.accent} op={prog(T, a, a + 0.15) * (1 - prog(T, a + 0.4, a + 0.5))}/>);
            })}
            {DROPS.map((d, i) => {
                if (T < d.a || T > d.b)
                    return null;
                const b = BLD[d.key];
                const f = travel(T, d.a, d.b);
                const [x0, y0] = SRC_C;
                const z0 = SRC.h;
                const z1 = state[d.key].top;
                const z = z0 + (z1 - z0) * f + 90 * Math.sin(Math.PI * f);
                return <Cube key={'drop' + i} x={x0 + (b.cx - x0) * f} y={y0 + (b.cy - y0) * f} z={z} color={d.tone === 'fix' ? pal.ok : HEAT} op={prog(T, d.a, d.a + 0.1)}/>;
            })}

            {(() => {
                const [sx, sy] = at([SRC.x, SRC.y, SRC.h]);
                return <Label x={sx} y={sy - 62} text="MERGED CHANGES" sub="Flow in every day" anchor="middle"/>;
            })()}
          </g>

          {[
                { a: cityPt([PLAT.x + PLAT.w, 0, PLAT.h]), b: sidePt(WEEK_AT, WEEK_C, [WEEK.x, 0, WEEK.h / 2]), t: cWeek - 0.2, c: pal.accent },
                { a: sidePt(WEEK_AT, WEEK_C, [WEEK.x + WEEK.s, 0, WEEK.h / 2]), b: sidePt(ASK_AT, ASK_C, [ASK.x, 0, ASK.h / 2]), t: cAsk - 0.4, c: pal.line },
            ].map((l, i) => {
                const hot = fade(T, l.t, l.t + 0.15, l.t + 0.7, l.t + 0.9);
                const f = travel(T, l.t, l.t + 0.6);
                const on = T > l.t && T < l.t + 0.7;
                return (<g key={i}>
                  <line x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke={pal.line} strokeWidth="1.8" opacity="0.5"/>
                  {hot > 0 ? <line x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke={l.c} strokeWidth="3.4" opacity={hot}/> : null}
                  {on ? <circle cx={l.a[0] + (l.b[0] - l.a[0]) * f} cy={l.a[1] + (l.b[1] - l.a[1]) * f} r="8" fill={l.c}/> : null}
                </g>);
            })}
          <g transform="translate(520 900) scale(1.3)">
            <Label x={0} y={0} text="CODEBASE CITY" sub="Your architecture as districts and buildings"/>
          </g>
          <g transform={place(WEEK_AT, SIDE_S, WEEK_C)}>
            <Box x={WEEK.x} y={-WEEK.s / 2} w={WEEK.s} d={WEEK.s} h={WEEK.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, weekK * 0.6)} stroke={mix(pal.line, pal.accent, weekK)}/>
            {BARS.map((b) => {
                const k = pop(T, b.at, b.at + 0.5) * out;
                const color = barColor(b.key);
                const solid = mix(pal.top, color, clamp(k, 0, 1));
                return (<Box key={b.key} x={b.x} y={-BAR_W / 2} z={WEEK.h} w={BAR_W} d={BAR_W} h={Math.max(3, b.h * k)} pal={{
                        ...pal,
                        left: mix(solid, '#000000', 0.15),
                        right: mix(solid, '#000000', 0.3),
                    }} top={solid} stroke={mix(pal.line, mix(color, '#000000', 0.3), clamp(k, 0, 1))}/>);
            })}
            {BARS.map((b) => {
                const k = enter(T, b.at + 0.2, b.at + 0.5) * out;
                if (k <= 0.02)
                    return null;
                const [sx, sy] = at([b.x + BAR_W, -BAR_W / 2, WEEK.h + b.h * clamp(pop(T, b.at, b.at + 0.5), 0, 1.1)]);
                return (<text key={b.key + '-label'} x={sx + 10} y={sy + 4} opacity={k} fontSize="19" fontWeight="600" fill={pal.ink} stroke={pal.bg} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">
                  {b.label} <tspan fill={mix(barColor(b.key), '#000000', pal.bg === '#ffffff' ? 0.15 : 0)}>{b.pct}</tspan>
                </text>);
            })}

            {(() => {
                const [sx, sy] = at([WEEK.x + WEEK.s, WEEK.s / 2]);
                return <Label x={sx} y={sy + 44} text="THIS WEEK" sub="Momentum, focus, kind of work" anchor="middle"/>;
            })()}
          </g>
          <g transform={place(ASK_AT, SIDE_S, ASK_C)}>
            <Box x={ASK.x} y={-ASK.s / 2} w={ASK.s} d={ASK.s} h={ASK.h} pal={pal} top={mix(pal.hub, pal.hubHot, askK)} sw={2}/>
            <polyline points={pts([
                [AC, 0, ASK.h],
                [AC, 0, 110 + bob],
            ])} stroke={pal.guide} strokeWidth="1.2" strokeDasharray="2 5" fill="none"/>
            <Hex cx={AC} cy={0} z={110 + bob} r={46} h={24} top={mix(pal.top, pal.hub, askK)} stroke={mix(pal.line, pal.accent, askK)}>
              <g fill="none" stroke={askK > 0.3 ? pal.accent : pal.line} strokeWidth="3.2" strokeLinejoin="round">
                <path d="M-20 -14 H20 A6 6 0 0 1 26 -8 V8 A6 6 0 0 1 20 14 H-4 L-14 22 V14 H-20 A6 6 0 0 1 -26 8 V-8 A6 6 0 0 1 -20 -14 Z"/>
                <path d="M-12 0 H-11 M0 0 H1 M12 0 H13" strokeWidth="4.4" strokeLinecap="round"/>
              </g>
            </Hex>

            {(() => {
                const [sx, sy] = at([ASK.x + ASK.s, ASK.s / 2]);
                return <Label x={sx} y={sy + 44} text="ASK" sub="Analyze in Chat" anchor="middle"/>;
            })()}
          </g>

          {(() => {
              const qK = fade(T, cAsk + 0.3, cAsk + 0.6, cL - 0.2, cL + 0.3);
              const aK = fade(T, cAsk + 1.2, cAsk + 1.5, cL - 0.2, cL + 0.3);
              return (<g>
                {qK > 0.02 ? (<g opacity={qK} transform={`translate(0 ${8 * (1 - qK)})`}>
                    <Bubble x={1890} y={372} lines={['What moved this week?']} tone="ask"/>
                  </g>) : null}
                {aK > 0.02 ? (<g opacity={aK} transform={`translate(0 ${8 * (1 - aK)})`}>
                    <Bubble x={1890} y={436} lines={['Checkout and Billing moved most.', 'Upgrade a trial got 3 changes.']}/>
                  </g>) : null}
              </g>);
          })()}

          <g transform={`translate(${PANEL_XY[0]} ${PANEL_XY[1]})`}>
            <Label x={0} y={-54} text="PEOPLE" sub="Who worked where"/>
            <rect width="300" height="146" rx="14" fill={pal.bg} stroke={mix(pal.guide, pal.line, pplK)} strokeWidth="1.6"/>
            {ROSTER.map((w, i) => {
                const p = PEOPLE[w];
                const c = personColor(w);
                const barK = enter(T, cPpl + 0.1 * i, cPpl + 0.5 + 0.1 * i) * out;
                const hl = w === 'jordan' ? jK : 0;
                return (<g key={w} transform={`translate(0 ${30 + i * 43})`}>
                  {hl > 0.02 ? <rect x="8" y="-19" width="284" height="38" rx="10" fill={pal.hub} opacity={hl}/> : null}
                  <Avatar x={30} y={0} who={w}/>
                  <text x="56" y="6" fontSize="19" fontWeight={hl > 0.5 ? 700 : 500} fill={pal.ink}>{p.name}</text>
                  <rect x="134" y="-4" width="120" height="8" rx="4" fill={pal.grid} opacity="0.6"/>
                  <rect x="134" y="-4" width={Math.max(0.01, (120 * p.n) / 9 * barK)} height="8" rx="4" fill={c}/>
                  <text x="276" y="6" fontSize="18" fontWeight="600" textAnchor="middle" fill={pal.ink} opacity={0.35 + 0.65 * barK}>{p.n}</text>
                </g>);
            })}
          </g>

          {pills.map((p) => p.k > 0 ? (<g key={p.text} opacity={p.k} transform={`translate(1400 ${80 - 8 * (1 - p.k)})`}>
                <TextPill text={p.text} tone={p.tone}/>
              </g>) : null)}

          <StepPills steps={STEPS} T={T} fadeAt={cL + 0.3}/>
        </g>);
    }
    function AtlasStage({ className }) {
        return (<IsoMotionStage loop={LOOP} label="Codebase Atlas shows a repository as a city. Areas are districts, components are buildings, and dependency links are streets. Business flows such as Upgrade a trial and Refund an order run as lines through the buildings they use. Merged changes land on buildings, which grow and heat up, and the flows through them pulse. A change to a building that a Billing rule depends on shows a red light until a fix turns it green. The week sums up momentum, focus and the kind of work, People shows who worked where, and Analyze in Chat answers what moved this week. Atlas updates every day." className={className} frame={(T) => <AtlasFrame T={T}/>}/>);
    }

    return AtlasStage;
  }, []);
  return (
    <div className={className ?? 'ct-iso-scene'}>
      <Stage className="ct-iso-svg" />
    </div>
  );
};
