import { useState } from 'react';
import { stockFrameUrls } from './exerciseStock';

export function ExerciseVisual({visual,name,size='large'}:{visual:string;name:string;size?:'small'|'large'}){
  const media=stockFrameUrls(visual);
  const [failed,setFailed]=useState(false);

  if(!media||failed){
    return <div className={`stock-exercise fallback ${size}`} role="img" aria-label={`${name} exercise demo unavailable`}>
      <div className="fallback-badge">EXERCISE DEMO</div>
      <strong>{name}</strong>
      <span>Media fallback</span>
    </div>;
  }

  if(size==='small'){
    return <div className="stock-exercise small" title={`${media.sourceName} — public-domain exercise media`}>
      <img src={media.first} alt={`${name} start position`} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
      <span className="stock-source">DEMO</span>
    </div>;
  }

  return <div className="stock-exercise large" title={`${media.sourceName} — public-domain exercise media`}>
    <img className="stock-frame frame-a" src={media.first} alt={`${name} start position`} decoding="async" onError={()=>setFailed(true)}/>
    <img className="stock-frame frame-b" src={media.second} alt={`${name} end position`} decoding="async" onError={()=>setFailed(true)}/>
    <div className="stock-demo-label"><span>FORM DEMO</span><small>{media.sourceName}</small></div>
  </div>;
}
