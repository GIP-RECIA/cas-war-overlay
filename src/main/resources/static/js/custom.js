(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();/*!
 * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2024 Fonticons, Inc.
 */function Ke(t,e,n){return(e=Qe(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Yt(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter(function(r){return Object.getOwnPropertyDescriptor(t,r).enumerable})),n.push.apply(n,a)}return n}function s(t){for(var e=1;e<arguments.length;e++){var n=arguments[e]!=null?arguments[e]:{};e%2?Yt(Object(n),!0).forEach(function(a){Ke(t,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):Yt(Object(n)).forEach(function(a){Object.defineProperty(t,a,Object.getOwnPropertyDescriptor(n,a))})}return t}function qe(t,e){if(typeof t!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var a=n.call(t,e);if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}function Qe(t){var e=qe(t,"string");return typeof e=="symbol"?e:e+""}const Ut=()=>{};let Ot={},ge={},pe=null,he={mark:Ut,measure:Ut};try{typeof window<"u"&&(Ot=window),typeof document<"u"&&(ge=document),typeof MutationObserver<"u"&&(pe=MutationObserver),typeof performance<"u"&&(he=performance)}catch{}const{userAgent:Wt=""}=Ot.navigator||{},N=Ot,p=ge,Ht=pe,q=he;N.document;const C=!!p.documentElement&&!!p.head&&typeof p.addEventListener=="function"&&typeof p.createElement=="function",be=~Wt.indexOf("MSIE")||~Wt.indexOf("Trident/");var Je=/fa(s|r|l|t|d|dr|dl|dt|b|k|kd|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,Ze=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i,ye={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"}},tn={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},ve=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone"],h="classic",nt="duotone",en="sharp",nn="sharp-duotone",xe=[h,nt,en,nn],an={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"}},rn={"Font Awesome 6 Free":{900:"fas",400:"far"},"Font Awesome 6 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 6 Brands":{400:"fab",normal:"fab"},"Font Awesome 6 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 6 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 6 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"}},on=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}]]),sn={classic:{solid:"fas",regular:"far",light:"fal",thin:"fat",brands:"fab"},duotone:{solid:"fad",regular:"fadr",light:"fadl",thin:"fadt"},sharp:{solid:"fass",regular:"fasr",light:"fasl",thin:"fast"},"sharp-duotone":{solid:"fasds",regular:"fasdr",light:"fasdl",thin:"fasdt"}},cn=["fak","fa-kit","fakd","fa-kit-duotone"],Gt={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},ln=["kit"],fn={kit:{"fa-kit":"fak"}},un=["fak","fakd"],mn={kit:{fak:"fa-kit"}},Xt={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},Q={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},dn=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone"],gn=["fak","fa-kit","fakd","fa-kit-duotone"],pn={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},hn={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"}},bn={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"]},dt={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"}},yn=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands"],gt=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt",...dn,...yn],vn=["solid","regular","light","thin","duotone","brands"],Ae=[1,2,3,4,5,6,7,8,9,10],xn=Ae.concat([11,12,13,14,15,16,17,18,19,20]),An=[...Object.keys(bn),...vn,"2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",Q.GROUP,Q.SWAP_OPACITY,Q.PRIMARY,Q.SECONDARY].concat(Ae.map(t=>"".concat(t,"x"))).concat(xn.map(t=>"w-".concat(t))),wn={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}};const P="___FONT_AWESOME___",pt=16,we="fa",ke="svg-inline--fa",_="data-fa-i2svg",ht="data-fa-pseudo-element",kn="data-fa-pseudo-element-pending",Nt="data-prefix",It="data-icon",Bt="fontawesome-i2svg",Sn="async",Pn=["HTML","HEAD","STYLE","SCRIPT"],Se=(()=>{try{return!0}catch{return!1}})();function $(t){return new Proxy(t,{get(e,n){return n in e?e[n]:e[h]}})}const Pe=s({},ye);Pe[h]=s(s(s(s({},{"fa-duotone":"duotone"}),ye[h]),Gt.kit),Gt["kit-duotone"]);const En=$(Pe),bt=s({},sn);bt[h]=s(s(s(s({},{duotone:"fad"}),bt[h]),Xt.kit),Xt["kit-duotone"]);const Vt=$(bt),yt=s({},dt);yt[h]=s(s({},yt[h]),mn.kit);const Mt=$(yt),vt=s({},hn);vt[h]=s(s({},vt[h]),fn.kit);$(vt);const Cn=Je,Ee="fa-layers-text",Ln=Ze,On=s({},an);$(On);const Nn=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],ct=tn,In=[...ln,...An],G=N.FontAwesomeConfig||{};function Mn(t){var e=p.querySelector("script["+t+"]");if(e)return e.getAttribute(t)}function Fn(t){return t===""?!0:t==="false"?!1:t==="true"?!0:t}p&&typeof p.querySelector=="function"&&[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]].forEach(e=>{let[n,a]=e;const r=Fn(Mn(n));r!=null&&(G[a]=r)});const Ce={styleDefault:"solid",familyDefault:h,cssPrefix:we,replacementClass:ke,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};G.familyPrefix&&(G.cssPrefix=G.familyPrefix);const U=s(s({},Ce),G);U.autoReplaceSvg||(U.observeMutations=!1);const l={};Object.keys(Ce).forEach(t=>{Object.defineProperty(l,t,{enumerable:!0,set:function(e){U[t]=e,X.forEach(n=>n(l))},get:function(){return U[t]}})});Object.defineProperty(l,"familyPrefix",{enumerable:!0,set:function(t){U.cssPrefix=t,X.forEach(e=>e(l))},get:function(){return U.cssPrefix}});N.FontAwesomeConfig=l;const X=[];function Tn(t){return X.push(t),()=>{X.splice(X.indexOf(t),1)}}const O=pt,w={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function _n(t){if(!t||!C)return;const e=p.createElement("style");e.setAttribute("type","text/css"),e.innerHTML=t;const n=p.head.childNodes;let a=null;for(let r=n.length-1;r>-1;r--){const o=n[r],i=(o.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(i)>-1&&(a=o)}return p.head.insertBefore(e,a),t}const zn="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function B(){let t=12,e="";for(;t-- >0;)e+=zn[Math.random()*62|0];return e}function W(t){const e=[];for(let n=(t||[]).length>>>0;n--;)e[n]=t[n];return e}function Ft(t){return t.classList?W(t.classList):(t.getAttribute("class")||"").split(" ").filter(e=>e)}function Le(t){return"".concat(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Rn(t){return Object.keys(t||{}).reduce((e,n)=>e+"".concat(n,'="').concat(Le(t[n]),'" '),"").trim()}function at(t){return Object.keys(t||{}).reduce((e,n)=>e+"".concat(n,": ").concat(t[n].trim(),";"),"")}function Tt(t){return t.size!==w.size||t.x!==w.x||t.y!==w.y||t.rotate!==w.rotate||t.flipX||t.flipY}function Dn(t){let{transform:e,containerWidth:n,iconWidth:a}=t;const r={transform:"translate(".concat(n/2," 256)")},o="translate(".concat(e.x*32,", ").concat(e.y*32,") "),i="scale(".concat(e.size/16*(e.flipX?-1:1),", ").concat(e.size/16*(e.flipY?-1:1),") "),c="rotate(".concat(e.rotate," 0 0)"),u={transform:"".concat(o," ").concat(i," ").concat(c)},f={transform:"translate(".concat(a/2*-1," -256)")};return{outer:r,inner:u,path:f}}function jn(t){let{transform:e,width:n=pt,height:a=pt,startCentered:r=!1}=t,o="";return r&&be?o+="translate(".concat(e.x/O-n/2,"em, ").concat(e.y/O-a/2,"em) "):r?o+="translate(calc(-50% + ".concat(e.x/O,"em), calc(-50% + ").concat(e.y/O,"em)) "):o+="translate(".concat(e.x/O,"em, ").concat(e.y/O,"em) "),o+="scale(".concat(e.size/O*(e.flipX?-1:1),", ").concat(e.size/O*(e.flipY?-1:1),") "),o+="rotate(".concat(e.rotate,"deg) "),o}var Yn=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 6 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 6 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 6 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 6 Sharp Duotone";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
    transition-delay: 0s;
    transition-duration: 0s;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}`;function Oe(){const t=we,e=ke,n=l.cssPrefix,a=l.replacementClass;let r=Yn;if(n!==t||a!==e){const o=new RegExp("\\.".concat(t,"\\-"),"g"),i=new RegExp("\\--".concat(t,"\\-"),"g"),c=new RegExp("\\.".concat(e),"g");r=r.replace(o,".".concat(n,"-")).replace(i,"--".concat(n,"-")).replace(c,".".concat(a))}return r}let $t=!1;function lt(){l.autoAddCss&&!$t&&(_n(Oe()),$t=!0)}var Un={mixout(){return{dom:{css:Oe,insertCss:lt}}},hooks(){return{beforeDOMElementCreation(){lt()},beforeI2svg(){lt()}}}};const E=N||{};E[P]||(E[P]={});E[P].styles||(E[P].styles={});E[P].hooks||(E[P].hooks={});E[P].shims||(E[P].shims=[]);var k=E[P];const Ne=[],Ie=function(){p.removeEventListener("DOMContentLoaded",Ie),tt=1,Ne.map(t=>t())};let tt=!1;C&&(tt=(p.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(p.readyState),tt||p.addEventListener("DOMContentLoaded",Ie));function Wn(t){C&&(tt?setTimeout(t,0):Ne.push(t))}function K(t){const{tag:e,attributes:n={},children:a=[]}=t;return typeof t=="string"?Le(t):"<".concat(e," ").concat(Rn(n),">").concat(a.map(K).join(""),"</").concat(e,">")}function Kt(t,e,n){if(t&&t[e]&&t[e][n])return{prefix:e,iconName:n,icon:t[e][n]}}var ft=function(e,n,a,r){var o=Object.keys(e),i=o.length,c=n,u,f,m;for(a===void 0?(u=1,m=e[o[0]]):(u=0,m=a);u<i;u++)f=o[u],m=c(m,e[f],f,e);return m};function Hn(t){const e=[];let n=0;const a=t.length;for(;n<a;){const r=t.charCodeAt(n++);if(r>=55296&&r<=56319&&n<a){const o=t.charCodeAt(n++);(o&64512)==56320?e.push(((r&1023)<<10)+(o&1023)+65536):(e.push(r),n--)}else e.push(r)}return e}function xt(t){const e=Hn(t);return e.length===1?e[0].toString(16):null}function Gn(t,e){const n=t.length;let a=t.charCodeAt(e),r;return a>=55296&&a<=56319&&n>e+1&&(r=t.charCodeAt(e+1),r>=56320&&r<=57343)?(a-55296)*1024+r-56320+65536:a}function qt(t){return Object.keys(t).reduce((e,n)=>{const a=t[n];return!!a.icon?e[a.iconName]=a.icon:e[n]=a,e},{})}function At(t,e){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const{skipHooks:a=!1}=n,r=qt(e);typeof k.hooks.addPack=="function"&&!a?k.hooks.addPack(t,qt(e)):k.styles[t]=s(s({},k.styles[t]||{}),r),t==="fas"&&At("fa",e)}const{styles:V,shims:Xn}=k,Me=Object.keys(Mt),Bn=Me.reduce((t,e)=>(t[e]=Object.keys(Mt[e]),t),{});let _t=null,Fe={},Te={},_e={},ze={},Re={};function Vn(t){return~In.indexOf(t)}function $n(t,e){const n=e.split("-"),a=n[0],r=n.slice(1).join("-");return a===t&&r!==""&&!Vn(r)?r:null}const De=()=>{const t=a=>ft(V,(r,o,i)=>(r[i]=ft(o,a,{}),r),{});Fe=t((a,r,o)=>(r[3]&&(a[r[3]]=o),r[2]&&r[2].filter(c=>typeof c=="number").forEach(c=>{a[c.toString(16)]=o}),a)),Te=t((a,r,o)=>(a[o]=o,r[2]&&r[2].filter(c=>typeof c=="string").forEach(c=>{a[c]=o}),a)),Re=t((a,r,o)=>{const i=r[2];return a[o]=o,i.forEach(c=>{a[c]=o}),a});const e="far"in V||l.autoFetchSvg,n=ft(Xn,(a,r)=>{const o=r[0];let i=r[1];const c=r[2];return i==="far"&&!e&&(i="fas"),typeof o=="string"&&(a.names[o]={prefix:i,iconName:c}),typeof o=="number"&&(a.unicodes[o.toString(16)]={prefix:i,iconName:c}),a},{names:{},unicodes:{}});_e=n.names,ze=n.unicodes,_t=rt(l.styleDefault,{family:l.familyDefault})};Tn(t=>{_t=rt(t.styleDefault,{family:l.familyDefault})});De();function zt(t,e){return(Fe[t]||{})[e]}function Kn(t,e){return(Te[t]||{})[e]}function T(t,e){return(Re[t]||{})[e]}function je(t){return _e[t]||{prefix:null,iconName:null}}function qn(t){const e=ze[t],n=zt("fas",t);return e||(n?{prefix:"fas",iconName:n}:null)||{prefix:null,iconName:null}}function I(){return _t}const Ye=()=>({prefix:null,iconName:null,rest:[]});function Qn(t){let e=h;const n=Me.reduce((a,r)=>(a[r]="".concat(l.cssPrefix,"-").concat(r),a),{});return xe.forEach(a=>{(t.includes(n[a])||t.some(r=>Bn[a].includes(r)))&&(e=a)}),e}function rt(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{family:n=h}=e,a=En[n][t];if(n===nt&&!t)return"fad";const r=Vt[n][t]||Vt[n][a],o=t in k.styles?t:null;return r||o||null}function Jn(t){let e=[],n=null;return t.forEach(a=>{const r=$n(l.cssPrefix,a);r?n=r:a&&e.push(a)}),{iconName:n,rest:e}}function Qt(t){return t.sort().filter((e,n,a)=>a.indexOf(e)===n)}function ot(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{skipLookups:n=!1}=e;let a=null;const r=gt.concat(gn),o=Qt(t.filter(g=>r.includes(g))),i=Qt(t.filter(g=>!gt.includes(g))),c=o.filter(g=>(a=g,!ve.includes(g))),[u=null]=c,f=Qn(o),m=s(s({},Jn(i)),{},{prefix:rt(u,{family:f})});return s(s(s({},m),na({values:t,family:f,styles:V,config:l,canonical:m,givenPrefix:a})),Zn(n,a,m))}function Zn(t,e,n){let{prefix:a,iconName:r}=n;if(t||!a||!r)return{prefix:a,iconName:r};const o=e==="fa"?je(r):{},i=T(a,r);return r=o.iconName||i||r,a=o.prefix||a,a==="far"&&!V.far&&V.fas&&!l.autoFetchSvg&&(a="fas"),{prefix:a,iconName:r}}const ta=xe.filter(t=>t!==h||t!==nt),ea=Object.keys(dt).filter(t=>t!==h).map(t=>Object.keys(dt[t])).flat();function na(t){const{values:e,family:n,canonical:a,givenPrefix:r="",styles:o={},config:i={}}=t,c=n===nt,u=e.includes("fa-duotone")||e.includes("fad"),f=i.familyDefault==="duotone",m=a.prefix==="fad"||a.prefix==="fa-duotone";if(!c&&(u||f||m)&&(a.prefix="fad"),(e.includes("fa-brands")||e.includes("fab"))&&(a.prefix="fab"),!a.prefix&&ta.includes(n)&&(Object.keys(o).find(d=>ea.includes(d))||i.autoFetchSvg)){const d=on.get(n).defaultShortPrefixId;a.prefix=d,a.iconName=T(a.prefix,a.iconName)||a.iconName}return(a.prefix==="fa"||r==="fa")&&(a.prefix=I()||"fas"),a}class aa{constructor(){this.definitions={}}add(){for(var e=arguments.length,n=new Array(e),a=0;a<e;a++)n[a]=arguments[a];const r=n.reduce(this._pullDefinitions,{});Object.keys(r).forEach(o=>{this.definitions[o]=s(s({},this.definitions[o]||{}),r[o]),At(o,r[o]);const i=Mt[h][o];i&&At(i,r[o]),De()})}reset(){this.definitions={}}_pullDefinitions(e,n){const a=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(a).map(r=>{const{prefix:o,iconName:i,icon:c}=a[r],u=c[2];e[o]||(e[o]={}),u.length>0&&u.forEach(f=>{typeof f=="string"&&(e[o][f]=c)}),e[o][i]=c}),e}}let Jt=[],j={};const Y={},ra=Object.keys(Y);function oa(t,e){let{mixoutsTo:n}=e;return Jt=t,j={},Object.keys(Y).forEach(a=>{ra.indexOf(a)===-1&&delete Y[a]}),Jt.forEach(a=>{const r=a.mixout?a.mixout():{};if(Object.keys(r).forEach(o=>{typeof r[o]=="function"&&(n[o]=r[o]),typeof r[o]=="object"&&Object.keys(r[o]).forEach(i=>{n[o]||(n[o]={}),n[o][i]=r[o][i]})}),a.hooks){const o=a.hooks();Object.keys(o).forEach(i=>{j[i]||(j[i]=[]),j[i].push(o[i])})}a.provides&&a.provides(Y)}),n}function wt(t,e){for(var n=arguments.length,a=new Array(n>2?n-2:0),r=2;r<n;r++)a[r-2]=arguments[r];return(j[t]||[]).forEach(i=>{e=i.apply(null,[e,...a])}),e}function z(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),a=1;a<e;a++)n[a-1]=arguments[a];(j[t]||[]).forEach(o=>{o.apply(null,n)})}function M(){const t=arguments[0],e=Array.prototype.slice.call(arguments,1);return Y[t]?Y[t].apply(null,e):void 0}function kt(t){t.prefix==="fa"&&(t.prefix="fas");let{iconName:e}=t;const n=t.prefix||I();if(e)return e=T(n,e)||e,Kt(Ue.definitions,n,e)||Kt(k.styles,n,e)}const Ue=new aa,ia=()=>{l.autoReplaceSvg=!1,l.observeMutations=!1,z("noAuto")},sa={i2svg:function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return C?(z("beforeI2svg",t),M("pseudoElements2svg",t),M("i2svg",t)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:e}=t;l.autoReplaceSvg===!1&&(l.autoReplaceSvg=!0),l.observeMutations=!0,Wn(()=>{la({autoReplaceSvgRoot:e}),z("watch",t)})}},ca={icon:t=>{if(t===null)return null;if(typeof t=="object"&&t.prefix&&t.iconName)return{prefix:t.prefix,iconName:T(t.prefix,t.iconName)||t.iconName};if(Array.isArray(t)&&t.length===2){const e=t[1].indexOf("fa-")===0?t[1].slice(3):t[1],n=rt(t[0]);return{prefix:n,iconName:T(n,e)||e}}if(typeof t=="string"&&(t.indexOf("".concat(l.cssPrefix,"-"))>-1||t.match(Cn))){const e=ot(t.split(" "),{skipLookups:!0});return{prefix:e.prefix||I(),iconName:T(e.prefix,e.iconName)||e.iconName}}if(typeof t=="string"){const e=I();return{prefix:e,iconName:T(e,t)||t}}}},v={noAuto:ia,config:l,dom:sa,parse:ca,library:Ue,findIconDefinition:kt,toHtml:K},la=function(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:e=p}=t;(Object.keys(k.styles).length>0||l.autoFetchSvg)&&C&&l.autoReplaceSvg&&v.dom.i2svg({node:e})};function it(t,e){return Object.defineProperty(t,"abstract",{get:e}),Object.defineProperty(t,"html",{get:function(){return t.abstract.map(n=>K(n))}}),Object.defineProperty(t,"node",{get:function(){if(!C)return;const n=p.createElement("div");return n.innerHTML=t.html,n.children}}),t}function fa(t){let{children:e,main:n,mask:a,attributes:r,styles:o,transform:i}=t;if(Tt(i)&&n.found&&!a.found){const{width:c,height:u}=n,f={x:c/u/2,y:.5};r.style=at(s(s({},o),{},{"transform-origin":"".concat(f.x+i.x/16,"em ").concat(f.y+i.y/16,"em")}))}return[{tag:"svg",attributes:r,children:e}]}function ua(t){let{prefix:e,iconName:n,children:a,attributes:r,symbol:o}=t;const i=o===!0?"".concat(e,"-").concat(l.cssPrefix,"-").concat(n):o;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:s(s({},r),{},{id:i}),children:a}]}]}function Rt(t){const{icons:{main:e,mask:n},prefix:a,iconName:r,transform:o,symbol:i,title:c,maskId:u,titleId:f,extra:m,watchable:g=!1}=t,{width:d,height:b}=n.found?n:e,L=un.includes(a),F=[l.replacementClass,r?"".concat(l.cssPrefix,"-").concat(r):""].filter(D=>m.classes.indexOf(D)===-1).filter(D=>D!==""||!!D).concat(m.classes).join(" ");let x={children:[],attributes:s(s({},m.attributes),{},{"data-prefix":a,"data-icon":r,class:F,role:m.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(d," ").concat(b)})};const S=L&&!~m.classes.indexOf("fa-fw")?{width:"".concat(d/b*16*.0625,"em")}:{};g&&(x.attributes[_]=""),c&&(x.children.push({tag:"title",attributes:{id:x.attributes["aria-labelledby"]||"title-".concat(f||B())},children:[c]}),delete x.attributes.title);const y=s(s({},x),{},{prefix:a,iconName:r,main:e,mask:n,maskId:u,transform:o,symbol:i,styles:s(s({},S),m.styles)}),{children:A,attributes:R}=n.found&&e.found?M("generateAbstractMask",y)||{children:[],attributes:{}}:M("generateAbstractIcon",y)||{children:[],attributes:{}};return y.children=A,y.attributes=R,i?ua(y):fa(y)}function Zt(t){const{content:e,width:n,height:a,transform:r,title:o,extra:i,watchable:c=!1}=t,u=s(s(s({},i.attributes),o?{title:o}:{}),{},{class:i.classes.join(" ")});c&&(u[_]="");const f=s({},i.styles);Tt(r)&&(f.transform=jn({transform:r,startCentered:!0,width:n,height:a}),f["-webkit-transform"]=f.transform);const m=at(f);m.length>0&&(u.style=m);const g=[];return g.push({tag:"span",attributes:u,children:[e]}),o&&g.push({tag:"span",attributes:{class:"sr-only"},children:[o]}),g}function ma(t){const{content:e,title:n,extra:a}=t,r=s(s(s({},a.attributes),n?{title:n}:{}),{},{class:a.classes.join(" ")}),o=at(a.styles);o.length>0&&(r.style=o);const i=[];return i.push({tag:"span",attributes:r,children:[e]}),n&&i.push({tag:"span",attributes:{class:"sr-only"},children:[n]}),i}const{styles:ut}=k;function St(t){const e=t[0],n=t[1],[a]=t.slice(4);let r=null;return Array.isArray(a)?r={tag:"g",attributes:{class:"".concat(l.cssPrefix,"-").concat(ct.GROUP)},children:[{tag:"path",attributes:{class:"".concat(l.cssPrefix,"-").concat(ct.SECONDARY),fill:"currentColor",d:a[0]}},{tag:"path",attributes:{class:"".concat(l.cssPrefix,"-").concat(ct.PRIMARY),fill:"currentColor",d:a[1]}}]}:r={tag:"path",attributes:{fill:"currentColor",d:a}},{found:!0,width:e,height:n,icon:r}}const da={found:!1,width:512,height:512};function ga(t,e){!Se&&!l.showMissingIcons&&t&&console.error('Icon with name "'.concat(t,'" and prefix "').concat(e,'" is missing.'))}function Pt(t,e){let n=e;return e==="fa"&&l.styleDefault!==null&&(e=I()),new Promise((a,r)=>{if(n==="fa"){const o=je(t)||{};t=o.iconName||t,e=o.prefix||e}if(t&&e&&ut[e]&&ut[e][t]){const o=ut[e][t];return a(St(o))}ga(t,e),a(s(s({},da),{},{icon:l.showMissingIcons&&t?M("missingIconAbstract")||{}:{}}))})}const te=()=>{},Et=l.measurePerformance&&q&&q.mark&&q.measure?q:{mark:te,measure:te},H='FA "6.7.2"',pa=t=>(Et.mark("".concat(H," ").concat(t," begins")),()=>We(t)),We=t=>{Et.mark("".concat(H," ").concat(t," ends")),Et.measure("".concat(H," ").concat(t),"".concat(H," ").concat(t," begins"),"".concat(H," ").concat(t," ends"))};var Dt={begin:pa,end:We};const J=()=>{};function ee(t){return typeof(t.getAttribute?t.getAttribute(_):null)=="string"}function ha(t){const e=t.getAttribute?t.getAttribute(Nt):null,n=t.getAttribute?t.getAttribute(It):null;return e&&n}function ba(t){return t&&t.classList&&t.classList.contains&&t.classList.contains(l.replacementClass)}function ya(){return l.autoReplaceSvg===!0?Z.replace:Z[l.autoReplaceSvg]||Z.replace}function va(t){return p.createElementNS("http://www.w3.org/2000/svg",t)}function xa(t){return p.createElement(t)}function He(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{ceFn:n=t.tag==="svg"?va:xa}=e;if(typeof t=="string")return p.createTextNode(t);const a=n(t.tag);return Object.keys(t.attributes||[]).forEach(function(o){a.setAttribute(o,t.attributes[o])}),(t.children||[]).forEach(function(o){a.appendChild(He(o,{ceFn:n}))}),a}function Aa(t){let e=" ".concat(t.outerHTML," ");return e="".concat(e,"Font Awesome fontawesome.com "),e}const Z={replace:function(t){const e=t[0];if(e.parentNode)if(t[1].forEach(n=>{e.parentNode.insertBefore(He(n),e)}),e.getAttribute(_)===null&&l.keepOriginalSource){let n=p.createComment(Aa(e));e.parentNode.replaceChild(n,e)}else e.remove()},nest:function(t){const e=t[0],n=t[1];if(~Ft(e).indexOf(l.replacementClass))return Z.replace(t);const a=new RegExp("".concat(l.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){const o=n[0].attributes.class.split(" ").reduce((i,c)=>(c===l.replacementClass||c.match(a)?i.toSvg.push(c):i.toNode.push(c),i),{toNode:[],toSvg:[]});n[0].attributes.class=o.toSvg.join(" "),o.toNode.length===0?e.removeAttribute("class"):e.setAttribute("class",o.toNode.join(" "))}const r=n.map(o=>K(o)).join(`
`);e.setAttribute(_,""),e.innerHTML=r}};function ne(t){t()}function Ge(t,e){const n=typeof e=="function"?e:J;if(t.length===0)n();else{let a=ne;l.mutateApproach===Sn&&(a=N.requestAnimationFrame||ne),a(()=>{const r=ya(),o=Dt.begin("mutate");t.map(r),o(),n()})}}let jt=!1;function Xe(){jt=!0}function Ct(){jt=!1}let et=null;function ae(t){if(!Ht||!l.observeMutations)return;const{treeCallback:e=J,nodeCallback:n=J,pseudoElementsCallback:a=J,observeMutationsRoot:r=p}=t;et=new Ht(o=>{if(jt)return;const i=I();W(o).forEach(c=>{if(c.type==="childList"&&c.addedNodes.length>0&&!ee(c.addedNodes[0])&&(l.searchPseudoElements&&a(c.target),e(c.target)),c.type==="attributes"&&c.target.parentNode&&l.searchPseudoElements&&a(c.target.parentNode),c.type==="attributes"&&ee(c.target)&&~Nn.indexOf(c.attributeName))if(c.attributeName==="class"&&ha(c.target)){const{prefix:u,iconName:f}=ot(Ft(c.target));c.target.setAttribute(Nt,u||i),f&&c.target.setAttribute(It,f)}else ba(c.target)&&n(c.target)})}),C&&et.observe(r,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}function wa(){et&&et.disconnect()}function ka(t){const e=t.getAttribute("style");let n=[];return e&&(n=e.split(";").reduce((a,r)=>{const o=r.split(":"),i=o[0],c=o.slice(1);return i&&c.length>0&&(a[i]=c.join(":").trim()),a},{})),n}function Sa(t){const e=t.getAttribute("data-prefix"),n=t.getAttribute("data-icon"),a=t.innerText!==void 0?t.innerText.trim():"";let r=ot(Ft(t));return r.prefix||(r.prefix=I()),e&&n&&(r.prefix=e,r.iconName=n),r.iconName&&r.prefix||(r.prefix&&a.length>0&&(r.iconName=Kn(r.prefix,t.innerText)||zt(r.prefix,xt(t.innerText))),!r.iconName&&l.autoFetchSvg&&t.firstChild&&t.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=t.firstChild.data)),r}function Pa(t){const e=W(t.attributes).reduce((r,o)=>(r.name!=="class"&&r.name!=="style"&&(r[o.name]=o.value),r),{}),n=t.getAttribute("title"),a=t.getAttribute("data-fa-title-id");return l.autoA11y&&(n?e["aria-labelledby"]="".concat(l.replacementClass,"-title-").concat(a||B()):(e["aria-hidden"]="true",e.focusable="false")),e}function Ea(){return{iconName:null,title:null,titleId:null,prefix:null,transform:w,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function re(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0};const{iconName:n,prefix:a,rest:r}=Sa(t),o=Pa(t),i=wt("parseNodeAttributes",{},t);let c=e.styleParser?ka(t):[];return s({iconName:n,title:t.getAttribute("title"),titleId:t.getAttribute("data-fa-title-id"),prefix:a,transform:w,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:r,styles:c,attributes:o}},i)}const{styles:Ca}=k;function Be(t){const e=l.autoReplaceSvg==="nest"?re(t,{styleParser:!1}):re(t);return~e.extra.classes.indexOf(Ee)?M("generateLayersText",t,e):M("generateSvgReplacementMutation",t,e)}function La(){return[...cn,...gt]}function oe(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!C)return Promise.resolve();const n=p.documentElement.classList,a=m=>n.add("".concat(Bt,"-").concat(m)),r=m=>n.remove("".concat(Bt,"-").concat(m)),o=l.autoFetchSvg?La():ve.concat(Object.keys(Ca));o.includes("fa")||o.push("fa");const i=[".".concat(Ee,":not([").concat(_,"])")].concat(o.map(m=>".".concat(m,":not([").concat(_,"])"))).join(", ");if(i.length===0)return Promise.resolve();let c=[];try{c=W(t.querySelectorAll(i))}catch{}if(c.length>0)a("pending"),r("complete");else return Promise.resolve();const u=Dt.begin("onTree"),f=c.reduce((m,g)=>{try{const d=Be(g);d&&m.push(d)}catch(d){Se||d.name==="MissingIcon"&&console.error(d)}return m},[]);return new Promise((m,g)=>{Promise.all(f).then(d=>{Ge(d,()=>{a("active"),a("complete"),r("pending"),typeof e=="function"&&e(),u(),m()})}).catch(d=>{u(),g(d)})})}function Oa(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Be(t).then(n=>{n&&Ge([n],e)})}function Na(t){return function(e){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const a=(e||{}).icon?e:kt(e||{});let{mask:r}=n;return r&&(r=(r||{}).icon?r:kt(r||{})),t(a,s(s({},n),{},{mask:r}))}}const Ia=function(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=w,symbol:a=!1,mask:r=null,maskId:o=null,title:i=null,titleId:c=null,classes:u=[],attributes:f={},styles:m={}}=e;if(!t)return;const{prefix:g,iconName:d,icon:b}=t;return it(s({type:"icon"},t),()=>(z("beforeDOMElementCreation",{iconDefinition:t,params:e}),l.autoA11y&&(i?f["aria-labelledby"]="".concat(l.replacementClass,"-title-").concat(c||B()):(f["aria-hidden"]="true",f.focusable="false")),Rt({icons:{main:St(b),mask:r?St(r.icon):{found:!1,width:null,height:null,icon:{}}},prefix:g,iconName:d,transform:s(s({},w),n),symbol:a,title:i,maskId:o,titleId:c,extra:{attributes:f,styles:m,classes:u}})))};var Ma={mixout(){return{icon:Na(Ia)}},hooks(){return{mutationObserverCallbacks(t){return t.treeCallback=oe,t.nodeCallback=Oa,t}}},provides(t){t.i2svg=function(e){const{node:n=p,callback:a=()=>{}}=e;return oe(n,a)},t.generateSvgReplacementMutation=function(e,n){const{iconName:a,title:r,titleId:o,prefix:i,transform:c,symbol:u,mask:f,maskId:m,extra:g}=n;return new Promise((d,b)=>{Promise.all([Pt(a,i),f.iconName?Pt(f.iconName,f.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(L=>{let[F,x]=L;d([e,Rt({icons:{main:F,mask:x},prefix:i,iconName:a,transform:c,symbol:u,maskId:m,title:r,titleId:o,extra:g,watchable:!0})])}).catch(b)})},t.generateAbstractIcon=function(e){let{children:n,attributes:a,main:r,transform:o,styles:i}=e;const c=at(i);c.length>0&&(a.style=c);let u;return Tt(o)&&(u=M("generateAbstractTransformGrouping",{main:r,transform:o,containerWidth:r.width,iconWidth:r.width})),n.push(u||r.icon),{children:n,attributes:a}}}},Fa={mixout(){return{layer(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{classes:n=[]}=e;return it({type:"layer"},()=>{z("beforeDOMElementCreation",{assembler:t,params:e});let a=[];return t(r=>{Array.isArray(r)?r.map(o=>{a=a.concat(o.abstract)}):a=a.concat(r.abstract)}),[{tag:"span",attributes:{class:["".concat(l.cssPrefix,"-layers"),...n].join(" ")},children:a}]})}}}},Ta={mixout(){return{counter(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{title:n=null,classes:a=[],attributes:r={},styles:o={}}=e;return it({type:"counter",content:t},()=>(z("beforeDOMElementCreation",{content:t,params:e}),ma({content:t.toString(),title:n,extra:{attributes:r,styles:o,classes:["".concat(l.cssPrefix,"-layers-counter"),...a]}})))}}}},_a={mixout(){return{text(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=w,title:a=null,classes:r=[],attributes:o={},styles:i={}}=e;return it({type:"text",content:t},()=>(z("beforeDOMElementCreation",{content:t,params:e}),Zt({content:t,transform:s(s({},w),n),title:a,extra:{attributes:o,styles:i,classes:["".concat(l.cssPrefix,"-layers-text"),...r]}})))}}},provides(t){t.generateLayersText=function(e,n){const{title:a,transform:r,extra:o}=n;let i=null,c=null;if(be){const u=parseInt(getComputedStyle(e).fontSize,10),f=e.getBoundingClientRect();i=f.width/u,c=f.height/u}return l.autoA11y&&!a&&(o.attributes["aria-hidden"]="true"),Promise.resolve([e,Zt({content:e.innerHTML,width:i,height:c,transform:r,title:a,extra:o,watchable:!0})])}}};const za=new RegExp('"',"ug"),ie=[1105920,1112319],se=s(s(s(s({},{FontAwesome:{normal:"fas",400:"fas"}}),rn),wn),pn),Lt=Object.keys(se).reduce((t,e)=>(t[e.toLowerCase()]=se[e],t),{}),Ra=Object.keys(Lt).reduce((t,e)=>{const n=Lt[e];return t[e]=n[900]||[...Object.entries(n)][0][1],t},{});function Da(t){const e=t.replace(za,""),n=Gn(e,0),a=n>=ie[0]&&n<=ie[1],r=e.length===2?e[0]===e[1]:!1;return{value:xt(r?e[0]:e),isSecondary:a||r}}function ja(t,e){const n=t.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(e),r=isNaN(a)?"normal":a;return(Lt[n]||{})[r]||Ra[n]}function ce(t,e){const n="".concat(kn).concat(e.replace(":","-"));return new Promise((a,r)=>{if(t.getAttribute(n)!==null)return a();const i=W(t.children).filter(d=>d.getAttribute(ht)===e)[0],c=N.getComputedStyle(t,e),u=c.getPropertyValue("font-family"),f=u.match(Ln),m=c.getPropertyValue("font-weight"),g=c.getPropertyValue("content");if(i&&!f)return t.removeChild(i),a();if(f&&g!=="none"&&g!==""){const d=c.getPropertyValue("content");let b=ja(u,m);const{value:L,isSecondary:F}=Da(d),x=f[0].startsWith("FontAwesome");let S=zt(b,L),y=S;if(x){const A=qn(L);A.iconName&&A.prefix&&(S=A.iconName,b=A.prefix)}if(S&&!F&&(!i||i.getAttribute(Nt)!==b||i.getAttribute(It)!==y)){t.setAttribute(n,y),i&&t.removeChild(i);const A=Ea(),{extra:R}=A;R.attributes[ht]=e,Pt(S,b).then(D=>{const Ve=Rt(s(s({},A),{},{icons:{main:D,mask:Ye()},prefix:b,iconName:y,extra:R,watchable:!0})),st=p.createElementNS("http://www.w3.org/2000/svg","svg");e==="::before"?t.insertBefore(st,t.firstChild):t.appendChild(st),st.outerHTML=Ve.map($e=>K($e)).join(`
`),t.removeAttribute(n),a()}).catch(r)}else a()}else a()})}function Ya(t){return Promise.all([ce(t,"::before"),ce(t,"::after")])}function Ua(t){return t.parentNode!==document.head&&!~Pn.indexOf(t.tagName.toUpperCase())&&!t.getAttribute(ht)&&(!t.parentNode||t.parentNode.tagName!=="svg")}function le(t){if(C)return new Promise((e,n)=>{const a=W(t.querySelectorAll("*")).filter(Ua).map(Ya),r=Dt.begin("searchPseudoElements");Xe(),Promise.all(a).then(()=>{r(),Ct(),e()}).catch(()=>{r(),Ct(),n()})})}var Wa={hooks(){return{mutationObserverCallbacks(t){return t.pseudoElementsCallback=le,t}}},provides(t){t.pseudoElements2svg=function(e){const{node:n=p}=e;l.searchPseudoElements&&le(n)}}};let fe=!1;var Ha={mixout(){return{dom:{unwatch(){Xe(),fe=!0}}}},hooks(){return{bootstrap(){ae(wt("mutationObserverCallbacks",{}))},noAuto(){wa()},watch(t){const{observeMutationsRoot:e}=t;fe?Ct():ae(wt("mutationObserverCallbacks",{observeMutationsRoot:e}))}}}};const ue=t=>{let e={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t.toLowerCase().split(" ").reduce((n,a)=>{const r=a.toLowerCase().split("-"),o=r[0];let i=r.slice(1).join("-");if(o&&i==="h")return n.flipX=!0,n;if(o&&i==="v")return n.flipY=!0,n;if(i=parseFloat(i),isNaN(i))return n;switch(o){case"grow":n.size=n.size+i;break;case"shrink":n.size=n.size-i;break;case"left":n.x=n.x-i;break;case"right":n.x=n.x+i;break;case"up":n.y=n.y-i;break;case"down":n.y=n.y+i;break;case"rotate":n.rotate=n.rotate+i;break}return n},e)};var Ga={mixout(){return{parse:{transform:t=>ue(t)}}},hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-transform");return n&&(t.transform=ue(n)),t}}},provides(t){t.generateAbstractTransformGrouping=function(e){let{main:n,transform:a,containerWidth:r,iconWidth:o}=e;const i={transform:"translate(".concat(r/2," 256)")},c="translate(".concat(a.x*32,", ").concat(a.y*32,") "),u="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),f="rotate(".concat(a.rotate," 0 0)"),m={transform:"".concat(c," ").concat(u," ").concat(f)},g={transform:"translate(".concat(o/2*-1," -256)")},d={outer:i,inner:m,path:g};return{tag:"g",attributes:s({},d.outer),children:[{tag:"g",attributes:s({},d.inner),children:[{tag:n.icon.tag,children:n.icon.children,attributes:s(s({},n.icon.attributes),d.path)}]}]}}}};const mt={x:0,y:0,width:"100%",height:"100%"};function me(t){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return t.attributes&&(t.attributes.fill||e)&&(t.attributes.fill="black"),t}function Xa(t){return t.tag==="g"?t.children:[t]}var Ba={hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-mask"),a=n?ot(n.split(" ").map(r=>r.trim())):Ye();return a.prefix||(a.prefix=I()),t.mask=a,t.maskId=e.getAttribute("data-fa-mask-id"),t}}},provides(t){t.generateAbstractMask=function(e){let{children:n,attributes:a,main:r,mask:o,maskId:i,transform:c}=e;const{width:u,icon:f}=r,{width:m,icon:g}=o,d=Dn({transform:c,containerWidth:m,iconWidth:u}),b={tag:"rect",attributes:s(s({},mt),{},{fill:"white"})},L=f.children?{children:f.children.map(me)}:{},F={tag:"g",attributes:s({},d.inner),children:[me(s({tag:f.tag,attributes:s(s({},f.attributes),d.path)},L))]},x={tag:"g",attributes:s({},d.outer),children:[F]},S="mask-".concat(i||B()),y="clip-".concat(i||B()),A={tag:"mask",attributes:s(s({},mt),{},{id:S,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[b,x]},R={tag:"defs",children:[{tag:"clipPath",attributes:{id:y},children:Xa(g)},A]};return n.push(R,{tag:"rect",attributes:s({fill:"currentColor","clip-path":"url(#".concat(y,")"),mask:"url(#".concat(S,")")},mt)}),{children:n,attributes:a}}}},Va={provides(t){let e=!1;N.matchMedia&&(e=N.matchMedia("(prefers-reduced-motion: reduce)").matches),t.missingIconAbstract=function(){const n=[],a={fill:"currentColor"},r={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:s(s({},a),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});const o=s(s({},r),{},{attributeName:"opacity"}),i={tag:"circle",attributes:s(s({},a),{},{cx:"256",cy:"364",r:"28"}),children:[]};return e||i.children.push({tag:"animate",attributes:s(s({},r),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:s(s({},o),{},{values:"1;0;1;1;0;1;"})}),n.push(i),n.push({tag:"path",attributes:s(s({},a),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:e?[]:[{tag:"animate",attributes:s(s({},o),{},{values:"1;0;0;0;0;1;"})}]}),e||n.push({tag:"path",attributes:s(s({},a),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:s(s({},o),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},$a={hooks(){return{parseNodeAttributes(t,e){const n=e.getAttribute("data-fa-symbol"),a=n===null?!1:n===""?!0:n;return t.symbol=a,t}}}},Ka=[Un,Ma,Fa,Ta,_a,Wa,Ha,Ga,Ba,Va,$a];oa(Ka,{mixoutsTo:v});v.noAuto;v.config;const de=v.library,qa=v.dom;v.parse;v.findIconDefinition;v.toHtml;v.icon;v.layer;v.text;v.counter;/*!
 * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2024 Fonticons, Inc.
 */const Qa={prefix:"far",iconName:"star",icon:[576,512,[11088,61446],"f005","M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"]};/*!
 * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2024 Fonticons, Inc.
 */const Ja={prefix:"fas",iconName:"forward-step",icon:[320,512,["step-forward"],"f051","M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241l0-145c0-17.7 14.3-32 32-32s32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-145-11.5 9.6-192 160z"]},Za=Ja,tr={prefix:"fas",iconName:"arrow-right-from-bracket",icon:[512,512,["sign-out"],"f08b","M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"]},er={prefix:"fas",iconName:"eye-slash",icon:[640,512,[],"f070","M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"]},nr={prefix:"fas",iconName:"chevron-up",icon:[512,512,[],"f077","M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"]},ar={prefix:"fas",iconName:"bullhorn",icon:[512,512,[128226,128363],"f0a1","M480 32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L381.7 53c-48 48-113.1 75-181 75l-8.7 0-32 0-96 0c-35.3 0-64 28.7-64 64l0 96c0 35.3 28.7 64 64 64l0 128c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-128 8.7 0c67.9 0 133 27 181 75l43.6 43.6c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-147.6c18.6-8.8 32-32.5 32-60.4s-13.4-51.6-32-60.4L480 32zm-64 76.7L416 240l0 131.3C357.2 317.8 280.5 288 200.7 288l-8.7 0 0-96 8.7 0c79.8 0 156.5-29.8 215.3-83.3z"]},rr={prefix:"fas",iconName:"star",icon:[576,512,[11088,61446],"f005","M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"]},or={prefix:"fas",iconName:"arrow-right",icon:[448,512,[8594],"f061","M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"]},ir={prefix:"fas",iconName:"heart",icon:[512,512,[128153,128154,128155,128156,128420,129293,129294,129505,9829,10084,61578],"f004","M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"]},sr={prefix:"fas",iconName:"lock-open",icon:[576,512,[],"f3c1","M352 144c0-44.2 35.8-80 80-80s80 35.8 80 80l0 48c0 17.7 14.3 32 32 32s32-14.3 32-32l0-48C576 64.5 511.5 0 432 0S288 64.5 288 144l0 48L64 192c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-32 0 0-48z"]},cr={prefix:"fas",iconName:"eye",icon:[576,512,[128065],"f06e","M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"]},lr={prefix:"fas",iconName:"arrow-left",icon:[448,512,[8592],"f060","M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"]},fr={prefix:"fas",iconName:"circle-info",icon:[512,512,["info-circle"],"f05a","M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]},ur={prefix:"fas",iconName:"arrow-rotate-left",icon:[512,512,[8634,"arrow-left-rotate","arrow-rotate-back","arrow-rotate-backward","undo"],"f0e2","M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"]},mr={prefix:"fas",iconName:"gear",icon:[512,512,[9881,"cog"],"f013","M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"]},dr={prefix:"fas",iconName:"bolt",icon:[448,512,[9889,"zap"],"f0e7","M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"]},gr={prefix:"fas",iconName:"play",icon:[384,512,[9654],"f04b","M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"]},pr={prefix:"fas",iconName:"chevron-down",icon:[512,512,[],"f078","M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"]},hr={prefix:"fas",iconName:"xmark",icon:[384,512,[128473,10005,10006,10060,215,"close","multiply","remove","times"],"f00d","M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"]},br={prefix:"fas",iconName:"right-left",icon:[512,512,["exchange-alt"],"f362","M32 96l320 0 0-64c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-64L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32l-320 0 0 64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64 320 0z"]};function yr(){de.add(lr,or,tr,ur,dr,ar,pr,nr,fr,cr,er,mr,ir,sr,gr,br,rr,Za,hr),de.add(Qa),qa.watch()}yr();
//# sourceMappingURL=index.js.map
