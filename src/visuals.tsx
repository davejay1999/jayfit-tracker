import type { CSSProperties } from 'react';

const machineKeys = new Set(['chest-press','shoulder-press','pec-deck','lateral-raise','pulldown','row','reverse-fly','preacher-curl','leg-press','leg-curl','leg-extension','hip-thrust','calf-raise','ab-crunch']);
const cableKeys = new Set(['pushdown','overhead-triceps','cable-crunch','pallof','straight-arm-pulldown','hammer-curl','biceps-curl','external-rotation','face-pull','scapular-pulldown']);
const lowerKeys = new Set(['leg-press','leg-curl','leg-extension','hip-thrust','rdl','calf-raise','knee-raise','squat','glute-bridge','hinge','hip-circle','leg-swing','leg-swing-side','hamstring-stretch','quad-stretch','hip-flexor-stretch','figure-four','calf-stretch']);
const pullKeys = new Set(['pulldown','row','reverse-fly','straight-arm-pulldown','preacher-curl','hammer-curl','biceps-curl','lat-stretch','child-pose','rear-delt-stretch','biceps-stretch','face-pull','scapular-pulldown']);
const pushKeys = new Set(['chest-press','shoulder-press','pec-deck','lateral-raise','pushdown','overhead-triceps','pushup','chest-stretch','triceps-stretch','shoulder-stretch','external-rotation']);

function accentFor(key:string){
  if(lowerKeys.has(key)) return '#f7b267';
  if(pullKeys.has(key)) return '#72d6ff';
  if(pushKeys.has(key)) return '#ff7f96';
  return '#baf26a';
}

export function ExerciseVisual({visual,name,size='large'}:{visual:string;name:string;size?:'small'|'large'}){
  const accent=accentFor(visual);
  const style:CSSProperties={width:'100%',height:'100%',display:'block'};
  const machine=machineKeys.has(visual), cable=cableKeys.has(visual);
  const lower=lowerKeys.has(visual);
  const initials=name.split(/\s|\//).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  return <svg style={style} viewBox="0 0 180 130" role="img" aria-label={`${name} illustration`}>
    <defs><linearGradient id={`g-${visual}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={accent} stopOpacity=".35"/><stop offset="1" stopColor={accent} stopOpacity=".06"/></linearGradient></defs>
    <rect x="2" y="2" width="176" height="126" rx="24" fill={`url(#g-${visual})`} stroke={accent} strokeOpacity=".22"/>
    {machine && <g stroke="#7d8798" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M28 104V28h34M28 34h26M145 105V30h-25"/><path d="M36 104h112"/><path d="M50 78h36v12H50z" fill="#1a202b"/><path d="M64 78V56"/></g>}
    {cable && <g stroke="#7d8798" strokeWidth="3" fill="none"><path d="M28 105V22h24M28 30h24"/><circle cx="47" cy="30" r="5"/><path d="M47 35L96 61" strokeDasharray="3 3"/></g>}
    <g stroke="#d7dce6" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={machine?92:96} cy="37" r="9" fill="#d7dce6" stroke="none"/>
      <path d={lower?"M93 48L88 76":"M94 48L91 78"}/>
      {visual.includes('pulldown')||visual==='shoulder-press'?<><path d="M92 54L65 35"/><path d="M92 54L118 34"/></>:visual.includes('row')||visual==='reverse-fly'?<><path d="M92 56L62 65"/><path d="M92 56L124 64"/></>:visual.includes('curl')||visual==='preacher-curl'?<><path d="M92 56L72 68L82 52"/><path d="M92 56L112 68L102 52"/></>:visual.includes('stretch')? <><path d="M92 55L66 42"/><path d="M92 55L117 76"/></>:<><path d="M92 56L70 71"/><path d="M92 56L114 70"/></>}
      {lower?<><path d="M88 76L68 101"/><path d="M88 76L109 102"/></>:<><path d="M91 78L76 103"/><path d="M91 78L108 103"/></>}
    </g>
    {lower && <g fill={accent} opacity=".9"><ellipse cx="75" cy="88" rx="7" ry="12"/><ellipse cx="102" cy="88" rx="7" ry="12"/></g>}
    {!lower && pullKeys.has(visual) && <path d="M76 53Q92 46 108 53L105 69Q92 65 79 69Z" fill={accent} opacity=".78"/>}
    {!lower && pushKeys.has(visual) && <path d="M78 52Q92 43 106 52L104 61Q92 57 80 61Z" fill={accent} opacity=".78"/>}
    {visual.includes('crunch')||visual==='pallof'||visual==='knee-raise'?<ellipse cx="91" cy="72" rx="12" ry="15" fill={accent} opacity=".75"/>:null}
    {visual==='walk'||visual==='cardio'||visual==='bike'||visual==='elliptical'?<g stroke={accent} strokeWidth="5" fill="none"><path d="M50 105h80"/><circle cx="62" cy="94" r="13"/><circle cx="116" cy="94" r="13"/><path d="M62 94L87 72L104 94M87 72L116 94"/></g>:null}
    <text x="150" y="116" textAnchor="middle" fontSize={size==='small'?12:15} fontWeight="900" fill={accent} opacity=".9">{initials}</text>
  </svg>
}
