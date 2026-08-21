import { useMemo, useState } from 'react'
import { Dumbbell, CalendarDays, Trophy, Settings, ChevronLeft, ChevronRight, Check, Flame } from 'lucide-react'

type Exercise = { name:string; sets:number; reps:string; unilateral?:boolean; type?:'strength'|'recovery'|'cardio'|'stretch'; note?:string }
type DayPlan = { title:string; subtitle:string; exercises:Exercise[] }
type LogSet = { weight:string; reps:string; done:boolean; side?:'L'|'R' }
type Logs = Record<string, Record<string, LogSet[]>>

const plans: Record<number, DayPlan> = {
  1:{title:'PUSH + ABS',subtitle:'Chest • Shoulders • Triceps • Core',exercises:[
    {name:'Lever Chest Press',sets:3,reps:'8–12'}, {name:'Lever Seated Shoulder Press',sets:3,reps:'8–12'},
    {name:'Lever Seated Fly / Pec Deck',sets:3,reps:'10–15'}, {name:'Lever Lateral Raise',sets:3,reps:'10–15'},
    {name:'Cable Triceps Pushdown',sets:3,reps:'10–15'}, {name:'Cable Overhead Triceps Extension',sets:3,reps:'10–15'},
    {name:'Cable Crunch',sets:3,reps:'10–15'}, {name:'Pallof Press',sets:3,reps:'10–12 / side',unilateral:true}
  ]},
  2:{title:'ACTIVE RECOVERY',subtitle:'Move • Mobilize • Recover',exercises:[
    {name:'Easy Walking',sets:1,reps:'20–30 min',type:'cardio'}, {name:'Chin Tucks',sets:3,reps:'8–10',type:'recovery'},
    {name:'Wall Slides',sets:3,reps:'8–10',type:'recovery'}, {name:'Doorway Chest Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch'},
    {name:'Thoracic Mobility',sets:1,reps:'2–3 min',type:'recovery'}, {name:'Optional Easy Cycling',sets:1,reps:'10–20 min',type:'cardio'}
  ]},
  3:{title:'PULL',subtitle:'Back • Rear Delts • Biceps',exercises:[
    {name:'Lat Pulldown',sets:3,reps:'8–12'}, {name:'Lever Seated Row',sets:3,reps:'8–12'},
    {name:'Lever Seated Reverse Fly',sets:3,reps:'10–15'}, {name:'Cable Straight-Arm Pulldown',sets:3,reps:'10–15'},
    {name:'Lever Preacher Curl',sets:3,reps:'10–12'}, {name:'Cable Rope Hammer Curl',sets:3,reps:'10–15'},
    {name:'Cable Biceps Curl',sets:3,reps:'10–15'}
  ]},
  4:{title:'ACTIVE RECOVERY',subtitle:'Move • Mobilize • Recover',exercises:[
    {name:'Walking',sets:1,reps:'20–30 min',type:'cardio'}, {name:'Wall Slides',sets:3,reps:'8–10',type:'recovery'},
    {name:'Chin Tucks',sets:3,reps:'8–10',type:'recovery'}, {name:'Gentle Pec Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch'},
    {name:'Gentle Lat Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch'}, {name:'Optional Easy Cycling',sets:1,reps:'10–20 min',type:'cardio'}
  ]},
  5:{title:'LEGS + ABS',subtitle:'Quads • Hamstrings • Glutes • Core',exercises:[
    {name:'Sled 45° Leg Press',sets:3,reps:'8–12'}, {name:'Lever Seated Leg Curl',sets:3,reps:'10–15'},
    {name:'Lever Leg Extension',sets:3,reps:'10–15'}, {name:'Machine Hip Thrust / Glute Drive',sets:3,reps:'8–12'},
    {name:'Romanian Deadlift',sets:3,reps:'8–10',note:'Optional while learning hip hinge'}, {name:'Lever Seated Calf Press / Calf Raise',sets:3,reps:'10–15'},
    {name:"Captain's Chair Knee Raise / Machine Knee Raise",sets:3,reps:'8–15'}, {name:'Machine Ab Crunch',sets:3,reps:'10–15'}
  ]},
  6:{title:'LIGHT CARDIO',subtitle:'Easy conditioning • Mobility',exercises:[{name:'Walking / Cycling / Elliptical',sets:1,reps:'20–45 min',type:'cardio'},{name:'Optional Mobility',sets:1,reps:'5–10 min',type:'recovery'}]},
  0:{title:'COMPLETE REST',subtitle:'Recover • Sleep • Reset',exercises:[]}
}

function keyForDate(d:Date){return d.toISOString().slice(0,10)}
function loadLogs():Logs { try { return JSON.parse(localStorage.getItem('jayfit.logs')||'{}') } catch { return {} } }

export default function App(){
  const [tab,setTab]=useState<'home'|'week'|'calendar'|'prs'|'settings'>('home')
  const [date,setDate]=useState(new Date())
  const [active,setActive]=useState<number|null>(null)
  const [logs,setLogs]=useState<Logs>(loadLogs)
  const plan=plans[date.getDay()]
  const dateKey=keyForDate(date)

  const save=(next:Logs)=>{setLogs(next);localStorage.setItem('jayfit.logs',JSON.stringify(next))}
  const rowsFor=(ex:Exercise)=> ex.unilateral ? ex.sets*2 : ex.sets
  const getSets=(ex:Exercise)=> logs[dateKey]?.[ex.name] || Array.from({length:rowsFor(ex)},(_,i)=>({weight:'',reps:'',done:false,side:ex.unilateral?(i%2===0?'R':'L'):undefined}))
  const updateSet=(ex:Exercise,idx:number,patch:Partial<LogSet>)=>{
    const sets=[...getSets(ex)]; sets[idx]={...sets[idx],...patch};
    save({...logs,[dateKey]:{...(logs[dateKey]||{}),[ex.name]:sets}})
  }
  const completed=useMemo(()=>plan.exercises.filter(e=>getSets(e).every(s=>s.done)).length,[logs,dateKey,plan])
  const pct=plan.exercises.length?Math.round(completed/plan.exercises.length*100):100

  if(active!==null && plan.exercises[active]){
    const ex=plan.exercises[active], sets=getSets(ex)
    return <main className="workout-screen">
      <header className="session-head"><button onClick={()=>setActive(null)}>×</button><div><small>{plan.title}</small><strong>{active+1} / {plan.exercises.length}</strong></div><span>{pct}%</span></header>
      <div className="exercise-hero"><div className="exercise-icon"><Dumbbell size={38}/></div><p>{ex.type?.toUpperCase()||'STRENGTH'}</p><h1>{ex.name}</h1><div className="prescription">{ex.unilateral?'3 sets each side':`${ex.sets} sets`} • {ex.reps}</div>{ex.note&&<div className="note">{ex.note}</div>}</div>
      <section className="sets-card">
        {sets.map((s,i)=><div className={`set-row ${s.done?'done':''}`} key={i}>
          <div className="set-label">{ex.unilateral?<><b>{s.side}</b><small>SET {Math.floor(i/2)+1}</small></>:<><b>{i+1}</b><small>SET</small></>}</div>
          {ex.type==='cardio'||ex.type==='recovery'||ex.type==='stretch'?<input inputMode="numeric" placeholder="reps / min" value={s.reps} onChange={e=>updateSet(ex,i,{reps:e.target.value})}/>:<><input inputMode="decimal" placeholder="lb" value={s.weight} onChange={e=>updateSet(ex,i,{weight:e.target.value})}/><input inputMode="numeric" placeholder="reps" value={s.reps} onChange={e=>updateSet(ex,i,{reps:e.target.value})}/></>}
          <button className="done-btn" onClick={()=>updateSet(ex,i,{done:!s.done})}><Check size={20}/></button>
        </div>)}
      </section>
      <footer className="session-nav"><button disabled={active===0} onClick={()=>setActive(Math.max(0,active-1))}><ChevronLeft/> Previous</button><button onClick={()=> active===plan.exercises.length-1?setActive(null):setActive(active+1)}>Next <ChevronRight/></button></footer>
    </main>
  }

  return <div className="app"><main>
    {tab==='home'&&<><header className="top"><div><small>{date.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'}).toUpperCase()}</small><h1>JayFit</h1></div><div className="avatar">JD</div></header><section className="hero-card"><div className="hero-top"><span>TODAY</span><span>{pct}%</span></div><h2>{plan.title}</h2><p>{plan.subtitle}</p><div className="progress"><i style={{width:`${pct}%`}}/></div>{plan.exercises.length>0?<button className="primary" onClick={()=>setActive(Math.min(completed,plan.exercises.length-1))}>{completed?'CONTINUE WORKOUT':'START WORKOUT'}</button>:<button className="primary muted">RECOVERY DAY</button>}</section><section className="motivation"><Flame/><div><strong>Consistency wins.</strong><p>Show up, log the work, recover, repeat.</p></div></section><h3>This week</h3><div className="week-strip">{['S','M','T','W','T','F','S'].map((x,i)=><button key={i} className={date.getDay()===i?'today':''} onClick={()=>{const d=new Date();d.setDate(d.getDate()+(i-d.getDay()));setDate(d)}}><span>{x}</span><b>{plans[i].title.split(' ')[0]}</b></button>)}</div></>}
    {tab==='week'&&<><h1 className="page-title">Weekly Plan</h1>{[1,2,3,4,5,6,0].map(i=><button className="day-card" key={i} onClick={()=>{const d=new Date();d.setDate(d.getDate()+(i-d.getDay()));setDate(d);setTab('home')}}><div><small>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}</small><strong>{plans[i].title}</strong></div><ChevronRight/></button>)}</>}
    {tab==='calendar'&&<CalendarView logs={logs} onPick={d=>{setDate(d);setTab('home')}}/>}
    {tab==='prs'&&<PRView logs={logs}/>} 
    {tab==='settings'&&<><h1 className="page-title">Settings</h1><div className="settings-card"><strong>Units</strong><p>Pounds (lb)</p></div><div className="settings-card"><strong>Cloud sync</strong><p>AWS connection will be added in the backend phase. This build saves safely on this device meanwhile.</p></div><button className="danger" onClick={()=>{if(confirm('Clear all workout logs?')){localStorage.removeItem('jayfit.logs');setLogs({})}}}>Clear local workout data</button></>}
  </main><nav className="bottom-nav"><NavButton active={tab==='home'} onClick={()=>setTab('home')} icon={<Dumbbell/>} label="Today"/><NavButton active={tab==='week'} onClick={()=>setTab('week')} icon={<CalendarDays/>} label="Week"/><NavButton active={tab==='calendar'} onClick={()=>setTab('calendar')} icon={<CalendarDays/>} label="Calendar"/><NavButton active={tab==='prs'} onClick={()=>setTab('prs')} icon={<Trophy/>} label="PRs"/><NavButton active={tab==='settings'} onClick={()=>setTab('settings')} icon={<Settings/>} label="Settings"/></nav></div>
}

function NavButton({active,onClick,icon,label}:{active:boolean,onClick:()=>void,icon:any,label:string}){return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>}

function CalendarView({logs,onPick}:{logs:Logs,onPick:(d:Date)=>void}){const [cursor,setCursor]=useState(new Date());const y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();return <><div className="calendar-head"><button onClick={()=>setCursor(new Date(y,m-1,1))}><ChevronLeft/></button><h1>{cursor.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h1><button onClick={()=>setCursor(new Date(y,m+1,1))}><ChevronRight/></button></div><div className="calendar-grid">{['S','M','T','W','T','F','S'].map((d,i)=><small key={i}>{d}</small>)}{Array.from({length:first}).map((_,i)=><span key={'e'+i}/>)}{Array.from({length:days},(_,i)=>{const d=new Date(y,m,i+1),k=keyForDate(d),has=!!logs[k];return <button key={i} className={has?'logged':''} onClick={()=>onPick(d)}><b>{i+1}</b><em>{plans[d.getDay()].title.split(' ')[0]}</em></button>})}</div></>}

function PRView({logs}:{logs:Logs}){const best:Record<string,{weight:number,reps:number,date:string}>= {};Object.entries(logs).forEach(([date,exs])=>Object.entries(exs).forEach(([name,sets])=>sets.forEach(s=>{const w=Number(s.weight),r=Number(s.reps);if(s.done&&w>0&&r>0&&(!best[name]||w>best[name].weight||(w===best[name].weight&&r>best[name].reps)))best[name]={weight:w,reps:r,date}})));const entries=Object.entries(best).sort((a,b)=>b[1].weight-a[1].weight);return <><h1 className="page-title">Personal Records</h1>{entries.length?entries.map(([n,v])=><div className="pr-card" key={n}><Trophy/><div><strong>{n}</strong><p>{v.weight} lb × {v.reps} reps • {v.date}</p></div></div>):<div className="empty">Complete workouts to build your PR board.</div>}</>}
