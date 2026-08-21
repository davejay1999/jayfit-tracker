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
import WorkoutScreenSafe, { type SafeFlowItem, type SessionViewMode } from './WorkoutScreenSafe';
import { CalendarPage, HomePage, PRPage, SettingsPage, WeekPage } from './Pages';
import { FinishSheet, HistorySheet, MachineSheet, NotesSheet, SummarySheet, SwapSheet } from './Sheets';

type Tab='home'|'week'|'calendar'|'prs'|'settings';
type Props={user:any;logout:()=>Promise<void>};

function normalizePhantomSessions(input:AppState):AppState{
  const sessions={...input.sessions};
  Object.entries(sessions).forEach(([date,session])=>{
    const rows=Object.values(input.sets[date]||{}).flat();
    const hasCompletedSet=rows.some(row=>row.done);
    const hasMeaningfulData=hasCompletedSet||(session.durationSeconds||0)>0||!!session.completedAt||!!session.notes||session.status==='completed'||(session.sorenessScore||0)>0||Object.keys(session.sorenessAreas||{}).length>0;
    if(session.status==='in_progress'&&!hasMeaningfulData){
      sessions[date]={...session,status:'not_started',startedAt:undefined,durationSeconds:0};
    }
  });
  return {...input,sessions};
}

export default function JayFitTimerSafe({logout}:Props){
  const [state,setState]=useState<AppState>(()=>normalizePhantomSessions(loadState()));
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
  const [workoutMode,setWorkoutMode]=useState(false);
  const [historyEdit,setHistoryEdit]=useState(false);
  const [timerRunning,setTimerRunning]=useState(false);
  const timerRunningRef=useRef(false);
  const timerAnchorRef=useRef<number|null>(null);
  const [previewCardio,setPreviewCardio]=useState<Record<string,string>>({});
  const fileInput=useRef<HTMLInputElement>(null);

  const updateState=(fn:(prev:AppState)=>AppState)=>setState(prev=>{const next=fn(prev);stateRef.current=next;saveState(next);return next;});
  const setTimerState=(running:boolean,anchor:number|null)=>{timerRunningRef.current=running;timerAnchorRef.current=anchor;setTimerRunning(running);};

  const syncFromCloud=async()=>{
    setCloudState('syncing');setCloudMessage('Syncing with AWS…');
    try{
      const cloud=await loadCloudState();const local=stateRef.current;const mergedSets={...local.sets};
      Object.entries(cloud.sets||{}).forEach(([date,exercises])=>{mergedSets[date]={...(mergedSets[date]||{}),...exercises};});
      const merged=normalizePhantomSessions({...local,sessions:{...local.sessions,...(cloud.sessions||{})},sets:mergedSets,machineSettings:{...local.machineSettings,...(cloud.machineSettings||{})},settings:cloud.profileCloudId?{...local.settings,...(cloud.settings||{})}:local.settings,profileCloudId:cloud.profileCloudId||local.profileCloudId,lastSyncAt:new Date().toISOString()});
      updateState(()=>merged);
      await uploadLocalState(merged,
        (date,id)=>updateState(p=>({...p,sessions:{...p.sessions,[date]:{...p.sessions[date],cloudId:id}}})),
        (date,exerciseId,index,id)=>updateState(p=>{const rows=[...(p.sets[date]?.[exerciseId]||[])];if(rows[index])rows[index]={...rows[index],cloudId:id};return {...p,sets:{...p.sets,[date]:{...(p.sets[date]||{}),[exerciseId]:rows}}};})
      );
      const profileId=await saveProfile(merged.profileCloudId,merged.settings);if(profileId)updateState(p=>({...p,profileCloudId:profileId,lastSyncAt:new Date().toISOString()}));
      setCloudState('synced');setCloudMessage('All changes saved online');
    }catch(error){console.error(error);setCloudState('offline');setCloudMessage('Offline cache active — changes remain here until cloud sync returns');}
  };

  useEffect(()=>{void syncFromCloud()},[]);
  useEffect(()=>{const timer=setInterval(()=>setTick(v=>v+1),1000);return()=>clearInterval(timer)},[]);
  useEffect(()=>{if(!restRunning||restSeconds<=0)return;const timer=setInterval(()=>setRestSeconds(s=>{if(s<=1){setRestRunning(false);return 0}return s-1}),1000);return()=>clearInterval(timer)},[restRunning,restSeconds>0]);

  const todayKey=localDateKey();
  const relation:'past'|'today'|'future'=dateKey<todayKey?'past':dateKey>todayKey?'future':'today';
  const date=parseLocalDate(dateKey);const basePlan=weeklyPlans[date.getDay()];
  const plan=useMemo(()=>applyRoutineOverrides(basePlan,state.settings.routineOverrides),[basePlan,state.settings.routineOverrides]);
  const session=state.sessions[dateKey];
  const selectedCardio=session?.selectedCardio||previewCardio[dateKey];

  const resolveExercise=(exercise:Exercise):Exercise=>{const replacement=session?.substitutions?.[exercise.id];return replacement?{...exercise,id:`sub-${slug(replacement)}`,name:replacement,note:`Substituted for ${exercise.name} this session.`}:exercise};
  const flow=useMemo(()=>{
    const items:SafeFlowItem[]=[];
    const append=(list:Exercise[],phase:Phase)=>list.forEach(original=>{if(plan.kind==='cardio'&&original.type==='cardio'&&(!selectedCardio||original.id!==selectedCardio))return;items.push({exercise:resolveExercise(original),phase,originalId:original.id});});
    append(plan.warmup,'warmup');append(plan.main,'main');append(plan.cooldown,'cooldown');return items;
  },[plan,selectedCardio,JSON.stringify(session?.substitutions||{})]);

  const seedRows=(item:SafeFlowItem):SetEntry[]=>{
    const rows=createSetRows(item.exercise,item.phase,stateRef.current.settings.weightUnit);
    if(item.phase==='main'&&(item.exercise.type==='strength'||item.exercise.type==='core')){
      const previous=previousExerciseSets(stateRef.current,dateKey,item.exercise.id);
      rows.forEach(row=>{const prior=previous.find(p=>p.setNumber===row.setNumber&&(p.side||'')===(row.side||''))||previous.find(p=>(p.side||'')===(row.side||''));if(prior?.weight){const converted=convertWeight(Number(prior.weight),prior.weightUnit,stateRef.current.settings.weightUnit);row.weight=String(Math.round(converted*10)/10);}});
      const machine=stateRef.current.machineSettings[item.exercise.id];if(!previous.length&&machine?.preferredWeight)rows.forEach(row=>row.weight=machine.preferredWeight||'');
    }
    return rows;
  };

  const ensureRows=(item:SafeFlowItem)=>{const existing=stateRef.current.sets[dateKey]?.[item.exercise.id];if(existing?.length)return existing;const rows=seedRows(item);updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}}));return rows;};

  const ensureSession=async():Promise<SessionEntry>=>{
    let current=stateRef.current.sessions[dateKey];
    if(!current){current={date:dateKey,workoutType:plan.kind,status:'not_started',durationSeconds:0,planSnapshot:JSON.stringify(plan),selectedCardio,substitutions:{}};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:current!}}));}
    try{const id=await saveSession(current,sessionVolume(stateRef.current,dateKey));if(id&&!current.cloudId){current={...current,cloudId:id};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:current!}}));}setCloudState('synced');}catch(error){console.error(error);setCloudState('offline');}
    return current;
  };

  const elapsedNow=()=>{
    const saved=stateRef.current.sessions[dateKey]?.durationSeconds||0;
    if(!timerRunningRef.current||timerAnchorRef.current===null)return saved;
    return saved+Math.max(0,Math.floor((Date.now()-timerAnchorRef.current)/1000));
  };

  const checkpointTimer=async(pause:boolean)=>{
    const current=stateRef.current.sessions[dateKey];
    if(!current){if(pause)setTimerState(false,null);return 0;}
    const total=elapsedNow();const next={...current,durationSeconds:total};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));
    if(pause)setTimerState(false,null);else if(timerRunningRef.current)setTimerState(true,Date.now());
    try{await saveSession(next,sessionVolume(stateRef.current,dateKey));setCloudState('synced');}catch(error){console.error(error);setCloudState('offline');}
    return total;
  };

  useEffect(()=>{if(!timerRunning)return;const id=setInterval(()=>{void checkpointTimer(false)},60000);return()=>clearInterval(id)},[timerRunning,dateKey]);

  const startTimerSession=async()=>{
    if(relation!=='today'||stateRef.current.sessions[dateKey]?.status==='completed')return;
    let current=await ensureSession();
    const next:SessionEntry={...current,status:'in_progress',startedAt:current.startedAt||new Date().toISOString(),durationSeconds:current.durationSeconds||0,selectedCardio:selectedCardio||current.selectedCardio,planSnapshot:current.planSnapshot||JSON.stringify(plan)};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));
    try{const id=await saveSession(next,sessionVolume(stateRef.current,dateKey));if(id&&!next.cloudId)updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:{...next,cloudId:id}}}));}catch(error){console.error(error);setCloudState('offline');}
    setHistoryEdit(false);setWorkoutMode(true);setTimerState(true,Date.now());
  };

  const pauseTimer=async()=>{await checkpointTimer(true);setRestRunning(false);};
  const resumeTimer=async()=>{if(timerRunningRef.current)return;await startTimerSession();};

  const persistSet=async(item:SafeFlowItem,index:number,row:SetEntry)=>{
    if(!(workoutMode||historyEdit))return;
    try{const s=await ensureSession();if(!s.cloudId)return;const id=await saveSet(s.cloudId,row);if(id&&!row.cloudId)updateState(p=>{const rows=[...(p.sets[dateKey]?.[item.exercise.id]||[])];if(rows[index])rows[index]={...rows[index],cloudId:id};return {...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}};});setCloudState('synced');}catch(error){console.error(error);setCloudState('offline');}
  };

  const setRow=(item:SafeFlowItem,index:number,patch:Partial<SetEntry>,persist=true)=>{
    if(!(workoutMode||historyEdit))return;
    let changed:SetEntry|undefined;
    updateState(p=>{const rows=[...(p.sets[dateKey]?.[item.exercise.id]||seedRows(item))];rows[index]={...rows[index],...patch};changed=rows[index];return {...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[item.exercise.id]:rows}}};});
    if(persist&&changed)void persistSet(item,index,changed);
  };

  const requiredFlow=flow.filter(item=>!item.exercise.optional||(plan.kind==='cardio'&&item.exercise.id===selectedCardio));
  const completion=useMemo(()=>{let total=0,done=0;requiredFlow.forEach(item=>{total+=item.exercise.unilateral?item.exercise.sets*2:item.exercise.sets;done+=(state.sets[dateKey]?.[item.exercise.id]||[]).filter(row=>row.done).length;});return{total,done,percent:total?Math.min(100,Math.round(done/total*100)):0};},[state,dateKey,requiredFlow.map(x=>x.exercise.id).join('|')]);

  const firstIncomplete=()=>{
    for(let index=0;index<flow.length;index++){
      const rows=stateRef.current.sets[dateKey]?.[flow[index].exercise.id]||seedRows(flow[index]);const setIndex=rows.findIndex(row=>!row.done);if(setIndex>=0)return{index,setIndex};
    }
    return{index:Math.max(0,flow.length-1),setIndex:0};
  };

  const openPreviewAt=(index:number,setIndex=0)=>{if(index<0||index>=flow.length)return;setWorkoutMode(false);setHistoryEdit(false);setTimerState(false,null);const rows=stateRef.current.sets[dateKey]?.[flow[index].exercise.id]||seedRows(flow[index]);const preferred=rows.findIndex(row=>!row.done);setActive({index,setIndex:preferred>=0?preferred:Math.min(setIndex,Math.max(0,rows.length-1))});};

  const startWorkout=async()=>{
    if(relation!=='today'){
      if(flow.length)openPreviewAt(0);return;
    }
    if(plan.kind==='rest'){const s=await ensureSession();const next={...s,status:'in_progress' as const,startedAt:s.startedAt||new Date().toISOString()};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));void saveSession(next,0);setFinishOpen(true);return;}
    if(plan.kind==='cardio'&&!selectedCardio)return;
    await startTimerSession();const next=firstIncomplete();if(flow[next.index])ensureRows(flow[next.index]);setActive(next);
  };

  const openExercise=(exerciseId:string)=>{
    const index=flow.findIndex(item=>item.exercise.id===exerciseId||item.originalId===exerciseId);
    if(index>=0)openPreviewAt(index);
  };

  const selectCardio=(exerciseId:string)=>{
    setPreviewCardio(p=>({...p,[dateKey]:exerciseId}));
    const exercise=plan.main.find(ex=>ex.id===exerciseId);if(!exercise)return;
    setWorkoutMode(false);setHistoryEdit(false);setTimerState(false,null);setActive({index:0,setIndex:0});
  };

  const current=active?flow[active.index]:undefined;
  const currentRows=current?(state.sets[dateKey]?.[current.exercise.id]||seedRows(current)):[];
  const currentSet=currentRows[active?.setIndex||0];
  const canModify=(workoutMode&&relation==='today'&&session?.status!=='completed')||historyEdit;

  const startFromPreview=async()=>{if(relation!=='today'||session?.status==='completed')return;await startTimerSession();if(current)ensureRows(current);};

  const completeCurrentSet=()=>{
    if(!canModify||!current||!currentSet||active===null)return;
    const before=derivePRs(stateRef.current)[current.exercise.id];const completed={...currentSet,done:!currentSet.done,loggedAt:new Date().toISOString()};setRow(current,active.setIndex,completed);
    if(!currentSet.done&&currentSet.setType==='WORKING'){
      const weight=canonicalLb(Number(completed.weight),completed.weightUnit),reps=Number(completed.reps),oneRM=epley(weight,reps);
      if(weight>0&&reps>0&&(!before?.weight||weight>before.weight.weight||oneRM>(before.oneRM?.oneRM||0)))setCelebration(`New PR • ${completed.exerciseName} • ${completed.weight} ${completed.weightUnit} × ${completed.reps}`);
      if(state.settings.autoRestTimer){setRestSeconds(state.settings.defaultRestSeconds);setRestRunning(true);}
    }
    if(!currentSet.done){const nextSet=currentRows.findIndex((row,i)=>i>active.setIndex&&!row.done);if(nextSet>=0)setActive({...active,setIndex:nextSet});else if(active.index<flow.length-1){const index=active.index+1;ensureRows(flow[index]);setActive({index,setIndex:0});}else setFinishOpen(true);}
  };

  const addExtraSet=()=>{
    if(!canModify||!current||active===null)return;const rows=[...(stateRef.current.sets[dateKey]?.[current.exercise.id]||ensureRows(current))];const setNumber=Math.max(0,...rows.map(r=>r.setNumber))+1;
    const setType:SetEntry['setType']=current.phase==='warmup'?'WARMUP':current.phase==='cooldown'?'COOLDOWN':(current.exercise.type==='strength'||current.exercise.type==='core'?'WORKING':'RECOVERY');
    const base:SetEntry={exerciseId:current.exercise.id,exerciseName:current.exercise.name,phase:current.phase,setNumber,weight:'',reps:'',done:false,setType,weightUnit:state.settings.weightUnit};const additions:SetEntry[]=current.exercise.unilateral?[{...base,side:'R'},{...base,side:'L'}]:[base];
    updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[current.exercise.id]:[...rows,...additions]}}}));setActive({...active,setIndex:rows.length});
  };

  const removeExtraSet=()=>{
    if(!canModify||!current||active===null)return;const rows=[...(stateRef.current.sets[dateKey]?.[current.exercise.id]||[])];const baseCount=current.exercise.unilateral?current.exercise.sets*2:current.exercise.sets;if(rows.length<=baseCount)return;
    const max=Math.max(...rows.map(r=>r.setNumber));const removed=rows.filter(r=>r.setNumber===max),kept=rows.filter(r=>r.setNumber!==max);removed.forEach(r=>{if(r.cloudId)void deleteSetLog(r.cloudId).catch(()=>setCloudState('offline'));});updateState(p=>({...p,sets:{...p.sets,[dateKey]:{...(p.sets[dateKey]||{}),[current.exercise.id]:kept}}}));setActive({...active,setIndex:Math.max(0,kept.length-1)});
  };

  const reducedVolume=()=>{if(!canModify||!current||active===null)return;const rows=stateRef.current.sets[dateKey]?.[current.exercise.id]||ensureRows(current);rows.forEach((r,i)=>{if(r.setNumber===3&&!r.done)setRow(current,i,{done:true,notes:'Reduced-volume skip',loggedAt:new Date().toISOString()});});const next=rows.findIndex(r=>!r.done&&r.setNumber<3);setActive({...active,setIndex:next>=0?next:Math.max(0,rows.length-1)});};

  const finishWorkout=async(score:number,areas:Record<string,number>,notes:string)=>{
    const total=await checkpointTimer(true);const s=await ensureSession();const completed:SessionEntry={...s,status:'completed',completedAt:new Date().toISOString(),durationSeconds:total,sorenessScore:score,sorenessAreas:areas,notes:notes||s.notes};
    updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:completed}}));try{const id=await saveSession(completed,sessionVolume(stateRef.current,dateKey));if(id&&!completed.cloudId)updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:{...completed,cloudId:id}}}));}catch{setCloudState('offline');}
    setWorkoutMode(false);setFinishOpen(false);setActive(null);setSummaryDate(dateKey);setRestSeconds(0);setRestRunning(false);
  };

  const editCompleted=()=>{
    const mainIndex=Math.max(0,flow.findIndex(item=>item.phase==='main'));setTimerState(false,null);setWorkoutMode(false);setHistoryEdit(true);setSummaryDate('');
    if(flow[mainIndex]){const rows=stateRef.current.sets[dateKey]?.[flow[mainIndex].exercise.id]||seedRows(flow[mainIndex]);setActive({index:mainIndex,setIndex:Math.max(0,rows.findIndex(row=>!row.done))});}
  };

  const saveSessionNotes=(notes:string)=>{if(!canModify)return;void ensureSession().then(s=>{const next={...s,notes};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));void saveSession(next,sessionVolume(stateRef.current,dateKey));});setNotesOpen(false);};
  const saveMachine=(setting:MachineSetting)=>{if(!canModify)return;updateState(p=>({...p,machineSettings:{...p.machineSettings,[setting.exerciseId]:setting}}));void saveMachineSetting(setting,state.settings.weightUnit).then(id=>{if(id)updateState(p=>({...p,machineSettings:{...p.machineSettings,[setting.exerciseId]:{...p.machineSettings[setting.exerciseId],cloudId:id}}}));}).catch(()=>setCloudState('offline'));setMachineOpen(false);};
  const swapExercise=(replacement:string)=>{if(!canModify||!current)return;const existing=stateRef.current.sets[dateKey]?.[current.exercise.id]||[];if(existing.some(r=>r.done)&&!confirm('This exercise already has completed sets. Replace it anyway? Completed history will remain saved.'))return;void ensureSession().then(s=>{const next={...s,substitutions:{...(s.substitutions||{}),[current.originalId]:replacement}};updateState(p=>({...p,sessions:{...p.sessions,[dateKey]:next}}));void saveSession(next,sessionVolume(stateRef.current,dateKey));});setSwapOpen(false);setActive(active?{...active,setIndex:0}:active);};
  const updateSettings=(patch:Partial<AppState['settings']>)=>{const next={...state.settings,...patch};updateState(p=>({...p,settings:next}));void saveProfile(stateRef.current.profileCloudId,next).then(id=>{if(id)updateState(p=>({...p,profileCloudId:id}));}).catch(()=>setCloudState('offline'));};

  const closeWorkout=async()=>{if(timerRunningRef.current)await checkpointTimer(true);setWorkoutMode(false);setHistoryEdit(false);setRestRunning(false);setActive(null);};
  const goPrev=()=>{if(active===null||active.index<=0)return;const index=active.index-1;if(canModify)ensureRows(flow[index]);const rows=stateRef.current.sets[dateKey]?.[flow[index].exercise.id]||seedRows(flow[index]);setActive({index,setIndex:Math.max(0,rows.findIndex(r=>!r.done))});};
  const goNext=()=>{if(active===null)return;if(active.index<flow.length-1){const index=active.index+1;if(canModify)ensureRows(flow[index]);const rows=stateRef.current.sets[dateKey]?.[flow[index].exercise.id]||seedRows(flow[index]);setActive({index,setIndex:Math.max(0,rows.findIndex(r=>!r.done))});}else if(canModify&&!historyEdit)setFinishOpen(true);};

  const exportData=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`jayfit-backup-${localDateKey()}.json`;link.click();URL.revokeObjectURL(url);};
  const importData=(file:File)=>{const reader=new FileReader();reader.onload=async()=>{try{const parsed=JSON.parse(String(reader.result));if(!parsed.sessions||!parsed.sets||!parsed.settings)throw new Error('Invalid backup');const next=normalizePhantomSessions({...parsed,settings:{...DEFAULT_SETTINGS,...parsed.settings}} as AppState);updateState(()=>next);await uploadLocalState(next);await syncFromCloud();alert('Backup imported and synchronized.');}catch{alert('This is not a valid JayFit backup. No data was changed.');}};reader.readAsText(file);};
  const clearAll=async()=>{if(!confirm('Delete ALL JayFit workout history, settings and cloud records? This cannot be undone.'))return;try{await deleteCloudData();localStorage.removeItem('jayfit.state.v2');localStorage.removeItem('jayfit.logs');updateState(()=>({sessions:{},sets:{},machineSettings:{},settings:DEFAULT_SETTINGS}));setCloudState('synced');}catch{alert('Cloud deletion failed. Nothing else was changed.');}};

  const overlays=<>{celebration&&<div className="toast-pr" onClick={()=>setCelebration('')}><Trophy/><div><small>PERSONAL RECORD</small><strong>{celebration.replace('New PR • ','')}</strong></div><X/></div>}{machineOpen&&current&&<MachineSheet setting={state.machineSettings[current.exercise.id]||{exerciseId:current.exercise.id}} exercise={current.exercise} onSave={saveMachine} onClose={()=>setMachineOpen(false)}/>} {notesOpen&&<NotesSheet initial={state.sessions[dateKey]?.notes||''} onSave={saveSessionNotes} onClose={()=>setNotesOpen(false)}/>} {swapOpen&&current&&<SwapSheet exercise={findExercise(current.originalId)||current.exercise} onSwap={swapExercise} onClose={()=>setSwapOpen(false)}/>} {finishOpen&&<FinishSheet initialNotes={state.sessions[dateKey]?.notes||''} onFinish={finishWorkout} onClose={()=>setFinishOpen(false)}/>} {summaryDate&&<SummarySheet date={summaryDate} state={state} onClose={()=>setSummaryDate('')} onEdit={editCompleted}/>} {historyExercise&&<HistorySheet exerciseId={historyExercise} state={state} onClose={()=>setHistoryExercise('')}/>}</>;

  if(active!==null&&current&&currentSet){
    const previous=previousExerciseSets(state,dateKey,current.exercise.id,currentSet.side);const suggestion=progressionSuggestion(state,dateKey,current.exercise);const elapsed=elapsedNow();void tick;
    const mode:SessionViewMode=historyEdit?'history-edit':session?.status==='completed'?'completed-preview':workoutMode?(timerRunning?'active':'paused'):'preview';
    const hasStarted=!!session?.startedAt||(session?.durationSeconds||0)>0||Object.values(state.sets[dateKey]||{}).flat().some(r=>r.done);
    return <><WorkoutScreenSafe item={current} rows={currentRows} activeSet={active.setIndex} elapsed={elapsed} restSeconds={restSeconds} restRunning={restRunning} previous={previous} suggestion={suggestion} cloudState={cloudState} machine={state.machineSettings[current.exercise.id]} onClose={()=>{void closeWorkout()}} onPrev={goPrev} onNext={goNext} onPickSet={setIndex=>setActive({...active,setIndex})} onSet={(patch,persist=true)=>setRow(current,active.setIndex,patch,persist)} onComplete={completeCurrentSet} onRest={seconds=>{setRestSeconds(seconds);setRestRunning(seconds>0)}} onMachine={()=>canModify&&setMachineOpen(true)} onNotes={()=>canModify&&setNotesOpen(true)} onSwap={()=>canModify&&setSwapOpen(true)} onReduced={reducedVolume} onAddSet={addExtraSet} onRemoveSet={removeExtraSet} onStartTimer={()=>{void startFromPreview()}} onPauseTimer={()=>{void pauseTimer()}} onResumeTimer={()=>{void resumeTimer()}} beginner={state.settings.beginnerMode} position={`${active.index+1} / ${flow.length}`} phase={current.phase} mode={mode} dateRelation={relation} hasStarted={hasStarted}/>{overlays}</>;
  }

  return <div className="app-shell"><main className="page-shell">
    {cloudState!=='synced'&&<div className={`sync-banner ${cloudState}`}>{cloudState==='offline'?<CloudOff/>:<RefreshCw className="spin"/>}<span>{cloudMessage}</span><button onClick={()=>void syncFromCloud()}>Retry</button></div>}
    {tab==='home'&&<HomePage dateKey={dateKey} state={state} plan={plan} flow={flow} completion={completion} isFuture={relation==='future'} onStart={startWorkout} onDate={key=>{setDateKey(key);setCalendarCursor(parseLocalDate(key));setPreviewCardio(p=>({...p}));}} onCardio={selectCardio} onSummary={()=>setSummaryDate(dateKey)} onExercise={openExercise}/>} 
    {tab==='week'&&<WeekPage state={state} selected={dateKey} onPick={key=>{setDateKey(key);setTab('home')}}/>}
    {tab==='calendar'&&<CalendarPage state={state} cursor={calendarCursor} setCursor={setCalendarCursor} onPick={key=>{setDateKey(key);setTab('home')}}/>}
    {tab==='prs'&&<PRPage state={state} exerciseFilter={prExercise} setExerciseFilter={setPrExercise} monthFilter={prMonth} setMonthFilter={setPrMonth} onHistory={setHistoryExercise}/>} 
    {tab==='settings'&&<SettingsPage state={state} section={settingsSection} setSection={setSettingsSection} onSettings={updateSettings} onExport={exportData} onImport={()=>fileInput.current?.click()} onClear={clearAll} onLogout={logout} cloudState={cloudState}/>} 
    <input ref={fileInput} hidden type="file" accept="application/json" onChange={event=>event.target.files?.[0]&&importData(event.target.files[0])}/>
  </main>
  <nav className="bottom-nav"><Nav active={tab==='home'} icon={<Dumbbell/>} label="Today" onClick={()=>setTab('home')}/><Nav active={tab==='week'} icon={<CalendarDays/>} label="Week" onClick={()=>setTab('week')}/><Nav active={tab==='calendar'} icon={<CalendarDays/>} label="Calendar" onClick={()=>setTab('calendar')}/><Nav active={tab==='prs'} icon={<Trophy/>} label="PRs" onClick={()=>setTab('prs')}/><Nav active={tab==='settings'} icon={<Settings/>} label="Settings" onClick={()=>setTab('settings')}/></nav>{overlays}</div>;
}

function Nav({active,icon,label,onClick}:{active:boolean;icon:any;label:string;onClick:()=>void}){return <button className={active?'active':''} onClick={onClick}>{icon}<span>{label}</span></button>}
