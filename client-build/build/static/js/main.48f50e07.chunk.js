(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{10:function(e,t,n){},17:function(e,t,n){"use strict";n.r(t);var r=n(5),i=n(1),c=n.n(i),a=n(3),o=n.n(a),f=(n(10),n(4)),l=n.n(f),s=n(0),u=l.a.Chance(),j=[["#000","#fff"],["red","green","blue"],["#777","blue"],["#e619b2","#0cf3b5","#ff2e00","#8ded12","#0a0e7d","#aaaba8","#ff1d00"]],b=function(){var e=Object(i.useRef)(null);return Object(i.useEffect)((function(){if(null!==e.current){var t=function(e){var t=!0,n=Date.now(),r=1e3/u.integer({min:5,max:30}),i=u.bool(),c=u.floating({min:.1,max:.9}),a=j[u.integer({min:0,max:j.length-1})],o=e.clientWidth,f=e.clientHeight;e.width=o,e.height=f;var l=e.getContext("2d");if(!l)throw new Error("No context?");var s=o/300,b=s;return function e(){var j=Date.now();if(j-n<r)window.requestAnimationFrame(e);else if(!1!==t){n=j;for(var h=0;h<f;h+=b)if(Math.random()>c)i&&(l.fillStyle="white",l.fillRect(0,h,o,f));else for(var d=0;d<o;d+=s)l.fillStyle=u.pickone(a),l.fillRect(d,h,s,b);window.requestAnimationFrame(e)}}(),function(){t=!1}}(e.current);return function(){return t()}}}),[]),Object(s.jsx)("canvas",{id:"glitch-canvas",ref:e})},h=function(){var e=Object(i.useState)(Math.random()),t=Object(r.a)(e,2),n=t[0],a=t[1];return Object(s.jsxs)(c.a.StrictMode,{children:[Object(s.jsx)(b,{},n),Object(s.jsxs)("nav",{children:[Object(s.jsx)("a",{href:"https://twitch.tv/joe_js",target:"_blank",rel:"noreferrer",children:Object(s.jsx)("h1",{children:"ttv/joe_js"})}),Object(s.jsx)("img",{src:"prof.jpg",onClick:function(){return a(Math.random())}})]}),Object(s.jsx)("main",{children:Object(s.jsx)("img",{src:"https://i.pinimg.com/originals/eb/1b/27/eb1b27863813653543914d222ceb9cd0.gif"})})]})};o.a.render(Object(s.jsx)(h,{}),document.getElementById("root"))}},[[17,1,2]]]);
//# sourceMappingURL=main.48f50e07.chunk.js.map