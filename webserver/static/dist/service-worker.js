if(!self.define){const i=i=>{"require"!==i&&(i+=".js");let t=Promise.resolve();return s[i]||(t=new Promise((async t=>{if("document"in self){const s=document.createElement("script");s.src=i,document.head.appendChild(s),s.onload=t}else importScripts(i),t()}))),t.then((()=>{if(!s[i])throw new Error(`Module ${i} didn’t register its module`);return s[i]}))},t=(t,s)=>{Promise.all(t.map(i)).then((i=>s(1===i.length?i[0]:i)))},s={require:Promise.resolve(t)};self.define=(t,e,c)=>{s[t]||(s[t]=Promise.resolve().then((()=>{let s={};const f={uri:location.origin+t.slice(1)};return Promise.all(e.map((t=>{switch(t){case"exports":return s;case"module":return f;default:return i(t)}}))).then((i=>{const t=c(...i);return s.default||(s.default=t),s}))})))}}define("./service-worker.js",["./workbox-f6829f63"],(function(i){"use strict";i.setCacheNameDetails({prefix:"frontend"}),self.addEventListener("message",(i=>{i.data&&"SKIP_WAITING"===i.data.type&&self.skipWaiting()})),i.precacheAndRoute([{url:"/static/dist/304958d0a438bb0cf96f.worker.js",revision:null},{url:"/static/dist/50af42beaa99916ae313.worker.js",revision:null},{url:"/static/dist/5f9e0fe6666390f4b917.worker.js",revision:null},{url:"/static/dist/cptv-files/20210322-112850.cptv",revision:"e4859ab5ccb6e63dea37d48af9c975b2"},{url:"/static/dist/cptv-files/20210323-141045.cptv",revision:"b4f72dbf3b5acba4427c4cb129aee051"},{url:"/static/dist/cptv-files/20210323-215851.cptv",revision:"15237a07e59b1d29e54b221791f1e65e"},{url:"/static/dist/cptv-files/20210324-052519.cptv",revision:"35009d9e8430d8ad31b1994c07abdacd"},{url:"/static/dist/cptv-files/20210324-134824.cptv",revision:"66059756d3bfcdeb378a4858c660f659"},{url:"/static/dist/cptv-files/20210325-071859.cptv",revision:"bdd260a33b152ff16587335e02cb93fb"},{url:"/static/dist/cptv-files/20210325-073124.cptv",revision:"298802ca1190b4fb5a4213e530dc1085"},{url:"/static/dist/cptv-files/20210325-073421.cptv",revision:"7e9ab328d60c0aed80c69fe72ccc3744"},{url:"/static/dist/cptv-files/20210325-091249.cptv",revision:"22a3285b0d189f6a808838a7324fadb3"},{url:"/static/dist/cptv-files/20210326-074601.cptv",revision:"1b4ba3186e0adf220ec11f0f087d0037"},{url:"/static/dist/cptv-files/20210326-110819.cptv",revision:"05d84fb0c324d8817f57e0e7364e697f"},{url:"/static/dist/cptv-files/20210329-093608.cptv",revision:"a6749726cf3cdc47591d1621fd372f50"},{url:"/static/dist/cptv-files/20210330-141215.cptv",revision:"94447ec88934de02f05ba81648d571e9"},{url:"/static/dist/cptv-files/20210331-071932.cptv",revision:"53ff6848763f1f3adf50f89d98f83af0"},{url:"/static/dist/cptv-files/20210331-073057.cptv",revision:"6fab3dc32386a417757777974884bbc3"},{url:"/static/dist/cptv-files/20210331-131017.cptv",revision:"a7a4c10f20922ff2bad4ae072dd1e064"},{url:"/static/dist/cptv-files/20210331-231218.cptv",revision:"9522ac6b634903547cd73d61af8e002e"},{url:"/static/dist/cptv-files/20210401-132636.cptv",revision:"d5d8b00636a08dd1eb1b36f999b93c1a"},{url:"/static/dist/cptv-files/20210401-142114.cptv",revision:"c7cc473e8d4c2d6f2d593099fc526409"},{url:"/static/dist/cptv-files/20210523-214354.cptv",revision:"3e35f5b60c162bf32179bed763a7b5da"},{url:"/static/dist/cptv-files/20210604.092427.027.cptv",revision:"2c05d06e1a54ee76b96152b5c5bea541"},{url:"/static/dist/cptv-files/20210609-160610.cptv",revision:"c4c67253564091a7418bdfbec747aa9b"},{url:"/static/dist/cptv-files/20210610-074330.cptv",revision:"0b26bd7a095f0e4819ef7ea7192734eb"},{url:"/static/dist/cptv-files/20210610-075457.cptv",revision:"4c9ff6fd090b574a611205814144b307"},{url:"/static/dist/cptv-files/20210610-084119.cptv",revision:"d567fec8e61633aead46e68108eb6a64"},{url:"/static/dist/cptv-files/20210610-091608.cptv",revision:"95344d726627fc411a6b7630d39a459b"},{url:"/static/dist/cptv-files/20210616-082037.cptv",revision:"38f291432244fae2c7b3a56700def263"},{url:"/static/dist/cptv-files/20210616-091337.cptv",revision:"bb0632e0c7dced8214ea5382bdb0e5f4"},{url:"/static/dist/cptv-files/TKO8-810440-2021-03-23T22:40:09.052Z.cptv",revision:"8e5b92bd681b096a5176ae59e097f7a2"},{url:"/static/dist/cptv-files/fs-1204-815336-2021-03-30T01:39:27.695Z.cptv",revision:"15acee465b67596dff3e16bd0cb8003c"},{url:"/static/dist/cptv-files/fs-1204-816672-2021-04-01T00:26:03.221Z.cptv",revision:"289deaa5fd302490ab8f3f92a96c3ffd"},{url:"/static/dist/cptv-files/fs-1204-816674-2021-04-01T00:46:43.265Z.cptv",revision:"ada27ae2f1ff0266c7cafbf3841fbf54"},{url:"/static/dist/cptv-files/fs-1216-814652-2021-03-28T23:10:39.577Z.cptv",revision:"91d28bcc41dbd596151d2d32d0a13cc6"},{url:"/static/dist/cptv-files/fs-1220-814636-2021-03-28T22:22:13.077Z.cptv",revision:"643c902057fee1c8e57f3424fc6b9d78"},{url:"/static/dist/cptv-files/fs-1220-814675-2021-03-28T23:26:49.781Z.cptv",revision:"dcfffd8bf49a10ef7c015451131f464f"},{url:"/static/dist/cptv-files/fs-1220-814722-2021-03-29T01:14:49.000Z.cptv",revision:"02d82954f6a25a27213bef6e09ab1b69"},{url:"/static/dist/cptv-files/fs-1220-814762-2021-03-29T02:34:50.710Z.cptv",revision:"c9c7166fa41f2d2b18f8adeaac058ca8"},{url:"/static/dist/cptv-files/fs-1220-815227-2021-03-29T21:34:25.000Z.cptv",revision:"d70ae2bbc93ec08beae10ac2b8cb9a28"},{url:"/static/dist/cptv-files/fs-1220-815251-2021-03-29T22:09:21.000Z.cptv",revision:"11e5734bd0106fc74046a7d3eb0db839"},{url:"/static/dist/cptv-files/fs-1220-815931-2021-03-30T23:34:42.000Z.cptv",revision:"bc80db973fa4535bef201d1086930fc9"},{url:"/static/dist/cptv-files/fs-1220-816619-2021-03-31T21:19:04.180Z.cptv",revision:"c73fec9475098abefdac9cee0e279815"},{url:"/static/dist/cptv-files/fs-1220-816659-2021-04-01T00:10:48.540Z.cptv",revision:"9031ea23d9d0b812539500f38a767642"},{url:"/static/dist/cptv-files/fs-1220-816699-2021-04-01T02:28:45.941Z.cptv",revision:"240766f03980310bed6a0d13c7dea074"},{url:"/static/dist/cptv-files/fs-1220-816709-2021-04-01T03:30:06.298Z.cptv",revision:"1a6189e6c81b9bdd56d617726686cd97"},{url:"/static/dist/cptv-files/fs-1228-810781-2021-03-23T18:39:29.774Z.cptv",revision:"062c3e23099f2fba4465629a6e365399"},{url:"/static/dist/cptv-files/fs-1228-815076-2021-03-29T15:35:10.096Z.cptv",revision:"868c867824e6984d9e514b9ac791c221"},{url:"/static/dist/cptv-files/fs-1228-815109-2021-03-29T16:41:20.851Z.cptv",revision:"3922d536b2f6715876babd5326fbe70e"},{url:"/static/dist/cptv-files/test.cptv",revision:"8e5b92bd681b096a5176ae59e097f7a2"},{url:"/static/dist/cptv-files/testr.cptv",revision:"9f737a0800e857e743bf3671aa303ec4"},{url:"/static/dist/cptv-files/tko-0257-2888-4209-810158-2021-03-23T08:58:51.696Z.cptv",revision:"15237a07e59b1d29e54b221791f1e65e"},{url:"/static/dist/cptv-files/tko-1007-0013-9125-814484-2021-03-23T00:35:35.747Z.cptv",revision:"8d9d77c4acf20d559baf2e9f8f187663"},{url:"/static/dist/cptv_player_bg.wasm",revision:"e767ce8271e08a2d9c95b3a3908d7c7d"},{url:"/static/dist/css/app.8bd0abf7.css",revision:null},{url:"/static/dist/css/chunk-vendors.2141b8b5.css",revision:null},{url:"/static/dist/e3f7296217571fdd8bb8.module.wasm",revision:null},{url:"/static/dist/fonts/mem5YaGs126MiZpBA-UN7rgOUehpOqc.f8a27a6d.woff2",revision:null},{url:"/static/dist/fonts/mem5YaGs126MiZpBA-UN7rgOUuhp.92425c62.woff2",revision:null},{url:"/static/dist/fonts/mem5YaGs126MiZpBA-UN7rgOVuhpOqc.d09ca2b7.woff2",revision:null},{url:"/static/dist/fonts/mem5YaGs126MiZpBA-UN7rgOXOhpOqc.3e382661.woff2",revision:null},{url:"/static/dist/fonts/mem5YaGs126MiZpBA-UN7rgOXehpOqc.942fc94c.woff2",revision:null},{url:"/static/dist/img/qr-code.svg",revision:"a48f31c1fd3eb34a87605ff1aadad631"},{url:"/static/dist/index.html",revision:"e1c8d7852f1cfbe5ed390776c54a424c"},{url:"/static/dist/js/641.f577683e.js",revision:null},{url:"/static/dist/js/app.d538cb2e.js",revision:null},{url:"/static/dist/manifest.json",revision:"4b14c64efaf846819b9a229b4193c8b7"},{url:"/static/dist/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"},{url:"/static/dist/sounds/142608_1840739-lq.mp3",revision:"1c11ac42c08ceba98939a8a0371f47c9"},{url:"/static/dist/sounds/341695_5858296-lq.mp3",revision:"d5a4f041974446a90d2b931b5e0c46dc"},{url:"/static/dist/sounds/445978_9159316-lq.mp3",revision:"70c22e9f66d2277d4de3138b93d0516f"},{url:"/static/dist/tko_processing_bg.wasm",revision:"9ae15ec8e818b539e5e023351ab8392e"}],{})}));
//# sourceMappingURL=service-worker.js.map
