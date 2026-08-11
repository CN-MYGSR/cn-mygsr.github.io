'use strict';
// ===================== 武器改装系统 =====================
// 每位玩家的武器可在部署时加装配件, 改装后模型与属性同时变化
// 三个槽位: optic(瞄具) · muzzle(枪口) · magazine(弹匣)

const ALL_MODS = {
  // ---- 瞄具 ----
  optic_iron:     { slot:'optic', name:'机械瞄具',   desc:'出厂标配',       icon:'◎', affects:{} },
  optic_reflex:   { slot:'optic', name:'反射瞄具',   desc:'更快瞄准·视野开阔', icon:'◉', affects:{ adsFov:1.25, spreadAds:0.85 }, cost:80 },
  optic_2x:       { slot:'optic', name:'2倍瞄准镜',  desc:'中距精确射击',     icon:'⊕', affects:{ adsFov:0.58, spreadAds:0.62, spreadHip:1.1 }, cost:120 },
  optic_4x:       { slot:'optic', name:'4倍狙击镜',  desc:'远距高倍精确',     icon:'⦿', affects:{ adsFov:0.34, spreadAds:0.48, spreadHip:1.2 }, cost:180 },

  // ---- 枪口 ----
  muzzle_standard:  { slot:'muzzle', name:'标准枪口', desc:'无改动',           icon:'─', affects:{} },
  muzzle_comp:      { slot:'muzzle', name:'制退器',   desc:'减少垂直后座',     icon:'◁', affects:{ recoil:0.78, recSide:1.15 }, cost:90 },
  muzzle_supp:      { slot:'muzzle', name:'消音器',   desc:'减小枪声·降低威力', icon:'○', affects:{ dmg:0.92, spreadAds:0.82, snd:'smg' }, cost:140 },
  muzzle_hider:     { slot:'muzzle', name:'喇叭形消焰', desc:'消焰·略微减后座', icon:'△', affects:{ recoil:0.88, spreadAds:0.95 }, cost:70 },

  // ---- 弹匣 ----
  mag_standard:     { slot:'mag', name:'标准弹匣',   desc:'默认容量',          icon:'□', affects:{} },
  mag_ext:          { slot:'mag', name:'扩容弹匣',   desc:'弹容量 +40%·装填稍慢',icon:'▣', affects:{ magMul:1.4, reload:1.15 }, cost:100 },
  mag_quick:        { slot:'mag', name:'快拔弹匣',   desc:'装填加快·弹容 -15%',icon:'▤', affects:{ magMul:0.85, reload:0.78 }, cost:100 },
};

// 每个武器可用的模组 (按武器 key)
const MOD_AVAIL = {
  garand:      { optic:['optic_iron','optic_2x','optic_reflex'],      muzzle:['muzzle_standard','muzzle_comp','muzzle_hider'],     mag:['mag_standard'] },
  m1carb:      { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  thompson:    { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard','muzzle_comp','muzzle_supp'],      mag:['mag_standard','mag_ext','mag_quick'] },
  bar:         { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard','muzzle_comp'],                    mag:['mag_standard'] },
  springfield: { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  m1903:       { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  m1911:       { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext','mag_quick'] },
  bazooka:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  kar98:       { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  kar98zf:     { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  mp40:        { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  stg44:       { optic:['optic_iron','optic_reflex','optic_2x'],       muzzle:['muzzle_standard','muzzle_comp','muzzle_supp'],      mag:['mag_standard','mag_ext','mag_quick'] },
  g33:         { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  p38:         { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard'] },
  schreck:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  mosin:       { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  mosinpu:     { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  m38carb:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  ppsh:        { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_comp'],                    mag:['mag_standard','mag_ext'] },
  dp28:        { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  tt33:        { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard'] },
  ptrd:        { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  finmosin:    { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  finmosins:   { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  suomi:       { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_comp'],                    mag:['mag_standard','mag_ext'] },
  ls26:        { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  l39:         { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  l35:         { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard'] },

  arisaka:     { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  type97s:     { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  type38c:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  type100:     { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  type96:      { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  nambu:       { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  type97at:    { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  zhongzheng:  { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  zhongzhengs: { optic:['optic_4x','optic_2x'],                        muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  mp18:        { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  zb26:        { optic:['optic_iron','optic_reflex'],                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  c96:         { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard'] },
  c96auto:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard','muzzle_comp'],                    mag:['mag_standard','mag_ext'] },
  boys:        { optic:['optic_iron','optic_2x'],                      muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  hanyang:     { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  laotao:      { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  type11:      { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  mortar:      { optic:['optic_iron'],                                  muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },

  // ---- 现代 ----
  m4:        { optic:['optic_iron','optic_reflex','optic_2x'],         muzzle:['muzzle_standard','muzzle_comp','muzzle_supp'],      mag:['mag_standard','mag_ext','mag_quick'] },
  g36c:      { optic:['optic_iron','optic_reflex','optic_2x'],         muzzle:['muzzle_standard','muzzle_comp','muzzle_supp'],      mag:['mag_standard','mag_ext','mag_quick'] },
  m24:       { optic:['optic_4x','optic_2x'],                          muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_quick'] },
  g28:       { optic:['optic_4x','optic_2x'],                          muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  mp5:       { optic:['optic_iron','optic_reflex'],                    muzzle:['muzzle_standard','muzzle_supp','muzzle_comp'],      mag:['mag_standard','mag_ext','mag_quick'] },
  at4:       { optic:['optic_iron'],                                    muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  pf3:       { optic:['optic_iron'],                                    muzzle:['muzzle_standard'],                                  mag:['mag_standard'] },
  p320:      { optic:['optic_iron'],                                    muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
  g17:       { optic:['optic_iron'],                                    muzzle:['muzzle_standard','muzzle_supp'],                    mag:['mag_standard','mag_ext'] },
};

// 玩家存储的改装选择: { weaponKey: { optic:'optic_2x', muzzle:'muzzle_comp', mag:'mag_standard' } }
let PLAYER_MODS = {};
try { PLAYER_MODS = JSON.parse(localStorage.getItem('sf_mods')||'{}'); } catch(e) { PLAYER_MODS = {}; }

function savePlayerMods() { try { localStorage.setItem('sf_mods', JSON.stringify(PLAYER_MODS)); } catch(e) {} }

function getModSlots(key) { return MOD_AVAIL[key] || { optic:['optic_iron'], muzzle:['muzzle_standard'], mag:['mag_standard'] }; }
function getModChoice(key, slot) {
  const wm = PLAYER_MODS[key] || {};
  const avail = getModSlots(key);
  const list = avail[slot] || [];
  return (wm[slot] && list.includes(wm[slot])) ? wm[slot] : list[0];
}
function setModChoice(key, slot, modId) { if(!PLAYER_MODS[key]) PLAYER_MODS[key]={}; PLAYER_MODS[key][slot]=modId; savePlayerMods(); }

// 将改装效果应用到武器定义(返回一份浅拷贝+数值乘算)
function moddedDef(key) {
  const base = WPN_DEFS[key];
  if(!base) return null;
  const out = Object.assign({}, base);
  ['optic','muzzle','mag'].forEach(slot => {
    const mid = getModChoice(key, slot);
    const mod = ALL_MODS[mid];
    if(!mod||!mod.affects) return;
    const a = mod.affects;
    if(a.dmg) out.dmg = Math.round(out.dmg * a.dmg);
    if(a.recoil) out.recoil = out.recoil * a.recoil;
    if(a.recSide) out.recSide = out.recSide * a.recSide;
    if(a.spreadAds) out.spreadAds = out.spreadAds * a.spreadAds;
    if(a.spreadHip) out.spreadHip = out.spreadHip * a.spreadHip;
    if(a.adsFov) out.adsFov = Math.round(out.adsFov * a.adsFov);
    if(a.magMul) { out.mag = Math.max(1, Math.round(out.mag * a.magMul)); out.reserve = Math.max(1, Math.round(out.reserve * a.magMul)); }
    if(a.reload) out.reload = +(out.reload * a.reload).toFixed(2);
    if(a.snd) out.snd = a.snd;
    if(a.kick) out.kick = out.kick * a.kick;
  });
  return out;
}

// ---- 改装件的视觉部件构建 ----
function addModVisuals(parts, key) {
  const G = parts.gun;
  const gm = vmMats.gun, gl = vmMats.gunL, pk = vmMats.park;
  const muzz = parts.muzzle ? parts.muzzle.clone() : V3(0,0.03,-0.62);
  const baseDef = WPN_DEFS[key];
  const alreadyScoped = baseDef && baseDef.scoped;

  // 瞄具: 仅非镜武器可加装; 镜武器(春田PU等)已有内建镜, 不改动视角
  const optic = getModChoice(key, 'optic');
  const adsA = parts.anchors && parts.anchors.ads;
  if(!alreadyScoped && adsA && optic !== 'optic_iron') {
    const p0y = adsA.pos.y, p0z = adsA.pos.z;
    if(optic === 'optic_reflex') {
      const bxBase = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.016,0.04), gl);
      bxBase.position.set(0, p0y-0.003, p0z-0.05); G.add(bxBase);
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.028,0.022,0.005), new THREE.MeshLambertMaterial({color:0x8ac0e0}));
      lens.position.set(0, p0y-0.003, p0z-0.07); G.add(lens);
      adsA.pos.y += 0.015;
      adsA.pos.z += 0.06;
    } else if(optic === 'optic_2x') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.015,0.11,8), gl);
      tube.position.set(0, p0y-0.002, p0z-0.05); tube.rotation.x = HPI; G.add(tube);
      const obj = new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.011,0.025,8), gm);
      obj.position.set(0, p0y-0.002, p0z-0.1); obj.rotation.x = HPI; G.add(obj);
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.015,0.002,6,8), gl);
      r1.position.set(0, p0y-0.002, p0z-0.02); G.add(r1);
      const r2 = r1.clone(); r2.position.z = p0z-0.08; G.add(r2);
      adsA.pos.y += 0.025;
      adsA.pos.z += 0.055;
    } else if(optic === 'optic_4x') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.019,0.14,8), gl);
      tube.position.set(0, p0y, p0z-0.05); tube.rotation.x = HPI; G.add(tube);
      const obj = new THREE.Mesh(new THREE.CylinderGeometry(0.021,0.025,0.035,8), gm);
      obj.position.set(0, p0y, p0z-0.12); obj.rotation.x = HPI; G.add(obj);
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.019,0.0025,8,10), gl);
      r1.position.set(0, p0y, p0z-0.01); G.add(r1);
      const r2 = r1.clone(); r2.position.z = p0z-0.09; G.add(r2);
      adsA.pos.y += 0.035;
      adsA.pos.z += 0.05;
    }
  }

  // 枪口装置
  const muzzle = getModChoice(key, 'muzzle');
  if(muzzle === 'muzzle_comp') {
    const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.018,0.06,8), gl);
    comp.position.copy(muzz); comp.position.z -= 0.03; comp.rotation.x = HPI; G.add(comp);
    for(let i=0;i<3;i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.003,0.025), gm);
      slot.position.set(muzz.x, muzz.y, muzz.z - 0.05 - i*0.015); G.add(slot);
    }
    parts.muzzle.z -= 0.08;
  } else if(muzzle === 'muzzle_supp') {
    const supp = new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.02,0.14,8), gm);
    supp.position.copy(muzz); supp.position.z -= 0.07; supp.rotation.x = HPI; G.add(supp);
    parts.muzzle.z -= 0.16;
  } else if(muzzle === 'muzzle_hider') {
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.022,0.07,8), gl);
    cone.position.copy(muzz); cone.position.z -= 0.035; cone.rotation.x = HPI; G.add(cone);
    parts.muzzle.z -= 0.09;
  }

  // 弹匣
  const mag = getModChoice(key, 'mag');
  const mw = parts.anchors && parts.anchors.magWell;
  if(mag === 'mag_ext' && mw) {
    const extMag = new THREE.Mesh(new THREE.BoxGeometry(0.024,0.22,0.06), pk);
    extMag.position.set(mw.x, mw.y - 0.075, mw.z); G.add(extMag);
    if(parts.mag) { parts.mag.scale.y = 1.35; parts.mag.position.y -= 0.04; }
  } else if(mag === 'mag_quick' && mw) {
    // 快拔弹匣: 底部加装快拔环
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018,0.003,6,8), gl);
    ring.position.set(mw.x, mw.y - 0.08, mw.z); G.add(ring);
  }
}

// 改装外观显示名称 (部署界面)
function modDisplayName(key) {
  const parts = [];
  ['optic','muzzle','mag'].forEach(s => {
    const mid = getModChoice(key, s);
    if(mid && mid !== 'optic_iron' && mid !== 'muzzle_standard' && mid !== 'mag_standard') {
      parts.push(ALL_MODS[mid].name);
    }
  });
  return parts.length ? parts.join(' · ') : '无改装';
}

// 改装总开销
function modTotalCost(key) {
  let total = 0;
  ['optic','muzzle','mag'].forEach(s => {
    const mid = getModChoice(key, s);
    if(mid && ALL_MODS[mid].cost) total += ALL_MODS[mid].cost;
  });
  return total;
}
