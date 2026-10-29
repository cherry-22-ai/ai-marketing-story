
window.FILM_PLAYBACK_VIDEOS={"0": "asset-eb64649c39b6150d.mp4", "1": "asset-24e9ab793e88bdd0.mp4", "2": "asset-bc48c590d05426a1.mp4", "3": "asset-06b9872bab85fe8a.mp4", "4": "asset-f7262011faecbb3d.mp4", "5": "asset-30f98077e6d81b5c.mp4"};
window.FILM_PLAYBACK_EVIDENCE="asset-2c0c585123a9ffa8.mp4";
window.OFFLINE_VIDEOS={"0":"asset-ac996f9327fee949.mp4","1":"asset-cb25dfb1841590c9.mp4","2":"asset-f97fc0cff84127b3.mp4","3":"asset-a7fe6739f5ce5302.mp4","4":"asset-3e2ee2e83abe0dfe.mp4","5":"asset-5f595eb36999e9e9.mp4"};
window.FILM_EVIDENCE_ASSETS={"comparison":"asset-3e1ecf9dbb4eaf77.jpg","original":"asset-510e135bad5a447d.mp4"};
'use strict';
// Main-story previews are optimized for streaming; the gallery retains original files.
window.FILM_MEDIA=(()=>{
 const entries=window.FILM_CONTENT.cases.map((item,i)=>{
  const video=document.createElement('video');video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.preload='none';video.muted=true;video.style.display='none';video.setAttribute('aria-hidden','true');
  video.src=window.FILM_PLAYBACK_VIDEOS?.[i]||window.OFFLINE_VIDEOS?.[i]||item.src;document.body.append(video);
  const poster=new Image();poster.src=window.CASE_POSTERS[i];
  const e={video,poster,error:false,blocked:false,starting:false,warmed:false,waitingAt:null};
  video.addEventListener('error',()=>{e.error=true;e.starting=false});
  for(const event of ['seeked','loadeddata','canplay'])video.addEventListener(event,()=>{if(window.STORY_PLAYER&&!window.STORY_PLAYER.running)window.STORY_PLAYER.redraw?.()});return e;
 });
 let active=-1;
 function indexForShot(s){if(s?.scene==='case-primary')return window.FILM_STATE.choice==='menu'?2:0;if(s?.scene==='case-secondary')return window.FILM_STATE.choice==='menu'?0:2;if(s?.scene==='case-branch')return 4;return -1}
 function at(t){const shot=window.FILM_SHOTS.find(s=>t>=s.start&&t<s.end),i=indexForShot(shot);return i<0?null:{index:i,shot,local:t-shot.start,entry:entries[i]}}
 function warm(i){const e=entries[i];if(!e||e.warmed)return;e.warmed=true;e.video.preload='auto';e.video.load();}
 function warmUpcoming(t){const next=window.FILM_SHOTS.find(s=>s.end>t&&indexForShot(s)>=0);if(next)warm(indexForShot(next));}
 async function requestPlay(e){if(e.starting||e.blocked||e.error||!e.video.paused||e.video.ended)return;e.starting=true;try{await e.video.play()}catch(err){if(err.name==='NotAllowedError')e.blocked=true;else if(err.name!=='AbortError')e.error=true;}finally{e.starting=false;}}
 function sync(t,playing,sound){
  if(playing)warmUpcoming(t);
  const spec=at(t),i=spec?.index??-1;
  if(active!==i){entries.forEach(e=>{e.video.pause();e.video.muted=true;e.waitingAt=null});active=i;}
  if(!spec)return;warm(i);const e=spec.entry,v=e.video;v.muted=!sound;v.volume=.65;if(e.error)return;
  const target=Math.min(spec.local,Math.max(0,(Number.isFinite(v.duration)?v.duration:window.FILM_CONTENT.cases[i].duration)-.05));
  if(v.readyState>=1&&!v.seeking&&Math.abs(v.currentTime-target)>(playing?.32:.035)){try{v.currentTime=target}catch{}}
  // Calling play also starts downloading on browsers which stop at metadata.
  if(playing)requestPlay(e);else if(!v.paused)v.pause();
  if(playing&&(v.readyState<3||v.seeking||e.blocked)){if(e.waitingAt===null)e.waitingAt=performance.now();}else e.waitingAt=null;
 }
 function ready(t){const spec=at(t);if(!spec)return true;const e=spec.entry;if(e.error)return true;return (e.video.readyState>=3||e.video.ended)&&!e.blocked&&!e.video.seeking;}
 function status(t){const spec=at(t);if(!spec)return '';const e=spec.entry;if(e.error)return 'error';if(e.blocked)return 'blocked';if(!ready(t))return e.waitingAt!==null&&performance.now()-e.waitingAt>=8000?'slow':'loading';return 'ready';}
 async function seek(t){const spec=at(t);if(!spec)return;warm(spec.index);const e=spec.entry,v=e.video;if(e.error)return;
  if(v.readyState<1)await new Promise(resolve=>{const done=()=>{clearTimeout(timer);v.removeEventListener('loadedmetadata',done);v.removeEventListener('error',done);resolve()};const timer=setTimeout(done,7000);v.addEventListener('loadedmetadata',done);v.addEventListener('error',done)});
  const target=Math.min(spec.local,Math.max(0,(Number.isFinite(v.duration)?v.duration:window.FILM_CONTENT.cases[spec.index].duration)-.05));
  if(v.readyState>=1&&Math.abs(v.currentTime-target)>.035)await new Promise(resolve=>{const done=()=>{clearTimeout(timer);v.removeEventListener('seeked',done);resolve()};const timer=setTimeout(done,4000);v.addEventListener('seeked',done);v.currentTime=target});
 }
 function frame(index,local){const e=entries[index];if(!window.STORY_PLAYER&&e.video.readyState>=1&&!e.video.seeking){const target=Math.min(local,Math.max(0,e.video.duration-.05));if(Math.abs(e.video.currentTime-target)>.4)try{e.video.currentTime=target}catch{}}return e.video.readyState>=2?e.video:e.poster;}
 function pause(){entries.forEach(e=>{e.video.pause();e.waitingAt=null})}
 async function unlock(t){const s=at(t);if(!s)return false;warm(s.index);s.entry.blocked=false;await requestPlay(s.entry);return !s.entry.blocked&&!s.entry.error;}
 async function retry(t){const s=at(t);if(!s)return;s.entry.error=false;s.entry.blocked=false;s.entry.waitingAt=null;s.entry.video.preload='auto';s.entry.video.load();return unlock(t);}
 return{at,indexForShot,sync,ready,status,seek,frame,pause,entries,warmUpcoming,unlock,retry};
})();

// Export hooks: wait for the actual video frame and preserve source audio.
window.__prepareRenderFrame=async frame=>{await window.FILM_MEDIA.seek(frame/FPS_DRAW);};
let filmMediaAudioBuffers=null;
window.prepareFilmMediaAudio=async()=>{if(filmMediaAudioBuffers)return;const ac=new OfflineAudioContext(2,1,48000),ids=[...new Set(window.FILM_SHOTS.filter(s=>s.scene.startsWith('case-')).map(s=>window.FILM_MEDIA.indexForShot(s)))];const decoded=await Promise.all(ids.map(async i=>{const src=window.OFFLINE_VIDEOS?.[i]||window.FILM_CONTENT.cases[i].src;const response=await fetch(src);if(!response.ok)throw Error('案例音轨加载失败：'+(i+1));return [i,await ac.decodeAudioData(await response.arrayBuffer())]}));filmMediaAudioBuffers=Object.fromEntries(decoded);};
window.scheduleFilmMediaAudio=(ac,dest)=>{if(!filmMediaAudioBuffers)throw Error('案例音轨尚未准备');for(const shot of window.FILM_SHOTS.filter(s=>s.scene.startsWith('case-'))){const source=ac.createBufferSource(),gain=ac.createGain();source.buffer=filmMediaAudioBuffers[window.FILM_MEDIA.indexForShot(shot)];gain.gain.value=.65;source.connect(gain);gain.connect(dest);source.start(shot.start,0,Math.min(shot.dur,source.buffer.duration));}};

