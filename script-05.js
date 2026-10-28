
window.FILM_MUSIC_DATA={"fluffing-a-duck":"asset-deac4b20614e8aad.mp3","carefree":"asset-91bdc00a9f9a6b7c.mp3"};
'use strict';
// Licensed recordings replace the repeating oscillator bed; see MUSIC-CREDITS.md.
window.FILM_MUSIC_BUFFERS=null;let filmMusicPromise;
window.prepareFilmMusic=()=>filmMusicPromise||(filmMusicPromise=(async()=>{const ac=new OfflineAudioContext(2,1,24000),files=['fluffing-a-duck','carefree'];const buffers=await Promise.all(files.map(async name=>{const src=window.FILM_MUSIC_DATA?.[name]||`assets/${name}.mp3`;const response=await fetch(src);if(!response.ok)throw Error('配乐加载失败：'+name);return ac.decodeAudioData(await response.arrayBuffer())}));window.FILM_MUSIC_BUFFERS=buffers;return buffers;})());
window.filmScore=function(ac,t0,dest){const buffers=window.FILM_MUSIC_BUFFERS;if(!buffers)throw Error('请先加载配乐');const master=ac.createGain();master.gain.value=.8;master.connect(dest);const times=window.FILM_TIMES,total=window.FILM_CONTENT.totalDuration;
function music(index,start,end,offset,level){const source=ac.createBufferSource(),g=ac.createGain();source.buffer=buffers[index];source.connect(g);g.connect(master);g.gain.setValueAtTime(0,t0+start);g.gain.linearRampToValueAtTime(level,t0+start+.55);let cursor=start+.55;
for(const shot of window.FILM_SHOTS.filter(s=>s.scene.startsWith('case-')&&s.start>start&&s.end<end)){g.gain.setValueAtTime(level,t0+Math.max(cursor,shot.start-.5));g.gain.linearRampToValueAtTime(0,t0+shot.start);g.gain.setValueAtTime(0,t0+shot.end-.05);g.gain.linearRampToValueAtTime(level,t0+shot.end+.65);cursor=shot.end+.65;}
g.gain.setValueAtTime(level,t0+end-.8);g.gain.linearRampToValueAtTime(0,t0+end);source.start(t0+start,offset,end-start);source.stop(t0+end+.01);}
music(0,0,times.invite+1,0,.72);music(1,times.invite-.3,times.weekend,4,.62);music(0,times.weekend,times.comfort+1,32,.65);music(1,times.comfort-.3,total,100,.62);
function tap(t,f,d=.09,g=.12){const o=ac.createOscillator(),e=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f,t0+t);e.gain.setValueAtTime(.001,t0+t);e.gain.linearRampToValueAtTime(g,t0+t+.006);e.gain.exponentialRampToValueAtTime(.001,t0+t+d);o.connect(e);e.connect(master);o.start(t0+t);o.stop(t0+t+d)}
for(let n=0;n<10;n++)tap(.35+n*.68,840+n%3*110,.075,.16);tap(times.choose+1.5,1060,.16,.12);tap(times.hatch+8,210,.12,.21);[523.25,659.25,783.99,1046.5].forEach((f,i)=>tap(times.hatch+10+i*.08,f,.35,.17));};

