import { useState } from 'react';
import { ChevronRight, NotebookPen, RefreshCw, TrendingDown, TrendingUp, Trophy, X } from 'lucide-react';
import type { AppState, Exercise, MachineSetting } from '../types';
import { derivePREvents, epley, exerciseHistory, canonicalLb, sessionVolume } from '../store';
import { findExercise, weeklyPlans } from '../routine';
import { ExerciseVisual } from '../visuals';

const sorenessAreas=['Chest','Shoulders','Arms','Back','Core','Glutes','Quads','Hamstrings','Calves'];
const fmtTime=(sec:number)=>`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
const formatVolume=(v:number)=>v>=1_000_000?`${(v/1_000_000).toFixed(1)}M`:v>=1000?`${Math.round(v/1000)}k`:Math.round(v).toString();

export function MachineSheet({setting,exercise,onSave,onClose}:{setting:MachineSetting;exercise:Exercise;onSave:(s:MachineSetting)=>void;onClose:()=>void}){
  const [form,setForm]=useState(setting);
  return <Sheet title="Machine setup" onClose={onClose}>
    <div className="sheet-exercise"><div className="mini-visual"><ExerciseVisual visual={exercise.visual} name={exercise.name} size="small"/></div><div><strong>{exercise.name}</strong><p>Save the setup once; reuse it every session.</p></div></div>
    <div className="form-grid">{[['seat','Seat'],['backrest','Backrest'],['handle','Handle'],['machine','Machine #'],['pin','Pin / stack'],['preferredWeight','Preferred start']].map(([key,label])=><label key={key}>{label}<input value={(form as any)[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}</div>
    <label className="full-label">Exercise notes<textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Example: seat 4, shoulders down…"/></label>
    <button className="primary" onClick={()=>onSave(form)}>SAVE MACHINE SETUP</button>
  </Sheet>;
}

export function NotesSheet({initial,onSave,onClose}:{initial:string;onSave:(s:string)=>void;onClose:()=>void}){
  const [value,setValue]=useState(initial);
  return <Sheet title="Workout notes" onClose={onClose}><textarea className="big-textarea" value={value} onChange={e=>setValue(e.target.value)} placeholder="Energy, technique, equipment, anything worth remembering…"/><button className="primary" onClick={()=>onSave(value)}>SAVE NOTES</button></Sheet>;
}

export function SwapSheet({exercise,onSwap,onClose}:{exercise:Exercise;onSwap:(s:string)=>void;onClose:()=>void}){
  return <Sheet title="Substitute this session" onClose={onClose}><p className="sheet-copy">The standard routine stays unchanged. Only this dated session uses the replacement.</p>{(exercise.alternatives||[]).map(a=><button className="swap-option" key={a} onClick={()=>onSwap(a)}><RefreshCw/><span><strong>{a}</strong><small>Same primary movement pattern</small></span><ChevronRight/></button>)}</Sheet>;
}

export function FinishSheet({initialNotes,onFinish,onClose}:{initialNotes:string;onFinish:(score:number,areas:Record<string,number>,notes:string)=>void;onClose:()=>void}){
  const [score,setScore]=useState(0);const [areas,setAreas]=useState<Record<string,number>>({});const [notes,setNotes]=useState(initialNotes);
  return <Sheet title="Finish workout" onClose={onClose}><p className="sheet-copy">Log recovery information so future recommendations have context.</p><h3>Overall soreness</h3><div className="score-row">{[0,1,2,3].map(n=><button className={score===n?'active':''} key={n} onClick={()=>setScore(n)}><b>{n}</b><small>{['None','Mild','Moderate','High'][n]}</small></button>)}</div><h3>Muscle soreness</h3><div className="area-grid">{sorenessAreas.map(a=><button key={a} className={(areas[a]||0)>0?'active':''} onClick={()=>setAreas({...areas,[a]:((areas[a]||0)+1)%4})}>{a}<b>{areas[a]||0}</b></button>)}</div><label className="full-label">Session notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Energy, pain-free range, machine availability, anything notable…"/></label><button className="primary" onClick={()=>onFinish(score,areas,notes)}>FINISH & SAVE ONLINE</button></Sheet>;
}

export function SummarySheet({date,state,onClose,onEdit}:{date:string;state:AppState;onClose:()=>void;onEdit:()=>void}){
  const session=state.sessions[date];const volume=sessionVolume(state,date);const all=state.sets[date]||{};const rows=Object.values(all).flat();const working=rows.filter(r=>r.setType==='WORKING'&&r.done);const events=derivePREvents(state).filter(e=>e.date===date);
  const previousSame=Object.keys(state.sessions).filter(d=>d<date&&state.sessions[d].workoutType===session?.workoutType&&state.sessions[d].status==='completed').sort().reverse()[0];const previousVolume=previousSame?sessionVolume(state,previousSame):0;const delta=previousVolume?Math.round((volume-previousVolume)/previousVolume*100):0;
  return <div className="full-modal summary"><button className="modal-close" onClick={onClose}><X/></button><div className="summary-medal"><Trophy/></div><small>SESSION COMPLETE</small><h1>{weeklyPlans[new Date(`${date}T12:00:00`).getDay()].title}</h1><p>{date}</p><div className="summary-grid"><SummaryStat label="Duration" value={fmtTime(session?.durationSeconds||0)} sub="training time"/><SummaryStat label="Working sets" value={String(working.length)} sub="completed"/><SummaryStat label="Volume" value={`${formatVolume(volume)} lb`} sub="working sets"/><SummaryStat label="PR events" value={String(events.length)} sub="today"/></div>
    {previousSame&&<div className={`comparison ${delta>=0?'up':'down'}`}>{delta>=0?<TrendingUp/>:<TrendingDown/>}<strong>{delta>=0?'+':''}{delta}% volume vs previous {session.workoutType} session</strong></div>}
    {events.slice(0,3).map((e,i)=><div className="summary-pr" key={i}><Trophy/><span><strong>{e.exerciseName}</strong><small>{e.type} PR • {Math.round(e.weight)} lb × {e.reps}</small></span></div>)}
    <h3>Exercise log</h3><div className="summary-exercises">{Object.entries(all).map(([id,sets])=>{const done=sets.filter(x=>x.done);if(!done.length)return null;return <div key={id}><strong>{done[0].exerciseName}</strong><span>{done.map(x=>`${x.side?`${x.side} `:''}${x.weight?`${x.weight}${x.weightUnit}×`:''}${x.reps||'✓'}`).join(' • ')}</span></div>})}</div>
    {session?.notes&&<div className="summary-note"><NotebookPen/><span>{session.notes}</span></div>}
    <div className="summary-quote">Consistency wins when the next session is recoverable.</div><div className="summary-actions"><button onClick={onEdit}>EDIT WORKOUT</button><button className="primary" onClick={onClose}>DONE</button></div>
  </div>;
}

function SummaryStat({label,value,sub}:{label:string;value:string;sub:string}){return <div className="stat"><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>}

export function HistorySheet({exerciseId,state,onClose}:{exerciseId:string;state:AppState;onClose:()=>void}){
  const history=exerciseHistory(state,exerciseId);const ex=findExercise(exerciseId);const points=history.map(h=>Math.max(0,...h.sets.map(s=>epley(canonicalLb(Number(s.weight),s.weightUnit),Number(s.reps)))));const max=Math.max(1,...points);
  return <Sheet title="Exercise history" onClose={onClose}><div className="history-head"><div className="mini-visual"><ExerciseVisual visual={ex?.visual||'cardio'} name={ex?.name||exerciseId}/></div><div><strong>{ex?.name||history[0]?.sets[0]?.exerciseName||exerciseId}</strong><p>{history.length} logged sessions</p></div></div>{points.length>1&&<svg className="sparkline" viewBox="0 0 300 100" preserveAspectRatio="none"><polyline fill="none" stroke="currentColor" strokeWidth="4" points={points.map((p,i)=>`${i*(300/(points.length-1))},${92-p/max*80}`).join(' ')}/></svg>}<div className="history-list">{history.slice().reverse().map(h=><div key={h.date}><small>{h.date}</small><strong>{h.sets.map(s=>`${s.weight}${s.weightUnit}×${s.reps}${s.side?` ${s.side}`:''}`).join(' • ')}</strong></div>)}</div></Sheet>;
}

function Sheet({title,onClose,children}:{title:string;onClose:()=>void;children:any}){return <div className="sheet-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="sheet"><header><strong>{title}</strong><button onClick={onClose}><X/></button></header>{children}</section></div>}
