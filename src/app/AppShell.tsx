import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CloudOff, Dumbbell, RefreshCw, Settings, Trophy, X } from 'lucide-react';
import type { AppState, Exercise, MachineSetting, Phase, SessionEntry, SetEntry } from '../types';
import { applyRoutineOverrides, findExercise, weeklyPlans } from '../routine';
import {
  canonicalLb, convertWeight, createSetRows, DEFAULT_SETTINGS, derivePRs, epley, loadState,
  localDateKey, parseLocalDate, previousExerciseSets, progressionSuggestion, saveState,
  sessionVolume, slug
} from '../store';
import {
  deleteCloudData, deleteSetLog, loadCloudState, saveMachineSetting, saveProfile,
  saveSession, saveSet, uploadLocalState
} from '../cloud';
import WorkoutScreen, { type FlowItem } from './WorkoutScreen';
import { CalendarPage, HomePage, PRPage, SettingsPage, WeekPage } from './Pages';
import { FinishSheet, HistorySheet, MachineSheet, NotesSheet, SummarySheet, SwapSheet } from './Sheets';

type Tab='home'|'week'|'calendar'|'prs'|'settings';
type Props={user:any;logout:()=>Promise<void>};

export default function AppShell({logout}:Props){
  const [state,setState]=useState<AppState>(loadState);
  const stateRef=useRef(state);stateRef.current=state;
  const [tab,setTab]=useState<Tab>('home');
  const [dateKey,setDateKey]=useState(localDateKey());
  const [active,setActive]=useState<{index:number;setIndex:number}|null>(null);
  const [cloudState,setCloudState]=useState<'syncing'|'synced'|'offline'>('syncing');
  const [cloudMessage,setCloudMessage]=useState('Connecting to your training history…');
  const [restSeconds,setRestSeconds]=useState(0);
  const [restRunning,setRestRunning]=useState(false);
  const [tick,setTick]=useState(0);
  const [celebration,setCelebration]=useState('');
  const [machineOpen,setMachineOpen]=useState(false);
  const [notesOpen,setNotesOpen]=useState(false);
  const [swapOpen,setSwapOpen]=useState(false);
  const [finishOpen,setFinishOpen]=useState(false);
  const [summaryDate,setSummaryDate]=useState('');
  const [calendarCursor,setCalendarCursor]=useState(parseLocalDate(dateKey));
  const [prExercise,setPrExercise]=useState('all');
  const [prMonth,setPrMonth]=useState('all');
  const [historyExercise,setHistoryExercise]=useState('');
  const [settingsSection,setSettingsSection]=useState<'general'|'routine'|'data'>('general');
  const fileInput=useRef<HTMLInputElement>(null);

  const updateState=(fn:(prev:AppState)=>AppState)=>{
    setState(prev=>{const next=fn(prev);stateRef.current=next;saveState(next);return next;});
  };

  const syncFromCloud=async()=>{
    setCloudState('syncing');setCloudMessage('Syncing with AWS…');
    try{
      const cloud=await loadCloudState();
      const local=stateRef.current;
      const mergedSets={...local.sets};
      Object.entries(cloud.sets||{}).forEach(([d,exs])=>{mergedSets[d]={...(mergedSets[d]||{}),...exs};});
      const merged:AppState={
        ...local,
        sessions:{...local.sessions,...(cloud.sessions||{})},
        sets:mergedSets,
        machineSettings:{...local.machineSettings,...(cloud.machineSettings||{})},
        settings:cloud.profileCloudId?{...local.settings,...(cloud.settings||{})}:local.settings,
        profileCloudId:cloud.profileCloudId||local.profileCloudId,
        lastSyncAt:new Date().toISOString(),
      };
      updateState(()=>merged);
      await uploadLocalState(merged,
        (date,id)=>updateState(p=>({...p,sessions:{...p.sessions,[date]:{...p.sessions[date],cloudId:id}}})),
        (date,exerciseId,index,id)=>updateState(p=>{const rows=[...(p.sets[date]?.[exerciseId]||[])];if(rows[index])rows[index]={...rows[index],cloudId:id};return {...p,sets:{...p.sets,[date]:{...(p.sets[date]||{}),[exerciseId]:rows}}};})
      );
      const profileId=await saveProfile(merged.profileCloudId,merged.settings);
      if(profileId)updateState(p=>({...p,profileCloudId:profileId,lastSyncAt:new Date().toISOString()}));
      setCloudState('synced');setCloudMessage('All changes saved online');
    }catch(error){console.error(error);setCloudState('offline');setCloudMessage('Offline cache active — changes remain on this device until sync returns');}
  };

  useEffect(()=>{void syncFromCloud()},[]);
  useEffect(()=>{const id=setInterval(()=>setTick(v=>v+1),1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{
    if(!restRunning||restSeconds<=0)return;
    const id=setInterval(()=>setRestSeconds(s=>{if(s<=1){setRestRunning(false);return 0}return s-1}),1000);
    return()=>clearInterval(id);
  },[restRunning,restSeconds>0]);

  const date=parseLocalDate(dateKey);
  const basePlan=weeklyPlans[date.getDay()];
  const plan=useMemo(()=>applyRoutineOverrides(basePlan,state.settings.routineOverrides),[basePlan,state.settings.routineOverrides]);
  const session=state.sessions[dateKey];
  const isFuture=date>parseLocalDate(localDateKey());

  const resolvedExercise=(exercise:Exercise):Exercise=>{
    const replacement=session?.substitutions?.[exercise.id];
    return replacement?{...exercise,id:`sub-${slug(replacement)}`,name:replacement,note:`Substituted for ${exercise.name} this session.`}:exercise;
  };

  const flow=useMemo(()=>{
    const result:FlowItem[]=[];
    const append=(items:Exercise[],phase:Phase)=>items.forEach(original=>{
      if(plan.kind==='cardio'&&original.type==='cardio'){
        if(!session?.selectedCardio||original.id!==session.selectedCardio)return;
      }
      result.push({exercise:resolvedExercise(original),phase,originalId:original.id});
    });
    append(plan.warmup,'warmup');append(plan.main,'main');append(plan.cooldown,'cooldown');
    return result;
  },[plan,session?.selectedCardio,JSON.stringify(session?.substitutions||{})]);

  const seedRows=(item:FlowItem):SetEntry[]=>{
    const rows=createSetRows(item.exercise,item.phase,stateRef.current.settings.weightUnit);
    if(item.phase==='main'&&(item.exercise.type==='strength'||item.exercise.type==='core')){
      const previous=previousExerciseSets(stateRef.current,dateKey,item.exercise.id);
      rows.forEach(row=>{
        const prior=previous.find(p=>p.setNumber===row.setNumber&&(p.side||'')===(row.side||''))||previous.find(p=>(p.side||'')===(row.side||''));
        if(prior?.weight){const converted=convertWeight(Number(prior.weight),prior.weightUnit,stateRef.current.settings.weightUnit);row.weight=String(Math.round(converted*10)/10);}
      });
      const machine=stateRef.current.machineSettings[item.exercise.id];
      if(!previous.length&&machine?.preferredWeight)rows.forEach(row=>row.weight=machine.preferredWeight||'');
    }
    return rows;
  };

  const ensureRows=(item:FlowItem):SetEntry[]=>{
    const existing=stateRef.current.sets[dateKey]?.[item.exercise.id];
    if(existing?.length)return existing;
    const rows=seedRows(item);
    updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}}));
    return rows;
  };

  const ensureSession=async(start=false):Promise<SessionEntry>=>{
    let current=stateRef.current.sessions[dateKey];
    if(!current){
      current={date:dateKey,workoutType:plan.kind,status:start?'in_progress':'not_started',startedAt:start?new Date().toISOString():undefined,planSnapshot:JSON.stringify(plan),substitutions:{}};
      updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:current!}}));
    }else if(start&&!current.startedAt){
      current={...current,status:'in_progress',startedAt:new Date().toISOString(),planSnapshot:current.planSnapshot||JSON.stringify(plan)};
      updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:current!}}));
    }
    try{
      const id=await saveSession(current,sessionVolume(stateRef.current,dateKey));
      if(id&&!current.cloudId){current={...current,cloudId:id};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:current!}}));}
      setCloudState('synced');
    }catch(error){console.error(error);setCloudState('offline');}
    return current;
  };

  const persistSet=async(item:FlowItem,index:number,row:SetEntry)=>{
    try{
      const currentSession=await ensureSession(true);if(!currentSession.cloudId)return;
      const id=await saveSet(currentSession.cloudId,row);
      if(id&&!row.cloudId)updateState(p=>{const rows=[...(p.sets[dateKey]?.[item.exercise.id]||[])];if(rows[index])rows[index]={...rows[index],cloudId:id};return {...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}};});
      setCloudState('synced');
    }catch(error){console.error(error);setCloudState('offline');}
  };

  const setRow=(item:FlowItem,index:number,patch:Partial<SetEntry>,persist=true)=>{
    let changed:SetEntry|undefined;
    updateState(p=>{
      const rows=[...(p.sets[dateKey]?.[item.exercise.id]||seedRows(item))];
      rows[index]={...rows[index],...patch};changed=rows[index];
      return {...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}};
    });
    if(persist&&changed)void persistSet(item,index,changed);
  };

  const requiredFlow=flow.filter(item=>!item.exercise.optional||(plan.kind==='cardio'&&item.exercise.id===session?.selectedCardio));
  const completion=useMemo(()=>{
    let total=0,done=0;
    requiredFlow.forEach(item=>{
      total+=item.exercise.unilateral?item.exercise.sets*2:item.exercise.sets;
      done+=(state.sets[dateKey]?.[item.exercise.id]||[]).filter(row=>row.done).length;
    });
    return {total,done,percent:total?Math.min(100,Math.round(done/total*100)):0};
  },[state,dateKey,requiredFlow.map(item=>item.exercise.id).join('|')]);

  const firstIncomplete=()=>{
    for(let i=0;i<flow.length;i++){
      const rows=stateRef.current.sets[dateKey]?.[flow[i].exercise.id]||seedRows(flow[i]);
      const setIndex=rows.findIndex(row=>!row.done);if(setIndex>=0)return{index:i,setIndex};
    }
    return {index:Math.max(0,flow.length-1),setIndex:0};
  };

  const startWorkout=async()=>{
    if(isFuture)return;
    if(plan.kind==='rest'){await ensureSession(true);setFinishOpen(true);return;}
    if(plan.kind==='cardio'&&!stateRef.current.sessions[dateKey]?.selectedCardio)return;
    await ensureSession(true);
    const next=firstIncomplete();if(flow[next.index])ensureRows(flow[next.index]);setActive(next);
  };

  const openExercise=async(exerciseId:string)=>{
    if(isFuture)return;
    await ensureSession(true);
    const index=flow.findIndex(item=>item.exercise.id===exerciseId||item.originalId===exerciseId);if(index<0)return;
    const rows=ensureRows(flow[index]);const incomplete=rows.findIndex(row=>!row.done);setActive({index,setIndex:incomplete>=0?incomplete:0});
  };

  const selectCardio=async(exerciseId:string)=>{
    const current=await ensureSession(false);const next={...current,selectedCardio:exerciseId};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));
    try{const id=await saveSession(next,0);if(id&&!next.cloudId)updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:{...next,cloudId:id}}}));}catch{setCloudState('offline');}
  };

  const current=active?flow[active.index]:undefined;
  const currentRows=current?(state.sets[dateKey]?.[current.exercise.id]||seedRows(current)):[];
  const currentSet=currentRows[active?.setIndex||0];

  const completeCurrentSet=()=>{
    if(!current||!currentSet||active===null)return;
    const before=derivePRs(stateRef.current)[current.exercise.id];
    const completed={...currentSet,done:!currentSet.done,loggedAt:new Date().toISOString()};
    setRow(current,active.setIndex,completed);
    if(!currentSet.done&&currentSet.setType==='WORKING'){
      const weight=canonicalLb(Number(completed.weight),completed.weightUnit),reps=Number(completed.reps),oneRM=epley(weight,reps);
      if(weight>0&&reps>0&&(!before?.weight||weight>before.weight.weight||oneRM>(before.oneRM?.oneRM||0)))setCelebration(`New PR • ${completed.exerciseName} • ${completed.weight} ${completed.weightUnit} × ${completed.reps}`);
      if(state.settings.autoRestTimer){setRestSeconds(state.settings.defaultRestSeconds);setRestRunning(true);}
    }
    if(!currentSet.done){
      const nextSet=currentRows.findIndex((row,i)=>i>active.setIndex&&!row.done);
      if(nextSet>=0)setActive({...active,setIndex:nextSet});
      else if(active.index<flow.length-1){const index=active.index+1;ensureRows(flow[index]);setActive({index,setIndex:0});}
      else setFinishOpen(true);
    }
  };

  const addExtraSet=()=>{
    if(!current||active===null)return;
    const rows=[...(stateRef.current.sets[dateKey]?.[current.exercise.id]||ensureRows(current))];
    const setNumber=Math.max(0,...rows.map(row=>row.setNumber))+1;
    const setType:SetEntry['setType']=current.phase==='warmup'?'WARMUP':current.phase==='cooldown'?'COOLDOWN':(current.exercise.type==='strength'||current.exercise.type==='core'?'WORKING':'RECOVERY');
    const base:SetEntry={exerciseId:current.exercise.id,exerciseName:current.exercise.name,phase:current.phase,setNumber,weight:'',reps:'',done:false,setType,weightUnit:state.settings.weightUnit};
    const additions:SetEntry[]=current.exercise.unilateral?[{...base,side:'R'},{...base,side:'L'}]:[base];
    updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[current.exercise.id]:[...rows,...additions]}}}));
    setActive({...active,setIndex:rows.length});
  };

  const removeExtraSet=()=>{
    if(!current||active===null)return;
    const rows=[...(stateRef.current.sets[dateKey]?.[current.exercise.id]||[])];const baseCount=current.exercise.unilateral?current.exercise.sets*2:current.exercise.sets;if(rows.length<=baseCount)return;
    const max=Math.max(...rows.map(row=>row.setNumber));const removed=rows.filter(row=>row.setNumber===max);const kept=rows.filter(row=>row.setNumber!==max);
    removed.forEach(row=>{if(row.cloudId)void deleteSetLog(row.cloudId).catch(()=>setCloudState('offline'));});
    updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[current.exercise.id]:kept}}}));
    setActive({...active,setIndex:Math.max(0,kept.length-1)});
  };

  const reducedVolume=()=>{
    if(!current||active===null)return;
    const rows=stateRef.current.sets[dateKey]?.[current.exercise.id]||ensureRows(current);
    rows.forEach((row,index)=>{if(row.setNumber===3&&!row.done)setRow(current,index,{done:true,notes:'Reduced-volume skip',loggedAt:new Date().toISOString()});});
    const next=rows.findIndex(row=>!row.done&&row.setNumber<3);setActive({...active,setIndex:next>=0?next:Math.max(0,rows.length-1)});
  };

  const finishWorkout=async(score:number,areas:Record<string,number>,notes:string)=>{
    const currentSession=await ensureSession(true);const started=currentSession.startedAt?new Date(currentSession.startedAt).getTime():Date.now();
    const completed:SessionEntry={...currentSession,status:'completed',completedAt:new Date().toISOString(),durationSeconds:Math.max(0,Math.round((Date.now()-started)/1000)),sorenessScore:score,sorenessAreas:areas,notes:notes||currentSession.notes};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:completed}}));
    try{const id=await saveSession(completed,sessionVolume(stateRef.current,dateKey));if(id&&!completed.cloudId)updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:{...completed,cloudId:id}}}));}catch{setCloudState('offline');}
    setFinishOpen(false);setActive(null);setSummaryDate(dateKey);setRestSeconds(0);setRestRunning(false);
  };

  const editCompleted=()=>{
    const currentSession=stateRef.current.sessions[dateKey];if(!currentSession)return;
    const edited={...currentSession,status:'partial' as const,completedAt:undefined};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:edited}}));void saveSession(edited,sessionVolume(stateRef.current,dateKey));setSummaryDate('');
    const next=firstIncomplete();if(flow[next.index])ensureRows(flow[next.index]);setActive(next);
  };

  const saveSessionNotes=(notes:string)=>{
    const currentSession=stateRef.current.sessions[dateKey]||{date:dateKey,workoutType:plan.kind,status:'not_started' as const};const next={...currentSession,notes};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));void saveSession(next,sessionVolume(stateRef.current,dateKey));setNotesOpen(false);
  };

  const saveMachine=(setting:MachineSetting)=>{
    updateState(p=>({...p,machineSettings:{...p.machineSettings,[setting.exerciseId]:setting}}));
    void saveMachineSetting(setting,state.settings.weightUnit).then(id=>{if(id)updateState(p=>({...p,machineSettings:{...p.machineSettings,[setting.exerciseId]:{...p.machineSettings[setting.exerciseId],cloudId:id}}}));}).catch(()=>setCloudState('offline'));
    setMachineOpen(false);
  };

  const swapExercise=(replacement:string)=>{
    if(!current)return;
    const existing=stateRef.current.sets[dateKey]?.[current.exercise.id]||[];
    if(existing.some(row=>row.done)&&!confirm('This exercise already has completed sets. Replace it anyway? Completed history will remain saved.'))return;
    const currentSession=stateRef.current.sessions[dateKey]||{date:dateKey,workoutType:plan.kind,status:'not_started' as const,substitutions:{}};
    const next={...currentSession,substitutions:{...(currentSession.substitutions||{}),[current.originalId]:replacement}};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));void saveSession(next,sessionVolume(stateRef.current,dateKey));setSwapOpen(false);setActive(active?{...active,setIndex:0}:active);
  };

  const updateSettings=(patch:Partial<AppState['settings']>)=>{
    const next={...state.settings,...patch};updateState(p=>({...p,settings:next}));
    void saveProfile(stateRef.current.profileCloudId,next).then(id=>{if(id)updateState(p=>({...p,profileCloudId:id}));}).catch(()=>setCloudState('offline'));
  };

  const exportData=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`jayfit-backup-${localDateKey()}.json`;link.click();URL.revokeObjectURL(url);};
  const importData=(file:File)=>{const reader=new FileReader();reader.onload=async()=>{try{const parsed=JSON.parse(String(reader.result));if(!parsed.sessions||!parsed.sets||!parsed.settings)throw new Error('Invalid backup');const next={...parsed,settings:{...DEFAULT_SETTINGS,...parsed.settings}} as AppState;updateState(()=>next);await uploadLocalState(next);await syncFromCloud();alert('Backup imported and synchronized.');}catch{alert('This is not a valid JayFit backup. No data was changed.');}};reader.readAsText(file);};
  const clearAll=async()=>{if(!confirm('Delete ALL JayFit workout history, settings and cloud records? This cannot be undone.'))return;try{await deleteCloudData();localStorage.removeItem('jayfit.state.v2');localStorage.removeItem('jayfit.logs');updateState(()=>({sessions:{},sets:{},machineSettings:{},settings:DEFAULT_SETTINGS}));setCloudState('synced');}catch{alert('Cloud deletion failed. Nothing else was changed.');}};

  if(active!==null&&current&&currentSet){
    const previous=previousExerciseSets(state,dateKey,current.exercise.id,currentSet.side);const suggestion=progressionSuggestion(state,dateKey,current.exercise);const elapsed=session?.startedAt?Math.max(0,Math.floor((Date.now()-new Date(session.startedAt).getTime())/1000)):0;void tick;
    return <WorkoutScreen item={current} rows={currentRows} activeSet={active.setIndex} elapsed={elapsed} restSeconds={restSeconds} restRunning={restRunning} previous={previous} suggestion={suggestion} cloudState={cloudState} machine={state.machineSettings[current.exercise.id]}
      onClose={()=>setActive(null)} onPrev={()=>{if(active.index>0){const index=active.index-1;ensureRows(flow[index]);setActive({index,setIndex:0});}}} onNext={()=>{if(active.index<flow.length-1){const index=active.index+1;ensureRows(flow[index]);setActive({index,setIndex:0});}else setFinishOpen(true);}} onPickSet={setIndex=>setActive({...active,setIndex})}
      onSet={(patch,persist=true)=>setRow(current,active.setIndex,patch,persist)} onComplete={completeCurrentSet} onRest={seconds=>{setRestSeconds(seconds);setRestRunning(seconds>0);}} onMachine={()=>setMachineOpen(true)} onNotes={()=>setNotesOpen(true)} onSwap={()=>setSwapOpen(true)} onReduced={reducedVolume} onAddSet={addExtraSet} onRemoveSet={removeExtraSet} beginner={state.settings.beginnerMode} position={`${active.index+1} / ${flow.length}`} phase={current.phase}/>;
  }

  return <div className="app-shell"><main className="page-shell">
    {cloudState!=='synced'&&<div className={`sync-banner ${cloudState}`}>{cloudState==='offline'?<CloudOff/>:<RefreshCw className="spin"/>}<span>{cloudMessage}</span><button onClick={()=>void syncFromCloud()}>Retry</button></div>}
    {tab==='home'&&<HomePage dateKey={dateKey} state={state} plan={plan} flow={flow} completion={completion} isFuture={isFuture} onStart={startWorkout} onDate={key=>{setDateKey(key);setCalendarCursor(parseLocalDate(key));}} onCardio={selectCardio} onSummary={()=>setSummaryDate(dateKey)} onExercise={openExercise}/>} 
    {tab==='week'&&<WeekPage state={state} selected={dateKey} onPick={key=>{setDateKey(key);setTab('home');}}/>}
    {tab==='calendar'&&<CalendarPage state={state} cursor={calendarCursor} setCursor={setCalendarCursor} onPick={key=>{setDateKey(key);setTab('home');}}/>}
    {tab==='prs'&&<PRPage state={state} exerciseFilter={prExercise} setExerciseFilter={setPrExercise} monthFilter={prMonth} setMonthFilter={setPrMonth} onHistory={setHistoryExercise}/>} 
    {tab==='settings'&&<SettingsPage state={state} section={settingsSection} setSection={setSettingsSection} onSettings={updateSettings} onExport={exportData} onImport={()=>fileInput.current?.click()} onClear={clearAll} onLogout={logout} cloudState={cloudState}/>} 
    <input ref={fileInput} hidden type="file" accept="application/json" onChange={event=>event.target.files?.[0]&&importData(event.target.files[0])}/>
  </main>
  <nav className="bottom-nav"><Nav active={tab==='home'} icon={<Dumbbell/>} label="Today" onClick={()=>setTab('home')}/><Nav active={tab==='week'} icon={<CalendarDays/>} label="Week" onClick={()=>setTab('week')}/><Nav active={tab==='calendar'} icon={<CalendarDays/>} label="Calendar" onClick={()=>setTab('calendar')}/><Nav active={tab==='prs'} icon={<Trophy/>} label="PRs" onClick={()=>setTab('prs')}/><Nav active={tab==='settings'} icon={<Settings/>} label="Settings" onClick={()=>setTab('settings')}/></nav>
  {celebration&&<div className="toast-pr" onClick={()=>setCelebration('')}><Trophy/><div><small>PERSONAL RECORD</small><strong>{celebration.replace('New PR • ','')}</strong></div><X/></div>}
  {machineOpen&&current&&<MachineSheet setting={state.machineSettings[current.exercise.id]||{exerciseId:current.exercise.id}} exercise={current.exercise} onSave={saveMachine} onClose={()=>setMachineOpen(false)}/>} 
  {notesOpen&&<NotesSheet initial={state.sessions[dateKey]?.notes||''} onSave={saveSessionNotes} onClose={()=>setNotesOpen(false)}/>} 
  {swapOpen&&current&&<SwapSheet exercise={findExercise(current.originalId)||current.exercise} onSwap={swapExercise} onClose={()=>setSwapOpen(false)}/>} 
  {finishOpen&&<FinishSheet initialNotes={state.sessions[dateKey]?.notes||''} onFinish={finishWorkout} onClose={()=>setFinishOpen(false)}/>} 
  {summaryDate&&<SummarySheet date={summaryDate} state={state} onClose={()=>setSummaryDate('')} onEdit={editCompleted}/>} 
  {historyExercise&&<HistorySheet exerciseId={historyExercise} state={state} onClose={()=>setHistoryExercise('')}/>} 
  </div>;
}

function Nav({active,icon,label,onClick}:{active:boolean;icon:any;label:string;onClick:()=>void}){return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>}
