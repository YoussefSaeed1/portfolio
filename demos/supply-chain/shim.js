/* Minimal stand-in for the Dashboard runtime: loads local JSON, keeps filters in the URL. */
(function(){
const IDS=['products','materials','bom','suppliers','demand','mps','mrp','pos','recs','capacity','weeks','lines'];
const store={};IDS.forEach(i=>store[i]={status:'loading',data:[],message:'',refreshing:false,meta:[]});
const subs=[];let params={};
function readParams(){const q=new URLSearchParams(location.search);params={};q.forEach((v,k)=>{params[k]=v})}
function writeParams(){const q=new URLSearchParams();for(const k in params)if(params[k]!=null&&params[k]!=='')q.set(k,params[k]);const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash)}
let raf=0;function fire(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>subs.forEach(fn=>{try{fn()}catch(e){console.error(e)}}))}
window.dash={
  data:id=>store[id]||{status:'missing',data:[],message:'',refreshing:false,meta:[]},
  onData:fn=>{subs.push(fn);try{fn()}catch(e){console.error(e)}},
  params:()=>Object.assign({},params),
  setParams:o=>{for(const k in o){if(o[k]==null||o[k]==='')delete params[k];else params[k]=String(o[k])}writeParams();fire()},
  resetParams:()=>{params={};writeParams();fire()},
  setLink:()=>{},
  refresh:()=>{}
};
readParams();
IDS.forEach(id=>fetch('data/'+id+'.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{store[id].data=d;store[id].status='ok'}).catch(e=>{store[id].status='error';store[id].message=String(e)}).finally(fire));
let w=0;new ResizeObserver(es=>{const nw=Math.round(es[0].contentRect.width);if(nw!==w){w=nw;fire()}}).observe(document.documentElement);
})();
