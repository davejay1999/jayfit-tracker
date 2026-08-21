import type { AppState, Exercise, PREvent, PRMetric, SessionEntry, SetEntry, Side, UserSettings, WeightUnit } from './types';
import { weeklyPlans } from './routine';

export const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'lb',
  defaultRestSeconds: 90,
  beginnerMode: false,
  theme: 'dark',
  autoRestTimer: true,
  routineOverrides: {},
};

export const EMPTY_STATE: AppState = {
  sessions: {},
  sets: {},
  machineSettings: {},
  settings: DEFAULT_SETTINGS,
};

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(key: string): Date {
  const [y,m,d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem('jayfit.state.v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...EMPTY_STATE,
        ...parsed,
        settings: {...DEFAULT_SETTINGS, ...(parsed.settings || {})},
      };
    }
    const old = JSON.parse(localStorage.getItem('jayfit.logs') || '{}');
    const migrated: AppState = structuredClone(EMPTY_STATE);
    Object.entries(old as Record<string,Record<string,Array<any>>>).forEach(([date, exercises]) => {
      const day = parseLocalDate(date).getDay();
      migrated.sessions[date] = {date, workoutType: weeklyPlans[day].kind, status:'in_progress'};
      migrated.sets[date] = {};
      Object.entries(exercises).forEach(([name, rows]) => {
        const id = slug(name);
        migrated.sets[date][id] = rows.map((row:any, i:number) => ({
          exerciseId:id, exerciseName:name, phase:'main', setNumber:Math.floor(i/2)+1,
          side:row.side, weight:String(row.weight || ''), reps:String(row.reps || ''), done:!!row.done,
          setType:'WORKING', weightUnit:'lb', loggedAt:new Date().toISOString(),
        }));
      });
    });
    saveState(migrated);
    return migrated;
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

export function saveState(state: AppState) {
  localStorage.setItem('jayfit.state.v2', JSON.stringify(state));
}

export function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

export function createSetRows(ex: Exercise, phase:'warmup'|'main'|'cooldown', unit:WeightUnit): SetEntry[] {
  const rows: SetEntry[] = [];
  const setType = phase === 'warmup' ? 'WARMUP' : phase === 'cooldown' ? 'COOLDOWN' : (ex.type === 'strength' || ex.type === 'core' ? 'WORKING' : 'RECOVERY');
  if (ex.unilateral) {
    for (let set = 1; set <= ex.sets; set++) {
      rows.push({exerciseId:ex.id,exerciseName:ex.name,phase,setNumber:set,side:'R',weight:'',reps:'',done:false,setType,weightUnit:unit});
      rows.push({exerciseId:ex.id,exerciseName:ex.name,phase,setNumber:set,side:'L',weight:'',reps:'',done:false,setType,weightUnit:unit});
    }
  } else {
    for (let set = 1; set <= ex.sets; set++) rows.push({exerciseId:ex.id,exerciseName:ex.name,phase,setNumber:set,weight:'',reps:'',done:false,setType,weightUnit:unit});
  }
  return rows;
}

export function convertWeight(value:number, from:WeightUnit, to:WeightUnit): number {
  if (from === to) return value;
  return to === 'kg' ? value / 2.2046226218 : value * 2.2046226218;
}

export function canonicalLb(weight:number, unit:WeightUnit) {
  return unit === 'lb' ? weight : weight * 2.2046226218;
}

export function displayWeight(weight:number, stored:WeightUnit, desired:WeightUnit) {
  return Math.round(convertWeight(weight,stored,desired) * 10) / 10;
}

export function setVolume(set:SetEntry): number {
  if (set.setType !== 'WORKING' || !set.done) return 0;
  const w = Number(set.weight), r = Number(set.reps);
  return Number.isFinite(w) && Number.isFinite(r) ? canonicalLb(w,set.weightUnit) * r : 0;
}

export function sessionVolume(state:AppState, date:string): number {
  return Object.values(state.sets[date] || {}).flat().reduce((sum,s)=>sum+setVolume(s),0);
}

export function epley(weight:number,reps:number): number {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

export function completedRows(state:AppState,date:string) {
  return Object.values(state.sets[date] || {}).flat().filter(s=>s.done).length;
}

export function workingRows(state:AppState,date:string) {
  return Object.values(state.sets[date] || {}).flat().filter(s=>s.setType==='WORKING');
}

export function derivePRs(state:AppState): Record<string,{weight?:PRMetric;volume?:PRMetric;oneRM?:PRMetric;reps?:PRMetric;left?:PRMetric;right?:PRMetric}> {
  const out:Record<string,any> = {};
  Object.entries(state.sets).forEach(([date, exercises]) => Object.values(exercises).flat().forEach(set => {
    if (!set.done || set.setType !== 'WORKING') return;
    const w = Number(set.weight), r = Number(set.reps);
    if (!(w > 0 && r > 0)) return;
    const weightLb = canonicalLb(w,set.weightUnit);
    const metric:PRMetric = {exerciseId:set.exerciseId,exerciseName:set.exerciseName,side:set.side,date,weight:weightLb,reps:r,volume:weightLb*r,oneRM:epley(weightLb,r)};
    const row = out[set.exerciseId] ||= {};
    if (!row.weight || metric.weight > row.weight.weight || (metric.weight===row.weight.weight && r>row.weight.reps)) row.weight = metric;
    if (!row.volume || metric.volume > row.volume.volume) row.volume = metric;
    if (!row.oneRM || metric.oneRM > row.oneRM.oneRM) row.oneRM = metric;
    if (!row.reps || r > row.reps.reps || (r===row.reps.reps && metric.weight>row.reps.weight)) row.reps = metric;
    if (set.side === 'L' && (!row.left || metric.oneRM > row.left.oneRM)) row.left = metric;
    if (set.side === 'R' && (!row.right || metric.oneRM > row.right.oneRM)) row.right = metric;
  }));
  return out;
}

export function derivePREvents(state:AppState): PREvent[] {
  const best:Record<string,{weight:number;volume:number;oneRM:number;reps:number}> = {};
  const events:PREvent[] = [];
  Object.keys(state.sets).sort().forEach(date => {
    Object.values(state.sets[date] || {}).flat().filter(s=>s.done&&s.setType==='WORKING').forEach(set => {
      const w = canonicalLb(Number(set.weight),set.weightUnit), r=Number(set.reps);
      if (!(w>0&&r>0)) return;
      const key = `${set.exerciseId}:${set.side||'B'}`;
      const prev = best[key] ||= {weight:0,volume:0,oneRM:0,reps:0};
      const base = {exerciseId:set.exerciseId,exerciseName:set.exerciseName,side:set.side,date,weight:w,reps:r,volume:w*r,oneRM:epley(w,r)};
      if (w > prev.weight) {events.push({...base,type:'weight',value:w});prev.weight=w;}
      if (base.volume > prev.volume) {events.push({...base,type:'volume',value:base.volume});prev.volume=base.volume;}
      if (base.oneRM > prev.oneRM) {events.push({...base,type:'oneRM',value:base.oneRM});prev.oneRM=base.oneRM;}
      if (r > prev.reps) {events.push({...base,type:'reps',value:r});prev.reps=r;}
    });
  });
  return events.reverse();
}

export function previousExerciseSets(state:AppState,currentDate:string,exerciseId:string,side?:Side): SetEntry[] {
  const dates = Object.keys(state.sets).filter(d=>d<currentDate && state.sets[d]?.[exerciseId]).sort().reverse();
  if (!dates.length) return [];
  const rows = state.sets[dates[0]][exerciseId] || [];
  return rows.filter(s=>s.setType==='WORKING' && (!side || s.side===side));
}

export function progressionSuggestion(state:AppState,date:string,ex:Exercise): {label:string;detail:string;tone:'up'|'hold'|'down'} {
  const prior = previousExerciseSets(state,date,ex.id).filter(s=>s.done);
  if (!prior.length || !ex.minReps || !ex.maxReps) return {label:'Build a baseline',detail:'Use clean technique and finish with about 2–4 reps in reserve.',tone:'hold'};
  const reps = prior.map(s=>Number(s.reps)).filter(Boolean);
  const soreness = state.sessions[date]?.sorenessScore || 0;
  if (soreness >= 3) return {label:'Recover first',detail:'High soreness logged. Keep the load conservative or shorten the session.',tone:'down'};
  if (reps.length && reps.every(r=>r>=ex.maxReps!)) return {label:'Increase slightly',detail:'You reached the top of the rep range across all prior working sets. Use the smallest practical increment.',tone:'up'};
  if (reps.length && reps.every(r=>r<ex.minReps!)) return {label:'Reduce slightly',detail:'The previous session stayed below the target range. Reduce load enough to regain clean reps.',tone:'down'};
  return {label:'Keep the load',detail:'Stay at the current weight and add clean reps before increasing.',tone:'hold'};
}

export function exerciseHistory(state:AppState,exerciseId:string) {
  return Object.keys(state.sets).sort().filter(date=>state.sets[date]?.[exerciseId]).map(date=>({date,sets:(state.sets[date][exerciseId]||[]).filter(s=>s.setType==='WORKING'&&s.done)}));
}

export function plateauStatus(state:AppState,exerciseId:string): {plateau:boolean;detail:string} {
  const history = exerciseHistory(state,exerciseId).slice(-5);
  if (history.length < 4) return {plateau:false,detail:'More sessions are needed for plateau detection.'};
  const scores = history.map(h=>Math.max(0,...h.sets.map(s=>epley(canonicalLb(Number(s.weight),s.weightUnit),Number(s.reps)))));
  const first=Math.max(...scores.slice(0,2)), recent=Math.max(...scores.slice(-2));
  if (recent <= first * 1.01) return {plateau:true,detail:'Estimated strength has not meaningfully increased across the last 4–5 logged sessions.'};
  return {plateau:false,detail:'Recent estimated strength is still moving upward.'};
}

export function sessionStatusForDate(state:AppState,date:string): 'completed'|'partial'|'missed'|'future'|'rest'|'scheduled' {
  const d=parseLocalDate(date), today=parseLocalDate(localDateKey());
  const plan=weeklyPlans[d.getDay()];
  const session=state.sessions[date];
  if (plan.kind==='rest') return session?.status==='completed' ? 'completed' : 'rest';
  if (session?.status==='completed') return 'completed';
  if (session && (session.status==='in_progress'||session.status==='partial')) return 'partial';
  if (d>today) return 'future';
  if (d<today) return 'missed';
  return 'scheduled';
}

export function monthlyStats(state:AppState,cursor=new Date()) {
  const y=cursor.getFullYear(),m=cursor.getMonth();
  const prefix=`${y}-${String(m+1).padStart(2,'0')}`;
  const dates=Object.keys(state.sessions).filter(d=>d.startsWith(prefix));
  const completed=dates.filter(d=>state.sessions[d].status==='completed').length;
  const strength=dates.filter(d=>['push','pull','legs'].includes(state.sessions[d].workoutType)&&state.sessions[d].status==='completed').length;
  const volume=dates.reduce((sum,d)=>sum+sessionVolume(state,d),0);
  const prs=derivePREvents(state).filter(e=>e.date.startsWith(prefix)).length;
  return {completed,strength,volume,prs};
}

export function weeklyStrengthStreak(state:AppState): number {
  const now = new Date();
  let streak=0;
  for (let w=0; w<52; w++) {
    const anchor=new Date(now);anchor.setDate(now.getDate()-w*7);
    const monday=new Date(anchor);const offset=(monday.getDay()+6)%7;monday.setDate(monday.getDate()-offset);
    const keys=[0,2,4].map(n=>{const d=new Date(monday);d.setDate(monday.getDate()+n);return localDateKey(d)});
    if (keys.every(k=>state.sessions[k]?.status==='completed')) streak++; else if (w>0 || keys.some(k=>parseLocalDate(k)<=now)) break;
  }
  return streak;
}

export function recoveryInsight(state:AppState): string {
  const completed=Object.values(state.sessions).filter(s=>s.status==='completed'&&typeof s.sorenessScore==='number');
  if (completed.length<3) return 'Log soreness after a few workouts to reveal recovery patterns.';
  const high=completed.filter(s=>(s.sorenessScore||0)>=2);
  if (high.length/completed.length>0.6) return 'Moderate/high soreness is common in your recent logs. Avoid adding volume until recovery improves.';
  return 'Recent soreness looks manageable relative to completed sessions. Keep progression gradual.';
}

export function sessionCompletion(state:AppState,date:string,requiredExerciseIds:string[]): {done:number;total:number;percent:number} {
  let total=0,done=0;
  requiredExerciseIds.forEach(id=>{
    const rows=state.sets[date]?.[id]||[];
    if (!rows.length) return;
    total+=rows.length;
    done+=rows.filter(s=>s.done).length;
  });
  return {done,total,percent:total?Math.round(done/total*100):0};
}
