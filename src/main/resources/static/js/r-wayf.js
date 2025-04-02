import { i as oe, r as ie, n as A, a as se, x as H, t as le, p as ce } from "./r-wc-config.js";
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const T = "lit-localize-status";
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = (e) => typeof e != "string" && "strTag" in e, X = (e, t, r) => {
  let n = e[0];
  for (let a = 1; a < e.length; a++)
    n += t[r ? r[a - 1] : a - 1], n += e[a];
  return n;
};
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = (e) => ue(e) ? X(e.strings, e.values) : e;
let u = B, F = !1;
function de(e) {
  if (F)
    throw new Error("lit-localize can only be configured once");
  u = e, F = !0;
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class fe {
  constructor(t) {
    this.__litLocalizeEventHandler = (r) => {
      r.detail.status === "ready" && this.host.requestUpdate();
    }, this.host = t;
  }
  hostConnected() {
    window.addEventListener(T, this.__litLocalizeEventHandler);
  }
  hostDisconnected() {
    window.removeEventListener(T, this.__litLocalizeEventHandler);
  }
}
const pe = (e) => e.addController(new fe(e)), Z = pe;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const he = () => (e, t) => (e.addInitializer(Z), e);
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class J {
  constructor() {
    this.settled = !1, this.promise = new Promise((t, r) => {
      this._resolve = t, this._reject = r;
    });
  }
  resolve(t) {
    this.settled = !0, this._resolve(t);
  }
  reject(t) {
    this.settled = !0, this._reject(t);
  }
}
/**
 * @license
 * Copyright 2014 Travis Webb
 * SPDX-License-Identifier: MIT
 */
const s = [];
for (let e = 0; e < 256; e++)
  s[e] = (e >> 4 & 15).toString(16) + (e & 15).toString(16);
function ge(e) {
  let t = 0, r = 8997, n = 0, a = 33826, o = 0, i = 40164, c = 0, m = 52210;
  for (let z = 0; z < e.length; z++)
    r ^= e.charCodeAt(z), t = r * 435, n = a * 435, o = i * 435, c = m * 435, o += r << 8, c += a << 8, n += t >>> 16, r = t & 65535, o += n >>> 16, a = n & 65535, m = c + (o >>> 16) & 65535, i = o & 65535;
  return s[m >> 8] + s[m & 255] + s[i >> 8] + s[i & 255] + s[a >> 8] + s[a & 255] + s[r >> 8] + s[r & 255];
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = "", ye = "h", ve = "s";
function me(e, t) {
  return (t ? ye : ve) + ge(typeof e == "string" ? e : e.join(be));
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new Map();
function _e(e, t, r) {
  if (e) {
    const n = (r == null ? void 0 : r.id) ?? we(t), a = e[n];
    if (a) {
      if (typeof a == "string")
        return a;
      if ("strTag" in a)
        return X(
          a.strings,
          // Cast `template` because its type wasn't automatically narrowed (but
          // we know it must be the same type as `localized`).
          t.values,
          a.values
        );
      {
        let o = U.get(a);
        return o === void 0 && (o = a.values, U.set(a, o)), {
          ...a,
          values: o.map((i) => t.values[i])
        };
      }
    }
  }
  return B(t);
}
function we(e) {
  const t = typeof e == "string" ? e : e.strings;
  let r = G.get(t);
  return r === void 0 && (r = me(t, typeof e != "string" && !("strTag" in e)), G.set(t, r)), r;
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function E(e) {
  window.dispatchEvent(new CustomEvent(T, { detail: e }));
}
let w = "", S, Q, x, $, Y, d = new J();
d.resolve();
let _ = 0;
const xe = (e) => (de((t, r) => _e(Y, t, r)), w = Q = e.sourceLocale, x = new Set(e.targetLocales), x.add(e.sourceLocale), $ = e.loadLocale, { getLocale: Pe, setLocale: Le }), Pe = () => w, Le = (e) => {
  if (e === (S ?? w))
    return d.promise;
  if (!x || !$)
    throw new Error("Internal error");
  if (!x.has(e))
    throw new Error("Invalid locale code");
  _++;
  const t = _;
  return S = e, d.settled && (d = new J()), E({ status: "loading", loadingLocale: e }), (e === Q ? (
    // We could switch to the source locale synchronously, but we prefer to
    // queue it on a microtask so that switching locales is consistently
    // asynchronous.
    Promise.resolve({ templates: void 0 })
  ) : $(e)).then((n) => {
    _ === t && (w = e, S = void 0, Y = n.templates, E({ status: "ready", readyLocale: e }), d.resolve());
  }, (n) => {
    _ === t && (E({
      status: "error",
      errorLocale: e,
      errorMessage: n.toString()
    }), d.reject(n));
  }), d.promise;
};
var Oe = typeof global == "object" && global && global.Object === Object && global, Ce = typeof self == "object" && self && self.Object === Object && self, M = Oe || Ce || Function("return this")(), g = M.Symbol, ee = Object.prototype, ze = ee.hasOwnProperty, Ee = ee.toString, y = g ? g.toStringTag : void 0;
function Se(e) {
  var t = ze.call(e, y), r = e[y];
  try {
    e[y] = void 0;
    var n = !0;
  } catch {
  }
  var a = Ee.call(e);
  return n && (t ? e[y] = r : delete e[y]), a;
}
var je = Object.prototype, Te = je.toString;
function $e(e) {
  return Te.call(e);
}
var Ie = "[object Null]", Ae = "[object Undefined]", V = g ? g.toStringTag : void 0;
function te(e) {
  return e == null ? e === void 0 ? Ae : Ie : V && V in Object(e) ? Se(e) : $e(e);
}
function Me(e) {
  return e != null && typeof e == "object";
}
var Re = "[object Symbol]";
function R(e) {
  return typeof e == "symbol" || Me(e) && te(e) == Re;
}
function Ne(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, a = Array(n); ++r < n; )
    a[r] = t(e[r], r, e);
  return a;
}
var N = Array.isArray, q = g ? g.prototype : void 0, K = q ? q.toString : void 0;
function re(e) {
  if (typeof e == "string")
    return e;
  if (N(e))
    return Ne(e, re) + "";
  if (R(e))
    return K ? K.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function ne(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
var ke = "[object AsyncFunction]", De = "[object Function]", He = "[object GeneratorFunction]", Fe = "[object Proxy]";
function Ue(e) {
  if (!ne(e))
    return !1;
  var t = te(e);
  return t == De || t == He || t == ke || t == Fe;
}
var j = M["__core-js_shared__"], W = function() {
  var e = /[^.]+$/.exec(j && j.keys && j.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Ge(e) {
  return !!W && W in e;
}
var Ve = Function.prototype, qe = Ve.toString;
function Ke(e) {
  if (e != null) {
    try {
      return qe.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var We = /[\\^$.*+?()[\]{}|]/g, Xe = /^\[object .+?Constructor\]$/, Be = Function.prototype, Ze = Object.prototype, Je = Be.toString, Qe = Ze.hasOwnProperty, Ye = RegExp(
  "^" + Je.call(Qe).replace(We, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function et(e) {
  if (!ne(e) || Ge(e))
    return !1;
  var t = Ue(e) ? Ye : Xe;
  return t.test(Ke(e));
}
function tt(e, t) {
  return e == null ? void 0 : e[t];
}
function ae(e, t) {
  var r = tt(e, t);
  return et(r) ? r : void 0;
}
function rt(e, t) {
  return e === t || e !== e && t !== t;
}
var nt = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, at = /^\w*$/;
function ot(e, t) {
  if (N(e))
    return !1;
  var r = typeof e;
  return r == "number" || r == "symbol" || r == "boolean" || e == null || R(e) ? !0 : at.test(e) || !nt.test(e) || t != null && e in Object(t);
}
var v = ae(Object, "create");
function it() {
  this.__data__ = v ? v(null) : {}, this.size = 0;
}
function st(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var lt = "__lodash_hash_undefined__", ct = Object.prototype, ut = ct.hasOwnProperty;
function dt(e) {
  var t = this.__data__;
  if (v) {
    var r = t[e];
    return r === lt ? void 0 : r;
  }
  return ut.call(t, e) ? t[e] : void 0;
}
var ft = Object.prototype, pt = ft.hasOwnProperty;
function ht(e) {
  var t = this.__data__;
  return v ? t[e] !== void 0 : pt.call(t, e);
}
var gt = "__lodash_hash_undefined__";
function bt(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = v && t === void 0 ? gt : t, this;
}
function f(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
f.prototype.clear = it;
f.prototype.delete = st;
f.prototype.get = dt;
f.prototype.has = ht;
f.prototype.set = bt;
function yt() {
  this.__data__ = [], this.size = 0;
}
function L(e, t) {
  for (var r = e.length; r--; )
    if (rt(e[r][0], t))
      return r;
  return -1;
}
var vt = Array.prototype, mt = vt.splice;
function _t(e) {
  var t = this.__data__, r = L(t, e);
  if (r < 0)
    return !1;
  var n = t.length - 1;
  return r == n ? t.pop() : mt.call(t, r, 1), --this.size, !0;
}
function wt(e) {
  var t = this.__data__, r = L(t, e);
  return r < 0 ? void 0 : t[r][1];
}
function xt(e) {
  return L(this.__data__, e) > -1;
}
function Pt(e, t) {
  var r = this.__data__, n = L(r, e);
  return n < 0 ? (++this.size, r.push([e, t])) : r[n][1] = t, this;
}
function b(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
b.prototype.clear = yt;
b.prototype.delete = _t;
b.prototype.get = wt;
b.prototype.has = xt;
b.prototype.set = Pt;
var Lt = ae(M, "Map");
function Ot() {
  this.size = 0, this.__data__ = {
    hash: new f(),
    map: new (Lt || b)(),
    string: new f()
  };
}
function Ct(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function O(e, t) {
  var r = e.__data__;
  return Ct(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
function zt(e) {
  var t = O(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function Et(e) {
  return O(this, e).get(e);
}
function St(e) {
  return O(this, e).has(e);
}
function jt(e, t) {
  var r = O(this, e), n = r.size;
  return r.set(e, t), this.size += r.size == n ? 0 : 1, this;
}
function h(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
h.prototype.clear = Ot;
h.prototype.delete = zt;
h.prototype.get = Et;
h.prototype.has = St;
h.prototype.set = jt;
var Tt = "Expected a function";
function k(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function")
    throw new TypeError(Tt);
  var r = function() {
    var n = arguments, a = t ? t.apply(this, n) : n[0], o = r.cache;
    if (o.has(a))
      return o.get(a);
    var i = e.apply(this, n);
    return r.cache = o.set(a, i) || o, i;
  };
  return r.cache = new (k.Cache || h)(), r;
}
k.Cache = h;
var $t = 500;
function It(e) {
  var t = k(e, function(n) {
    return r.size === $t && r.clear(), n;
  }), r = t.cache;
  return t;
}
var At = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Mt = /\\(\\)?/g, Rt = It(function(e) {
  var t = [];
  return e.charCodeAt(0) === 46 && t.push(""), e.replace(At, function(r, n, a, o) {
    t.push(a ? o.replace(Mt, "$1") : n || r);
  }), t;
});
function Nt(e) {
  return e == null ? "" : re(e);
}
function kt(e, t) {
  return N(e) ? e : ot(e, t) ? [e] : Rt(Nt(e));
}
function Dt(e) {
  if (typeof e == "string" || R(e))
    return e;
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function Ht(e, t) {
  t = kt(t, e);
  for (var r = 0, n = t.length; e != null && r < n; )
    e = e[Dt(t[r++])];
  return r && r == n ? e : void 0;
}
function Ft(e, t, r) {
  var n = e == null ? void 0 : Ht(e, t);
  return n === void 0 ? r : n;
}
const I = "fr", Ut = [
  "en"
], Gt = [
  "en",
  "fr"
], D = class D {
  static setLocale(t) {
    this.locale = t;
  }
  static setReference(t) {
    this.reference = t;
  }
  static getBrowserLocales(t = {}) {
    const n = {
      ...{
        languageCodeOnly: !0,
        defaultLanguage: I
      },
      ...t
    }, a = navigator.languages === void 0 ? [navigator.language] : navigator.languages;
    return a ? a.map((o) => {
      const i = o.trim();
      return n.languageCodeOnly ? i.split(/-|_/)[0] : i;
    }) : [n.defaultLanguage];
  }
  static getPageLang(t = {}) {
    const n = {
      ...{
        languageCodeOnly: !0,
        availableLanguages: Gt,
        defaultLanguage: I
      },
      ...t
    }, a = document.documentElement.lang;
    let o = [];
    if (a)
      o = n.languageCodeOnly ? [a.split(/-|_/)[0]] : [a];
    else {
      const c = {
        languageCodeOnly: n.languageCodeOnly,
        defaultLanguage: n.defaultLanguage
      };
      o = this.getBrowserLocales(c);
    }
    return o.find(
      (c) => n.availableLanguages.includes(c)
    ) || n.defaultLanguage;
  }
  static localTranslation(t, r) {
    var o;
    const n = (o = this.reference) == null ? void 0 : o.find(
      (i) => i.locales.includes(this.locale)
    ), a = n == null ? void 0 : n.messages;
    return a ? Ft(a, t, r) : r;
  }
};
D.locale = "en";
let P = D;
const Vt = (e, t, r) => {
  const n = e[t];
  return n ? typeof n == "function" ? n() : Promise.resolve(n) : new Promise((a, o) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(
      o.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + t + (t.split("/").length !== r ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
}, { setLocale: qt } = xe({
  sourceLocale: I,
  targetLocales: Ut,
  loadLocale: (e) => Vt(/* @__PURE__ */ Object.assign({ "./generated/locales/en.ts": () => import("./r-wc-en.js") }), `./generated/locales/${e}.ts`, 4)
});
var l = /* @__PURE__ */ ((e) => (e.ParentEleveEN = "parentEleveEN-IdP", e.ElevesParents = "eleves-parents", e.Catel = "catel-IdP", e.Agri = "agri-IdP", e.RCVL = "RCVL-IdP", e.AutresPublics = "autres-publics", e))(l || {});
const Kt = "html{-webkit-text-size-adjust:100%;box-sizing:border-box;-moz-tab-size:4;tab-size:4;word-break:normal}*,:after,:before{background-repeat:no-repeat;box-sizing:inherit}:after,:before{text-decoration:inherit;vertical-align:inherit}*{margin:0;padding:0}hr{color:inherit;height:0;overflow:visible}details,main{display:block}summary{display:list-item}small{font-size:80%}[hidden]{display:none}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}a{background-color:transparent}a:active,a:hover{outline-width:0}code,kbd,pre,samp{font-family:monospace,monospace}pre{font-size:1em}b,strong{font-weight:bolder}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-color:inherit;text-indent:0}iframe{border-style:none}input{border-radius:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}textarea{overflow:auto;resize:vertical}button,input,optgroup,select,textarea{font:inherit}optgroup{font-weight:700}button{overflow:visible}button,select{text-transform:none}[role=button],[type=button],[type=reset],[type=submit],button{cursor:pointer}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button:-moz-focusring{outline:1px dotted ButtonText}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}button,input,select,textarea{background-color:transparent;border-style:none}a:focus,button:focus,input:focus,select:focus,textarea:focus{outline-width:0}select{-moz-appearance:none;-webkit-appearance:none}select::-ms-expand{display:none}select::-ms-value{color:currentColor}legend{border:0;color:inherit;display:table;max-width:100%;white-space:normal}::-webkit-file-upload-button{-webkit-appearance:button;color:inherit;font:inherit}[disabled]{cursor:default}img{border-style:none}progress{vertical-align:baseline}[aria-busy=true]{cursor:progress}[aria-controls]{cursor:pointer}[aria-disabled=true]{cursor:default}.wayf-tiles{padding-left:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));grid-auto-rows:1fr;gap:15px;text-align:center;font-size:var(--recia-font-size-xxs);font-weight:500;letter-spacing:-.25px}.wayf-tiles>li>a{text-decoration:none;color:inherit;outline:1px solid var(--recia-stroke);border-radius:10px;background-color:var(--recia-body-bg);box-shadow:var(--recia-shadow-neutral) var(--recia-black-10);padding:12px;display:inline-block;width:100%;height:100%;transition:outline .15s ease-in,box-shadow .15s ease-in}.wayf-tiles>li>a>.wayf-profile{display:block;margin:0 auto 8px;height:64px;width:64px;color:var(--recia-basic-black);opacity:.33;transition:color .15s ease-in,opacity .15s ease-in}@media (hover: none){.wayf-tiles>li>a>.wayf-profile{color:var(--recia-primary);opacity:unset}}.wayf-tiles>li>a>span{white-space:pre-line}.wayf-tiles>li>a:hover,.wayf-tiles>li>a:focus-visible{outline:2px solid var(--recia-primary);box-shadow:var(--recia-shadow-hover) var(--recia-primary-20)}.wayf-tiles>li>a:hover>.wayf-profile,.wayf-tiles>li>a:focus-visible>.wayf-profile{color:var(--recia-primary);opacity:unset}@media (width >= 576px){.wayf-tiles{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));font-size:unset}}@media (width >= 768px){.wayf-tiles>li>a{padding:16px}}";
var Wt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, C = (e, t, r, n) => {
  for (var a = n > 1 ? void 0 : n ? Xt(t, r) : t, o = e.length - 1, i; o >= 0; o--)
    (i = e[o]) && (a = (n ? i(t, r, a) : i(a)) || a);
  return n && a && Wt(t, r, a), a;
};
const Bt = `${ce}wayf`;
let p = class extends se {
  constructor() {
    super(), this.svgUrl = "/wayf.spritemap.svg";
    const e = P.getPageLang();
    qt(e), P.setLocale(e), Z(this);
  }
  static i18n() {
    return {
      [l.ParentEleveEN]: u(`Ã‰lÃ¨ves ou parent
(Ã©ducation nationale)`),
      [l.ElevesParents]: u(`Ã‰lÃ¨ve ou parent
(enseignement agricole)`),
      [l.Catel]: u(`Personnel
(Ã©ducation nationale)`),
      [l.Agri]: u(`Personnel
(enseignement agricole)`),
      [l.RCVL]: u(`Personnel
(RÃ©gion Centre-Val de Loire)`),
      [l.AutresPublics]: u(`Autre public
(utilisateur local, entreprise,...)`)
    };
  }
  render() {
    var e;
    return H`
      <ul class="wayf-tiles">
        ${(e = this.idpIds) == null ? void 0 : e.filter((t) => Object.values(l).includes(t)).map((t) => H`
              <li>
                <a id=${t} href="${this.casUrl}&idpId=${t}">
                  <svg class="wayf-profile" aria-hidden="true" >
                    <use href="${this.svgUrl}#${t}"></use>
                  </svg>
                  <span>${p.i18n()[t]}</span>
                </a>
              </li>
            `)}
      </ul>
    `;
  }
};
p.styles = oe`${ie(Kt)}`;
C([
  A({ attribute: "cas-url", type: String })
], p.prototype, "casUrl", 2);
C([
  A({ attribute: "idp-ids", type: Array })
], p.prototype, "idpIds", 2);
C([
  A({ attribute: "svg-url", type: String })
], p.prototype, "svgUrl", 2);
p = C([
  he(),
  le(Bt)
], p);
export {
  p as ReciaWayf
};
//# sourceMappingURL=r-wayf.js.map
