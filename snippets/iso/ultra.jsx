/* Hand-written sibling of review.jsx: it reuses the generated iso kit verbatim.
 * There is no source scene in cloudthinker-landing-page; edit this file directly. */

export const UltraScene = ({ className }) => {
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
    const cE = 0;
    const cH = 1.6;
    const cVer = 5.4;
    const cPost = 7.8;
    const cX = 9.4;
    const cM = 10.8;
    const cL = 13.4;
    const STEPS = [
        ['Comment', cE],
        ['Hunt', cH],
        ['Verify', cVer],
        ['Post', cPost],
        ['Fix', cX],
        ['Merge', cM],
    ];
    const ENG = { x: -520, s: 100, h: 56 };
    const PR = { x: -300, s: 100, h: 44 };
    const HUB = { x: -70, s: 150, h: 36 };
    const MERGE = { x: 210, s: 90, h: 40 };
    const PROD = { x: 380, s: 260, h: 16 };
    const HC = HUB.x + HUB.s / 2;
    const BUS_Y = -150;
    const HS = 60;
    const SWARM = { x: HC - 230, y: -400, w: 400, d: 200, h: 12 };
    const HUNTERS = [
        { x: HC - 210, y: -380, at: 0, finds: true },
        { x: HC - 90, y: -380, at: 0.5, finds: false },
        { x: HC + 30, y: -380, at: 0.2, finds: false },
        { x: HC - 150, y: -280, at: 0.7, finds: true },
        { x: HC - 30, y: -280, at: 0.35, finds: false },
        { x: HC + 90, y: -280, at: 0.9, finds: true },
    ].map((h) => ({ ...h, at: cH + 0.4 + h.at }));
    const FOUND = HUNTERS.filter((h) => h.finds);
    const toHunter = (h) => {
        const cx = h.x + HS / 2;
        return [
            [HC, -HUB.s / 2],
            [HC, BUS_Y],
            [cx, BUS_Y],
            [cx, h.y + HS],
        ];
    };
    const VS = 70;
    const VER = { x: HC - 180, y: 170, w: 360, d: 110, h: 12 };
    const VERIFIERS = [0, 1, 2].map((i) => ({
        x: VER.x + 20 + i * 115,
        y: VER.y + 20,
        at: cVer + i * 0.4,
        ok: i < 2,
    }));
    const toVerifier = (v) => {
        const cx = v.x + VS / 2;
        return [
            [HC - 40, HUB.s / 2],
            [HC - 40, 125],
            [cx, 125],
            [cx, v.y],
        ];
    };
    const lane = (a, b) => [
        [a, 0],
        [b, 0],
    ];
    const ENG_PR = lane(ENG.x + ENG.s, PR.x);
    const PR_HUB = lane(PR.x + PR.s, HUB.x);
    const HUB_MERGE = lane(HUB.x + HUB.s, MERGE.x);
    const MERGE_PROD = lane(MERGE.x + MERGE.s, PROD.x);
    const BACK_TO_PR = [
        [HUB.x, -36],
        [PR.x + PR.s, -36],
    ];
    const bolt = (c) => (<g fill="none" stroke={c} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 -20 L-12 3 H1 L-4 20 L12 -3 H-1 Z"/>
      </g>);
    const found = (h) => h.at + 1.1;
    const FEED = [
        { who: 'Engineer', lines: [{ at: cE + 0.6, text: '@cloudthinker-ai review ultra' }] },
        {
            who: 'Hunters',
            tone: 'alert',
            lines: [
                { at: found(FOUND[0]), text: 'Callers: refund reads old field' },
                { at: found(FOUND[1]), text: 'Edge: empty cart, zero total' },
                { at: found(FOUND[2]), text: 'Failure: timeout retries charge' },
            ],
        },
        { who: 'Verifiers', tone: 'ok', lines: [{ at: cVer + 2.0, text: '2 bugs confirmed and posted' }] },
        { who: 'Check by hand', tone: 'note', lines: [{ at: cPost + 0.8, text: '3 notes in the summary' }] },
        { who: 'Engineer', tone: 'ok', lines: [{ at: cM + 0.4, text: 'Fixed and merged' }] },
    ];
    const FEED_Y = FEED.reduce((acc, f) => [...acc, acc[acc.length - 1] + 44 + 30 * f.lines.length], [80]);
    function UltraFrame({ T }) {
        const pal = useContext(PalContext);
        const out = 1 - enter(T, cL, cL + 0.8);
        const engK = Math.max(fade(T, cE, cE + 0.3, cE + 1.0, cE + 1.4), fade(T, cX, cX + 0.3, cX + 0.9, cX + 1.2));
        const prK = enter(T, cE + 0.8, cE + 1.1) * out;
        const prBad = enter(T, cPost + 0.6, cPost + 0.9) * (1 - enter(T, cX + 0.6, cX + 0.9));
        const prOk = enter(T, cX + 0.6, cX + 0.9) * out;
        const hubK = Math.max(fade(T, cH, cH + 0.2, cPost + 0.6, cPost + 1.0), fade(T, cM - 0.2, cM, cM + 0.6, cM + 0.9));
        const fixedK = enter(T, cX + 0.6, cX + 0.9);
        const swarmK = fade(T, cH + 0.3, cH + 0.6, cVer, cVer + 0.4);
        const hunt = HUNTERS.map((h) => ({
            k: fade(T, h.at, h.at + 0.2, h.at + 1.3, h.at + 1.6),
            phase: ((T - h.at) / 0.7) % 1,
            fail: h.finds ? enter(T, found(h), found(h) + 0.25) * (1 - fixedK) : 0,
            pass: h.finds ? fixedK * out : 0,
        }));
        const verK = fade(T, cVer, cVer + 0.3, cPost + 0.4, cPost + 0.8);
        const verdict = VERIFIERS.map((v) => {
            const arrive = enter(T, v.at + 0.45, v.at + 0.6) * out;
            const decide = enter(T, v.at + 0.9, v.at + 1.1);
            return {
                k: fade(T, v.at + 0.4, v.at + 0.55, v.at + 1.0, v.at + 1.3),
                arrive,
                sure: v.ok ? decide : 0,
                ok: v.ok ? decide * out : 0,
                no: v.ok ? 0 : decide * out,
            };
        });
        const checkK = pop(T, cM + 0.1, cM + 0.4) * out;
        const mergeK = enter(T, cM + 0.4, cM + 0.7) * out;
        const prodOk = enter(T, cM + 1.0, cM + 1.3) * out;
        const pills = [
            { k: fade(T, found(FOUND[2]) + 0.1, found(FOUND[2]) + 0.3, cVer + 0.9, cVer + 1.1), text: 'Hunters: 3 possible bugs', tone: pal.alert },
            { k: fade(T, cVer + 2.0, cVer + 2.2, cPost + 0.6, cPost + 0.8), text: 'Verifiers: 2 bugs confirmed', tone: pal.ok },
            { k: fade(T, cPost + 0.8, cPost + 1.0, cX + 0.9, cX + 1.1), text: '2 comments posted, 3 notes kept', tone: pal.accent },
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
        const toneOf = (t) => t === 'alert'
            ? pal.alert
            : t === 'ok'
                ? pal.ok
                : t === 'note'
                    ? pal.guide
                    : pal.accent;
        return (<g>
          <g transform="translate(80 150)">
            <Label x={0} y={0} text="PULL REQUEST" sub="#517, checkout"/>
            {FEED.map((f, i) => {
                const hide = 1 - enter(T, cL, cL + 0.6);
                const k = enter(T, f.lines[0].at, f.lines[0].at + 0.35) * hide;
                if (k <= 0)
                    return null;
                return (<g key={f.who + i} opacity={k} transform={`translate(${-12 * (1 - k)} ${FEED_Y[i]})`}>
                  <circle cx="7" cy="-7" r="6" fill={toneOf(f.tone)}/>
                  <text x="26" y="0" fontSize="20" fontWeight="600" fill={pal.ink}>
                    {f.who}
                  </text>
                  {f.lines.map((l, j) => (<text key={l.text} x="26" y={30 * (j + 1)} fontSize="20" fill={pal.mut} opacity={enter(T, l.at, l.at + 0.35)}>
                      {l.text}
                    </text>))}
                </g>);
            })}
          </g>

          <g transform="translate(120 150)">
            <Box x={PROD.x} y={-PROD.s / 2} w={PROD.s} d={PROD.s} h={PROD.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.okTop, prodOk * 0.6)} stroke={mix(pal.line, pal.ok, prodOk)}/>

            <Wire route={ENG_PR} hot={engK} color={pal.accent}/>
            <Wire route={PR_HUB} hot={fade(T, cE + 1.0, cE + 1.15, cH, cH + 0.2)} color={pal.accent}/>
            {HUNTERS.map((h, i) => (<Wire key={i} route={toHunter(h)} hot={hunt[i].k} color={pal.accent}/>))}
            {VERIFIERS.map((v, i) => (<Wire key={i} route={toVerifier(v)} hot={verdict[i].k} color={pal.accent}/>))}
            <Wire route={BACK_TO_PR} hot={fade(T, cPost, cPost + 0.15, cPost + 0.7, cPost + 0.9)} color={pal.alert}/>
            <Wire route={HUB_MERGE} hot={fade(T, cM, cM + 0.15, cM + 0.8, cM + 1.0)} color={pal.ok}/>
            <Wire route={MERGE_PROD} hot={fade(T, cM + 0.5, cM + 0.65, cM + 1.2, cM + 1.4)} color={pal.ok}/>

            <Box x={SWARM.x} y={SWARM.y} w={SWARM.w} d={SWARM.d} h={SWARM.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, swarmK * 0.5)} stroke={mix(pal.line, pal.accent, swarmK)}/>
            {HUNTERS.map((h, i) => {
                const s = hunt[i];
                const top = mix(mix(mix(pal.top, pal.hub, s.k), pal.alertTop, s.fail), pal.okTop, s.pass * 0.8);
                const stroke = mix(mix(mix(pal.line, pal.accent, s.k), pal.alert, s.fail), pal.ok, s.pass);
                const ic = s.fail > 0.5
                    ? pal.alert
                    : s.pass > 0.5
                        ? pal.ok
                        : s.k > 0.3
                            ? pal.accent
                            : pal.line;
                return (<Box key={i} x={h.x} y={h.y} z={SWARM.h} w={HS} d={HS} h={30} pal={pal} top={top} stroke={stroke}>
                    {s.k > 0.05 && s.phase >= 0 ? (<circle r={10 + 22 * s.phase} fill="none" stroke={pal.accent} strokeWidth="2.4" opacity={s.k * (1 - s.phase)}/>) : null}
                    <g transform="scale(0.85)">{ICON.resolve(ic)}</g>
                  </Box>);
            })}

            <Box x={ENG.x} y={-ENG.s / 2} w={ENG.s} d={ENG.s} h={ENG.h} pal={pal} top={mix(mix(pal.top, pal.hub, engK), pal.okTop, checkK)} stroke={mix(pal.line, pal.accent, engK)}>
              {ICON.people(engK > 0.3 ? pal.accent : pal.line)}
            </Box>
            {checkK > 0.02
                ? (() => {
                    const [sx, sy] = P(ENG.x + ENG.s, -ENG.s / 2, ENG.h);
                    return (<g transform={`translate(${sx + 10} ${sy - 30}) scale(${checkK})`}>
                      <circle r="20" fill={pal.ok}/>
                      <g transform="scale(0.8)">{ICON.check('#ffffff')}</g>
                    </g>);
                })()
                : null}
            <Box x={PR.x} y={-PR.s / 2} w={PR.s} d={PR.s} h={PR.h} pal={pal} top={prTop} stroke={prStroke}>
              {ICON.code(prIcon)}
            </Box>

            <Box x={HUB.x} y={-HUB.s / 2} w={HUB.s} d={HUB.s} h={HUB.h} pal={pal} top={mix(pal.hub, pal.hubHot, hubK)} sw={2}/>
            <polyline points={pts([
                [HC, 0, HUB.h],
                [HC, 0, 100 + bob],
            ])} stroke={pal.guide} strokeWidth="1.2" strokeDasharray="2 5" fill="none"/>
            <Hex cx={HC} cy={0} z={100 + bob} r={46} h={24} top={mix(pal.top, pal.hub, hubK)} stroke={mix(pal.line, pal.accent, hubK)}>
              <g transform="scale(1.2)">
                {bolt(hubK > 0.3 ? pal.accent : pal.line)}
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

            <Box x={VER.x} y={VER.y} w={VER.w} d={VER.d} h={VER.h} pal={{ ...pal, left: pal.pleft, right: pal.pright }} top={mix(pal.ptop, pal.hub, verK * 0.5)} stroke={mix(pal.line, pal.accent, verK)}/>
            {VERIFIERS.map((v, i) => {
                const d = verdict[i];
                const top = mix(mix(pal.top, pal.hub, d.k), pal.okTop, d.ok * 0.8);
                const stroke = mix(mix(mix(pal.line, pal.accent, d.k), pal.ok, d.ok), pal.guide, d.no);
                const ic = d.ok > 0.5 ? pal.ok : d.k > 0.3 ? pal.accent : pal.line;
                const tz = VER.h + 40 + 34 + bob * 0.6;
                const tx = v.x + VS / 2;
                const ty = v.y + VS / 2;
                const ts = 14;
                const tokenColor = mix(pal.alert, pal.ok, d.sure);
                return (<g key={i}>
                  <Box x={v.x} y={v.y} z={VER.h} w={VS} d={VS} h={40} pal={pal} top={top} stroke={stroke}>
                    {d.ok > 0.5 ? ICON.check(ic) : ICON.review(ic)}
                  </Box>
                  {d.arrive > 0.02 && d.no < 0.5 ? (<Box x={tx - ts} y={ty - ts} z={tz} w={ts * 2} d={ts * 2} h={14} op={d.arrive} pal={{
                            line: pal.line,
                            top: tokenColor,
                            left: mix(tokenColor, '#000000', 0.15),
                            right: mix(tokenColor, '#000000', 0.3),
                        }} top={tokenColor} stroke={mix(tokenColor, '#000000', 0.35)} sw={1}/>) : null}
                  {d.no > 0.02 ? (<polygon points={pts([
                            [tx - ts, ty - ts, tz + 14],
                            [tx + ts, ty - ts, tz + 14],
                            [tx + ts, ty + ts, tz + 14],
                            [tx - ts, ty + ts, tz + 14],
                        ])} fill="none" stroke={pal.guide} strokeWidth="2.4" strokeDasharray="5 4" opacity={d.no}/>) : null}
                  {d.no > 0.02
                    ? (() => {
                        const [lx, ly] = P(tx + ts, ty, tz + 14);
                        return (<text x={lx + 14} y={ly + 6} fontSize="18" fontWeight="600" fill={pal.mut} opacity={d.no}>
                          Check by hand
                        </text>);
                    })()
                    : null}
                </g>);
            })}

            <Packet T={T} route={ENG_PR} a={cE + 0.3} b={cE + 1.0} color={pal.accent}/>
            <Packet T={T} route={PR_HUB} a={cE + 1.0} b={cH} color={pal.accent}/>
            {HUNTERS.map((h, i) => (<Packet key={'out' + i} T={T} route={toHunter(h)} a={h.at - 0.5} b={h.at} color={pal.accent}/>))}
            {FOUND.map((h, i) => (<Packet key={'back' + i} T={T} route={toHunter(h)} a={found(h) + 0.2} b={found(h) + 0.7} rev color={pal.alert}/>))}
            {VERIFIERS.map((v, i) => (<Packet key={'ver' + i} T={T} route={toVerifier(v)} a={v.at} b={v.at + 0.5} color={pal.alert}/>))}
            {VERIFIERS.filter((v) => v.ok).map((v, i) => (<Packet key={'okv' + i} T={T} route={toVerifier(v)} a={cPost - 0.6} b={cPost} rev color={pal.ok}/>))}
            <Packet T={T} route={BACK_TO_PR} a={cPost} b={cPost + 0.6} color={pal.alert}/>
            <Packet T={T} route={ENG_PR} a={cX} b={cX + 0.6} color={pal.ok}/>
            <Packet T={T} route={PR_HUB} a={cM - 0.6} b={cM} color={pal.ok}/>
            <Packet T={T} route={HUB_MERGE} a={cM} b={cM + 0.6} color={pal.ok}/>
            <Packet T={T} route={MERGE_PROD} a={cM + 0.6} b={cM + 1.2} color={pal.ok}/>

            <Label x={P(ENG.x, ENG.s / 2)[0]} y={P(ENG.x, ENG.s / 2)[1] + 50} text="ENGINEER" sub="Asks for Ultra" anchor="middle"/>
            <Label x={P(PR.x, -PR.s / 2, PR.h)[0]} y={P(PR.x, -PR.s / 2, PR.h)[1] - 60} text="PULL REQUEST" sub="One MR or PR" anchor="middle"/>
            <Label x={P(SWARM.x + SWARM.w + 20, SWARM.y)[0] + 30} y={P(SWARM.x + SWARM.w + 20, SWARM.y)[1] + 30} text="HUNTERS" sub="A swarm hunts from every angle"/>
            <Label x={P(VER.x + VER.w, VER.y + VER.d)[0]} y={P(VER.x + VER.w, VER.y + VER.d)[1] + 50} text="VERIFIERS" sub="Confirm each bug before it posts" anchor="middle"/>
            <Label x={P(MERGE.x + MERGE.s / 2, MERGE.s / 2)[0]} y={P(MERGE.x + MERGE.s / 2, MERGE.s / 2)[1] + 50} text="MERGE" anchor="middle"/>
            <Label x={P(PROD.x + PROD.s, PROD.s / 2)[0]} y={P(PROD.x + PROD.s, PROD.s / 2)[1] + 50} text="PRODUCTION" sub="Ships with the fixes" anchor="middle"/>
          </g>

          {pills.map((p) => p.k > 0 ? (<g key={p.text} opacity={p.k} transform={`translate(1400 ${80 - 8 * (1 - p.k)})`}>
                <TextPill text={p.text} tone={p.tone}/>
              </g>) : null)}

          <StepPills steps={STEPS} T={T} fadeAt={cL + 0.3}/>
        </g>);
    }
    function UltraStage({ className }) {
        return (<IsoMotionStage loop={LOOP} label="An engineer comments @cloudthinker-ai review ultra on a pull request. A swarm of hunters searches the change from every angle: callers, edge-case inputs and failure modes. Verifiers confirm each bug before it posts. Confirmed bugs go on the pull request as comments, and the rest stay in the summary to check by hand. The engineer fixes the bugs and the change merges to production." className={className} frame={(T) => <UltraFrame T={T}/>}/>);
    }

    return UltraStage;
  }, []);
  return (
    <div className={className ?? 'ct-iso-scene'}>
      <Stage className="ct-iso-svg" />
    </div>
  );
};
