import{o as f,u as m,c as s,i as t,S as u,F as h,t as o}from"./index.63c3418c.js";import v from"./_...404_.0cdb4451.js";import{v as C}from"./Changes.ab956cb8.js";import{U as N}from"./Tab.81eba0f1.js";import"./Games.49d8852b.js";const b=o('<p class="text-center"></p>'),S=o('<div class="py-5"><h2 class="text-xl">Additions</h2><ul class="list-disc"></ul></div>'),w=o('<div class="py-5"><h2 class="text-xl">Fixes</h2><ul class="list-disc"></ul></div>'),y=o('<div class="py-5"><h2 class="text-xl">Updates</h2><ul class="list-disc"></ul></div>'),F=o('<div class="py-5"><h2 class="text-xl">Deductions</h2><ul class="list-disc"></ul></div>'),U=o('<div class="bg-gray-900 text-gray-100"><div class="text-center mb-10"><h1 class="text-2xl pt-10"></h1><p class="italic pb-10"></p></div></div>'),p=o('<li class="list-disc">&bull; </li>');function V(_){f(()=>{N()});let a;_.version?a=_.version:a=m().pathname.split("/").at(-1);const e=C[a];return e?(()=>{const $=U.cloneNode(!0),d=$.firstChild,g=d.firstChild,x=g.nextSibling;return t(g,`v${a}`),t(x,()=>e.date),t(d,s(u,{get when(){return e.description},get children(){const n=b.cloneNode(!0);return t(n,()=>e.description),n}}),null),t(d,s(u,{get when(){return e.additions&&e.additions.length>0},get children(){const n=S.cloneNode(!0),i=n.firstChild,r=i.nextSibling;return t(r,s(h,{get each(){return e.additions},children:c=>(()=>{const l=p.cloneNode(!0);return l.firstChild,t(l,c,null),l})()})),n}}),null),t(d,s(u,{get when(){return e.fixes&&e.fixes.length>0},get children(){const n=w.cloneNode(!0),i=n.firstChild,r=i.nextSibling;return t(r,s(h,{get each(){return e.fixes},children:c=>(()=>{const l=p.cloneNode(!0);return l.firstChild,t(l,c,null),l})()})),n}}),null),t(d,s(u,{get when(){return e.updates&&e.updates.length>0},get children(){const n=y.cloneNode(!0),i=n.firstChild,r=i.nextSibling;return t(r,s(h,{get each(){return e.updates},children:c=>(()=>{const l=p.cloneNode(!0);return l.firstChild,t(l,c,null),l})()})),n}}),null),t(d,s(u,{get when(){return e.deductions&&e.deductions.length>0},get children(){const n=F.cloneNode(!0),i=n.firstChild,r=i.nextSibling;return t(r,s(h,{get each(){return e.deductions},children:c=>(()=>{const l=p.cloneNode(!0);return l.firstChild,t(l,c,null),l})()})),n}}),null),$})():s(v,{})}export{V as default};
