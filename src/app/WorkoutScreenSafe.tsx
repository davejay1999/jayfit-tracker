import { Check, ChevronLeft, ChevronRight, CircleMinus, CirclePlus, Cloud, CloudOff, Dumbbell, Minus, NotebookPen, Pause, Play, Plus, RefreshCw, SlidersHorizontal, Timer, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { Exercise, MachineSetting, Phase, SetEntry } from '../types';
import { canonicalLb } from '../store';
import { ExerciseVisual } from '../visuals';

export type SafeFlowItem={exercise:Exercise;phase:Phase;originalId:string};
export type SessionViewMode='preview'|'active'|'paused'|'history-edit'|'completed-preview';

const weightedWarmups=new Set(['external-rotation','scapular-pulldown','band-pull-apart-facepull','light-seated-row','chest-press-warmup','lat-pulldown-warmup','leg-press-warmup']);
const fmtTime=(sec:number)=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

export default function WorkoutScreenSafe({
  item,rows,activeSet,elapsed,restSeconds,restRunning,previous,suggestion,cloudState,machine,
  onClose,onPrev,onNext,onPickSet,onSet,onComplete,onRest,onMachine,onNotes,onSwap,onReduced,onAddSet,onRemoveSet,
  onStartTimer,onPauseTimer,onResumeTimer,beginner,position,phase,mode,dateRelation,hasStarted
}:{
  item:SafeFlowItem;rows:SetEntry[];activeSet:number;elapsed:number;restSeconds:number;restRunning:boolean;previous:SetEntry[];suggestion:any;cloudState:string;machine?:MachineSetting;
  onClose:()=>void;onPrev:()=>void;onNext:()=>void;onPickSet:(i:number)=>void;onSet:(p:Partial<SetEntry>,persist?:boolean)=>void;onComplete:()=>void;onRest:(s:number)=>void;onMachine:()=>void;onNotes:()=>void;onSwap:()=>void;onReduced:()=>void;onAddSet:()=>void;onRemoveSet:()=>void;
  onStartTimer:()=>void;onPauseTimer:()=>void;onResumeTimer:()=>void;beginner:boolean;position:string;phase:Phase;mode:SessionViewMode;dateRelation:'past'|'today'|'future';hasStarted:boolean;
}){
  const ex=item.exercise,set=rows[activeSet];
  const weighted=set.setType==='WORKING'||weightedWarmups.has(ex.id);
  const timed=!!ex.timedMinutes||ex.type==='stretch';
  const unit=set.weightUnit,weightStep=unit==='kg'?2.5:5,prior=previous[activeSet]||previous[previous.length-1];
  const weight=Number(set.weight)||0,reps=Number(set.reps)||0;
  const working=rows.filter(r=>r.setType==='WORKING'&&r.done);
  const totalVol=working.reduce((sum,r)=>sum+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const leftVol=working.filter(r=>r.side==='L').reduce((sum,r)=>sum+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const rightVol=working.filter(r=>r.side==='R').reduce((sum,r)=>sum+canonicalLb(Number(r.weight),r.weightUnit)*Number(r.reps||0),0);
  const baseCount=ex.unilateral?ex.sets*2:ex.sets;
  const canModify=mode==='active'||mode==='paused'||mode==='history-edit';
  const timerOff=mode==='preview'||mode==='history-edit'||mode==='completed-preview';
  const timerCaption=mode==='history-edit'?'EDIT HISTORY • TIMER OFF':dateRelation==='past'?'PAST WORKOUT • PREVIEW':dateRelation==='future'?'FUTURE WORKOUT • PREVIEW':mode==='completed-preview'?'COMPLETED • TIMER OFF':mode==='active'?'WORKOUT TIMER RUNNING':mode==='paused'?'WORKOUT TIMER PAUSED':'PREVIEW • TIMER OFF';

  return <main className={`workout-screen ${canModify?'logging-mode':'preview-mode'}`}>
    <header className="session-head timer-safe-head">
      <button aria-label="Close workout" onClick={onClose}><X/></button>
      <div className="session-clock"><small>{phase.toUpperCase()} • {position}</small><strong>{fmtTime(elapsed)}</strong><span>{timerCaption}</span></div>
      <span className={cloudState}>{cloudState==='synced'?<Cloud/>:<CloudOff/>}</span>
    </header>

    {dateRelation==='today'&&mode!=='history-edit'&&mode!=='completed-preview'&&<div className={`session-timer-control ${mode}`}>
      <div><Timer/><span><small>SESSION TIMER</small><strong>{timerOff?'Timer is not running':mode==='paused'?'Paused':'Running'}</strong></span></div>
      {mode==='active'?<button onClick={onPauseTimer}><Pause/>PAUSE</button>:mode==='paused'?<button onClick={onResumeTimer}><Play/>RESUME</button>:<button onClick={onStartTimer}><Play/>{hasStarted?'RESUME WORKOUT':'START WORKOUT'}</button>}
    </div>}

    {dateRelation!=='today'&&<div className="preview-banner"><strong>{dateRelation==='past'?'Past workout preview':'Future workout preview'}</strong><span>Looking does not start a timer, create a workout, or modify any set.</span></div>}
    {mode==='completed-preview'&&dateRelation==='today'&&<div className="preview-banner"><strong>Completed workout preview</strong><span>Your saved workout is read-only here. Use Edit Workout from the summary if you intentionally want to change history.</span></div>}
    {mode==='preview'&&dateRelation==='today'&&<div className="preview-banner"><strong>Preview mode</strong><span>Review form and settings freely. Press Start Workout only when you are actually beginning the session.</span></div>}
    {mode==='history-edit'&&<div className="preview-banner history-edit"><strong>Editing saved history</strong><span>The workout timer stays off. Only your explicit set changes are saved.</span></div>}

    <div className="exercise-visual-large"><ExerciseVisual visual={ex.visual} name={ex.name}/></div>
    <section className="exercise-title"><div className="type-line"><span>{ex.type.toUpperCase()}</span><span>{ex.unilateral?'3 SETS EACH SIDE':`${ex.sets} SETS`} • {ex.reps}</span></div><h1>{ex.name}</h1><p>{[...ex.primary,...(ex.secondary||[])].join(' • ')}</p>{ex.note&&<div className="note">{ex.note}</div>}</section>
    <div className={`suggestion ${suggestion.tone}`}>{suggestion.tone==='up'?<TrendingUp/>:suggestion.tone==='down'?<TrendingDown/>:<Dumbbell/>}<div><strong>{suggestion.label}</strong><span>{suggestion.detail}</span></div></div>
    <div className="set-pills">{rows.map((r,i)=><button key={i} className={`${i===activeSet?'active':''} ${r.done?'done':''}`} onClick={()=>onPickSet(i)}>{r.side?`${r.side}${r.setNumber}`:r.setNumber}{r.done&&<Check/>}</button>)}</div>

    <section className={`active-set-card ${canModify?'':'readonly-set-card'}`}>
      <div className="active-set-head"><div><small>{set.side?`${set.side==='R'?'RIGHT':'LEFT'} • `:''}SET {set.setNumber}</small><strong>{prior?.done?`Last: ${prior.weight||'—'} ${prior.weightUnit} × ${prior.reps||'—'}`:'Build your baseline'}</strong></div>{machine&&<span className="machine-chip passive">Machine saved</span>}</div>
      {weighted?<div className="controls-grid"><NumberControl disabled={!canModify} label={`WEIGHT (${unit})`} value={weight} step={weightStep} decimals onChange={v=>onSet({weight:String(Math.max(0,v))},false)} onCommit={v=>onSet({weight:String(v)})}/><NumberControl disabled={!canModify} label="REPS" value={reps} step={1} onChange={v=>onSet({reps:String(Math.max(0,v))},false)} onCommit={v=>onSet({reps:String(v)})}/></div>:<NumberControl disabled={!canModify} label={timed?(ex.type==='stretch'?'SECONDS / HOLD':'MINUTES / DURATION'):'REPS'} value={reps} step={1} onChange={v=>onSet({reps:String(Math.max(0,v))},false)} onCommit={v=>onSet({reps:String(v)})}/>} 
      <textarea disabled={!canModify} className="set-note" placeholder={canModify?'Optional set note…':'Preview only — notes are locked'} value={set.notes||''} onChange={e=>onSet({notes:e.target.value},false)} onBlur={e=>onSet({notes:e.target.value})}/>
      {canModify?<button className={`complete-set ${set.done?'undo':''}`} onClick={onComplete}>{set.done?'UNDO SET':'COMPLETE SET'}<Check/></button>:<div className="readonly-action"><Check/><span><strong>PREVIEW ONLY</strong><small>{dateRelation==='today'?'Start the workout to enable logging.':'No workout data will be changed.'}</small></span></div>}
    </section>

    {set.setType==='WORKING'&&<div className="volume-strip"><span><small>EXERCISE VOLUME</small><b>{Math.round(totalVol).toLocaleString()} lb</b></span>{ex.unilateral&&<><span><small>LEFT</small><b>{Math.round(leftVol).toLocaleString()}</b></span><span><small>RIGHT</small><b>{Math.round(rightVol).toLocaleString()}</b></span></>}</div>}
    {canModify&&restSeconds>0&&<section className="rest-bar"><Timer/><div><small>REST TIMER</small><strong>{fmtTime(restSeconds)}</strong></div><div className="rest-actions"><button onClick={()=>onRest(60)}>60</button><button onClick={()=>onRest(90)}>90</button><button onClick={()=>onRest(120)}>120</button><button onClick={()=>onRest(0)}>{restRunning?'Skip':'Clear'}</button></div></section>}
    {canModify&&<div className="workout-tools"><button onClick={onMachine}><SlidersHorizontal/>Machine</button><button onClick={onNotes}><NotebookPen/>Notes</button>{(ex.alternatives||[]).length>0&&<button onClick={onSwap}><RefreshCw/>Swap</button>}{beginner&&set.setType==='WORKING'&&<button onClick={onReduced}>2-set day</button>}<button onClick={onAddSet}><CirclePlus/>Set</button>{rows.length>baseCount&&<button onClick={onRemoveSet}><CircleMinus/>Set</button>}</div>}
    <footer className="session-nav"><button onClick={onPrev}><ChevronLeft/>Previous</button><button onClick={onNext}>Next<ChevronRight/></button></footer>
  </main>;
}

function NumberControl({label,value,step,onChange,onCommit,decimals=false,disabled=false}:{label:string;value:number;step:number;onChange:(n:number)=>void;onCommit:(n:number)=>void;decimals?:boolean;disabled?:boolean}){
  return <div className={`number-control ${disabled?'disabled':''}`}><small>{label}</small><div><button disabled={disabled} onClick={()=>{const n=Math.max(0,value-step);onChange(n);onCommit(n)}}><Minus/></button><input disabled={disabled} inputMode={decimals?'decimal':'numeric'} value={value||''} placeholder="0" onChange={e=>onChange(Number(e.target.value)||0)} onBlur={e=>onCommit(Number(e.currentTarget.value)||0)}/><button disabled={disabled} onClick={()=>{const n=value+step;onChange(n);onCommit(n)}}><Plus/></button></div></div>
}
