"use strict";
/* =====================================================================
   Sound: shared Web Audio context, sound effects, and the jukebox.
   Hava Nagila is a traditional Hasidic melody (first published 1922,
   words by A. Z. Idelsohn). Arranged here in E freygish / A minor,
   following the standard three-part form:
     A: "Hava nagila"   B: "Hava neranena"   C: "Uru, uru achim"
   Durations are in eighth notes; every bar is 8 eighths (4/4).
   ===================================================================== */
const Sound = (() => {
  let ac = null, master, sfxBus, musBus, verbIn;
  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.gain.value = 0.35; sfxBus.connect(master);
      musBus = ac.createGain(); musBus.gain.value = 0.6; musBus.connect(master);
      // small room reverb
      const len = Math.floor(ac.sampleRate * 1.6), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.6); }
      const verb = ac.createConvolver(); verb.buffer = ir;
      const wet = ac.createGain(); wet.gain.value = 0.2;
      verbIn = ac.createGain(); verbIn.connect(verb); verb.connect(wet); wet.connect(master);
      musBus.connect(verbIn);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  let noise = null;
  function noiseBuf() {
    if (noise) return noise;
    const len = Math.floor(ac.sampleRate * 0.4); noise = ac.createBuffer(1, len, ac.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random()*2-1;
    return noise;
  }
  function tone(f, t, dur, type, vol, bus, glideTo) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur*0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }
  const sfx = {
    on: true,
    click() { if (!this.on || !ctx()) return; const t = ac.currentTime; tone(900 + Math.random()*160, t, 0.12, 'sine', 0.35, sfxBus, 1500); tone(2400, t, 0.05, 'triangle', 0.08, sfxBus); },
    buy() { if (!this.on || !ctx()) return; const t = ac.currentTime; tone(520, t, 0.1, 'triangle', 0.3, sfxBus); tone(780, t + 0.06, 0.14, 'triangle', 0.25, sfxBus); },
    gelt() { if (!this.on || !ctx()) return; const t = ac.currentTime; [1047,1319,1568,2093].forEach((f,i) => tone(f, t + i*0.06, 0.4, 'sine', 0.3, sfxBus)); },
    ach() { if (!this.on || !ctx()) return; const t = ac.currentTime; [659,831,988,1319].forEach((f,i) => tone(f, t + i*0.09, 0.35, 'triangle', 0.22, sfxBus)); },
    spin() { if (!this.on || !ctx()) return; const t = ac.currentTime; for (let i = 0; i < 14; i++) tone(300 + i*25, t + i*0.09, 0.05, 'square', 0.05, sfxBus); },
    wrong() { if (!this.on || !ctx()) return; const t = ac.currentTime; tone(330, t, 0.25, 'triangle', 0.25, sfxBus, 220); },
  };
  return { ctx, sfx, noiseBuf, get ac() { return ac; }, get musBus() { return musBus; }, setMusicVol(v) { if (ctx()) musBus.gain.value = v; } };
})();

const Music = (() => {
  const NI = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,Bb:10,B:11};
  const hz = n => { const m = n.match(/^([A-G][#b]?)(\d)$/); return 440 * Math.pow(2, (12*(+m[2]+1) + NI[m[1]] - 69)/12); };

  const BAR = {
    A1:['E4:2 E4:3 G#4:1 F4:1 E4:1',                         'E:8'],
    A2:['G#4:2 G#4:3 B4:1 A4:1 G#4:1',                       'E:8'],
    A3:['A4:2 A4:3 C5:1 B4:1 A4:1',                          'Am:8'],
    X1:['G#4:2 F4:.5 E4:.5 F4:1 G#4:4',                      'E:2 Dm:2 E:4'],
    X2:['G#4:2 F4:.5 E4:.5 F4:1 E4:4',                       'E:2 Dm:2 E:4'],
    B1:['G#4:1 G#4:2 F4:1 E4:1 E4:1 E4:2',                   'E:8'],
    B2:['F4:1 F4:2 E4:1 D4:1 D4:1 D4:2',                     'Dm:8'],
    B3:['D4:2 F4:1.5 E4:.5 D4:1 D4:1 A4:2',                  'Dm:8'],
    C1:['A4:4 A4:4',                                         'Am:8'],
    C2:['A4:2 A4:2 A4:2 A4:2',                               'Am:8'],
    C3:['A4:.5 A4:.5 A4:1 C5:1.5 B4:.5 A4:1 C5:1 B4:1 A4:1', 'Am:8'],
    C5:['B4:.5 B4:.5 B4:1 D5:1.5 C5:.5 B4:1 D5:1 C5:1 B4:1', 'Dm:8'],
    C7:['B4:1 B4:1 E5:2 B4:1 B4:1 E5:1.5 E4:.5',             'Dm:2 E:2 Dm:2 E:2'],
    C8:['E4:1 E4:1 C5:.5 B4:.5 A4:.5 G#4:.5 A4:4',           'E7:4 Am:4'],
  };
  const SEQ = [
    {label:'Hava nagila',    lyric:'Hava nagila, hava nagila, hava nagila v\'nismecha', bars:['A1','A2','A3','X1','A1','A2','A3','X2']},
    {label:'Hava neranena',  lyric:'Hava neranena, hava neranena, hava neranena v\'nismecha', bars:['B1','B2','B3','X1','B1','B2','B3','X2']},
    {label:'Uru, uru achim', lyric:'Uru, uru achim! Uru achim b\'lev sameach', bars:['C1','C2','C3','C3','C5','C5','C7','C8']},
    {label:'Uru achim (again!)', lyric:'Uru achim b\'lev sameach, uru achim b\'lev sameach', bars:['C3','C3','C5','C5','C7','C8']},
  ];
  const CH = {
    E:{b:['E2','B2'], t:['E3','G#3','B3']}, Dm:{b:['D2','A2'], t:['D3','F3','A3']},
    Am:{b:['A2','E2'], t:['A3','C4','E4']}, E7:{b:['E2','B2'], t:['E3','G#3','D4']},
  };

  // ---- build the event list (time in eighths) ----
  const EV = [], SECT = [];
  let LEN = 0;
  (function build() {
    let t = 0;
    for (const sec of SEQ) {
      SECT.push({start:t, label:sec.label, lyric:sec.lyric});
      for (const id of sec.bars) {
        const [mel, chs] = BAR[id];
        let mt = t;
        for (const tok of mel.split(' ')) { const [n, d] = tok.split(':'); const dur = parseFloat(d); EV.push({t:mt, k:'mel', f:hz(n), d:dur}); mt += dur; }
        // chord map for this bar
        const segs = []; let ct = 0;
        for (const s of chs.split(' ')) { const [c, d] = s.split(':'); segs.push({from:ct, to:ct + +d, c}); ct += +d; }
        const chordAt = e => segs.find(s => e >= s.from && e < s.to).c;
        for (let q = 0; q < 4; q++) {
          const e = q*2, c = CH[chordAt(e)];
          if (q % 2 === 0) { EV.push({t:t+e, k:'bass', f:hz(c.b[q === 0 ? 0 : 1])}); EV.push({t:t+e, k:'kick'}); }
          else { EV.push({t:t+e, k:'chord', fs:c.t.map(hz)}); EV.push({t:t+e, k:'snare'}); }
          EV.push({t:t+e+1, k:'hat'});
        }
        t += 8;
      }
    }
    LEN = t;
    EV.sort((a, b) => a.t - b.t);
  })();

  const INSTR = {
    clarinet:  {name:'Klezmer clarinet', waves:[['square',0]],                 cut:2300, q:2, vib:9,  vibRate:5.6, scoop:35, gain:0.15, atk:0.025},
    fiddle:    {name:'Fiddle',           waves:[['sawtooth',0],['sawtooth',6]], cut:3400, q:1, vib:18, vibRate:6.2, scoop:20, gain:0.09, atk:0.05},
    accordion: {name:'Accordion',        waves:[['sawtooth',-8],['sawtooth',8],['square',-1200]], cut:2600, q:1, trem:true, gain:0.07, atk:0.02},
    chip:      {name:'8-bit arcade',     waves:[['square',0]],                 cut:12000, q:0, gain:0.07, atk:0.005, stac:0.85},
  };

  const M = {playing:false, mode:'steady', inst:'clarinet', bpm:152, band:true, idx:0, loopStart:0, loops:0, timer:null, session:null,
             hooks:{onHoraMax:null, onLoop:null}, SECT, LEN};
  const eighth = () => 30 / M.bpm;

  function voice(ev, t) {
    const ac = Sound.ac, out = M.session, e = eighth();
    if (ev.k === 'mel') {
      const ins = INSTR[M.inst], dur = ev.d * e * (ins.stac || 0.96);
      const g = ac.createGain(), f = ac.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = ins.cut; f.Q.value = ins.q || 0.7;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(ins.gain, t + ins.atk);
      g.gain.setValueAtTime(ins.gain * 0.85, t + Math.max(ins.atk + 0.01, dur * 0.7));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      let lfo = null, lfoG = null;
      if (ins.vib || ins.trem) {
        lfo = ac.createOscillator(); lfo.frequency.value = ins.trem ? 6.5 : ins.vibRate;
        lfoG = ac.createGain(); lfoG.gain.setValueAtTime(0, t);
        if (ins.vib) lfoG.gain.linearRampToValueAtTime(ins.vib, t + Math.min(0.25, dur*0.6));
        else lfoG.gain.value = 0.22 * ins.gain;
        lfo.connect(lfoG); lfo.start(t); lfo.stop(t + dur + 0.05);
        if (ins.trem) lfoG.connect(g.gain);
      }
      for (const [type, det] of ins.waves) {
        const o = ac.createOscillator(); o.type = type; o.frequency.value = ev.f;
        o.detune.setValueAtTime(det - (ins.scoop || 0), t);
        o.detune.linearRampToValueAtTime(det, t + 0.06);
        if (lfoG && ins.vib) lfoG.connect(o.detune);
        o.connect(f); o.start(t); o.stop(t + dur + 0.05);
      }
      f.connect(g); g.connect(out);
      return;
    }
    if (!M.band) return;
    if (ev.k === 'bass') {
      const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), d = e * 1.7;
      o.type = 'triangle'; o.frequency.value = ev.f; o2.type = 'sine'; o2.frequency.value = ev.f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); o2.connect(g); g.connect(out); o.start(t); o2.start(t); o.stop(t + d + 0.02); o2.stop(t + d + 0.02);
    } else if (ev.k === 'chord') {
      const g = ac.createGain(), f = ac.createBiquadFilter(), d = e * 1.3;
      f.type = 'lowpass'; f.frequency.value = 1600;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.055, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      for (const fr of ev.fs) for (const det of [-6, 6]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det; o.connect(f); o.start(t); o.stop(t + d + 0.02); }
      f.connect(g); g.connect(out);
    } else if (ev.k === 'kick') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
    } else if (ev.k === 'snare' || ev.k === 'hat') {
      const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
      s.buffer = Sound.noiseBuf();
      const hat = ev.k === 'hat';
      f.type = hat ? 'highpass' : 'bandpass'; f.frequency.value = hat ? 7000 : 1900;
      g.gain.setValueAtTime(hat ? 0.05 : 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (hat ? 0.04 : 0.13));
      s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + 0.16);
    }
  }

  function scheduler() {
    const ac = Sound.ac, ahead = ac.currentTime + 0.2;
    for (;;) {
      if (M.idx >= EV.length) {
        M.loopStart += LEN * eighth(); M.idx = 0; M.loops++;
        if (M.mode === 'hora') {
          const before = M.bpm;
          M.bpm = Math.min(260, Math.round(M.bpm * 1.08));
          if (M.bpm >= 260 && before < 260 && M.hooks.onHoraMax) M.hooks.onHoraMax();
        }
        if (M.hooks.onLoop) M.hooks.onLoop();
      }
      const ev = EV[M.idx], t = M.loopStart + ev.t * eighth();
      if (t > ahead) break;
      if (t >= ac.currentTime - 0.04) voice(ev, Math.max(t, ac.currentTime));
      M.idx++;
    }
  }

  M.start = function () {
    if (!Sound.ctx()) return false;
    const ac = Sound.ac;
    M.session = ac.createGain(); M.session.gain.value = 1; M.session.connect(Sound.musBus);
    M.playing = true; M.idx = 0; M.loops = 0;
    if (M.mode === 'hora') M.bpm = 112;
    M.loopStart = ac.currentTime + 0.1;
    M.timer = setInterval(scheduler, 35); scheduler();
    return true;
  };
  M.stop = function () {
    M.playing = false; clearInterval(M.timer);
    if (M.session) { const s = M.session, ac = Sound.ac; s.gain.setTargetAtTime(0, ac.currentTime, 0.04); setTimeout(() => s.disconnect(), 400); M.session = null; }
  };
  M.setTempo = function (v) {
    if (M.playing) { const ac = Sound.ac, beat = (ac.currentTime - M.loopStart) / eighth(); M.bpm = v; M.loopStart = ac.currentTime - beat * eighth(); }
    else M.bpm = v;
  };
  M.position = function () {
    if (!M.playing) return null;
    const pos = Math.max(0, (Sound.ac.currentTime - M.loopStart) / eighth());
    let sec = SECT[0]; for (const s of SECT) if (pos >= s.start) sec = s;
    return {pos, frac: Math.min(1, pos / LEN), sec};
  };
  M.INSTR = INSTR;
  return M;
})();
