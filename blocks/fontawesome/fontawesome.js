/*!
 * Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2024 Fonticons, Inc.
 */
!(function () {
  var t = () => { }; let e = {}; let a = {}; let n = null; let
    r = { mark: t, measure: t }; try { typeof window !== 'undefined' && (e = window), typeof document !== 'undefined' && (a = document), typeof MutationObserver !== 'undefined' && (n = MutationObserver), typeof performance !== 'undefined' && (r = performance); } catch (t) { } const { userAgent: i = '' } = e.navigator || {}; const k = e; const w = a; const
    c = n; let o = r; const s = !!k.document; const f = !!w.documentElement && !!w.head && typeof w.addEventListener === 'function' && typeof w.createElement === 'function'; const
    u = ~i.indexOf('MSIE') || ~i.indexOf('Trident/'); const l = 'classic';
  const m = 'duotone';
  const d = 'sharp';
  const p = 'sharp-duotone';
  const h = [l, m, d, p];
  const g = { fak: 'kit', 'fa-kit': 'kit' };
  const b = { fakd: 'kit-duotone', 'fa-kit-duotone': 'kit-duotone' };
  const v = {
    classic: {
      fa: 'solid', fas: 'solid', 'fa-solid': 'solid', far: 'regular', 'fa-regular': 'regular', fal: 'light', 'fa-light': 'light', fat: 'thin', 'fa-thin': 'thin', fad: 'duotone', 'fa-duotone': 'duotone', fab: 'brands', 'fa-brands': 'brands',
    },
    sharp: {
      fa: 'solid', fass: 'solid', 'fa-solid': 'solid', fasr: 'regular', 'fa-regular': 'regular', fasl: 'light', 'fa-light': 'light', fast: 'thin', 'fa-thin': 'thin',
    },
    'sharp-duotone': { fa: 'solid', fasds: 'solid', 'fa-solid': 'solid' },
  };
  var y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var x = y.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  let A = {
    GROUP: 'duotone-group', SWAP_OPACITY: 'swap-opacity', PRIMARY: 'primary', SECONDARY: 'secondary',
  };
  let N = [...Object.keys({ classic: ['fas', 'far', 'fal', 'fat'], sharp: ['fass', 'fasr', 'fasl', 'fast'], 'sharp-duotone': ['fasds'] }), 'solid', 'regular', 'light', 'thin', 'duotone', 'brands', '2xs', 'xs', 'sm', 'lg', 'xl', '2xl', 'beat', 'border', 'fade', 'beat-fade', 'bounce', 'flip-both', 'flip-horizontal', 'flip-vertical', 'flip', 'fw', 'inverse', 'layers-counter', 'layers-text', 'layers', 'li', 'pull-left', 'pull-right', 'pulse', 'rotate-180', 'rotate-270', 'rotate-90', 'rotate-by', 'shake', 'spin-pulse', 'spin-reverse', 'spin', 'stack-1x', 'stack-2x', 'stack', 'ul', A.GROUP, A.SWAP_OPACITY, A.PRIMARY, A.SECONDARY].concat(y.map((t) => ''.concat(t, 'x'))).concat(x.map((t) => 'w-'.concat(t)));
  var t = { kit: 'fak' };
  var y = { 'kit-duotone': 'fakd' };
  var x = '___FONT_AWESOME___'; const O = 16; const P = 'svg-inline--fa'; const C = 'data-fa-i2svg'; const S = 'data-fa-pseudo-element'; const E = 'data-fa-pseudo-element-pending'; const M = 'data-prefix'; const z = 'data-icon'; const j = 'fontawesome-i2svg'; const F = 'async'; const L = ['HTML', 'HEAD', 'STYLE', 'SCRIPT']; const R = (() => { try { return !0; } catch (t) { return !1; } })(); const
    I = [l, d, p]; function D(t) { return new Proxy(t, { get(t, e) { return e in t ? t[e] : t[l]; } }); } const T = { ...v }; T[l] = { ...v[l], ...g, ...b }; const Y = D(T); const
    H = {
      classic: {
        solid: 'fas', regular: 'far', light: 'fal', thin: 'fat', duotone: 'fad', brands: 'fab',
      },
      sharp: {
        solid: 'fass', regular: 'fasr', light: 'fasl', thin: 'fast',
      },
      'sharp-duotone': { solid: 'fasds' },
    }; H[l] = { ...H[l], ...t, ...y }; const W = D(H); const
    _ = {
      classic: {
        fab: 'fa-brands', fad: 'fa-duotone', fal: 'fa-light', far: 'fa-regular', fas: 'fa-solid', fat: 'fa-thin',
      },
      sharp: {
        fass: 'fa-solid', fasr: 'fa-regular', fasl: 'fa-light', fast: 'fa-thin',
      },
      'sharp-duotone': { fasds: 'fa-solid' },
    }; _[l] = { ..._[l], fak: 'fa-kit' }; const B = D(_); const
    U = {
      classic: {
        'fa-brands': 'fab', 'fa-duotone': 'fad', 'fa-light': 'fal', 'fa-regular': 'far', 'fa-solid': 'fas', 'fa-thin': 'fat',
      },
      sharp: {
        'fa-solid': 'fass', 'fa-regular': 'fasr', 'fa-light': 'fasl', 'fa-thin': 'fast',
      },
      'sharp-duotone': { 'fa-solid': 'fasds' },
    }; U[l] = { ...U[l], 'fa-kit': 'fak' }; const X = D(U); const q = /fa(s|r|l|t|d|b|k|kd|ss|sr|sl|st|sds)?[\-\ ]/; const V = 'fa-layers-text'; const
    G = /Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i; D({
    classic: {
      900: 'fas', 400: 'far', normal: 'far', 300: 'fal', 100: 'fat',
    },
    sharp: {
      900: 'fass', 400: 'fasr', 300: 'fasl', 100: 'fast',
    },
    'sharp-duotone': { 900: 'fasds' },
  }); const K = ['class', 'data-prefix', 'data-icon', 'data-fa-transform', 'data-fa-mask']; const J = A; const
    Q = new Set(); Object.keys(W[l]).map(Q.add.bind(Q)), Object.keys(W[d]).map(Q.add.bind(Q)), Object.keys(W[p]).map(Q.add.bind(Q)); const Z = ['kit', ...N]; const
    $ = k.FontAwesomeConfig || {}; if (w && typeof w.querySelector === 'function') {
    const Ve = [['data-family-prefix', 'familyPrefix'], ['data-css-prefix', 'cssPrefix'], ['data-family-default', 'familyDefault'], ['data-style-default', 'styleDefault'], ['data-replacement-class', 'replacementClass'], ['data-auto-replace-svg', 'autoReplaceSvg'], ['data-auto-add-css', 'autoAddCss'], ['data-auto-a11y', 'autoA11y'], ['data-search-pseudo-elements', 'searchPseudoElements'], ['data-observe-mutations', 'observeMutations'], ['data-mutate-approach', 'mutateApproach'], ['data-keep-original-source', 'keepOriginalSource'], ['data-measure-performance', 'measurePerformance'], ['data-show-missing-icons', 'showMissingIcons']]; Ve.forEach((t) => {
      var [e, t] = t; var
        e = (e = (function (t) { const e = w.querySelector(`script[${t}]`); if (e) return e.getAttribute(t); }(e))) === '' || e !== 'false' && (e === 'true' || e); e != null && ($[t] = e);
    });
  } y = {
    styleDefault: 'solid', familyDefault: 'classic', cssPrefix: 'fa', replacementClass: P, autoReplaceSvg: !0, autoAddCss: !0, autoA11y: !0, searchPseudoElements: !1, observeMutations: !0, mutateApproach: 'async', keepOriginalSource: !0, measurePerformance: !1, showMissingIcons: !0,
  }; $.familyPrefix && ($.cssPrefix = $.familyPrefix); const tt = { ...y, ...$ }; tt.autoReplaceSvg || (tt.observeMutations = !1); const et = {}; Object.keys(y).forEach((e) => { Object.defineProperty(et, e, { enumerable: !0, set(t) { tt[e] = t, at.forEach((t) => t(et)); }, get() { return tt[e]; } }); }), Object.defineProperty(et, 'familyPrefix', { enumerable: !0, set(t) { tt.cssPrefix = t, at.forEach((t) => t(et)); }, get() { return tt.cssPrefix; } }), k.FontAwesomeConfig = et; const at = []; const nt = O; const
    rt = {
      size: 16, x: 0, y: 0, rotate: 0, flipX: !1, flipY: !1,
    }; const it = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; function ot() {
    let t = 12; let
      e = ''; for (; t-- > 0;)e += it[62 * Math.random() | 0]; return e;
  } function st(e) { const a = []; for (let t = (e || []).length >>> 0; t--;)a[t] = e[t]; return a; } function ct(t) { return t.classList ? st(t.classList) : (t.getAttribute('class') || '').split(' ').filter((t) => t); } function lt(t) {
    return ''.concat(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } function ft(a) { return Object.keys(a || {}).reduce((t, e) => t + ''.concat(e, ': ').concat(a[e].trim(), ';'), ''); } function ut(t) { return t.size !== rt.size || t.x !== rt.x || t.y !== rt.y || t.rotate !== rt.rotate || t.flipX || t.flipY; } function mt() {
    let t; let e; let a = P; const n = et.cssPrefix; const
      r = et.replacementClass; let i = ':host,:root{--fa-font-solid:normal 900 1em/1 "Font Awesome 6 Free";--fa-font-regular:normal 400 1em/1 "Font Awesome 6 Free";--fa-font-light:normal 300 1em/1 "Font Awesome 6 Pro";--fa-font-thin:normal 100 1em/1 "Font Awesome 6 Pro";--fa-font-duotone:normal 900 1em/1 "Font Awesome 6 Duotone";--fa-font-brands:normal 400 1em/1 "Font Awesome 6 Brands";--fa-font-sharp-solid:normal 900 1em/1 "Font Awesome 6 Sharp";--fa-font-sharp-regular:normal 400 1em/1 "Font Awesome 6 Sharp";--fa-font-sharp-light:normal 300 1em/1 "Font Awesome 6 Sharp";--fa-font-sharp-thin:normal 100 1em/1 "Font Awesome 6 Sharp";--fa-font-sharp-duotone-solid:normal 900 1em/1 "Font Awesome 6 Sharp Duotone"}svg:not(:host).svg-inline--fa,svg:not(:root).svg-inline--fa{overflow:visible;box-sizing:content-box}.svg-inline--fa{display:var(--fa-display,inline-block);height:1em;overflow:visible;vertical-align:-.125em}.svg-inline--fa.fa-2xs{vertical-align:.1em}.svg-inline--fa.fa-xs{vertical-align:0}.svg-inline--fa.fa-sm{vertical-align:-.0714285705em}.svg-inline--fa.fa-lg{vertical-align:-.2em}.svg-inline--fa.fa-xl{vertical-align:-.25em}.svg-inline--fa.fa-2xl{vertical-align:-.3125em}.svg-inline--fa.fa-pull-left{margin-right:var(--fa-pull-margin,.3em);width:auto}.svg-inline--fa.fa-pull-right{margin-left:var(--fa-pull-margin,.3em);width:auto}.svg-inline--fa.fa-li{width:var(--fa-li-width,2em);top:.25em}.svg-inline--fa.fa-fw{width:var(--fa-fw-width,1.25em)}.fa-layers svg.svg-inline--fa{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0}.fa-layers-counter,.fa-layers-text{display:inline-block;position:absolute;text-align:center}.fa-layers{display:inline-block;height:1em;position:relative;text-align:center;vertical-align:-.125em;width:1em}.fa-layers svg.svg-inline--fa{transform-origin:center center}.fa-layers-text{left:50%;top:50%;transform:translate(-50%,-50%);transform-origin:center center}.fa-layers-counter{background-color:var(--fa-counter-background-color,#ff253a);border-radius:var(--fa-counter-border-radius,1em);box-sizing:border-box;color:var(--fa-inverse,#fff);line-height:var(--fa-counter-line-height,1);max-width:var(--fa-counter-max-width,5em);min-width:var(--fa-counter-min-width,1.5em);overflow:hidden;padding:var(--fa-counter-padding,.25em .5em);right:var(--fa-right,0);text-overflow:ellipsis;top:var(--fa-top,0);transform:scale(var(--fa-counter-scale,.25));transform-origin:top right}.fa-layers-bottom-right{bottom:var(--fa-bottom,0);right:var(--fa-right,0);top:auto;transform:scale(var(--fa-layers-scale,.25));transform-origin:bottom right}.fa-layers-bottom-left{bottom:var(--fa-bottom,0);left:var(--fa-left,0);right:auto;top:auto;transform:scale(var(--fa-layers-scale,.25));transform-origin:bottom left}.fa-layers-top-right{top:var(--fa-top,0);right:var(--fa-right,0);transform:scale(var(--fa-layers-scale,.25));transform-origin:top right}.fa-layers-top-left{left:var(--fa-left,0);right:auto;top:var(--fa-top,0);transform:scale(var(--fa-layers-scale,.25));transform-origin:top left}.fa-1x{font-size:1em}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-6x{font-size:6em}.fa-7x{font-size:7em}.fa-8x{font-size:8em}.fa-9x{font-size:9em}.fa-10x{font-size:10em}.fa-2xs{font-size:.625em;line-height:.1em;vertical-align:.225em}.fa-xs{font-size:.75em;line-height:.0833333337em;vertical-align:.125em}.fa-sm{font-size:.875em;line-height:.0714285718em;vertical-align:.0535714295em}.fa-lg{font-size:1.25em;line-height:.05em;vertical-align:-.075em}.fa-xl{font-size:1.5em;line-height:.0416666682em;vertical-align:-.125em}.fa-2xl{font-size:2em;line-height:.03125em;vertical-align:-.1875em}.fa-fw{text-align:center;width:1.25em}.fa-ul{list-style-type:none;margin-left:var(--fa-li-margin,2.5em);padding-left:0}.fa-ul>li{position:relative}.fa-li{left:calc(-1 * var(--fa-li-width,2em));position:absolute;text-align:center;width:var(--fa-li-width,2em);line-height:inherit}.fa-border{border-color:var(--fa-border-color,#eee);border-radius:var(--fa-border-radius,.1em);border-style:var(--fa-border-style,solid);border-width:var(--fa-border-width,.08em);padding:var(--fa-border-padding,.2em .25em .15em)}.fa-pull-left{float:left;margin-right:var(--fa-pull-margin,.3em)}.fa-pull-right{float:right;margin-left:var(--fa-pull-margin,.3em)}.fa-beat{animation-name:fa-beat;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,ease-in-out)}.fa-bounce{animation-name:fa-bounce;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,cubic-bezier(.28,.84,.42,1))}.fa-fade{animation-name:fa-fade;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,cubic-bezier(.4,0,.6,1))}.fa-beat-fade{animation-name:fa-beat-fade;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,cubic-bezier(.4,0,.6,1))}.fa-flip{animation-name:fa-flip;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,ease-in-out)}.fa-shake{animation-name:fa-shake;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,linear)}.fa-spin{animation-name:fa-spin;animation-delay:var(--fa-animation-delay,0s);animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,2s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,linear)}.fa-spin-reverse{--fa-animation-direction:reverse}.fa-pulse,.fa-spin-pulse{animation-name:fa-spin;animation-direction:var(--fa-animation-direction,normal);animation-duration:var(--fa-animation-duration,1s);animation-iteration-count:var(--fa-animation-iteration-count,infinite);animation-timing-function:var(--fa-animation-timing,steps(8))}@media (prefers-reduced-motion:reduce){.fa-beat,.fa-beat-fade,.fa-bounce,.fa-fade,.fa-flip,.fa-pulse,.fa-shake,.fa-spin,.fa-spin-pulse{animation-delay:-1ms;animation-duration:1ms;animation-iteration-count:1;transition-delay:0s;transition-duration:0s}}@keyframes fa-beat{0%,90%{transform:scale(1)}45%{transform:scale(var(--fa-beat-scale,1.25))}}@keyframes fa-bounce{0%{transform:scale(1,1) translateY(0)}10%{transform:scale(var(--fa-bounce-start-scale-x,1.1),var(--fa-bounce-start-scale-y,.9)) translateY(0)}30%{transform:scale(var(--fa-bounce-jump-scale-x,.9),var(--fa-bounce-jump-scale-y,1.1)) translateY(var(--fa-bounce-height,-.5em))}50%{transform:scale(var(--fa-bounce-land-scale-x,1.05),var(--fa-bounce-land-scale-y,.95)) translateY(0)}57%{transform:scale(1,1) translateY(var(--fa-bounce-rebound,-.125em))}64%{transform:scale(1,1) translateY(0)}100%{transform:scale(1,1) translateY(0)}}@keyframes fa-fade{50%{opacity:var(--fa-fade-opacity,.4)}}@keyframes fa-beat-fade{0%,100%{opacity:var(--fa-beat-fade-opacity,.4);transform:scale(1)}50%{opacity:1;transform:scale(var(--fa-beat-fade-scale,1.125))}}@keyframes fa-flip{50%{transform:rotate3d(var(--fa-flip-x,0),var(--fa-flip-y,1),var(--fa-flip-z,0),var(--fa-flip-angle,-180deg))}}@keyframes fa-shake{0%{transform:rotate(-15deg)}4%{transform:rotate(15deg)}24%,8%{transform:rotate(-18deg)}12%,28%{transform:rotate(18deg)}16%{transform:rotate(-22deg)}20%{transform:rotate(22deg)}32%{transform:rotate(-12deg)}36%{transform:rotate(12deg)}100%,40%{transform:rotate(0)}}@keyframes fa-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.fa-rotate-90{transform:rotate(90deg)}.fa-rotate-180{transform:rotate(180deg)}.fa-rotate-270{transform:rotate(270deg)}.fa-flip-horizontal{transform:scale(-1,1)}.fa-flip-vertical{transform:scale(1,-1)}.fa-flip-both,.fa-flip-horizontal.fa-flip-vertical{transform:scale(-1,-1)}.fa-rotate-by{transform:rotate(var(--fa-rotate-angle,0))}.fa-stack{display:inline-block;vertical-align:middle;height:2em;position:relative;width:2.5em}.fa-stack-1x,.fa-stack-2x{bottom:0;left:0;margin:auto;position:absolute;right:0;top:0;z-index:var(--fa-stack-z-index,auto)}.svg-inline--fa.fa-stack-1x{height:1em;width:1.25em}.svg-inline--fa.fa-stack-2x{height:2em;width:2.5em}.fa-inverse{color:var(--fa-inverse,#fff)}.fa-sr-only,.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.fa-sr-only-focusable:not(:focus),.sr-only-focusable:not(:focus){position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.svg-inline--fa .fa-primary{fill:var(--fa-primary-color,currentColor);opacity:var(--fa-primary-opacity,1)}.svg-inline--fa .fa-secondary{fill:var(--fa-secondary-color,currentColor);opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-primary{opacity:var(--fa-secondary-opacity,.4)}.svg-inline--fa.fa-swap-opacity .fa-secondary{opacity:var(--fa-primary-opacity,1)}.svg-inline--fa mask .fa-primary,.svg-inline--fa mask .fa-secondary{fill:#000}.fa-duotone.fa-inverse,.fad.fa-inverse{color:var(--fa-inverse,#fff)}'; return n === 'fa' && r === a || (t = new RegExp('\\.'.concat('fa', '\\-'), 'g'), e = new RegExp('\\--'.concat('fa', '\\-'), 'g'), a = new RegExp('\\.'.concat(a), 'g'), i = i.replace(t, '.'.concat(n, '-')).replace(e, '--'.concat(n, '-')).replace(a, '.'.concat(r))), i;
  } let dt = !1; function pt() { et.autoAddCss && !dt && ((function (t) { if (t && f) { const r = w.createElement('style'); r.setAttribute('type', 'text/css'), r.innerHTML = t; const a = w.head.childNodes; let e = null; for (let t = a.length - 1; t > -1; t--) { const i = a[t]; const n = (i.tagName || '').toUpperCase(); ['STYLE', 'LINK'].indexOf(n) > -1 && (e = i); } w.head.insertBefore(r, e); } }(mt())), dt = !0); } A = { mixout() { return { dom: { css: mt, insertCss: pt } }; }, hooks() { return { beforeDOMElementCreation() { pt(); }, beforeI2svg() { pt(); } }; } }; const ht = k || {}; ht[x] || (ht[x] = {}), ht[x].styles || (ht[x].styles = {}), ht[x].hooks || (ht[x].hooks = {}), ht[x].shims || (ht[x].shims = []); const gt = ht[x]; function bt() { w.removeEventListener('DOMContentLoaded', bt), yt = 1, vt.map((t) => t()); } const vt = []; let yt = !1; function xt(t) { f && (yt ? setTimeout(t, 0) : vt.push(t)); } function kt(t) { const { tag: e, attributes: a = {}, children: n = [] } = t; return typeof t === 'string' ? lt(t) : '<'.concat(e, ' ').concat((r = a, Object.keys(r || {}).reduce((t, e) => t + ''.concat(e, '="').concat(lt(r[e]), '" '), '').trim()), '>').concat(n.map(kt).join(''), '</').concat(e, '>'); let r; } function wt(t, e, a) { if (t && t[e] && t[e][a]) return { prefix: e, iconName: a, icon: t[e][a] }; } f && (yt = (w.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(w.readyState), yt || w.addEventListener('DOMContentLoaded', bt)); function At(t, e, a, n) { for (var r, i, o = Object.keys(t), s = o.length, c = void 0 !== n ? Nt(e, n) : e, l = void 0 === a ? (r = 1, t[o[0]]) : (r = 0, a); r < s; r++)l = c(l, t[i = o[r]], i, t); return l; } var Nt = function (r, i) { return function (t, e, a, n) { return r.call(i, t, e, a, n); }; }; function Ot(t) {
    const e = (function (t) {
      const e = []; let a = 0; for (let n = t.length; a < n;) {
        var r; const
          i = t.charCodeAt(a++); i >= 55296 && i <= 56319 && a < n ? (64512 & (r = t.charCodeAt(a++))) == 56320 ? e.push(((1023 & i) << 10) + (1023 & r) + 65536) : (e.push(i), a--) : e.push(i);
      } return e;
    }(t)); return e.length === 1 ? e[0].toString(16) : null;
  } function Pt(n) { return Object.keys(n).reduce((t, e) => { const a = n[e]; return a.icon ? t[a.iconName] = a.icon : t[e] = a, t; }, {}); } function Ct(t, e, a) {
    const { skipHooks: n = !1 } = arguments.length > 2 && void 0 !== a ? a : {}; var
      a = Pt(e); typeof gt.hooks.addPack !== 'function' || n ? gt.styles[t] = { ...gt.styles[t] || {}, ...a } : gt.hooks.addPack(t, Pt(e)), t === 'fas' && Ct('fa', e);
  } const { styles: St, shims: Et } = gt; const
    Mt = { classic: Object.values(B[l]), sharp: Object.values(B[d]), 'sharp-duotone': Object.values(B[p]) }; let zt = null; let jt = {}; let Ft = {}; let Lt = {}; let Rt = {}; let
    It = {}; const Dt = { classic: Object.keys(Y[l]), sharp: Object.keys(Y[d]), 'sharp-duotone': Object.keys(Y[p]) }; function Tt(t, e) {
    const a = e.split('-'); const n = a[0]; var
      e = a.slice(1).join('-'); return n !== t || e === '' || (t = e, ~Z.indexOf(t)) ? null : e;
  } const Yt = () => { let t = (n) => At(St, (t, e, a) => (t[a] = At(e, n, {}), t), {}); jt = t((e, t, a) => { if (t[3] && (e[t[3]] = a), t[2]) { const n = t[2].filter((t) => typeof t === 'number'); n.forEach((t) => { e[t.toString(16)] = a; }); } return e; }), Ft = t((e, t, a) => { if (e[a] = a, t[2]) { const n = t[2].filter((t) => typeof t === 'string'); n.forEach((t) => { e[t] = a; }); } return e; }), It = t((e, t, a) => { const n = t[2]; return e[a] = a, n.forEach((t) => { e[t] = a; }), e; }); const r = 'far' in St || et.autoFetchSvg; t = At(Et, (t, e) => { const a = e[0]; let n = e[1]; e = e[2]; return n !== 'far' || r || (n = 'fas'), typeof a === 'string' && (t.names[a] = { prefix: n, iconName: e }), typeof a === 'number' && (t.unicodes[a.toString(16)] = { prefix: n, iconName: e }), t; }, { names: {}, unicodes: {} }); Lt = t.names, Rt = t.unicodes, zt = Ut(et.styleDefault, { family: et.familyDefault }); }; function Ht(t, e) { return (jt[t] || {})[e]; } function Wt(t, e) { return (It[t] || {})[e]; } function _t(t) { return Lt[t] || { prefix: null, iconName: null }; } N = (t) => { zt = Ut(t.styleDefault, { family: et.familyDefault }); }, at.push(N), Yt(); const Bt = () => ({ prefix: null, iconName: null, rest: [] }); function Ut(t, e) {
    const { family: a = l } = arguments.length > 1 && void 0 !== e ? e : {}; var e = Y[a][t]; var e = W[a][t] || W[a][e]; var
      t = t in gt.styles ? t : null; return e || t || null;
  } const Xt = { classic: Object.keys(B[l]), sharp: Object.keys(B[d]), 'sharp-duotone': Object.keys(B[p]) }; function qt(t, e) {
    const { skipLookups: r = !1 } = arguments.length > 1 && void 0 !== e ? e : {}; const
      i = { classic: ''.concat(et.cssPrefix, '-').concat(l), sharp: ''.concat(et.cssPrefix, '-').concat(d), 'sharp-duotone': ''.concat(et.cssPrefix, '-').concat(p) }; let o = null; let
      s = l; const c = h.filter((t) => t !== m); c.forEach((e) => { (t.includes(i[e]) || t.some((t) => Xt[e].includes(t))) && (s = e); }); const a = t.reduce((t, e) => {
      let a; let
        n = Tt(et.cssPrefix, e); return St[e] ? (e = Mt[s].includes(e) ? X[s][e] : e, o = e, t.prefix = e) : Dt[s].indexOf(e) > -1 ? (o = e, t.prefix = Ut(e, { family: s })) : n ? t.iconName = n : e === et.replacementClass || c.some((t) => e === i[t]) || t.rest.push(e), !r && t.prefix && t.iconName && (a = o === 'fa' ? _t(t.iconName) : {}, n = Wt(t.prefix, t.iconName), a.prefix && (o = null), t.iconName = a.iconName || n || t.iconName, t.prefix = a.prefix || t.prefix, t.prefix !== 'far' || St.far || !St.fas || et.autoFetchSvg || (t.prefix = 'fas')), t;
    }, Bt()); return (t.includes('fa-brands') || t.includes('fab')) && (a.prefix = 'fab'), (t.includes('fa-duotone') || t.includes('fad')) && (a.prefix = 'fad'), a.prefix || s !== d || !St.fass && !et.autoFetchSvg || (a.prefix = 'fass', a.iconName = Wt(a.prefix, a.iconName) || a.iconName), a.prefix || s !== p || !St.fasds && !et.autoFetchSvg || (a.prefix = 'fasds', a.iconName = Wt(a.prefix, a.iconName) || a.iconName), a.prefix !== 'fa' && o !== 'fa' || (a.prefix = zt || 'fas'), a;
  } let Vt = []; let
    Gt = {}; const Kt = {}; const
    Jt = Object.keys(Kt); function Qt(t, e) { for (var a = arguments.length, n = new Array(a > 2 ? a - 2 : 0), r = 2; r < a; r++)n[r - 2] = arguments[r]; const i = Gt[t] || []; return i.forEach((t) => { e = t.apply(null, [e, ...n]); }), e; } function Zt(t) { for (var e = arguments.length, a = new Array(e > 1 ? e - 1 : 0), n = 1; n < e; n++)a[n - 1] = arguments[n]; const r = Gt[t] || []; r.forEach((t) => { t.apply(null, a); }); } function $t(t) {
    const e = t; var
      t = Array.prototype.slice.call(arguments, 1); return Kt[e] ? Kt[e].apply(null, t) : void 0;
  } function te(t) { t.prefix === 'fa' && (t.prefix = 'fas'); let e = t.iconName; t = t.prefix || zt; if (e) return e = Wt(t, e) || e, wt(ee.definitions, t, e) || wt(gt.styles, t, e); } const ee = new class {
    constructor() { this.definitions = {}; }

    add() { for (var t = arguments.length, e = new Array(t), a = 0; a < t; a++)e[a] = arguments[a]; const n = e.reduce(this._pullDefinitions, {}); Object.keys(n).forEach((t) => { this.definitions[t] = { ...this.definitions[t] || {}, ...n[t] }, Ct(t, n[t]); const e = B[l][t]; e && Ct(e, n[t]), Yt(); }); }

    reset() { this.definitions = {}; }

    _pullDefinitions(i, t) {
      const o = t.prefix && t.iconName && t.icon ? { 0: t } : t; return Object.keys(o).map((t) => {
        const { prefix: e, iconName: a, icon: n } = o[t]; const
          r = n[2]; i[e] || (i[e] = {}), r.length > 0 && r.forEach((t) => { typeof t === 'string' && (i[e][t] = n); }), i[e][a] = n;
      }), i;
    }
  }(); const ae = {
    noAuto: () => { et.autoReplaceSvg = !1, et.observeMutations = !1, Zt('noAuto'); },
    config: et,
    dom: { i2svg() { const t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}; return f ? (Zt('beforeI2svg', t), $t('pseudoElements2svg', t), $t('i2svg', t)) : Promise.reject(new Error('Operation requires a DOM of some kind.')); }, watch() { const t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}; const e = t.autoReplaceSvgRoot; !1 === et.autoReplaceSvg && (et.autoReplaceSvg = !0), et.observeMutations = !0, xt(() => { ne({ autoReplaceSvgRoot: e }), Zt('watch', t); }); } },
    parse: {
      icon: (t) => {
        if (t === null) return null; if (typeof t === 'object' && t.prefix && t.iconName) return { prefix: t.prefix, iconName: Wt(t.prefix, t.iconName) || t.iconName }; if (Array.isArray(t) && t.length === 2) {
          var e = t[1].indexOf('fa-') === 0 ? t[1].slice(3) : t[1]; const
            a = Ut(t[0]); return { prefix: a, iconName: Wt(a, e) || e };
        } if (typeof t === 'string' && (t.indexOf(''.concat(et.cssPrefix, '-')) > -1 || t.match(q))) { e = qt(t.split(' '), { skipLookups: !0 }); return { prefix: e.prefix || zt, iconName: Wt(e.prefix, e.iconName) || e.iconName }; } return typeof t === 'string' ? { prefix: zt, iconName: Wt(zt, t) || t } : void 0;
      },
    },
    library: ee,
    findIconDefinition: te,
    toHtml: kt,
  }; const
    ne = function () {
      var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}; var
        { autoReplaceSvgRoot: t = w } = t; (Object.keys(gt.styles).length > 0 || et.autoFetchSvg) && f && et.autoReplaceSvg && ae.dom.i2svg({ node: t });
    }; function re(e, t) { return Object.defineProperty(e, 'abstract', { get: t }), Object.defineProperty(e, 'html', { get() { return e.abstract.map((t) => kt(t)); } }), Object.defineProperty(e, 'node', { get() { if (f) { const t = w.createElement('div'); return t.innerHTML = e.html, t.children; } } }), e; } function ie(t) {
    const {
      icons: { main: e, mask: a }, prefix: n, iconName: r, transform: i, symbol: o, title: s, maskId: c, titleId: l, extra: f, watchable: u = !1,
    } = t; var { width: m, height: d } = a.found ? a : e; const p = n === 'fak'; var
      t = [et.replacementClass, r ? ''.concat(et.cssPrefix, '-').concat(r) : ''].filter((t) => f.classes.indexOf(t) === -1).filter((t) => t !== '' || !!t).concat(f.classes).join(' '); const h = {
      children: [],
      attributes: {
        ...f.attributes, 'data-prefix': n, 'data-icon': r, class: t, role: f.attributes.role || 'img', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 '.concat(m, ' ').concat(d),
      },
    }; m = p && !~f.classes.indexOf('fa-fw') ? { width: ''.concat(m / d * 16 * 0.0625, 'em') } : {}; u && (h.attributes[C] = ''), s && (h.children.push({ tag: 'title', attributes: { id: h.attributes['aria-labelledby'] || 'title-'.concat(l || ot()) }, children: [s] }), delete h.attributes.title); const g = {
      ...h, prefix: n, iconName: r, main: e, mask: a, maskId: c, transform: i, symbol: o, styles: { ...m, ...f.styles },
    }; var { children: d, attributes: m } = a.found && e.found ? $t('generateAbstractMask', g) || { children: [], attributes: {} } : $t('generateAbstractIcon', g) || { children: [], attributes: {} }; return g.children = d, g.attributes = m, (o ? function (t) {
      var {
        prefix: e, iconName: a, children: n, attributes: r, symbol: t,
      } = t; var
        t = !0 === t ? ''.concat(e, '-').concat(et.cssPrefix, '-').concat(a) : t; return [{ tag: 'svg', attributes: { style: 'display: none;' }, children: [{ tag: 'symbol', attributes: { ...r, id: t }, children: n }] }];
    } : function (t) {
      const {
        children: e, main: a, mask: n, attributes: r, styles: i, transform: o,
      } = t; if (ut(o) && a.found && !n.found) {
        var { width: s, height: t } = a; const c = s / t / 2; const
          l = 0.5; r.style = ft({ ...i, 'transform-origin': ''.concat(c + o.x / 16, 'em ').concat(l + o.y / 16, 'em') });
      } return [{ tag: 'svg', attributes: r, children: e }];
    })(g);
  } function oe(t) {
    const {
      content: e, width: a, height: n, transform: r, title: i, extra: o, watchable: s = !1,
    } = t; const
      c = { ...o.attributes, ...i ? { title: i } : {}, class: o.classes.join(' ') }; s && (c[C] = ''); const l = { ...o.styles }; ut(r) && (l.transform = (function (t) {
      var {
        transform: e, width: a = O, height: n = O, startCentered: t = !1,
      } = t; let r = ''; return t && u ? r += 'translate('.concat(e.x / nt - a / 2, 'em, ').concat(e.y / nt - n / 2, 'em) ') : r += t ? 'translate(calc(-50% + '.concat(e.x / nt, 'em), calc(-50% + ').concat(e.y / nt, 'em)) ') : 'translate('.concat(e.x / nt, 'em, ').concat(e.y / nt, 'em) '), r += 'scale('.concat(e.size / nt * (e.flipX ? -1 : 1), ', ').concat(e.size / nt * (e.flipY ? -1 : 1), ') '), r += 'rotate('.concat(e.rotate, 'deg) '), r;
    }({
      transform: r, startCentered: !0, width: a, height: n,
    })), l['-webkit-transform'] = l.transform); t = ft(l); t.length > 0 && (c.style = t); const f = []; return f.push({ tag: 'span', attributes: c, children: [e] }), i && f.push({ tag: 'span', attributes: { class: 'sr-only' }, children: [i] }), f;
  } const se = gt.styles; function ce(t) {
    const e = t[0]; const a = t[1]; var
      [t] = t.slice(4); let n = null; return n = Array.isArray(t) ? { tag: 'g', attributes: { class: ''.concat(et.cssPrefix, '-').concat(J.GROUP) }, children: [{ tag: 'path', attributes: { class: ''.concat(et.cssPrefix, '-').concat(J.SECONDARY), fill: 'currentColor', d: t[0] } }, { tag: 'path', attributes: { class: ''.concat(et.cssPrefix, '-').concat(J.PRIMARY), fill: 'currentColor', d: t[1] } }] } : { tag: 'path', attributes: { fill: 'currentColor', d: t } }, {
      found: !0, width: e, height: a, icon: n,
    };
  } const le = { found: !1, width: 512, height: 512 }; function fe(r, i) {
    const o = i; return i === 'fa' && et.styleDefault !== null && (i = zt), new Promise((t, e) => {
      let a; let
        n; if (o === 'fa' && (n = _t(r) || {}, r = n.iconName || r, i = n.prefix || i), r && i && se[i] && se[i][r]) return t(ce(se[i][r])); a = r, n = i, R || et.showMissingIcons || !a || console.error('Icon with name "'.concat(a, '" and prefix "').concat(n, '" is missing.')), t({ ...le, icon: et.showMissingIcons && r && $t('missingIconAbstract') || {} });
    });
  } y = () => { }; const ue = et.measurePerformance && o && o.mark && o.measure ? o : { mark: y, measure: y }; const
    me = 'FA "6.6.0"'; const de = (t) => { ue.mark(''.concat(me, ' ').concat(t, ' ends')), ue.measure(''.concat(me, ' ').concat(t), ''.concat(me, ' ').concat(t, ' begins'), ''.concat(me, ' ').concat(t, ' ends')); }; const pe = { begin: (t) => (ue.mark(''.concat(me, ' ').concat(t, ' begins')), () => de(t)), end: de }; const he = () => { }; function ge(t) { return typeof (t.getAttribute ? t.getAttribute(C) : null) === 'string'; } function be(e, t) { const { ceFn: a = e.tag === 'svg' ? function (t) { return w.createElementNS('http://www.w3.org/2000/svg', t); } : function (t) { return w.createElement(t); } } = arguments.length > 1 && void 0 !== t ? t : {}; if (typeof e === 'string') return w.createTextNode(e); const n = a(e.tag); Object.keys(e.attributes || []).forEach((t) => { n.setAttribute(t, e.attributes[t]); }); const r = e.children || []; return r.forEach((t) => { n.appendChild(be(t, { ceFn: a })); }), n; } const ve = {
    replace(t) { const e = t[0]; e.parentNode && (t[1].forEach((t) => { e.parentNode.insertBefore(be(t), e); }), e.getAttribute(C) === null && et.keepOriginalSource ? (t = w.createComment((t = e, t = ' '.concat(t.outerHTML, ' '), t = ''.concat(t, 'Font Awesome fontawesome.com '))), e.parentNode.replaceChild(t, e)) : e.remove()); },
    nest(t) {
      const e = t[0]; const
        a = t[1]; if (~ct(e).indexOf(et.replacementClass)) return ve.replace(t); const n = new RegExp(''.concat(et.cssPrefix, '-.*')); if (delete a[0].attributes.id, a[0].attributes.class) { const r = a[0].attributes.class.split(' ').reduce((t, e) => ((e === et.replacementClass || e.match(n) ? t.toSvg : t.toNode).push(e), t), { toNode: [], toSvg: [] }); a[0].attributes.class = r.toSvg.join(' '), r.toNode.length === 0 ? e.removeAttribute('class') : e.setAttribute('class', r.toNode.join(' ')); } t = a.map((t) => kt(t)).join('\n'); e.setAttribute(C, ''), e.innerHTML = t;
    },
  }; function ye(t) { t(); } function xe(a, t) { const n = typeof t === 'function' ? t : he; if (a.length === 0) n(); else { let t = ye; et.mutateApproach === F && (t = k.requestAnimationFrame || ye), t(() => { const t = !0 !== et.autoReplaceSvg && ve[et.autoReplaceSvg] || ve.replace; const e = pe.begin('mutate'); a.map(t), e(), n(); }); } } let ke = !1; function we() { ke = !0; } function Ae() { ke = !1; } let Ne = null; function Oe(t) {
    if (!c) return; if (!et.observeMutations) return; const {
      treeCallback: i = he, nodeCallback: o = he, pseudoElementsCallback: s = he, observeMutationsRoot: e = w,
    } = t; Ne = new c((t) => {
      if (!ke) {
        const r = zt; st(t).forEach((t) => {
          let e; let a; let
            n; t.type === 'childList' && t.addedNodes.length > 0 && !ge(t.addedNodes[0]) && (et.searchPseudoElements && s(t.target), i(t.target)), t.type === 'attributes' && t.target.parentNode && et.searchPseudoElements && s(t.target.parentNode), t.type === 'attributes' && ge(t.target) && ~K.indexOf(t.attributeName) && (t.attributeName === 'class' && (a = t.target, n = a.getAttribute ? a.getAttribute(M) : null, a = a.getAttribute ? a.getAttribute(z) : null, n && a) ? ({ prefix: a, iconName: e } = qt(ct(t.target)), t.target.setAttribute(M, a || r), e && t.target.setAttribute(z, e)) : (e = t.target) && e.classList && e.classList.contains && e.classList.contains(et.replacementClass) && o(t.target));
        });
      }
    }), f && Ne.observe(e, {
      childList: !0, attributes: !0, characterData: !0, subtree: !0,
    });
  } function Pe(t) {
    const e = t.getAttribute('data-prefix'); let a = t.getAttribute('data-icon'); let
      n = void 0 !== t.innerText ? t.innerText.trim() : ''; const r = qt(ct(t)); return r.prefix || (r.prefix = zt), e && a && (r.prefix = e, r.iconName = a), r.iconName && r.prefix || (r.prefix && n.length > 0 && (r.iconName = (a = r.prefix, n = t.innerText, (Ft[a] || {})[n] || Ht(r.prefix, Ot(t.innerText)))), !r.iconName && et.autoFetchSvg && t.firstChild && t.firstChild.nodeType === Node.TEXT_NODE && (r.iconName = t.firstChild.data)), r;
  } function Ce(t, e) {
    var a = arguments.length > 1 && void 0 !== e ? e : { styleParser: !0 }; const { iconName: n, prefix: r, rest: i } = Pe(t); const o = (function (t) {
      const e = st(t.attributes).reduce((t, e) => (t.name !== 'class' && t.name !== 'style' && (t[e.name] = e.value), t), {}); const a = t.getAttribute('title'); var
        t = t.getAttribute('data-fa-title-id'); return et.autoA11y && (a ? e['aria-labelledby'] = ''.concat(et.replacementClass, '-title-').concat(t || ot()) : (e['aria-hidden'] = 'true', e.focusable = 'false')), e;
    }(t)); var e = Qt('parseNodeAttributes', {}, t); var
      a = a.styleParser ? (function (t) { const e = t.getAttribute('style'); let a = []; return e && (a = e.split(';').reduce((t, e) => { const a = e.split(':'); e = a[0]; const n = a.slice(1); return e && n.length > 0 && (t[e] = n.join(':').trim()), t; }, {})), a; }(t)) : []; return {
      iconName: n, title: t.getAttribute('title'), titleId: t.getAttribute('data-fa-title-id'), prefix: r, transform: rt, mask: { iconName: null, prefix: null, rest: [] }, maskId: null, symbol: !1, extra: { classes: i, styles: a, attributes: o }, ...e,
    };
  } const Se = gt.styles; function Ee(t) { const e = et.autoReplaceSvg === 'nest' ? Ce(t, { styleParser: !1 }) : Ce(t); return ~e.extra.classes.indexOf(V) ? $t('generateLayersText', t, e) : $t('generateSvgReplacementMutation', t, e); } let Me = new Set(); function ze(t) {
    const n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null; if (!f) return Promise.resolve(); const e = w.documentElement.classList; const r = (t) => e.add(''.concat(j, '-').concat(t)); const i = (t) => e.remove(''.concat(j, '-').concat(t)); const
      a = et.autoFetchSvg ? Me : I.map((t) => 'fa-'.concat(t)).concat(Object.keys(Se)); a.includes('fa') || a.push('fa'); const o = ['.'.concat(V, ':not([').concat(C, '])')].concat(a.map((t) => '.'.concat(t, ':not([').concat(C, '])'))).join(', '); if (o.length === 0) return Promise.resolve(); let s = []; try { s = st(t.querySelectorAll(o)); } catch (t) { } if (!(s.length > 0)) return Promise.resolve(); r('pending'), i('complete'); const c = pe.begin('onTree'); const
      l = s.reduce((t, e) => { try { const a = Ee(e); a && t.push(a); } catch (t) { R || t.name === 'MissingIcon' && console.error(t); } return t; }, []); return new Promise((e, a) => { Promise.all(l).then((t) => { xe(t, () => { r('active'), r('complete'), i('pending'), typeof n === 'function' && n(), c(), e(); }); }).catch((t) => { c(), a(t); }); });
  } function je(t) { const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null; Ee(t).then((t) => { t && xe([t], e); }); } I.map((t) => { Me.add('fa-'.concat(t)); }), Object.keys(Y[l]).map(Me.add.bind(Me)), Object.keys(Y[d]).map(Me.add.bind(Me)), Object.keys(Y[p]).map(Me.add.bind(Me)), Me = [...Me]; function Fe(t) {
    const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; const {
      transform: a = rt, symbol: n = !1, mask: r = null, maskId: i = null, title: o = null, titleId: s = null, classes: c = [], attributes: l = {}, styles: f = {},
    } = e; if (t) {
      const { prefix: u, iconName: m, icon: d } = t; return re({ type: 'icon', ...t }, () => (Zt('beforeDOMElementCreation', { iconDefinition: t, params: e }), et.autoA11y && (o ? l['aria-labelledby'] = ''.concat(et.replacementClass, '-title-').concat(s || ot()) : (l['aria-hidden'] = 'true', l.focusable = 'false')), ie({
        icons: {
          main: ce(d),
          mask: r ? ce(r.icon) : {
            found: !1, width: null, height: null, icon: {},
          },
        },
        prefix: u,
        iconName: m,
        transform: { ...rt, ...a },
        symbol: n,
        title: o,
        maskId: i,
        titleId: s,
        extra: { attributes: l, styles: f, classes: c },
      })));
    }
  } x = {
    mixout() {
      return {
        icon: (n = Fe, function (t) {
          const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; var
            t = (t || {}).icon ? t : te(t || {}); let a = e.mask; return a = a && ((a || {}).icon ? a : te(a || {})), n(t, { ...e, mask: a });
        }),
      }; let n;
    },
    hooks() { return { mutationObserverCallbacks(t) { return t.treeCallback = ze, t.nodeCallback = je, t; } }; },
    provides(t) {
      t.i2svg = function (t) { var { node: e = w, callback: t = () => { } } = t; return ze(e, t); }, t.generateSvgReplacementMutation = function (n, t) {
        const {
          iconName: r, title: i, titleId: o, prefix: s, transform: c, symbol: l, mask: e, maskId: f, extra: u,
        } = t; return new Promise((a, t) => {
          Promise.all([fe(r, s), e.iconName ? fe(e.iconName, e.prefix) : Promise.resolve({
            found: !1, width: 512, height: 512, icon: {},
          })]).then((t) => {
            var [e, t] = t; a([n, ie({
              icons: { main: e, mask: t }, prefix: s, iconName: r, transform: c, symbol: l, maskId: f, title: i, titleId: o, extra: u, watchable: !0,
            })]);
          }).catch(t);
        });
      }, t.generateAbstractIcon = function (t) {
        const {
          children: e, attributes: a, main: n, transform: r, styles: i,
        } = t; t = ft(i); t.length > 0 && (a.style = t); let o; return ut(r) && (o = $t('generateAbstractTransformGrouping', {
          main: n, transform: r, containerWidth: n.width, iconWidth: n.width,
        })), e.push(o || n.icon), { children: e, attributes: a };
      };
    },
  }, N = { mixout() { return { layer(t) { const a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; const { classes: n = [] } = a; return re({ type: 'layer' }, () => { Zt('beforeDOMElementCreation', { assembler: t, params: a }); let e = []; return t((t) => { Array.isArray(t) ? t.map((t) => { e = e.concat(t.abstract); }) : e = e.concat(t.abstract); }), [{ tag: 'span', attributes: { class: [''.concat(et.cssPrefix, '-layers'), ...n].join(' ') }, children: e }]; }); } }; } }, o = {
    mixout() {
      return {
        counter(t) {
          const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; const {
            title: a = null, classes: n = [], attributes: r = {}, styles: i = {},
          } = e; return re({ type: 'counter', content: t }, () => (Zt('beforeDOMElementCreation', { content: t, params: e }), (function (t) {
            const { content: e, title: a, extra: n } = t; const
              r = { ...n.attributes, ...a ? { title: a } : {}, class: n.classes.join(' ') }; (t = ft(n.styles)).length > 0 && (r.style = t); const i = []; return i.push({ tag: 'span', attributes: r, children: [e] }), a && i.push({ tag: 'span', attributes: { class: 'sr-only' }, children: [a] }), i;
          }({ content: t.toString(), title: a, extra: { attributes: r, styles: i, classes: [''.concat(et.cssPrefix, '-layers-counter'), ...n] } }))));
        },
      };
    },
  }, y = {
    mixout() {
      return {
        text(t) {
          const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}; const {
            transform: a = rt, title: n = null, classes: r = [], attributes: i = {}, styles: o = {},
          } = e; return re({ type: 'text', content: t }, () => (Zt('beforeDOMElementCreation', { content: t, params: e }), oe({
            content: t, transform: { ...rt, ...a }, title: n, extra: { attributes: i, styles: o, classes: [''.concat(et.cssPrefix, '-layers-text'), ...r] },
          })));
        },
      };
    },
    provides(t) {
      t.generateLayersText = function (t, e) {
        const { title: a, transform: n, extra: r } = e; let i = null; let
          o = null; let s; return u && (s = parseInt(getComputedStyle(t).fontSize, 10), e = t.getBoundingClientRect(), i = e.width / s, o = e.height / s), et.autoA11y && !a && (r.attributes['aria-hidden'] = 'true'), Promise.resolve([t, oe({
          content: t.innerHTML, width: i, height: o, transform: n, title: a, extra: r, watchable: !0,
        })]);
      };
    },
  }; const Le = new RegExp('"', 'ug'); const Re = [1105920, 1112319]; const Ie = {
    FontAwesome: { normal: 'fas', 400: 'fas' },
    'Font Awesome 6 Free': { 900: 'fas', 400: 'far' },
    'Font Awesome 6 Pro': {
      900: 'fas', 400: 'far', normal: 'far', 300: 'fal', 100: 'fat',
    },
    'Font Awesome 6 Brands': { 400: 'fab', normal: 'fab' },
    'Font Awesome 6 Duotone': { 900: 'fad' },
    'Font Awesome 6 Sharp': {
      900: 'fass', 400: 'fasr', normal: 'fasr', 300: 'fasl', 100: 'fast',
    },
    'Font Awesome 6 Sharp Duotone': { 900: 'fasds' },
    'Font Awesome 5 Free': { 900: 'fas', 400: 'far' },
    'Font Awesome 5 Pro': {
      900: 'fas', 400: 'far', normal: 'far', 300: 'fal',
    },
    'Font Awesome 5 Brands': { 400: 'fab', normal: 'fab' },
    'Font Awesome 5 Duotone': { 900: 'fad' },
    'Font Awesome Kit': { 400: 'fak', normal: 'fak' },
    'Font Awesome Kit Duotone': { 400: 'fakd', normal: 'fakd' },
  }; const De = Object.keys(Ie).reduce((t, e) => (t[e.toLowerCase()] = Ie[e], t), {}); const
    Te = Object.keys(De).reduce((t, e) => { const a = De[e]; return t[e] = a[900] || [...Object.entries(a)][0][1], t; }, {}); function Ye(v, y) {
    const x = ''.concat(E).concat(y.replace(':', '-')); return new Promise((i, e) => {
      if (v.getAttribute(x) !== null) return i(); const t = st(v.children); const a = t.filter((t) => t.getAttribute(S) === y)[0]; const o = k.getComputedStyle(v, y); const s = o.getPropertyValue('font-family'); const
        c = s.match(G); let l; let f; let
        u = o.getPropertyValue('font-weight'); const m = o.getPropertyValue('content'); if (a && !c) return v.removeChild(a), i(); if (c && m !== 'none' && m !== '') {
        const m = o.getPropertyValue('content'); let n = (l = s, f = u, l = l.replace(/^['"]|['"]$/g, '').toLowerCase(), f = parseInt(f), f = isNaN(f) ? 'normal' : f, (De[l] || {})[f] || Te[l]); var { value: d, isSecondary: p } = (h = m, d = h.replace(Le, ''), u = 0, l = (f = d).length, h = (p = (h = f.charCodeAt(u)) >= 55296 && h <= 56319 && u + 1 < l && (p = f.charCodeAt(u + 1)) >= 56320 && p <= 57343 ? 1024 * (h - 55296) + p - 56320 + 65536 : h) >= Re[0] && p <= Re[1], { value: Ot((p = d.length === 2 && d[0] === d[1]) ? d[0] : d), isSecondary: h || p }); var
          h = c[0].startsWith('FontAwesome'); let t = Ht(n, d); const
          r = t; if (h && (h = d, d = Rt[h], h = Ht('fas', h), (h = d || (h ? { prefix: 'fas', iconName: h } : null) || { prefix: null, iconName: null }).iconName && h.prefix && (t = h.iconName, n = h.prefix)), !t || p || a && a.getAttribute(M) === n && a.getAttribute(z) === r) i(); else {
          v.setAttribute(x, r), a && v.removeChild(a); const g = {
            iconName: null, title: null, titleId: null, prefix: null, transform: rt, symbol: !1, mask: { iconName: null, prefix: null, rest: [] }, maskId: null, extra: { classes: [], styles: {}, attributes: {} },
          }; const
            b = g.extra; b.attributes[S] = y, fe(t, n).then((t) => {
            const e = ie({
              ...g, icons: { main: t, mask: Bt() }, prefix: n, iconName: r, extra: b, watchable: !0,
            }); const
              a = w.createElementNS('http://www.w3.org/2000/svg', 'svg'); y === '::before' ? v.insertBefore(a, v.firstChild) : v.appendChild(a), a.outerHTML = e.map((t) => kt(t)).join('\n'), v.removeAttribute(x), i();
          }).catch(e);
        }
      } else i();
    });
  } function He(t) { return Promise.all([Ye(t, '::before'), Ye(t, '::after')]); } function We(t) { return !(t.parentNode === document.head || ~L.indexOf(t.tagName.toUpperCase()) || t.getAttribute(S) || t.parentNode && t.parentNode.tagName === 'svg'); } function _e(r) { if (f) return new Promise((t, e) => { const a = st(r.querySelectorAll('*')).filter(We).map(He); const n = pe.begin('searchPseudoElements'); we(), Promise.all(a).then(() => { n(), Ae(), t(); }).catch(() => { n(), Ae(), e(); }); }); } let Be = !1; const Ue = (t) => t.toLowerCase().split(' ').reduce((t, e) => { const a = e.toLowerCase().split('-'); e = a[0]; let n = a.slice(1).join('-'); if (e && n === 'h') return t.flipX = !0, t; if (e && n === 'v') return t.flipY = !0, t; if (n = parseFloat(n), isNaN(n)) return t; switch (e) { case 'grow': t.size += n; break; case 'shrink': t.size -= n; break; case 'left': t.x -= n; break; case 'right': t.x += n; break; case 'up': t.y -= n; break; case 'down': t.y += n; break; case 'rotate': t.rotate += n; } return t; }, {
    size: 16, x: 0, y: 0, flipX: !1, flipY: !1, rotate: 0,
  });
  const Xe = {
    x: 0, y: 0, width: '100%', height: '100%',
  }; function qe(t) { return t.attributes && (t.attributes.fill || (!(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1])) && (t.attributes.fill = 'black'), t; } !(function (t, e) { const n = e.mixoutsTo; Vt = t, Gt = {}, Object.keys(Kt).forEach((t) => { Jt.indexOf(t) === -1 && delete Kt[t]; }), Vt.forEach((t) => { const a = t.mixout ? t.mixout() : {}; if (Object.keys(a).forEach((e) => { typeof a[e] === 'function' && (n[e] = a[e]), typeof a[e] === 'object' && Object.keys(a[e]).forEach((t) => { n[e] || (n[e] = {}), n[e][t] = a[e][t]; }); }), t.hooks) { const e = t.hooks(); Object.keys(e).forEach((t) => { Gt[t] || (Gt[t] = []), Gt[t].push(e[t]); }); } t.provides && t.provides(Kt); }), n; }([A, x, N, o, y, { hooks() { return { mutationObserverCallbacks(t) { return t.pseudoElementsCallback = _e, t; } }; }, provides(t) { t.pseudoElements2svg = function (t) { var { node: t = w } = t; et.searchPseudoElements && _e(t); }; } }, { mixout() { return { dom: { unwatch() { we(), Be = !0; } } }; }, hooks() { return { bootstrap() { Oe(Qt('mutationObserverCallbacks', {})); }, noAuto() { Ne && Ne.disconnect(); }, watch(t) { t = t.observeMutationsRoot; Be ? Ae() : Oe(Qt('mutationObserverCallbacks', { observeMutationsRoot: t })); } }; } }, {
    mixout() { return { parse: { transform: (t) => Ue(t) } }; },
    hooks() { return { parseNodeAttributes(t, e) { e = e.getAttribute('data-fa-transform'); return e && (t.transform = Ue(e)), t; } }; },
    provides(t) {
      t.generateAbstractTransformGrouping = function (t) {
        var {
          main: e, transform: a, containerWidth: n, iconWidth: r,
        } = t; const i = { transform: 'translate('.concat(n / 2, ' 256)') }; var t = 'translate('.concat(32 * a.x, ', ').concat(32 * a.y, ') '); var n = 'scale('.concat(a.size / 16 * (a.flipX ? -1 : 1), ', ').concat(a.size / 16 * (a.flipY ? -1 : 1), ') '); var
          a = 'rotate('.concat(a.rotate, ' 0 0)'); const o = i; const s = { transform: ''.concat(t, ' ').concat(n, ' ').concat(a) }; const
          c = { transform: 'translate('.concat(r / 2 * -1, ' -256)') }; return { tag: 'g', attributes: { ...o }, children: [{ tag: 'g', attributes: { ...s }, children: [{ tag: e.icon.tag, children: e.icon.children, attributes: { ...e.icon.attributes, ...c } }] }] };
      };
    },
  }, {
    hooks() {
      return {
        parseNodeAttributes(t, e) {
          const a = e.getAttribute('data-fa-mask'); const
            n = a ? qt(a.split(' ').map((t) => t.trim())) : Bt(); return n.prefix || (n.prefix = zt), t.mask = n, t.maskId = e.getAttribute('data-fa-mask-id'), t;
        },
      };
    },
    provides(t) {
      t.generateAbstractMask = function (t) {
        const {
          children: e, attributes: a, main: n, mask: r, maskId: i, transform: o,
        } = t; const { width: s, icon: c } = n; var { width: l, icon: f } = r; var u = (function (t) {
          var { transform: e, containerWidth: a, iconWidth: n } = t; const r = { transform: 'translate('.concat(a / 2, ' 256)') }; var t = 'translate('.concat(32 * e.x, ', ').concat(32 * e.y, ') '); var a = 'scale('.concat(e.size / 16 * (e.flipX ? -1 : 1), ', ').concat(e.size / 16 * (e.flipY ? -1 : 1), ') '); var
            e = 'rotate('.concat(e.rotate, ' 0 0)'); return { outer: r, inner: { transform: ''.concat(t, ' ').concat(a, ' ').concat(e) }, path: { transform: 'translate('.concat(n / 2 * -1, ' -256)') } };
        }({ transform: o, containerWidth: l, iconWidth: s })); const m = { tag: 'rect', attributes: { ...Xe, fill: 'white' } }; var t = c.children ? { children: c.children.map(qe) } : {}; var l = { tag: 'g', attributes: { ...u.inner }, children: [qe({ tag: c.tag, attributes: { ...c.attributes, ...u.path }, ...t })] }; var t = { tag: 'g', attributes: { ...u.outer }, children: [l] }; var u = 'mask-'.concat(i || ot()); var l = 'clip-'.concat(i || ot()); var t = {
          tag: 'mask',
          attributes: {
            ...Xe, id: u, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse',
          },
          children: [m, t],
        }; var
          t = { tag: 'defs', children: [{ tag: 'clipPath', attributes: { id: l }, children: (f = f).tag === 'g' ? f.children : [f] }, t] }; return e.push(t, {
          tag: 'rect',
          attributes: {
            fill: 'currentColor', 'clip-path': 'url(#'.concat(l, ')'), mask: 'url(#'.concat(u, ')'), ...Xe,
          },
        }), { children: e, attributes: a };
      };
    },
  }, {
    provides(t) {
      let i = !1; k.matchMedia && (i = k.matchMedia('(prefers-reduced-motion: reduce)').matches), t.missingIconAbstract = function () {
        const t = []; const e = { fill: 'currentColor' }; const
          a = { attributeType: 'XML', repeatCount: 'indefinite', dur: '2s' }; t.push({ tag: 'path', attributes: { ...e, d: 'M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z' } }); const n = { ...a, attributeName: 'opacity' }; const r = {
          tag: 'circle',
          attributes: {
            ...e, cx: '256', cy: '364', r: '28',
          },
          children: [],
        }; return i || r.children.push({ tag: 'animate', attributes: { ...a, attributeName: 'r', values: '28;14;28;28;14;28;' } }, { tag: 'animate', attributes: { ...n, values: '1;0;1;1;0;1;' } }), t.push(r), t.push({ tag: 'path', attributes: { ...e, opacity: '1', d: 'M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z' }, children: i ? [] : [{ tag: 'animate', attributes: { ...n, values: '1;0;0;0;0;1;' } }] }), i || t.push({ tag: 'path', attributes: { ...e, opacity: '0', d: 'M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z' }, children: [{ tag: 'animate', attributes: { ...n, values: '0;0;1;1;0;0;' } }] }), { tag: 'g', attributes: { class: 'missing' }, children: t };
      };
    },
  }, { hooks() { return { parseNodeAttributes(t, e) { e = e.getAttribute('data-fa-symbol'); return t.symbol = e !== null && (e === '' || e), t; } }; } }], { mixoutsTo: ae })), (function (t) { try { for (var e = arguments.length, a = new Array(e > 1 ? e - 1 : 0), n = 1; n < e; n++)a[n - 1] = arguments[n]; t(...a); } catch (t) { if (!R) throw t; } }((t) => {
    s && (k.FontAwesome || (k.FontAwesome = ae), xt(() => { ne(), Zt('bootstrap'); })), gt.hooks = {
      ...gt.hooks, addPack: (t, e) => { gt.styles[t] = { ...gt.styles[t] || {}, ...e }, Yt(), ne(); }, addPacks: (t) => { t.forEach((t) => { var [e, t] = t; gt.styles[e] = { ...gt.styles[e] || {}, ...t }; }), Yt(), ne(); }, addShims: (t) => { gt.shims.push(...t), Yt(), ne(); },
    };
  }));
}());
