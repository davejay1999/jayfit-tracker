import type { DayPlan, Exercise } from './types';

const e = (x: Exercise): Exercise => x;

const pushWarmup: Exercise[] = [
  e({id:'push-cardio-warmup',name:'Treadmill / Bike / Elliptical',sets:1,reps:'5 min',type:'cardio',primary:['Full body'],visual:'cardio',timedMinutes:[5,5]}),
  e({id:'arm-circles',name:'Arm Circles',sets:3,reps:'10 forward + 10 backward',type:'warmup',primary:['Shoulders'],visual:'arm-circles'}),
  e({id:'shoulder-blade-squeezes',name:'Shoulder Blade Squeezes',sets:3,reps:'10',minReps:10,maxReps:10,type:'warmup',primary:['Mid back'],visual:'scapula'}),
  e({id:'wall-slides-push',name:'Wall Slides',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'warmup',primary:['Shoulders','Upper back'],visual:'wall-slide'}),
  e({id:'external-rotation',name:'Cable / Band External Rotation',sets:3,reps:'10–12 / side',minReps:10,maxReps:12,unilateral:true,type:'warmup',primary:['Rotator cuff'],visual:'external-rotation',note:'Very light resistance.'}),
  e({id:'incline-wall-pushup',name:'Incline / Wall Push-Up',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'warmup',primary:['Chest','Shoulders','Triceps'],visual:'pushup'}),
  e({id:'chest-press-warmup',name:'Lever Chest Press — Warm-Up',sets:3,reps:'12 / 6–8 / 3–5',type:'warmup',primary:['Chest'],secondary:['Triceps','Front delts'],visual:'chest-press',note:'Very light → moderate-light → optional heavier ramp-up. Warm-up sets never count toward PRs.'}),
];

const pushMain: Exercise[] = [
  e({id:'lever-chest-press',name:'Lever Chest Press',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Chest'],secondary:['Triceps','Front delts'],visual:'chest-press',alternatives:['Machine Chest Press','Cable Chest Press']}),
  e({id:'lever-seated-shoulder-press',name:'Lever Seated Shoulder Press',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Front delts','Side delts'],secondary:['Triceps'],visual:'shoulder-press',alternatives:['Machine Shoulder Press','Cable Shoulder Press']}),
  e({id:'lever-seated-fly',name:'Lever Seated Fly / Pec Deck',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Chest'],visual:'pec-deck',alternatives:['Cable Fly']}),
  e({id:'lever-lateral-raise',name:'Lever Lateral Raise',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Side delts'],visual:'lateral-raise',alternatives:['Single-Arm Cable Lateral Raise']}),
  e({id:'cable-triceps-pushdown',name:'Cable Triceps Pushdown',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Triceps'],visual:'pushdown',alternatives:['Rope Triceps Pushdown']}),
  e({id:'cable-overhead-triceps-extension',name:'Cable Overhead Triceps Extension',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Triceps'],secondary:['Triceps long head'],visual:'overhead-triceps',alternatives:['Single-Arm Cable Overhead Extension']}),
  e({id:'cable-crunch',name:'Cable Crunch',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'core',primary:['Rectus abdominis'],visual:'cable-crunch'}),
  e({id:'pallof-press',name:'Pallof Press',sets:3,reps:'10–12 / side',minReps:10,maxReps:12,unilateral:true,type:'core',primary:['Deep core','Obliques'],secondary:['Anti-rotation stability'],visual:'pallof'}),
];

const pushCooldown: Exercise[] = [
  e({id:'doorway-chest-stretch-push',name:'Doorway Chest Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Chest'],visual:'chest-stretch'}),
  e({id:'overhead-triceps-stretch',name:'Overhead Triceps Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Triceps'],visual:'triceps-stretch'}),
  e({id:'cross-body-shoulder-stretch',name:'Cross-Body Shoulder Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Shoulders'],visual:'shoulder-stretch'}),
  e({id:'upper-trap-neck-stretch',name:'Gentle Upper-Trap / Neck Stretch',sets:3,reps:'15–20 sec / side',unilateral:true,type:'stretch',primary:['Upper traps','Neck'],visual:'neck-stretch',note:'Gentle only. Do not aggressively pull the neck.'}),
  e({id:'deep-breathing',name:'Deep Breathing',sets:1,reps:'1–2 min',type:'recovery',primary:['Recovery'],visual:'breathing',timedMinutes:[1,2]}),
];

const pullWarmup: Exercise[] = [
  e({id:'pull-cardio-warmup',name:'Treadmill / Bike / Elliptical',sets:1,reps:'5 min',type:'cardio',primary:['Full body'],visual:'cardio',timedMinutes:[5,5]}),
  e({id:'cat-cow',name:'Cat-Cow',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'warmup',primary:['Spine','Upper back'],visual:'cat-cow'}),
  e({id:'thoracic-rotation',name:'Thoracic Rotation',sets:3,reps:'8 / side',minReps:8,maxReps:8,unilateral:true,type:'warmup',primary:['Thoracic spine'],visual:'rotation'}),
  e({id:'scapular-pulldown',name:'Scapular Pulldown',sets:3,reps:'10',minReps:10,maxReps:10,type:'warmup',primary:['Scapular depressors','Lats'],visual:'scapular-pulldown'}),
  e({id:'band-pull-apart-facepull',name:'Band Pull-Apart / Light Face Pull',sets:3,reps:'12',minReps:12,maxReps:12,type:'warmup',primary:['Rear delts','Upper back'],visual:'face-pull'}),
  e({id:'light-seated-row',name:'Light Seated Row',sets:3,reps:'12',minReps:12,maxReps:12,type:'warmup',primary:['Mid back'],secondary:['Biceps'],visual:'row'}),
  e({id:'lat-pulldown-warmup',name:'Lat Pulldown — Warm-Up',sets:3,reps:'12 / 6–8 / 3–5',type:'warmup',primary:['Lats'],secondary:['Biceps'],visual:'pulldown',note:'Very light → moderate-light → optional heavier ramp-up.'}),
];

const pullMain: Exercise[] = [
  e({id:'lat-pulldown',name:'Lat Pulldown',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Lats'],secondary:['Biceps'],visual:'pulldown',alternatives:['Neutral-Grip Pulldown','Single-Arm Cable Pulldown']}),
  e({id:'lever-seated-row',name:'Lever Seated Row',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Mid back','Rhomboids','Lats'],secondary:['Biceps'],visual:'row',alternatives:['Cable Seated Row','Single-Arm Machine Row']}),
  e({id:'lever-seated-reverse-fly',name:'Lever Seated Reverse Fly',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Rear delts','Upper back'],visual:'reverse-fly',alternatives:['Cable Reverse Fly']}),
  e({id:'cable-straight-arm-pulldown',name:'Cable Straight-Arm Pulldown',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Lats'],visual:'straight-arm-pulldown'}),
  e({id:'lever-preacher-curl',name:'Lever Preacher Curl',sets:3,reps:'10–12',minReps:10,maxReps:12,type:'strength',primary:['Biceps'],visual:'preacher-curl',alternatives:['Cable Preacher Curl']}),
  e({id:'cable-rope-hammer-curl',name:'Cable Rope Hammer Curl',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Brachialis','Brachioradialis'],secondary:['Biceps','Forearms'],visual:'hammer-curl'}),
  e({id:'cable-biceps-curl',name:'Cable Biceps Curl',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Biceps brachii'],secondary:['Brachialis'],visual:'biceps-curl',alternatives:['Single-Arm Cable Biceps Curl']}),
];

const pullCooldown: Exercise[] = [
  e({id:'lat-stretch-pull',name:'Lat Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Lats'],visual:'lat-stretch'}),
  e({id:'childs-pose-side-reach',name:"Child's Pose + Side Reach",sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Lats','Upper back'],visual:'child-pose'}),
  e({id:'rear-delt-upper-back-stretch',name:'Rear-Delt / Upper-Back Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Rear delts','Upper back'],visual:'rear-delt-stretch'}),
  e({id:'biceps-wall-stretch',name:'Biceps Wall Stretch',sets:3,reps:'20 sec / side',unilateral:true,type:'stretch',primary:['Biceps'],visual:'biceps-stretch'}),
  e({id:'chin-tucks-pull-cooldown',name:'Chin Tucks',sets:3,reps:'8 slow reps',minReps:8,maxReps:8,type:'recovery',primary:['Deep neck flexors'],visual:'chin-tuck'}),
];

const legWarmup: Exercise[] = [
  e({id:'leg-cardio-warmup',name:'Bike / Treadmill / Elliptical',sets:1,reps:'5–7 min',type:'cardio',primary:['Full body'],visual:'bike',timedMinutes:[5,7]}),
  e({id:'hip-circles',name:'Hip Circles',sets:3,reps:'8 each direction / side',unilateral:true,type:'warmup',primary:['Hips'],visual:'hip-circle'}),
  e({id:'leg-swings-front-back',name:'Leg Swings — Front / Back',sets:3,reps:'10 / leg',unilateral:true,type:'warmup',primary:['Hips','Hamstrings'],visual:'leg-swing'}),
  e({id:'leg-swings-side',name:'Leg Swings — Side-to-Side',sets:3,reps:'10 / leg',unilateral:true,type:'warmup',primary:['Hips','Adductors','Abductors'],visual:'leg-swing-side'}),
  e({id:'bodyweight-squat',name:'Bodyweight Squat',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'warmup',primary:['Quads','Glutes'],visual:'squat',note:'Use comfortable depth.'}),
  e({id:'glute-bridge',name:'Glute Bridge',sets:3,reps:'10–12',minReps:10,maxReps:12,type:'warmup',primary:['Glutes'],visual:'glute-bridge'}),
  e({id:'hip-hinge-drill',name:'Hip-Hinge Drill',sets:3,reps:'8',minReps:8,maxReps:8,type:'warmup',primary:['Hamstrings','Glutes'],visual:'hinge'}),
  e({id:'leg-press-warmup',name:'Sled 45° Leg Press — Warm-Up',sets:3,reps:'12–15 / 8 / 3–5',type:'warmup',primary:['Quads','Glutes'],visual:'leg-press',note:'Very light → moderate-light → optional heavier ramp-up.'}),
];

const legMain: Exercise[] = [
  e({id:'sled-45-leg-press',name:'Sled 45° Leg Press',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Quadriceps','Glutes'],secondary:['Hamstrings'],visual:'leg-press',alternatives:['Machine Leg Press','Single-Leg Press']}),
  e({id:'lever-seated-leg-curl',name:'Lever Seated Leg Curl',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Hamstrings'],visual:'leg-curl',alternatives:['Single-Leg Curl']}),
  e({id:'lever-leg-extension',name:'Lever Leg Extension',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Quadriceps'],visual:'leg-extension',alternatives:['Single-Leg Extension']}),
  e({id:'machine-hip-thrust',name:'Machine Hip Thrust / Glute Drive',sets:3,reps:'8–12',minReps:8,maxReps:12,type:'strength',primary:['Glutes'],visual:'hip-thrust',alternatives:['Cable Pull-Through']}),
  e({id:'romanian-deadlift',name:'Romanian Deadlift',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'strength',primary:['Hamstrings','Glutes'],secondary:['Spinal erectors'],visual:'rdl',note:'Optional / Technique Learning until the hip hinge feels comfortable.',optional:true,alternatives:['Cable Pull-Through']}),
  e({id:'lever-seated-calf-press',name:'Lever Seated Calf Press / Calf Raise',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'strength',primary:['Calves'],visual:'calf-raise',alternatives:['Single-Leg Calf Raise']}),
  e({id:'captains-chair-knee-raise',name:"Captain's Chair Knee Raise / Machine Knee Raise",sets:3,reps:'8–15',minReps:8,maxReps:15,type:'core',primary:['Abs'],secondary:['Hip flexors'],visual:'knee-raise'}),
  e({id:'machine-ab-crunch',name:'Machine Ab Crunch',sets:3,reps:'10–15',minReps:10,maxReps:15,type:'core',primary:['Rectus abdominis'],visual:'ab-crunch'}),
];

const legCooldown: Exercise[] = [
  e({id:'hamstring-stretch',name:'Hamstring Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Hamstrings'],visual:'hamstring-stretch'}),
  e({id:'quad-stretch',name:'Quad Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Quadriceps'],visual:'quad-stretch'}),
  e({id:'hip-flexor-stretch',name:'Hip-Flexor Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Hip flexors'],visual:'hip-flexor-stretch'}),
  e({id:'figure-four-stretch',name:'Figure-4 Glute Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Glutes'],visual:'figure-four'}),
  e({id:'calf-stretch',name:'Calf Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Calves'],visual:'calf-stretch'}),
  e({id:'easy-walk-cooldown',name:'Easy Walking',sets:1,reps:'3–5 min',type:'recovery',primary:['Recovery'],visual:'walk',timedMinutes:[3,5]}),
];

const tuesdayRecovery: Exercise[] = [
  e({id:'tue-walk',name:'Easy Walking',sets:1,reps:'20–30 min',type:'cardio',primary:['Recovery'],visual:'walk',timedMinutes:[20,30]}),
  e({id:'tue-chin-tucks',name:'Chin Tucks',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'recovery',primary:['Deep neck flexors'],visual:'chin-tuck'}),
  e({id:'tue-wall-slides',name:'Wall Slides',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'recovery',primary:['Shoulders','Upper back'],visual:'wall-slide'}),
  e({id:'tue-doorway-stretch',name:'Doorway Chest Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Chest'],visual:'chest-stretch'}),
  e({id:'tue-thoracic-mobility',name:'Thoracic Mobility',sets:1,reps:'2–3 min',type:'recovery',primary:['Thoracic spine'],visual:'mobility',timedMinutes:[2,3]}),
  e({id:'tue-cycle',name:'Optional Easy Cycling',sets:1,reps:'10–20 min',type:'cardio',primary:['Recovery'],visual:'bike',timedMinutes:[10,20],optional:true}),
];

const thursdayRecovery: Exercise[] = [
  e({id:'thu-walk',name:'Walking',sets:1,reps:'20–30 min',type:'cardio',primary:['Recovery'],visual:'walk',timedMinutes:[20,30]}),
  e({id:'thu-wall-slides',name:'Wall Slides',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'recovery',primary:['Shoulders','Upper back'],visual:'wall-slide'}),
  e({id:'thu-chin-tucks',name:'Chin Tucks',sets:3,reps:'8–10',minReps:8,maxReps:10,type:'recovery',primary:['Deep neck flexors'],visual:'chin-tuck'}),
  e({id:'thu-pec-stretch',name:'Gentle Pec Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Chest'],visual:'chest-stretch'}),
  e({id:'thu-lat-stretch',name:'Gentle Lat Stretch',sets:3,reps:'20–30 sec / side',unilateral:true,type:'stretch',primary:['Lats'],visual:'lat-stretch'}),
  e({id:'thu-cycle',name:'Optional Easy Cycling',sets:1,reps:'10–20 min',type:'cardio',primary:['Recovery'],visual:'bike',timedMinutes:[10,20],optional:true}),
];

const saturdayCardio: Exercise[] = [
  e({id:'sat-walking',name:'Walking',sets:1,reps:'30–45 min',type:'cardio',primary:['Cardiovascular fitness'],visual:'walk',timedMinutes:[30,45],optional:true}),
  e({id:'sat-cycling',name:'Easy Cycling',sets:1,reps:'20–30 min',type:'cardio',primary:['Cardiovascular fitness'],visual:'bike',timedMinutes:[20,30],optional:true}),
  e({id:'sat-elliptical',name:'Easy Elliptical',sets:1,reps:'20–30 min',type:'cardio',primary:['Cardiovascular fitness'],visual:'elliptical',timedMinutes:[20,30],optional:true}),
  e({id:'sat-mobility',name:'Optional Mobility / Stretching',sets:1,reps:'5–10 min',type:'recovery',primary:['Mobility'],visual:'mobility',timedMinutes:[5,10],optional:true}),
];

export const weeklyPlans: Record<number, DayPlan> = {
  1: {weekday:1,title:'PUSH + ABS',subtitle:'Chest • Shoulders • Triceps • Core',kind:'push',warmup:pushWarmup,main:pushMain,cooldown:pushCooldown},
  2: {weekday:2,title:'ACTIVE RECOVERY',subtitle:'Move • Mobilize • Recover',kind:'recovery',warmup:[],main:tuesdayRecovery,cooldown:[]},
  3: {weekday:3,title:'PULL',subtitle:'Back • Rear Delts • Biceps',kind:'pull',warmup:pullWarmup,main:pullMain,cooldown:pullCooldown},
  4: {weekday:4,title:'ACTIVE RECOVERY',subtitle:'Move • Mobilize • Recover',kind:'recovery',warmup:[],main:thursdayRecovery,cooldown:[]},
  5: {weekday:5,title:'LEGS + ABS',subtitle:'Quads • Hamstrings • Glutes • Calves • Core',kind:'legs',warmup:legWarmup,main:legMain,cooldown:legCooldown},
  6: {weekday:6,title:'LIGHT CARDIO + MOBILITY',subtitle:'Choose one easy cardio option • Optional mobility',kind:'cardio',warmup:[],main:saturdayCardio,cooldown:[]},
  0: {weekday:0,title:'COMPLETE REST',subtitle:'Recover • Sleep • Reset',kind:'rest',warmup:[],main:[],cooldown:[]},
};

export const dayOrder = [1,2,3,4,5,6,0];
export const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function allExercises(): Exercise[] {
  const seen = new Map<string, Exercise>();
  Object.values(weeklyPlans).forEach(plan => [...plan.warmup,...plan.main,...plan.cooldown].forEach(ex => seen.set(ex.id,ex)));
  return [...seen.values()];
}

export function findExercise(id: string): Exercise | undefined {
  return allExercises().find(ex => ex.id === id);
}

export function applyRoutineOverrides(plan: DayPlan, overrides: Record<string,{enabled?:boolean;sets?:number;reps?:string;order?:number}>): DayPlan {
  const apply = (items: Exercise[]) => items
    .filter(ex => overrides[ex.id]?.enabled !== false)
    .map(ex => ({...ex,sets:overrides[ex.id]?.sets ?? ex.sets,reps:overrides[ex.id]?.reps ?? ex.reps}))
    .sort((a,b)=>(overrides[a.id]?.order ?? 999)-(overrides[b.id]?.order ?? 999));
  return {...plan,warmup:apply(plan.warmup),main:apply(plan.main),cooldown:apply(plan.cooldown)};
}
