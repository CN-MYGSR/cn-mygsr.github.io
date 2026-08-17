'use strict';
function initMenuUI(){
// 主菜单导航
const showPanel=(id)=>{
el('mHome').classList.toggle('hidden',id!=='mHome');
['mPlay','mCamp','mSet','mMulti'].forEach(pid=>el(pid).classList.toggle('hidden',pid!==id));
};
document.querySelectorAll('.navBtn').forEach(b=>{
b.onclick=()=>{ AudioSys.resume&&AudioSys.resume(); showPanel(b.dataset.p); };
});
document.querySelectorAll('.backBtn').forEach(b=>{ b.onclick=()=>{ NET.stop(); showPanel('mHome'); }; });
// 触控按键大小
{
const stored=parseInt(localStorage.getItem('sf_tsize')||'100');
el('tsizeRange').value=stored;
el('tsizeVal').textContent=stored+'%';
el('tsizeRange').oninput=e=>{
localStorage.setItem('sf_tsize',e.target.value);
el('tsizeVal').textContent=e.target.value+'%';
applyTouchScale();
};
}
// 战役选择: 切换后存档并重载页面重建世界
const campRow=el('campRow');
CAMPAIGNS.forEach((c,i)=>{
const b=document.createElement('button');
b.className='optBtn'+(i===CAMPAIGN_IDX?' sel':'');
b.innerHTML=`<b>${c.title}</b><br><span style="font-size:10px;opacity:.8;color:#c0d8e0">${c.modeName}</span><br><span style="font-size:11px;opacity:.7">${c.sub}</span>`;
b.style.minWidth='150px';
b.onclick=()=>{
if(i===CAMPAIGN_IDX) return;
localStorage.setItem('sf_campaign',String(i));
location.reload();
};
campRow.appendChild(b);
});
el('menuSub').textContent=NIGHT?`—— ${CAMPAIGN.title} · 夜战 ——`:`—— ${CAMPAIGN.title} · ${CAMPAIGN.sub} ——`;
// 战场时段: 昼/夜 (夜战模式, 切换后重载重建世界)
{
const syncNightUI=()=>{ el('dayBtn').classList.toggle('sel',!NIGHT); el('nightBtn').classList.toggle('sel',NIGHT); };
syncNightUI();
el('dayBtn').onclick=()=>{ if(NIGHT){ localStorage.setItem('sf_night','0'); location.reload(); } };
el('nightBtn').onclick=()=>{ if(!NIGHT){ localStorage.setItem('sf_night','1'); location.reload(); } };
}
el('teamUS').innerHTML=`${TEAM_FACTION[0].sym} ${TEAM_FACTION[0].short} · ${TEAM_FACTION[0].name}`;
el('teamGER').innerHTML=`${TEAM_FACTION[1].sym} ${TEAM_FACTION[1].short} · ${TEAM_FACTION[1].name}`;
document.querySelector('.t0h').textContent=TEAM_NAME[0];
document.querySelector('.t1h').textContent=TEAM_NAME[1];
// 模式归属战役, 此处仅兵力规模
document.querySelectorAll('.sizeBtn').forEach(b=>{
b.classList.toggle('sel',+b.dataset.s===SIZE_IDX);
b.onclick=()=>{
SIZE_IDX=+b.dataset.s;
localStorage.setItem('sf_size',b.dataset.s);
document.querySelectorAll('.sizeBtn').forEach(x=>x.classList.toggle('sel',x===b));
};
});
// 操控模式: 由 MOBILE 自动检测, 无需手动切换
el('teamUS').onclick=()=>{ SETTINGS.team=0; el('teamUS').classList.add('sel'); el('teamGER').classList.remove('sel'); };
el('teamGER').onclick=()=>{ SETTINGS.team=1; el('teamGER').classList.add('sel'); el('teamUS').classList.remove('sel'); };
document.querySelectorAll('.diffBtn').forEach(b=>b.onclick=()=>{
SETTINGS.diff=+b.dataset.d;
document.querySelectorAll('.diffBtn').forEach(x=>x.classList.toggle('sel',x===b));
});
document.querySelectorAll('.qualBtn').forEach(b=>b.onclick=()=>{
SETTINGS.quality=+b.dataset.q;
document.querySelectorAll('.qualBtn').forEach(x=>x.classList.toggle('sel',x===b));
applyQuality();
});
el('sensRange').oninput=e=>{ SETTINGS.sens=e.target.value/100; el('sensVal').textContent=SETTINGS.sens.toFixed(1); };
// 右键瞄准方式: 按住 / 切换
{
const syncAdsBtn=()=>{ el('adsModeBtn').textContent=SETTINGS.adsToggle?'切换瞄准':'按住瞄准'; };
syncAdsBtn();
el('adsModeBtn').onclick=()=>{
SETTINGS.adsToggle=!SETTINGS.adsToggle;
try{ localStorage.setItem('sf_adsmode',SETTINGS.adsToggle?'toggle':'hold'); }catch(e){}
syncAdsBtn();
};
}
el('volRange').oninput=e=>{ SETTINGS.vol=e.target.value/100; el('volVal').textContent=e.target.value; AudioSys.setVol(SETTINGS.vol); };
// 夜视滤镜: 蓝色/绿色/白色 (战斗内按 N 开关)
{
const FILTERS={blue:['nvgBlue','蓝色'],green:['nvgGreen','绿色'],white:['nvgWhite','白色']};
const syncNvgUI=()=>{
const cur=localStorage.getItem('sf_nvg')||'green';
Object.keys(FILTERS).forEach(k=>el(FILTERS[k][0]).classList.toggle('sel',k===cur));
};
syncNvgUI();
Object.keys(FILTERS).forEach(k=>{
el(FILTERS[k][0]).onclick=()=>{
localStorage.setItem('sf_nvg',k);
if(typeof NVG!=='undefined') NVG.setFilter(k);
syncNvgUI();
};
});
}
el('startBtn').onclick=()=>{
AudioSys.init();
NET.stop();
player.team=SETTINGS.team;
BOTS_PER_TEAM=SIZE_OPTS[SIZE_IDX].bots;
tickets[0]=SIZE_OPTS[SIZE_IDX].tk;
tickets[1]=SIZE_OPTS[SIZE_IDX].tk;
startMatch();
el('menu').classList.add('hidden');
startIntroCut(()=>showDeploy(false));
};
el('againBtn').onclick=()=>location.reload();
const grid=el('classGrid');
CLASSES.forEach((c,i)=>{
const d=document.createElement('div');
d.className='classCard'+(i===0?' sel':'');
d.innerHTML=`<div class="cname">${c.name}</div><div class="cwpn" id="cw${i}"></div><div class="cwpn">手雷 ×${c.nades}</div>`;
d.onclick=()=>{
player.cls=i;
document.querySelectorAll('.classCard').forEach(x=>x.classList.toggle('sel',x===d));
buildModUI();
};
grid.appendChild(d);
});
el('deployBtn').onclick=()=>{
if(respawnCd>0||matchOver) return;
deployPlayer();
};
el('resumeBtn').onclick=()=>{
document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
lockPointer();
};
renderer.domElement.addEventListener('click',()=>{
if(player.alive&&player.deployed&&!pointerLocked&&!matchOver) lockPointer();
});
// ===== 多人游戏 =====
{
const stH=el('mhStatus'), stJ=el('mjStatus');
const setStat=(elm,txt,err)=>{ elm.textContent=txt; elm.classList.toggle('err',!!err); elm.classList.toggle('ok',!err&&!!txt); };
const netStatus=(txt,err)=>{ setStat(stH,txt,err); setStat(stJ,txt,err); };
NET.setUI({
onStatus:netStatus,
onPlayers:list=>{ renderNetPlayers(list,el('mhPlayers')); renderNetPlayers(list,el('mjPlayers')); },
onChat:(from,text,sys)=>{ addNetChat(el('multiChatList'),from,text,sys); addNetChat(el('multiChatList2'),from,text,sys); },
onReset:()=>{ netStatus('',false); el('mhPlayers').innerHTML=''; el('mjPlayers').innerHTML=''; }
});
const showNav=()=>{ el('multiNavRow').classList.remove('hidden'); el('multiHostView').classList.add('hidden'); el('multiJoinView').classList.add('hidden'); };
const showHost=()=>{ el('multiNavRow').classList.add('hidden'); el('multiJoinView').classList.add('hidden'); el('multiHostView').classList.remove('hidden'); if(!el('mhNick').value) el('mhNick').value='主机'; };
const showJoin=()=>{ el('multiNavRow').classList.add('hidden'); el('multiHostView').classList.add('hidden'); el('multiJoinView').classList.remove('hidden'); if(!el('mjNick').value) el('mjNick').value='玩家'+randi(10,99); };
el('multiHostBtn').onclick=()=>{
showHost();
if(!el('mhIp').value){
el('mhIp').placeholder='检测本机 IP 中…';
NET.detectIP(ip=>{ el('mhIp').placeholder='检测失败, 请手动填写'; if(ip) el('mhIp').value=ip; });
}
};
el('multiJoinBtn').onclick=showJoin;
el('mhBack').onclick=()=>{ NET.stop(); showNav(); };
el('mjBack').onclick=()=>{ NET.stop(); showNav(); };
try{ const p=parseInt(localStorage.getItem('sf_netport'))||8192; el('mhPort').value=p; }catch(e){}
el('mhStart').onclick=()=>{
const ip=(el('mhIp').value||'').trim();
if(!ip){ netStatus('请填写本机 IP (无法自动检测时可手动输入)',true); return; }
const port=parseInt(el('mhPort').value);
if(!port||port<1||port>65535){ netStatus('端口范围: 1-65535',true); return; }
try{ localStorage.setItem('sf_netport',String(port)); }catch(e){}
NET.host({ nick:el('mhNick').value||'主机', ip:ip, port:port });
};
el('mjStart').onclick=()=>{
const addr=(el('mjAddr').value||'').trim();
if(!addr){ netStatus('请输入服务器地址, 示例: 192.168.0.1:8080',true); return; }
NET.join({ nick:el('mjNick').value||'', addr:addr });
};
const bindChat=(inputId,sendId)=>{
const inputEl=el(inputId);
const send=()=>{
const v=inputEl.value.trim();
if(!v) return;
if(NET.sendChat(v)) inputEl.value='';
};
el(sendId).onclick=send;
inputEl.onkeydown=e=>{ if(e.key==='Enter') send(); };
};
bindChat('mhChat','mhSend');
bindChat('mjChat','mjSend');
}
}
function renderNetPlayers(list,wrap){
wrap.innerHTML='';
if(!list||!list.length) return;
list.forEach(p=>{
const d=document.createElement('div');
d.className='mPlayer';
const nm=document.createElement('span');
nm.className='pmName';
nm.textContent=p.name;
if(p.isHost){
const hb=document.createElement('span');
hb.className='pmHost';
hb.textContent='主机';
nm.appendChild(hb);
}
const lat=document.createElement('span');
lat.className='pmLat';
lat.textContent=p.lat!=null?(p.lat+' ms'):(p.isHost?'主机':'…');
d.appendChild(nm);
d.appendChild(lat);
wrap.appendChild(d);
});
}
function addNetChat(listEl,from,text,sys){
const d=document.createElement('div');
if(sys) d.className='mcSys';
else if(from===NET.state.myName) d.className='mcMe';
d.textContent=sys?('· '+text):(from+': '+text);
listEl.appendChild(d);
listEl.scrollTop=listEl.scrollHeight;
while(listEl.children.length>60) listEl.removeChild(listEl.firstChild);
}
function showDeploy(isDead){
document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
el('deploy').classList.remove('hidden');
el('blackOv').style.opacity=0;
CLASSES.forEach((c,i)=>{
const ws=TEAM_FACTION[player.team].cls[i];
const mainKey=ws[0];
const modName=modDisplayName(mainKey);
let d2=ws.map(k=>WPN_DEFS[k].name).join(' · ');
if(i===2) d2+=' · 医疗箱[B] · 绷带×6';
if(i===3) d2+=' · AT雷×'+(TEAM_FACTION[player.team].atn5||3);
if(modName!=='无改装') d2+='\n🔧'+modName;
el('cw'+i).textContent=d2;
});
el('deathInfo').innerHTML=(()=>{ 
if(!isDead) return '';
const lifeT=Math.max(0,nowT-(player.lifeStartT||nowT));
const mm2=Math.floor(lifeT/60), ss3=Math.floor(lifeT%60);
const lk=player.lifeKills||0, ls=(player.score||0)-(player.lifeScoreStart||0);
return (player.killerName?`你被 <b>${player.killerName}</b> 击杀了<br>`:'')+
`<span style="font-size:13px;color:#cdd8c8">本次存活 ${mm2}:${ss3<10?'0':''}${ss3} · 击杀 <b>${lk}</b> · 获得 <b>+${ls}</b> 分 &nbsp;|&nbsp; 本局总计 ${player.kills} 杀 / ${player.deaths} 死 / ${player.score} 分</span>`;
})();
el('resumeBtn').style.display=(player.alive&&player.deployed)?'inline-block':'none';
el('deployBtn').style.display=player.alive&&player.deployed?'none':'inline-block';
buildSpawnList();
buildModUI();
drawDeployMap();
}
function buildModUI(){
const slotsEl=el('modSlots');
const labelEl=el('modLabel');
const costEl=el('modCost');
slotsEl.innerHTML='';
const wkeys=TEAM_FACTION[player.team].cls[player.cls];
const mainKey=wkeys[0];
const avail=getModSlots(mainKey);
if(!avail){ labelEl.style.display='none'; costEl.style.display='none'; return; }
labelEl.style.display='block';
costEl.style.display='block';
const slotNames={optic:'瞄具',muzzle:'枪口',mag:'弹匣',gear:'战术配件'};
['optic','muzzle','mag','gear'].forEach(slot=>{
const list=avail[slot]||[];
if(!list.length||list.length<=1) return;
const cur=getModChoice(mainKey,slot);
if(slot==='optic'&&opticBlocked(mainKey)) setModChoice(mainKey,'optic','optic_iron');
const wrapper=document.createElement('div');
wrapper.style.cssText='margin:4px 6px';
const lbl2=document.createElement('span');
lbl2.textContent=slotNames[slot]+'：';
lbl2.style.cssText='color:#a0a8b0;font-size:12px;display:block;margin-bottom:2px';
wrapper.appendChild(lbl2);
const row=document.createElement('div');
row.className='rowFlex';
list.forEach(mid=>{
const m=ALL_MODS[mid];
const btn=document.createElement('button');
btn.className='optBtn modOptBtn';
if(mid===cur) btn.classList.add('sel');
const costStr=m.cost?' ('+m.cost+'分)':'';
btn.textContent=(m.icon||'')+' '+m.name+costStr;
btn.style.cssText='font-size:12px;padding:5px 10px;';
btn.title=m.desc||'';
if(slot==='optic'&&OPTIC_BLOCKED.includes(mid)&&getModChoice(mainKey,'gear')==='gear_nvg'){
btn.disabled=true;
btn.title='夜视仪使用中，光学瞄具不可用';
}
if(mid==='optic_nvg'&&getModChoice(mainKey,'gear')!=='gear_nvg'){
btn.disabled=true;
btn.title='需先装备夜视仪 (战术配件)';
}
btn.onclick=()=>{
setModChoice(mainKey,slot,mid);
row.querySelectorAll('.modOptBtn').forEach(b=>b.classList.remove('sel'));
btn.classList.add('sel');
buildModUI();
};
row.appendChild(btn);
});
wrapper.appendChild(row);
slotsEl.appendChild(wrapper);
});
const total=modTotalCost(mainKey);
costEl.textContent=total?'改装总开销: '+total+' 分 (从本局得分扣除)':'';
}
function buildSpawnList(){
const list=el('spawnList');
list.innerHTML='';
const opts=[{name:'主基地',x:BASES[player.team].x,z:BASES[player.team].z,id:-1}];
FLAGS.forEach((f,i)=>{ if(f.owner===player.team) opts.push({name:f.id+' 点',x:f.x,z:f.z,id:i}); });
// 载具出生选项
const vehs=[...tanks,...planes].filter(v=>v.team===player.team);
vehs.forEach((v,i)=>{
const id='V'+i;
const busy=v.playerDriven;
const ready=v.alive&&!busy;
opts.push({name:(v.kind==='plane'?'✈ ':'▣ ')+v.name+(ready?'':(busy?' (占用)':' (重生 '+Math.ceil(v.respawnT)+'s)')),id,veh:v,disabled:!ready});
});
if(!opts.some(o=>!o.disabled&&(o.id===selectedSpawn))) selectedSpawn=-1;
opts.forEach(o=>{
const b=document.createElement('button');
b.className='spawnBtn'+(o.id===selectedSpawn?' sel':'');
b.textContent='◈ '+o.name;
if(o.disabled){ b.disabled=true; b.style.opacity=0.45; }
else b.onclick=()=>{ selectedSpawn=o.id; document.querySelectorAll('.spawnBtn').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
list.appendChild(b);
});
}
function drawDeployMap(){
const c=el('deployMap').getContext('2d');
const S=300;
c.fillStyle='#141a10'; c.fillRect(0,0,S,S);
const toM=(x,z)=>[S/2+x/(MAP_SIZE/2+10)*S/2, S/2+z/(MAP_SIZE/2+10)*S/2];
c.strokeStyle='rgba(150,130,90,.5)'; c.lineWidth=4;
if(CAMPAIGN.sineRoad){
c.beginPath();
for(let x=-155;x<=155;x+=10){ const [px,py]=toM(x,3*Math.sin(x*0.02)); x===-155?c.moveTo(px,py):c.lineTo(px,py); }
c.stroke();
}
for(const r of CAMPAIGN.roads){
c.beginPath();
const [ax,ay]=toM(r[0],r[1]), [bx2,by2]=toM(r[2],r[3]);
c.moveTo(ax,ay); c.lineTo(bx2,by2);
c.stroke();
}
[0,1].forEach(t=>{
const [px,py]=toM(BASES[t].x,BASES[t].z);
c.fillStyle=t===0?'#4a70b0':'#b05a4a';
c.fillRect(px-8,py-8,16,16);
c.fillStyle='#fff'; c.font='10px sans-serif'; c.textAlign='center';
c.fillText(TEAM_NAME[t][0],px,py+3);
});
for(const f of FLAGS){
const [px,py]=toM(f.x,f.z);
c.beginPath(); c.arc(px,py,13,0,TAU);
c.fillStyle=f.owner===0?'rgba(90,140,220,.85)':f.owner===1?'rgba(220,110,90,.85)':'rgba(150,150,140,.7)';
c.fill();
c.fillStyle='#fff'; c.font='bold 13px sans-serif'; c.textAlign='center';
c.fillText(f.id,px,py+4);
}
for(const s of soldiers){
if(!s.alive||s.onVehicle) continue;
const [px,py]=toM(s.pos.x,s.pos.z);
c.fillStyle=s.team===0?'#7da8e8':'#e8907d';
c.beginPath(); c.arc(px,py,2,0,TAU); c.fill();
}
}
function deployPlayer(){
const p=player;
// 载具出生
let vehSpawn=null;
if(typeof selectedSpawn==='string'&&selectedSpawn[0]==='V'){
const vehs=[...tanks,...planes].filter(v=>v.team===p.team);
const v=vehs[+selectedSpawn.slice(1)];
if(v&&v.alive&&!v.playerDriven) vehSpawn=v;
}
let sx,sz;
if(vehSpawn){ sx=vehSpawn.pos.x; sz=vehSpawn.pos.z; }
else if(selectedSpawn===-1||typeof selectedSpawn==='string'){ sx=BASES[p.team].x; sz=BASES[p.team].z; }
else {
const f=FLAGS[selectedSpawn];
if(f.owner!==p.team){ sx=BASES[p.team].x; sz=BASES[p.team].z; }
else { sx=f.x; sz=f.z; }
}
const fp2=findFreeSpawn(sx,sz);
p.pos.set(fp2[0],0,fp2[1]);
p.pos.y=standHeight(p.pos.x,p.pos.z,10);
p.vel.set(0,0,0);
p.hp=100; p.alive=true; p.deployed=true; p.crouch=false; p.prone=false; p.chute=false;
p.limbs={head:100,arms:100,torso:100,legs:100};
p.stamina=1; p.suppressV=0; p.bloom=0;
p.ads=false; p.holdBreath=false; VM.adsBlend=0;
document.getElementById('scopeOv').style.display='none';
p.yaw=Math.atan2(-sx,-sz); p.pitch=0;
const wkeys=TEAM_FACTION[p.team].cls[p.cls];
p.slots=wkeys.map(k=>{
const md=moddedDef(k)||WPN_DEFS[k];
return {key:k,def:md,mag:md.mag,reserve:md.reserve};
});
p.curSlot=0; p.curW=p.slots[0];
p.nadeCount=CLASSES[p.cls].nades;
p.atNades=p.cls===3?(TEAM_FACTION[p.team].atn5||3):0;
p.maxBandages=p.cls===2?6:2;
p.bandages=p.maxBandages;
p.smokeCount=CLASSES[p.cls].smoke||0;
p.bandaging=0;
p.medkitUsed=false; p.grabAction=null;
p.deathRag=null; p.deathCamT=0;
p.lifeStartT=nowT; p.lifeKills=0; p.lifeScoreStart=p.score||0;
p.onMortar=null; p.mortarPlaced=false; p.buildCount=6; p.buildSel=0; p.pendingBuild=null;
p.nadeIsAT=false; p.nadeHeld=false; p.nadeIsSmoke=false;
 p.onVehicle=null; p.onMG=null; p.onAT=null; p.onAA=null; p.tankView=false; p.planeView=false; p.braced=false;
ensurePlayerBody();
document.getElementById('deathQuote').style.opacity='0';
document.getElementById('heatWrap').style.display='none';
vmEquip(p.curW.key,p.team);
VM.root.visible=true;
if(p.cls===2) showScorePop(MOBILE?'医疗兵 · 左侧「医疗箱」放置 · 「绷带」自疗':'医疗兵 · 按 B 放置医疗箱 / H 包扎');
else if(p.cls===4) showScorePop(MOBILE?'工程兵 · 「工事」选类型 · 「建造」锤击建造':'工程兵 · 按 5 选择工事, 按 B 锤击建造');
if(vehSpawn){
if(vehSpawn.crewBot){
const cb=vehSpawn.crewBot;
if(vehSpawn.kind==='plane'){
vehSpawn.crewBot=null;
cb.onVehicle=null;
cb.chuting=true;
cb.pos.set(vehSpawn.pos.x,Math.max(vehSpawn.pos.y-2,heightAt(vehSpawn.pos.x,vehSpawn.pos.z)+3),vehSpawn.pos.z);
if(cb.mesh) cb.mesh.root.visible=true;
cb.path=null; cb.state='idle'; cb.target=null;
} else cb.dismountVehicle(false);
}
vehSpawn.playerDriven=true;
if(vehSpawn.kind==='tank'){ vehSpawn.isAI=false; vehSpawn.vel=0; p.yaw=vehSpawn.yaw+vehSpawn.turretYaw+Math.PI; }
else { p.yaw=vehSpawn.yaw+Math.PI; p.pitch=vehSpawn.pitch; }
p.onVehicle=vehSpawn;
p.pos.copy(vehSpawn.pos);
VM.root.visible=false;
document.getElementById('heatWrap').style.display='block';
}
document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
lockPointer();
startDeployCut();
}
function startMatch(){
const names0=[...TEAM_FACTION[0].names].sort(()=>Math.random()-0.5);
const names1=[...TEAM_FACTION[1].names].sort(()=>Math.random()-0.5);
const nameIdx=[0,0];
const nextName=t=>(t===0?names0:names1)[nameIdx[t]++%(t===0?names0:names1).length];
for(let t=0;t<2;t++){
const n=t===player.team?BOTS_PER_TEAM-1:BOTS_PER_TEAM;
for(let i=0;i<n;i++){
const cls=CLS_POOL[randi(0,CLS_POOL.length-1)];
const bot=new Bot(t,cls,nextName(t));
bot.spawn();
}
}
// 旗帜初始归属 (征服: 靠近各自基地的旗点归属该方; 攻防/破袭: 防守方全部据守)
el('flagIcons').innerHTML=FLAGS.map(f=>`<span id="fi${f.id}">${f.id}</span>`).join('');
if(GAMEMODE==='conquest'){
const sorted=[...FLAGS].sort((a,b)=>Math.hypot(a.x-BASES[0].x,a.z-BASES[0].z)-Math.hypot(b.x-BASES[0].x,b.z-BASES[0].z));
sorted[0].owner=0;
sorted[sorted.length-1].owner=1;
if(sorted.length>=5){ sorted[1].owner=0; sorted[sorted.length-2].owner=1; }
FLAGS.forEach(f=>drawFlagTex(f));
} else {
// 攻防/破袭: 防守方(DEF)据守全部旗点
assaultIdx=0;
FLAGS.forEach(f=>{ f.owner=DEF; f.cap=0; f.capTeam=-1; drawFlagTex(f); });
tickets[DEF]=Infinity;
matchTime=GAMEMODE==='assault'?18*60:16*60;
}
// 组建玩家小队: 挑3名本方步兵
for(const s of soldiers){
if(SQUAD.members.length>=3) break;
if(s.team===player.team&&!s.onVehicle&&!s.pilotOf){
s.inSquad=true;
SQUAD.members.push(s);
s.mesh.tag.material.color.set(0x86ffa6);
}
}
new Tank(0,0); new Tank(0,1); new Tank(1,0); new Tank(1,1);
if(TEAM_FACTION[0].tanks[2]) new Tank(0,2);
if(TEAM_FACTION[1].tanks[2]) new Tank(1,2);
new APC(0); new APC(1);
 new Plane(0,0); new Plane(0,1); new Plane(1,0); new Plane(1,1);
 if(TEAM_FACTION[0].planes[2]) new Plane(0,2);
 if(TEAM_FACTION[1].planes[2]) new Plane(1,2);
 if(TEAM_FACTION[0].planes[3]) new Plane(0,3);
 if(TEAM_FACTION[1].planes[3]) new Plane(1,3);
// 每辆载具塞入一名真正的AI乘员(算一个人, 可下车/跳伞)
for(const t of tanks){
const b=new Bot(t.team,CLS_POOL[randi(0,CLS_POOL.length-1)],nextName(t.team));
b.spawnInVehicle(t);
}
for(const a of apcs){
const b=new Bot(a.team,CLS_POOL[randi(0,CLS_POOL.length-1)],nextName(a.team));
b.spawnInVehicle(a);
}
for(const pl of planes){
const b=new Bot(pl.team,CLS_POOL[randi(0,CLS_POOL.length-1)],nextName(pl.team));
b.pilotOf=pl;
pl.pilotBot=b;
b.spawnInVehicle(pl);
}
}
let lastT=performance.now(), fpsAcc=0, fpsN=0, fpsShow=0;
