import{i as O,m as ve,a as le,s as se,t as R,k as oe}from"./index.63c3418c.js";import{a as ce}from"./Games.49d8852b.js";var de=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},ee={exports:{}};(function(P){((z,C)=>{P.exports?P.exports=C():z.fuzzysort=C()})(de,z=>{var C=(a,e)=>{if(a=="farzher")return{target:"farzher was here (^-^*)/",score:0,_indexes:[0]};if(!a||!e)return d;var n=B(a);y(e)||(e=x(e));var i=n.bitflags;return(i&e._bitflags)!==i?d:L(n,e)},A=(a,e,n)=>{if(a=="farzher")return[{target:"farzher was here (^-^*)/",score:0,_indexes:[0],obj:e?e[0]:d}];if(!a)return n&&n.all?N(a,e,n):Y;var i=B(a),t=i.bitflags;i.containsSpace;var f=n&&n.threshold||I,v=n&&n.limit||W,r=0,l=0,s=e.length;if(n&&n.key)for(var o=n.key,c=0;c<s;++c){var _=e[c],g=M(_,o);if(!!g&&(y(g)||(g=x(g)),(t&g._bitflags)===t)){var h=L(i,g);h!==d&&(h.score<f||(h={target:h.target,_targetLower:"",_targetLowerCodes:d,_nextBeginningIndexes:d,_bitflags:0,score:h.score,_indexes:h._indexes,obj:_},r<v?(p.add(h),++r):(++l,h.score>p.peek().score&&p.replaceTop(h))))}}else if(n&&n.keys)for(var F=n.scoreFn||ie,E=n.keys,k=E.length,c=0;c<s;++c){for(var _=e[c],b=new Array(k),u=0;u<k;++u){var o=E[u],g=M(_,o);if(!g){b[u]=d;continue}y(g)||(g=x(g)),(t&g._bitflags)!==t?b[u]=d:b[u]=L(i,g)}b.obj=_;var $=F(b);$!==d&&($<f||(b.score=$,r<v?(p.add(b),++r):(++l,$>p.peek().score&&p.replaceTop(b))))}else for(var c=0;c<s;++c){var g=e[c];if(!!g&&(y(g)||(g=x(g)),(t&g._bitflags)===t)){var h=L(i,g);h!==d&&(h.score<f||(r<v?(p.add(h),++r):(++l,h.score>p.peek().score&&p.replaceTop(h))))}}if(r===0)return Y;for(var w=new Array(r),c=r-1;c>=0;--c)w[c]=p.poll();return w.total=r+l,w},G=(a,e,n)=>{if(typeof e=="function")return V(a,e);if(a===d)return d;e===void 0&&(e="<b>"),n===void 0&&(n="</b>");var i="",t=0,f=!1,v=a.target,r=v.length,l=a._indexes;l=l.slice(0,l.len).sort((c,_)=>c-_);for(var s=0;s<r;++s){var o=v[s];if(l[t]===s){if(++t,f||(f=!0,i+=e),t===l.length){i+=o+n+v.substr(s+1);break}}else f&&(f=!1,i+=n);i+=o}return i},V=(s,e)=>{if(s===d)return d;var n=s.target,i=n.length,t=s._indexes;t=t.slice(0,t.len).sort((_,g)=>_-g);for(var f="",v=0,r=0,l=!1,s=[],o=0;o<i;++o){var c=n[o];if(t[r]===o){if(++r,l||(l=!0,s.push(f),f=""),r===t.length){f+=c,s.push(e(f,v++)),f="",s.push(n.substr(o+1));break}}else l&&(l=!1,s.push(e(f,v++)),f="");f+=c}return s},X=a=>a._indexes.slice(0,a._indexes.len).sort((e,n)=>e-n),T=a=>{typeof a!="string"&&(a="");var e=K(a);return{target:a,_targetLower:e._lower,_targetLowerCodes:e.lowerCodes,_nextBeginningIndexes:d,_bitflags:e.bitflags,score:d,_indexes:[0],obj:d}},H=a=>{typeof a!="string"&&(a=""),a=a.trim();var e=K(a),n=[];if(e.containsSpace){var i=a.split(/\s+/);i=[...new Set(i)];for(var t=0;t<i.length;t++)if(i[t]!==""){var f=K(i[t]);n.push({lowerCodes:f.lowerCodes,_lower:i[t].toLowerCase(),containsSpace:!1})}}return{lowerCodes:e.lowerCodes,bitflags:e.bitflags,containsSpace:e.containsSpace,_lower:e._lower,spaceSearches:n}},x=a=>{if(a.length>999)return T(a);var e=Q.get(a);return e!==void 0||(e=T(a),Q.set(a,e)),e},B=a=>{if(a.length>999)return H(a);var e=U.get(a);return e!==void 0||(e=H(a),U.set(a,e)),e},N=(a,e,n)=>{var i=[];i.total=e.length;var t=n&&n.limit||W;if(n&&n.key)for(var f=0;f<e.length;f++){var v=e[f],r=M(v,n.key);if(!!r){y(r)||(r=x(r)),r.score=I,r._indexes.len=0;var l=r;if(l={target:l.target,_targetLower:"",_targetLowerCodes:d,_nextBeginningIndexes:d,_bitflags:0,score:r.score,_indexes:d,obj:v},i.push(l),i.length>=t)return i}}else if(n&&n.keys)for(var f=0;f<e.length;f++){for(var v=e[f],s=new Array(n.keys.length),o=n.keys.length-1;o>=0;--o){var r=M(v,n.keys[o]);if(!r){s[o]=d;continue}y(r)||(r=x(r)),r.score=I,r._indexes.len=0,s[o]=r}if(s.obj=v,s.score=I,i.push(s),i.length>=t)return i}else for(var f=0;f<e.length;f++){var r=e[f];if(!!r&&(y(r)||(r=x(r)),r.score=I,r._indexes.len=0,i.push(r),i.length>=t))return i}return i},L=(a,e)=>{if(a.containsSpace)return J(a,e);for(var n=a._lower,i=a.lowerCodes,t=i[0],f=e._targetLowerCodes,v=i.length,r=f.length,c=0,l=0,s=0;;){var o=t===f[l];if(o){if(S[s++]=l,++c,c===v)break;t=i[c]}if(++l,l>=r)return d}var c=0,_=!1,g=0,h=e._nextBeginningIndexes;h===d&&(h=e._nextBeginningIndexes=ae(e.target)),l=S[0]===0?0:h[S[0]-1];var F=0;if(l!==r)for(;;)if(l>=r){if(c<=0||(++F,F>200))break;--c;var E=q[--g];l=h[E]}else{var o=i[c]===f[l];if(o){if(q[g++]=l,++c,c===v){_=!0;break}++l}else l=h[l]}var k=e._targetLower.indexOf(n,S[0]),b=~k;if(b&&!_)for(var u=0;u<s;++u)S[u]=k+u;var $=!1;b&&($=e._nextBeginningIndexes[k-1]===k);{if(_)var w=q,Z=g;else var w=S,Z=s;for(var m=0,j=0,u=1;u<v;++u)w[u]-w[u-1]!==1&&(m-=w[u],++j);var fe=w[v-1]-w[0]-(v-1);if(m-=(12+fe)*j,w[0]!==0&&(m-=w[0]*10),!_)m*=1e3;else{for(var D=1,u=h[0];u<r;u=h[u])++D;D>24&&(m*=(D-24)*10)}b&&(m/=10),$&&(m/=10),m-=r-v,e.score=m;for(var u=0;u<Z;++u)e._indexes[u]=w[u];return e._indexes.len=Z,e}},J=(a,e)=>{for(var n=new Set,i=0,t=d,f=0,v=a.spaceSearches,s=0;s<v.length;++s){var r=v[s];if(t=L(r,e),t===d)return d;i+=t.score,t._indexes[0]<f&&(i-=f-t._indexes[0]),f=t._indexes[0];for(var l=0;l<t._indexes.len;++l)n.add(t._indexes[l])}t.score=i;var s=0;for(let o of n)t._indexes[s++]=o;return t._indexes.len=s,t},K=a=>{for(var e=a.length,n=a.toLowerCase(),i=[],t=0,f=!1,v=0;v<e;++v){var r=i[v]=n.charCodeAt(v);if(r===32){f=!0;continue}var l=r>=97&&r<=122?r-97:r>=48&&r<=57?26:r<=127?30:31;t|=1<<l}return{lowerCodes:i,bitflags:t,containsSpace:f,_lower:n}},re=a=>{for(var e=a.length,n=[],i=0,t=!1,f=!1,v=0;v<e;++v){var r=a.charCodeAt(v),l=r>=65&&r<=90,s=l||r>=97&&r<=122||r>=48&&r<=57,o=l&&!t||!f||!s;t=l,f=s,o&&(n[i++]=v)}return n},ae=a=>{for(var e=a.length,n=re(a),i=[],t=n[0],f=0,v=0;v<e;++v)t>v?i[v]=t:(t=n[++f],i[v]=t===void 0?e:t);return i},ne=()=>{Q.clear(),U.clear(),S=[],q=[]},Q=new Map,U=new Map,S=[],q=[],ie=a=>{for(var e=I,n=a.length,i=0;i<n;++i){var t=a[i];if(t!==d){var f=t.score;f>e&&(e=f)}}return e===I?d:e},M=(a,e)=>{var n=a[e];if(n!==void 0)return n;var i=e;Array.isArray(e)||(i=e.split("."));for(var t=i.length,f=-1;a&&++f<t;)a=a[i[f]];return a},y=a=>typeof a=="object",W=1/0,I=-W,Y=[];Y.total=0;var d=null,te=a=>{var e=[],n=0,i={},t=f=>{for(var v=0,r=e[v],l=1;l<n;){var s=l+1;v=l,s<n&&e[s].score<e[l].score&&(v=s),e[v-1>>1]=e[v],l=1+(v<<1)}for(var o=v-1>>1;v>0&&r.score<e[o].score;o=(v=o)-1>>1)e[v]=e[o];e[v]=r};return i.add=f=>{var v=n;e[n++]=f;for(var r=v-1>>1;v>0&&f.score<e[r].score;r=(v=r)-1>>1)e[v]=e[r];e[v]=f},i.poll=f=>{if(n!==0){var v=e[0];return e[0]=e[--n],t(),v}},i.peek=f=>{if(n!==0)return e[0]},i.replaceTop=f=>{e[0]=f,t()},i},p=te();return{single:C,go:A,highlight:G,prepare:T,indexes:X,cleanup:ne}})})(ee);const ge=ee.exports,ue=R('<main class="text-gray-100"><h1 class="text-2xl text-center py-10">Search</h1><form action="/search" class="flex justify-center pb-5"><input name="q" placeholder="Search" class="bg-gray-900 w-96 p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"></form></main>'),he=R('<div class="block mx-auto w-full p-10 max-w-[48rem]"><a class="text-2xl hover:underline"></a><p></p></div>');function we(){const P=oe(),z=new URLSearchParams(P.search).get("q"),C=ge.go(z,ce,{key:"title"});return(()=>{const A=ue.cloneNode(!0),G=A.firstChild,V=G.nextSibling,X=V.firstChild;return X.value=z,O(A,()=>C.map((T,H)=>{let x=T.obj;return(()=>{const B=he.cloneNode(!0),N=B.firstChild,L=N.nextSibling;return O(N,()=>x.title),O(L,(()=>{const J=ve(()=>x.description===x.description.substring(0,100),!0);return()=>J()?x.description:`${x.description.substring(0,100)}...`})()),le(()=>se(N,"href",`/game/${x.route}`)),B})()}),null),A})()}export{we as default};
