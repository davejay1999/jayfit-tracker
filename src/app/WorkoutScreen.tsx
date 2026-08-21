import { Check, ChevronLeft, ChevronRight, CircleMinus, CirclePlus, Cloud, CloudOff, Dumbbell, Minus, NotebookPen, Plus, RefreshCw, SlidersHorizontal, Timer, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { Exercise, MachineSetting, Phase, SetEntry } from '../types';
import { canonicalLb } from '../store';
import { ExerciseVisual } from '../visuals';

export type FlowItem={exercise:Exercise;phase:Phase;originalId:string};
const weightedWarmups=new Set(['external-rotation','scapular-pulldown','band-pull-apart-facepull','light-seated-row','chest-press-warmup','lat-pulldown-warmup','leg-press-warmup']);
const fmtTime=(sec:number)=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

export default function WorkoutScreen({item,rows,activeSet,elapsed,restSeconds,restRunning,previous,suggestion,cloudState,machine,onClose,onPrev,onNext,onPickSet,onSet,onComplete,onRest,onMachine,onNotes,onSwap,onReduced,onAddSet,onRemoveSet,beginner,position,phase}:{item:FlowItem;rows:SetEntry[];activeSet:number;elapsed:number;restSeconds:number;restRunning:boolean;previous:SetEntry[];suggestion:any;cloudState:string;machine?:MachineSetting;onClose:()=>void;onPrev:()=>void;onNext:()=>void;onPickSet:(i:number)=>void;onSet:(p:Partial<SetEntry>,persist?:boolean)=>void;onComplete:()=>void;onRest:(s:number)=>void;onMachine:()=>void;onNotes:()=>void;onSwap:()=>void;onReduced:()=>void;onAddSet:()=>void;onRemoveSet:()=>void;beginner:boolean;position:string;phase:Phase}){
  const ex=item.exercise,set=rows[activeSet];
  const weighted=set.setType==='WORKING'||weightedWarmups.has(ex.id);
  const timed=!!ex.timedMinutes||ex.type==='stretch';
  const unit=set.weightUnit,weightStep=unit==='kg'?2.5:5,prior=previous[activeSet]||previous[previous.length-1];
  const weight=Number(set.weight)||0,reps=Number(set.reps)||0;
  const working=rows.filter(r=>r.setType==='WORKING'&&r.done);
  const totalVol=working.reduce((s,r)=>s+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const leftVol=working.filter(r=>r.side==='L').reduce((s,r)=>s+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const rightVol=working.filter(r=>r.side==='R').reduce((s,r)=>s+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const baseCount=ex.unilateral?ex.sets*2:ex.sets;
  return <main className="workout-screen">
    <header className="session-head"><button onClick={onClose}><X/></button><div><small>{phase.toUpperCase()} • {position}</small><strong>{fmtTime(elapsed)}</strong></div><span className={cloudState}>{cloudState==='synced'?<Cloud/>:<CloudOff/>}</span></header>
    <div className="exercise-visual-large"><ExerciseVisual visual={ex.visual} name={ex.name}/></div>
    <section className="exercise-title"><div className="type-line"><span>{ex.type.toUpperCase()}</span><span>{ex.unilateral?'3 SETS EACH SIDE':`${ex.sets} SETS`} • {ex.reps}</span></div><h1>{ex.name}</h1><p>{[...ex.primary,...(ex.secondary||[])].join(' • ')}</p>{ex.note&&<div className="note">{ex.note}</div>}</section>
    <div className={`suggestion ${suggestion.tone}`}>{suggestion.tone==='up'?<TrendingUp/>:suggestion.tone==='down'?<TrendingDown/>:<Dumbbell/>}<div><strong>{suggestion.label}</strong><span>{suggestion.detail}</span></div></div>
    <div className="set-pills">{rows.map((r,i)=><button key={i} className={`${i===activeSet?'active':''} ${r.done?'done':''}`} onClick={()=>onPickSet(i)}>{r.side?`${r.side}${r.setNumber}`:r.setNumber}{r.done&&<Check/>}</button>)}</div>
    <section className="active-set-card"><div className="active-set-head"><div><small>{set.side?`${set.side==='R'?'RIGHT':'LEFT'} • `:''}SET {set.setNumber}</small><strong>{prior?.done?`Last: ${prior.weight||'—'} ${prior.weightUnit} × ${prior.reps||'—'}`:'Build your baseline'}</strong></div>{machine&&<button className="machine-chip" onClick={onMachine}>Machine saved</button>}</div>
      {weighted?<div className="controls-grid"><NumberControl label={`WEIGHT (${unit})`} value={weight} step={weightStep} decimals onChange={v=>onSet({weight:String(Math.max(0,v))},false)} onCommit={v=>onSet({weight:String(v)})}/><NumberControl label="REPS" value={reps} step={1} onChange={v=>onSet({reps:String(Math.max(0,v))},false)} onCommit={v=>onSet({reps:String(v)})}/></div>:<NumberControl label={timed?(ex.type==='stretch'?'SECONDS / HOLD':'MINUTES / DURATION'):'REPS'} value={reps} step={1} onChange={v=>onSet({reps:String(Math.max(0,v))},false)} onCommit={v=>onSet({reps:String(v)})}/>} 
      <textarea className="set-note" placeholder="Optional set note…" value={set.notes||''} onChange={e=>onSet({notes:e.target.value},false)} onBlur={e=>onSet({notes:e.target.value})}/>
      <button className={`complete-set ${set.done?'undo':''}`} onClick={onComplete}>{set.done?'UNDO SET':'COMPLETE SET'}<Check/></button>
    </section>
    {set.setType==='WORKING'&&<div className="volume-strip"><span><small>EXERCISE VOLUME</small><b>{Math.round(totalVol).toLocaleString()} lb</b></span>{ex.unilateral&&<><span><small>LEFT</small><b>{Math.round(leftVol).toLocaleString()}</b></span><span><small>RIGHT</small><b>{Math.round(rightVol).toLocaleString()}</b></span></>}</div>}
    {restSeconds>0&&<section className="rest-bar"><Timer/><div><small>REST TIMER</small><strong>{fmtTime(restSeconds)}</strong></div><div className="rest-actions"><button onClick={()=>onRest(60)}>60</button><button onClick={()=>onRest(90)}>90</button><button onClick={()=>onRest(120)}>120</button><button onClick={()=>onRest(0)}>{restRunning?'Skip':'Clear'}</button></div></section>}
    <div className="workout-tools"><button onClick={onMachine}><SlidersHorizontal/>Machine</button><button onClick={onNotes}><NotebookPen/>Notes</button>{(ex.alternatives||[]).length>0&&<button onClick={onSwap}><RefreshCw/>Swap</button>}{beginner&&set.setType==='WORKING'&&<button onClick={onReduced}>2-set day</button>}<button onClick={onAddSet}><CirclePlus/>Set</button>{rows.length>baseCount&&<button onClick={onRemoveSet}><CircleMinus/>Set</button>}</div>
    <footer className="session-nav"><button onClick={onPrev}><ChevronLeft/>Previous</button><button onClick={onNext}>Next<ChevronRight/></button></footer>
  </main>;
}

function NumberControl({label,value,step,onChange,onCommit,decimals=false}:{label:string;value:number;step:number;onChange:(n:number)=>void;onCommit:(n:number)=>void;decimals?:boolean}){return <div className="number-control"><small>{label}</small><div><button onClick={()=>{const n=Math.max(0,value-step);onChange(n);onCommit(n)}}><Minus/></button><input inputMode={decimals?'decimal':'numeric'} value={value||''} placeholder="0" onChange={e=>onChange(Number(e.target.value)||0)} onBlur={e=>onCommit(Number(e.currentTarget.value)||0)}/><button onClick={()=>{const n=value+step;onChange(n);onCommit(n)}}><Plus/></button></div></div>}
