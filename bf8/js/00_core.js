'use strict';
const V3 = (x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const TAU=Math.PI*2, HPI=Math.PI/2;
const dampF=(cur,tgt,k,dt)=>lerp(tgt,cur,Math.exp(-k*dt));
const SETTINGS = { team:0, diff:1, quality:1, sens:1.0, vol:0.8,
adsToggle:(function(){ try{ return localStorage.getItem('sf_adsmode')==='toggle'; }catch(e){ return false; } })() };
const DIFF_TABLE = [
{ react:0.95, spreadMul:2.0, dmgMul:0.55, visMul:0.7, name:'新兵' },
{ react:0.65,  spreadMul:1.3, dmgMul:0.88, visMul:0.9, name:'老兵' },
{ react:0.42, spreadMul:0.8, dmgMul:1.15, visMul:1.2, name:'精英' },
];
