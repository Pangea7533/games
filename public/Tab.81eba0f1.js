import{a as $}from"./Games.49d8852b.js";import{o as R,t as G,u}from"./index.63c3418c.js";const I=G('<div class="bg-gray-900 text-gray-100"><h1 class="text-2xl p-10 text-center">Settings</h1><div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 px-5 sm:px-30 md:px-64"><div><h2 class="text-xl py-2">Tab Cloak</h2><select id="tab-cloak" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"><option value="true">Enabled</option><option value="false">Disabled</option></select></div><div><h2 class="text-xl py-2">Analytics Tracking</h2><select id="analytics" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"><option value="true">Enabled</option><option value="false">Disabled</option></select></div><div><h2 class="text-xl py-2">Tab Cloak Text</h2><input id="tab-cloak-text" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"></div><div><h2 class="text-xl py-2">Tab Cloak Icon</h2><input id="tab-cloak-icon" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"></div><div><h2 class="text-xl py-2">Tab Cloak Mode</h2><select id="tab-cloak-mode" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"><option value="hidden">On Tab Hide</option><option value="always">Always On</option></select></div><div><h2 class="text-xl py-2">URL Cloaking</h2><select id="url-cloak" class="bg-gray-900 w-full p-2 rounded-md border-solid border-2 border-gray-800 focus:outline-none"><option value="disabled">Disabled</option><option value="blank">About Blank</option><option value="data">Data URL</option><option value="blob">Blob URL</option></select></div></div></div>'),l={"tab-cloak":!1,"tab-cloak-text":"Google","tab-cloak-icon":"https://google.com/favicon.ico",analytics:!0,"tab-cloak-mode":"hidden","url-cloak":"disabled"};function C(){R(()=>{B();let e;try{e=JSON.parse(localStorage.getItem("settings"))||l}catch{e=l}document.getElementById("tab-cloak").value=e["tab-cloak"],document.getElementById("analytics").value=e.analytics,document.getElementById("tab-cloak-text").value=e["tab-cloak-text"],document.getElementById("tab-cloak-icon").value=e["tab-cloak-icon"],document.getElementById("tab-cloak-mode").value=e["tab-cloak-mode"],document.getElementById("url-cloak").value=e["url-cloak"]});function a(){let e;try{e=JSON.parse(localStorage.getItem("settings"))||{}}catch{e={}}e["tab-cloak"]=document.getElementById("tab-cloak").value.toLowerCase()==="true",e.analytics=document.getElementById("analytics").value.toLowerCase()==="true",e["tab-cloak-text"]=document.getElementById("tab-cloak-text").value,e["tab-cloak-icon"]=document.getElementById("tab-cloak-icon").value,e["tab-cloak-mode"]=document.getElementById("tab-cloak-mode").value,e["url-cloak"]=document.getElementById("url-cloak").value,localStorage.setItem("settings",JSON.stringify(e)),location.reload()}return(()=>{const e=I.cloneNode(!0),t=e.firstChild,o=t.nextSibling,n=o.firstChild,g=n.firstChild,b=g.nextSibling,i=n.nextSibling,m=i.firstChild,p=m.nextSibling,d=i.nextSibling,v=d.firstChild,y=v.nextSibling,s=d.nextSibling,k=s.firstChild,h=k.nextSibling,c=s.nextSibling,f=c.firstChild,x=f.nextSibling,S=c.nextSibling,_=S.firstChild,E=_.nextSibling;return b.addEventListener("change",a),p.addEventListener("change",a),y.addEventListener("change",a),h.addEventListener("change",a),x.addEventListener("change",a),E.addEventListener("change",a),e})()}const O=Object.freeze(Object.defineProperty({__proto__:null,defaultSettings:l,default:C},Symbol.toStringTag,{value:"Module"})),r={"/":()=>"Radon Games","/games":()=>"Games - Radon Games","/apps":()=>"Apps - Radon Games","/services":()=>"Services - Radon Games","/partners":()=>"Partners - Radon Games","/supporters":()=>"Supporters - Radon Games","/settings":()=>"Settings - Radon Games","/changelog":()=>"Changelog - Radon Games","/privacy":()=>"Privacy - Radon Games","/game-request":()=>"Game Request - Radon Games","/bug-report":()=>"Bug Report - Radon Games","/game/":()=>{let a=u();return $.find(t=>"/game/"+t.route===a.pathname).title+" - Radon Games"||"Radon Games"}};function B(){let a=u(),e="Radon Games";Object.keys(r).forEach(o=>{a.pathname.startsWith(o)&&(e=r[o]())});let t;try{t=JSON.parse(localStorage.getItem("settings"))||l}catch{t=l}t["tab-cloak"]&&(t["tab-cloak-mode"]==="hidden"?document.addEventListener("visibilitychange",()=>{document.hidden?(document.title=t["tab-cloak-text"],document.querySelector("link[rel='icon']").href=t["tab-cloak-icon"]):(document.title=e,document.querySelector("link[rel='icon']").href="/favicon.ico")}):t["tab-cloak-mode"]==="always"&&(document.title=t["tab-cloak-text"],document.querySelector("link[rel='icon']").href=t["tab-cloak-icon"]))}export{B as U,O as s};