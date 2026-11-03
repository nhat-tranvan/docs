/* Hand-written sibling of review.jsx: it reuses the generated iso kit verbatim.
 * There is no source scene in cloudthinker-landing-page; edit this file directly. */

export const LoupeScene = ({ className }) => {
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




    const LOOP = 16;
    const cE = 0;
    const cR = 1.4;
    const cO = 3.0;
    const cC = 4.8;
    const cS = 6.0;
    const cP = 8.6;
    const cX = 10.2;
    const cM = 11.8;
    const cL = 14.4;
    const STEPS = [
        ['Change', cE],
        ['Run', cR],
        ['Open', cO],
        ['Compare', cC],
        ['Spot', cS],
        ['Post', cP],
        ['Fix', cX],
        ['Merge', cM],
    ];
    const ENG = { x: -520, s: 100, h: 56 };
    const PR = { x: -300, s: 100, h: 44 };
    const HUB = { x: -70, s: 150, h: 36 };
    const MERGE = { x: 210, s: 90, h: 40 };
    const PROD = { x: 380, s: 260, h: 16 };
    const HC = HUB.x + HUB.s / 2;
    const YC = -237;
    const GAP = 28;
    const BEFORE = { x: -329, w: 220, h: 140 };
    const AFTER = { x: BEFORE.x + BEFORE.w + GAP, w: 220, h: 140 };
    const PHONE = { x: AFTER.x + AFTER.w + GAP, w: 80, h: 160 };
    const SLAB = { x: BEFORE.x - 8, y: YC - 12, w: PHONE.x + PHONE.w + 20 - (BEFORE.x - 8), d: 28, h: 12 };
    const Z0 = SLAB.h;
    const NOTE = { x: -245, y: 435, s: 90, h: 30 };
    const CARD = { x: NOTE.x + 5, y: NOTE.y + NOTE.s / 2, w: 80, h: 56 };
    const lane = (a, b) => [
        [a, 0],
        [b, 0],
    ];
    const ENG_PR = lane(ENG.x + ENG.s, PR.x);
    const PR_HUB = lane(PR.x + PR.s, HUB.x);
    const HUB_MERGE = lane(HUB.x + HUB.s, MERGE.x);
    const MERGE_PROD = lane(MERGE.x + MERGE.s, PROD.x);
    const TO_APP = [
        [HC + 20, -HUB.s / 2],
        [HC + 20, SLAB.y + SLAB.d],
    ];
    const TO_NOTE = [
        [HC - 40, HUB.s / 2],
        [HC - 40, NOTE.y + NOTE.s / 2],
        [NOTE.x + NOTE.s, NOTE.y + NOTE.s / 2],
    ];
    const NOTE_PR = [
        [NOTE.x + 30, NOTE.y],
        [NOTE.x + 30, PR.s / 2],
    ];
    const wall = (o) => `matrix(${C30},${S30},0,1,${o[0].toFixed(1)},${o[1].toFixed(1)})`;
    const onWall = (o, u, v) => [o[0] + C30 * u, o[1] + S30 * u + v];
    const screenOf = (f) => P(f.x, YC, Z0 + f.h);
    const CHANGES = [
        { box: [8, 20, 122, 20], spot: [66, 30], badge: [130, 20] },
        { box: [157, 45, 46, 22], spot: [180, 56], badge: [203, 45] },
        { box: [123, 93, 90, 34], spot: [168, 110], badge: [213, 93] },
    ];
    const markAt = (i) => cS + 0.3 + i * 0.45;
    const PAGE_AT = [1, 2, 3].map((i) => cO + 0.1 + i * 0.35);
    const shot = (c) => (<g fill="none" stroke={c} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        <rect x="-20" y="-15" width="40" height="30" rx="4"/>
        <path d="M-14 9 L-5 -1 L2 6 L7 1 L14 9"/>
        <circle cx="8" cy="-7" r="3"/>
      </g>);
    const FEED = [
        { at: cO + 1.0, who: 'Desktop', text: '4 pages checked' },
        { at: cO + 1.5, who: 'Mobile', text: 'Pay button overlaps the total at 375px', tone: 'alert' },
        { at: cS + 1.4, who: 'Compared with main', text: '3 visible changes, numbered' },
        { at: cS + 2.2, who: 'Flow', text: 'Checkout still completes', tone: 'ok' },
        { at: cP + 0.8, who: 'Note', text: 'Screenshots posted on the PR' },
        { at: cM + 0.4, who: 'Engineer', text: 'Fixed and merged', tone: 'ok' },
    ];
    function LoupeFrame({ T }) {
        const pal = useContext(PalContext);
        const out = 1 - enter(T, cL, cL + 0.8);
        const engK = Math.max(fade(T, cE, cE + 0.3, cE + 1.0, cE + 1.4), fade(T, cX, cX + 0.3, cX + 0.6, cX + 0.9));
        const prK = enter(T, cE + 0.8, cE + 1.1) * out;
        const prBad = enter(T, cP + 0.8, cP + 1.0) * (1 - enter(T, cX + 0.4, cX + 0.7));
        const prOk = enter(T, cX + 0.4, cX + 0.7) * out;
        const hubK = Math.max(fade(T, cR, cR + 0.2, cP + 0.8, cP + 1.1), fade(T, cX + 0.4, cX + 0.6, cX + 1.2, cX + 1.5), fade(T, cM - 0.2, cM, cM + 0.6, cM + 0.9));
        const appK = Math.max(fade(T, cR + 0.8, cR + 1.0, cP, cP + 0.4), fade(T, cX + 0.9, cX + 1.1, cX + 1.6, cX + 1.9));
        const bootK = enter(T, cR + 1.0, cR + 1.4) * out;
        const phoneBoot = enter(T, cO + 0.3, cO + 0.7) * out;
        const fixK = enter(T, cX + 1.1, cX + 1.4);
        const phoneBad = enter(T, cO + 1.2, cO + 1.4) * (1 - fixK);
        const phoneOk = fixK * out;
        const page = T < cO ? 0 : Math.min(3, Math.floor(prog(T, cO + 0.1, cO + 1.5) * 4));
        const dip = Math.max(0, ...PAGE_AT.map((t) => 1 - Math.abs(T - t) / 0.12));
        const scan = prog(T, cC + 0.1, cC + 1.1);
        const scanK = fade(T, cC, cC + 0.15, cC + 1.0, cC + 1.2);
        const lensK = fade(T, cS - 0.1, cS + 0.15, cS + 1.5, cS + 1.8);
        const marks = CHANGES.map((_, i) => ({
            k: pop(T, markAt(i), markAt(i) + 0.3) * out,
            box: enter(T, markAt(i), markAt(i) + 0.25) * out,
        }));
        const ptrK = fade(T, cS + 1.5, cS + 1.65, cS + 2.2, cS + 2.4);
        const ptrT = travel(T, cS + 1.5, cS + 1.95);
        const click = prog(T, cS + 1.95, cS + 2.3);
        const flowOk = pop(T, cS + 2.05, cS + 2.3) * out;
        const noteK = Math.max(fade(T, cP, cP + 0.2, cP + 1.0, cP + 1.3), fade(T, cX + 1.4, cX + 1.6, cM, cM + 0.3));
        const cardK = enter(T, cP + 0.5, cP + 0.8) * out;
        const checkK = pop(T, cM + 0.1, cM + 0.4) * out;
        const mergeK = enter(T, cM + 0.4, cM + 0.7) * out;
        const prodOk = enter(T, cM + 1.0, cM + 1.3) * out;
        const pills = [
            { k: fade(T, cR + 1.3, cR + 1.5, cO + 1.3, cO + 1.5), text: 'Both versions running', tone: pal.accent },
            { k: fade(T, cO + 1.5, cO + 1.7, cS, cS + 0.3), text: 'Mobile: Pay overlaps the total', tone: pal.alert },
            { k: fade(T, cS + 1.4, cS + 1.6, cS + 2.0, cS + 2.2), text: '3 visible changes vs main', tone: pal.accent },
            { k: fade(T, cS + 2.2, cS + 2.4, cP + 0.6, cP + 0.8), text: 'Checkout still completes', tone: pal.ok },
            { k: fade(T, cP + 0.8, cP + 1.0, cX + 1.2, cX + 1.4), text: 'Loupe note posted on the PR', tone: pal.accent },
            { k: fade(T, cX + 1.4, cX + 1.6, cM + 0.8, cM + 1.0), text: 'Mobile layout fixed', tone: pal.ok },
            { k: fade(T, cM + 1.0, cM + 1.3, cL - 0.1, cL + 0.4), text: 'Fixed and merged', tone: pal.ok },
        ];
        const prTop = mix(mix(mix(pal.top, pal.hub, prK * 0.7), pal.alertTop, prBad), pal.okTop, prOk);
        const prStroke = mix(mix(mix(pal.line, pal.accent, prK), pal.alert, prBad), pal.ok, prOk);
        const prIcon = prOk > 0.5
            ? pal.ok
            : prBad > 0.5
                ? pal.alert
                : prK > 0.5
                    ? pal.accent
                    : pal.line;
        const bob = 5 * Math.sin(((TAU * T) / LOOP) * 2);
        const ink = mix(pal.guide, pal.line, bootK);
        const frameStroke = mix(pal.line, pal.accent, appK);
        const oB = screenOf(BEFORE);
        const oA = screenOf(AFTER);
        const oP = screenOf(PHONE);
        const lensPath = [[20, 30], ...CHANGES.map((c) => c.spot)].map(([u, v]) => onWall(oA, u, v));
        const lens = along(lensPath, travel(T, cS, cS + 1.4));
        const ptrFrom = onWall(oA, 70, 132);
        const ptrTo = onWall(oA, CHANGES[2].spot[0], CHANGES[2].spot[1]);
        const ptr = [ptrFrom[0] + (ptrTo[0] - ptrFrom[0]) * ptrT, ptrFrom[1] + (ptrTo[1] - ptrFrom[1]) * ptrT];
        const flowAt = onWall(oA, 36, 124);
        const toneOf = (t) => t === 'alert' ? pal.alert : t === 'ok' ? pal.ok : pal.accent;
        const chrome = (w, dots) => (<g>
            <path d={`M0 16 H${w}`} stroke={pal.line} strokeWidth="1" opacity="0.6"/>
            {[8, 16, 24].map((x) => (<circle key={x} cx={x} cy="8" r="2.4" fill={pal.guide}/>))}
            {dots ? [0, 1, 2, 3].map((i) => (<circle key={'p' + i} cx={w - 40 + i * 9} cy="8" r="2.4" fill={i === page && bootK > 0.5 ? pal.accent : pal.guide} opacity={i <= page ? 1 : 0.45}/>)) : null}
          </g>);
        const scanBar = (w, h) => scanK > 0.02 ? (<g opacity={scanK}>
              <rect x="0" y="17" width={w * scan} height={h - 17} fill={pal.accent} opacity="0.08"/>
              <path d={`M${w * scan} 17 V${h}`} stroke={pal.accent} strokeWidth="2.4"/>
            </g>) : null;
        const desk = (after) => (<g opacity={(0.25 + 0.75 * bootK) * (1 - 0.6 * dip)}>
            <rect x="12" y="26" width={after ? 112 : 70} height="8" rx="2" fill={after ? mix(ink, pal.accent, bootK * 0.6) : ink}/>
            <rect x="12" y="44" width="196" height="40" rx="4" fill="none" stroke={ink} strokeWidth="1.2"/>
            <rect x="20" y="53" width="92" height="5" rx="2" fill={ink}/>
            <rect x="20" y="64" width="60" height="5" rx="2" fill={ink}/>
            {after ? <rect x="162" y="50" width="36" height="12" rx="6" fill={mix(ink, pal.accent, bootK)}/> : null}
            <rect x="12" y="106" width="90" height="7" rx="2" fill={ink}/>
            {after
                ? <rect x="128" y="98" width="80" height="24" rx="12" fill={mix(ink, pal.accent, bootK)}/>
                : <rect x="136" y="98" width="72" height="24" rx="4" fill={ink}/>}
          </g>);
        const btn = {
            x: 30 - 22 * fixK,
            y: 92 + 30 * fixK,
            w: 44 + 20 * fixK,
        };
        const phoneHl = Math.max(phoneBad, phoneOk);
        const phoneTone = mix(pal.alert, pal.ok, phoneOk);
        return (<g>
          <g transform="translate(80 150)">
            <Label x={0} y={0} text="PULL REQUEST" sub="#604, checkout page"/>
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

          <g transform="translate(180 210)">
            <Box x={PROD.x} y={-PROD.s / 2} w={PROD.s} d={PROD.s} h={PROD.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.okTop, prodOk * 0.6)} stroke={mix(pal.line, pal.ok, prodOk)}/>

            <Box x={SLAB.x} y={SLAB.y} w={SLAB.w} d={SLAB.d} h={SLAB.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, appK * 0.5)} stroke={mix(pal.line, pal.accent, appK)}/>

            <g transform={wall(oA)}>
              <rect width={AFTER.w} height={AFTER.h} rx="4" fill={pal.top} stroke={frameStroke} strokeWidth="1.6"/>
              {chrome(AFTER.w, true)}
              {desk(true)}
              {scanBar(AFTER.w, AFTER.h)}
              <text x="0" y="-12" fontSize="16" fontWeight="600" letterSpacing="1.2" fill={pal.mut}>AFTER · this change</text>
              {CHANGES.map((c, i) => marks[i].box > 0.02 ? (<rect key={i} x={c.box[0]} y={c.box[1]} width={c.box[2]} height={c.box[3]} rx="5" fill="none" stroke={pal.accent} strokeWidth="1.8" strokeDasharray="5 4" opacity={marks[i].box}/>) : null)}
            </g>
            <g transform={wall(oB)}>
              <rect width={BEFORE.w} height={BEFORE.h} rx="4" fill={pal.top} stroke={frameStroke} strokeWidth="1.6"/>
              {chrome(BEFORE.w, true)}
              {desk(false)}
              {scanBar(BEFORE.w, BEFORE.h)}
              <text x="0" y="-12" fontSize="16" fontWeight="600" letterSpacing="1.2" fill={pal.mut}>BEFORE · main</text>
            </g>
            <g transform={wall(oP)}>
              <rect width={PHONE.w} height={PHONE.h} rx="8" fill={pal.top} stroke={mix(mix(frameStroke, pal.alert, phoneBad), pal.ok, phoneOk)} strokeWidth="1.8"/>
              <path d={`M0 16 H${PHONE.w}`} stroke={pal.line} strokeWidth="1" opacity="0.6"/>
              <rect x="32" y="6" width="16" height="4" rx="2" fill={pal.guide}/>
              <text x="0" y="-12" fontSize="16" fontWeight="600" letterSpacing="1.2" fill={pal.mut}>375px</text>
              <g opacity={0.25 + 0.75 * phoneBoot}>
                <rect x="8" y="26" width="40" height="6" rx="2" fill={mix(pal.guide, pal.line, phoneBoot)}/>
                <rect x="8" y="40" width="64" height="40" rx="4" fill="none" stroke={mix(pal.guide, pal.line, phoneBoot)} strokeWidth="1.2"/>
                <rect x="14" y="49" width="36" height="4" rx="2" fill={mix(pal.guide, pal.line, phoneBoot)}/>
                <rect x="14" y="58" width="24" height="4" rx="2" fill={mix(pal.guide, pal.line, phoneBoot)}/>
                <rect x="8" y="96" width="44" height="7" rx="2" fill={mix(pal.guide, pal.line, phoneBoot)}/>
                <rect x={btn.x} y={btn.y} width={btn.w} height="18" rx="9" fill={mix(mix(pal.guide, pal.accent, phoneBoot), phoneTone, phoneHl * 0.85)} opacity="0.92"/>
              </g>
              {scanBar(PHONE.w, PHONE.h)}
              {phoneHl > 0.02 ? (<rect x={phoneOk > 0.5 ? btn.x - 5 : 4} y={phoneOk > 0.5 ? btn.y - 5 : 88} width={phoneOk > 0.5 ? btn.w + 10 : 72} height={phoneOk > 0.5 ? 28 : 28} rx="6" fill="none" stroke={phoneTone} strokeWidth="2.2" strokeDasharray={phoneOk > 0.5 ? undefined : '5 4'} opacity={phoneHl}/>) : null}
            </g>


            <Wire route={ENG_PR} hot={engK} color={pal.accent}/>
            <Wire route={PR_HUB} hot={Math.max(fade(T, cR, cR + 0.15, cR + 0.5, cR + 0.7), fade(T, cX + 0.4, cX + 0.55, cX + 0.8, cX + 1.0))} color={T > cX ? pal.ok : pal.accent}/>
            <Wire route={TO_APP} hot={Math.max(fade(T, cR + 0.5, cR + 0.65, cR + 1.0, cR + 1.2), fade(T, cP - 0.5, cP - 0.35, cP, cP + 0.2), fade(T, cX + 0.7, cX + 0.85, cX + 1.1, cX + 1.3))} color={T > cX ? pal.ok : pal.accent}/>
            <Wire route={TO_NOTE} hot={fade(T, cP, cP + 0.15, cP + 0.5, cP + 0.7)} color={pal.alert}/>
            <Wire route={NOTE_PR} hot={fade(T, cP + 0.5, cP + 0.6, cP + 0.85, cP + 1.05)} color={pal.alert}/>
            <Wire route={HUB_MERGE} hot={fade(T, cM, cM + 0.15, cM + 0.8, cM + 1.0)} color={pal.ok}/>
            <Wire route={MERGE_PROD} hot={fade(T, cM + 0.5, cM + 0.65, cM + 1.2, cM + 1.4)} color={pal.ok}/>

            <Box x={ENG.x} y={-ENG.s / 2} w={ENG.s} d={ENG.s} h={ENG.h} pal={pal} top={mix(mix(pal.top, pal.hub, engK), pal.okTop, checkK)} stroke={mix(pal.line, pal.accent, engK)}>
              {ICON.people(engK > 0.3 ? pal.accent : pal.line)}
            </Box>
            {checkK > 0.02
                ? (() => {
                    const [sx, sy] = P(ENG.x, -ENG.s / 2, ENG.h);
                    return (<g transform={`translate(${sx} ${sy - 32}) scale(${checkK})`}>
                      <circle r="20" fill={pal.ok}/>
                      <g transform="scale(0.8)">{ICON.check('#ffffff')}</g>
                    </g>);
                })()
                : null}
            <Box x={PR.x} y={-PR.s / 2} w={PR.s} d={PR.s} h={PR.h} pal={pal} top={prTop} stroke={prStroke}>
              {ICON.code(prIcon)}
            </Box>

            <Box x={NOTE.x} y={NOTE.y} w={NOTE.s} d={NOTE.s} h={NOTE.h} pal={pal} top={mix(mix(pal.top, pal.hub, noteK), pal.okTop, prodOk * 0.5)} stroke={mix(pal.line, pal.accent, Math.max(noteK, cardK * 0.6))}>
              {shot(noteK > 0.3 || cardK > 0.5 ? pal.accent : pal.line)}
            </Box>
            {cardK > 0.02 ? (() => {
                const zc = NOTE.h + 22 + bob * 0.6;
                const o = P(CARD.x, CARD.y, zc + CARD.h);
                const tone = mix(pal.alert, pal.ok, phoneOk);
                return (<g opacity={cardK}>
                  <polyline points={pts([
                        [NOTE.x + NOTE.s / 2, CARD.y, NOTE.h],
                        [NOTE.x + NOTE.s / 2, CARD.y, zc],
                    ])} stroke={pal.guide} strokeWidth="1.2" strokeDasharray="2 5" fill="none"/>
                  <g transform={`${wall(o)} translate(0 ${-10 * (1 - cardK)})`}>
                    <rect width={CARD.w} height={CARD.h} rx="5" fill={pal.bg} stroke={pal.accent} strokeWidth="1.6"/>
                    <rect x="6" y="7" width="44" height="30" rx="3" fill={pal.top} stroke={pal.line} strokeWidth="1"/>
                    <rect x="10" y="12" width="22" height="4" rx="1.5" fill={pal.accent}/>
                    <rect x="10" y="20" width="36" height="8" rx="2" fill="none" stroke={pal.line} strokeWidth="0.8"/>
                    <rect x="34" y="30" width="13" height="5" rx="2.5" fill={pal.accent}/>
                    <rect x="56" y="5" width="18" height="34" rx="3" fill={pal.top} stroke={tone} strokeWidth="1.4"/>
                    <rect x={62 - 3 * fixK} y={26 + 6 * fixK} width={10} height="4" rx="2" fill={tone}/>
                    <rect x="6" y="44" width="68" height="4" rx="2" fill={pal.guide}/>
                  </g>
                </g>);
            })() : null}

            <Box x={HUB.x} y={-HUB.s / 2} w={HUB.s} d={HUB.s} h={HUB.h} pal={pal} top={mix(pal.hub, pal.hubHot, hubK)} sw={2}/>
            <polyline points={pts([
                [HC, 0, HUB.h],
                [HC, 0, 100 + bob],
            ])} stroke={pal.guide} strokeWidth="1.2" strokeDasharray="2 5" fill="none"/>
            <Hex cx={HC} cy={0} z={100 + bob} r={46} h={24} top={mix(pal.top, pal.hub, hubK)} stroke={mix(pal.line, pal.accent, hubK)}>
              <g transform="scale(1.2)">
                {ICON.review(hubK > 0.3 ? pal.accent : pal.line)}
              </g>
            </Hex>

            <Box x={MERGE.x} y={-MERGE.s / 2} w={MERGE.s} d={MERGE.s} h={MERGE.h} pal={pal} top={mix(pal.top, pal.okTop, mergeK)} stroke={mix(pal.line, pal.ok, mergeK)}>
              {ICON.check(mergeK > 0.5 ? pal.ok : pal.line)}
            </Box>

            {[
                [PROD.x + 30, -100, 'cloud'],
                [PROD.x + 140, -100, 'chart'],
                [PROD.x + 30, 10, 'apps'],
                [PROD.x + 140, 10, 'network'],
            ].map(([x, y, ic], i) => (<Box key={i} x={x} y={y} z={PROD.h} w={90} d={90} h={40} pal={pal} top={mix(pal.top, pal.okTop, prodOk * (i === 2 ? 1 : 0.3))} stroke={mix(pal.line, pal.ok, prodOk * (i === 2 ? 1 : 0.3))}>
                {ICON[ic](pal.line)}
              </Box>))}

            <Packet T={T} route={ENG_PR} a={cE + 0.3} b={cE + 1.0} color={pal.accent}/>
            <Packet T={T} route={PR_HUB} a={cR} b={cR + 0.5} color={pal.accent}/>
            <Packet T={T} route={TO_APP} a={cR + 0.5} b={cR + 1.0} color={pal.accent}/>
            <Packet T={T} route={TO_APP} a={cP - 0.5} b={cP} rev color={pal.alert}/>
            <Packet T={T} route={TO_NOTE} a={cP} b={cP + 0.5} color={pal.alert}/>
            <Packet T={T} route={NOTE_PR} a={cP + 0.5} b={cP + 0.85} color={pal.alert}/>
            <Packet T={T} route={ENG_PR} a={cX} b={cX + 0.4} color={pal.ok}/>
            <Packet T={T} route={PR_HUB} a={cX + 0.4} b={cX + 0.7} color={pal.ok}/>
            <Packet T={T} route={TO_APP} a={cX + 0.7} b={cX + 1.1} color={pal.ok}/>
            <Packet T={T} route={HUB_MERGE} a={cM} b={cM + 0.6} color={pal.ok}/>
            <Packet T={T} route={MERGE_PROD} a={cM + 0.6} b={cM + 1.2} color={pal.ok}/>

            {lensK > 0.02 ? (<g opacity={lensK} transform={`translate(${lens[0].toFixed(1)} ${lens[1].toFixed(1)})`}>
                <line x1="25" y1="25" x2="48" y2="48" stroke={pal.ink} strokeWidth="9" strokeLinecap="round"/>
                <circle r="34" fill={pal.accent} fillOpacity="0.12" stroke={pal.ink} strokeWidth="4"/>
                <circle r="27" fill="none" stroke={pal.bg} strokeWidth="2" opacity="0.7"/>
              </g>) : null}

            {CHANGES.map((c, i) => {
                const k = marks[i].k;
                if (k <= 0.02)
                    return null;
                const [bx, by] = onWall(oA, c.badge[0], c.badge[1]);
                return (<g key={i} transform={`translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${k})`}>
                  <circle r="14" fill={pal.accent} stroke={pal.bg} strokeWidth="2.5"/>
                  <text y="6" fontSize="17" fontWeight="700" textAnchor="middle" fill="#ffffff">
                    {i + 1}
                  </text>
                </g>);
            })}

            {ptrK > 0.02 ? (<g opacity={ptrK}>
                {click > 0 && click < 1 ? (<circle cx={ptrTo[0]} cy={ptrTo[1]} r={6 + 22 * click} fill="none" stroke={pal.ok} strokeWidth="2.4" opacity={1 - click}/>) : null}
                <path transform={`translate(${ptr[0].toFixed(1)} ${ptr[1].toFixed(1)})`} d="M0 0 L0 24 L6 18 L11 29 L16 27 L11 16 L19 16 Z" fill={pal.bg} stroke={pal.ink} strokeWidth="2" strokeLinejoin="round"/>
              </g>) : null}
            {flowOk > 0.02 ? (<g transform={`translate(${flowAt[0].toFixed(1)} ${flowAt[1].toFixed(1)}) scale(${flowOk})`}>
                <circle r="14" fill={pal.ok} stroke={pal.bg} strokeWidth="2.5"/>
                <g transform="scale(0.62)">{ICON.check('#ffffff')}</g>
              </g>) : null}

            <Label x={P(ENG.x, ENG.s / 2)[0]} y={P(ENG.x, ENG.s / 2)[1] + 50} text="ENGINEER" sub="Opens the change" anchor="middle"/>
            <Label x={P(PR.x, -PR.s / 2, PR.h)[0]} y={P(PR.x, -PR.s / 2, PR.h)[1] - 60} text="PULL REQUEST" sub="Your MR or PR" anchor="middle"/>
            <Label x={P(SLAB.x + SLAB.w, SLAB.y)[0] + 20} y={P(SLAB.x + SLAB.w, SLAB.y)[1] - 70} text="YOUR APP" sub="Both versions, side by side"/>
            <text x={P(SLAB.x + SLAB.w, SLAB.y)[0] + 20} y={P(SLAB.x + SLAB.w, SLAB.y)[1] - 10} fontSize="18" fill={pal.mut}>
              On a machine you connect
            </text>
            <Label x={P(HUB.x + HUB.s, HUB.s / 2)[0]} y={P(HUB.x + HUB.s, HUB.s / 2)[1] + 55} text="LOUPE" sub="Looks like a user would" anchor="middle"/>
            <Label x={P(NOTE.x + NOTE.s, NOTE.y + NOTE.s)[0]} y={P(NOTE.x + NOTE.s, NOTE.y + NOTE.s)[1] + 50} text="NOTE" sub="Screenshots on the PR" anchor="middle"/>
            <Label x={P(MERGE.x + MERGE.s / 2, MERGE.s / 2)[0]} y={P(MERGE.x + MERGE.s / 2, MERGE.s / 2)[1] + 50} text="MERGE" anchor="middle"/>
            <Label x={P(PROD.x + PROD.s, PROD.s / 2)[0]} y={P(PROD.x + PROD.s, PROD.s / 2)[1] + 50} text="PRODUCTION" sub="Ships the checked pages" anchor="middle"/>
          </g>

          {pills.map((p) => p.k > 0 ? (<g key={p.text} opacity={p.k} transform={`translate(1400 ${80 - 8 * (1 - p.k)})`}>
                <TextPill text={p.text} tone={p.tone}/>
              </g>) : null)}

          <StepPills steps={STEPS} T={T} fadeAt={cL + 0.3}/>
        </g>);
    }
    function LoupeStage({ className }) {
        return (<IsoMotionStage loop={LOOP} label="An engineer opens a pull request that changes the checkout page. Loupe runs the target branch and the change side by side on a machine you connect, opens the changed pages at desktop and mobile size, and walks the checkout flow. It numbers three visible changes against main and spots the Pay button overlapping the total on a phone. One note with screenshots goes on the pull request, the engineer fixes the layout, and the change merges to production." className={className} frame={(T) => <LoupeFrame T={T}/>}/>);
    }

    return LoupeStage;
  }, []);
  return (
    <div className={className ?? 'ct-iso-scene'}>
      <Stage className="ct-iso-svg" />
    </div>
  );
};
