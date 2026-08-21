export type StockExerciseMedia = {
  folder: string;
  sourceName: string;
  note?: string;
};

// Source: yuhonas/free-exercise-db — public domain / Unlicense.
// Every source folder contains a start frame (0.jpg) and end frame (1.jpg).
// JayFit animates those real exercise photos for the active workout and uses
// the first frame as a lightweight thumbnail elsewhere.
export const STOCK_MEDIA: Record<string, StockExerciseMedia> = {
  // Push / chest / shoulders / triceps
  'chest-press': { folder: 'Leverage_Incline_Chest_Press', sourceName: 'Leverage Incline Chest Press', note: 'Closest machine chest-press stock demo; use JayFit seat/handle setup.' },
  'shoulder-press': { folder: 'Machine_Shoulder_Military_Press', sourceName: 'Machine Shoulder (Military) Press' },
  'pec-deck': { folder: 'Butterfly', sourceName: 'Butterfly' },
  'lateral-raise': { folder: 'Side_Lateral_Raise', sourceName: 'Side Lateral Raise', note: 'Same shoulder movement pattern; your programmed machine provides the resistance.' },
  'pushdown': { folder: 'Triceps_Pushdown_-_Rope_Attachment', sourceName: 'Triceps Pushdown - Rope Attachment' },
  'overhead-triceps': { folder: 'Cable_Rope_Overhead_Triceps_Extension', sourceName: 'Cable Rope Overhead Triceps Extension' },
  'cable-crunch': { folder: 'Cable_Crunch', sourceName: 'Cable Crunch' },
  'pallof': { folder: 'Pallof_Press', sourceName: 'Pallof Press' },
  'pushup': { folder: 'Incline_Push-Up', sourceName: 'Incline Push-Up' },
  'external-rotation': { folder: 'External_Rotation_with_Cable', sourceName: 'External Rotation with Cable' },

  // Pull / back / biceps
  'pulldown': { folder: 'Wide-Grip_Lat_Pulldown', sourceName: 'Wide-Grip Lat Pulldown' },
  'row': { folder: 'Seated_Cable_Rows', sourceName: 'Seated Cable Rows' },
  'reverse-fly': { folder: 'Reverse_Flyes', sourceName: 'Reverse Flyes', note: 'Same rear-delt motion pattern; use your programmed machine.' },
  'straight-arm-pulldown': { folder: 'Straight-Arm_Pulldown', sourceName: 'Straight-Arm Pulldown' },
  'preacher-curl': { folder: 'Machine_Preacher_Curls', sourceName: 'Machine Preacher Curls' },
  'hammer-curl': { folder: 'Cable_Hammer_Curls_-_Rope_Attachment', sourceName: 'Cable Hammer Curls - Rope Attachment' },
  'biceps-curl': { folder: 'Standing_Biceps_Cable_Curl', sourceName: 'Standing Biceps Cable Curl' },
  'face-pull': { folder: 'Face_Pull', sourceName: 'Face Pull' },
  'scapular-pulldown': { folder: 'Scapular_Pull-Up', sourceName: 'Scapular Pull-Up', note: 'Same scapular-depression pattern; your warm-up uses a pulldown station.' },

  // Legs / glutes / abs
  'leg-press': { folder: 'Leg_Press', sourceName: 'Leg Press' },
  'leg-curl': { folder: 'Seated_Leg_Curl', sourceName: 'Seated Leg Curl' },
  'leg-extension': { folder: 'Leg_Extensions', sourceName: 'Leg Extensions' },
  'hip-thrust': { folder: 'Barbell_Hip_Thrust', sourceName: 'Barbell Hip Thrust', note: 'Same hip-thrust pattern; your programmed glute-drive machine changes the setup.' },
  'rdl': { folder: 'Romanian_Deadlift_from_Deficit', sourceName: 'Romanian Deadlift from Deficit', note: 'Use only the hinge pattern shown; JayFit does not prescribe a deficit.' },
  'calf-raise': { folder: 'Seated_Calf_Raise', sourceName: 'Seated Calf Raise' },
  'knee-raise': { folder: 'Knee_Hip_Raise_On_Parallel_Bars', sourceName: 'Knee/Hip Raise On Parallel Bars' },
  'ab-crunch': { folder: 'Ab_Crunch_Machine', sourceName: 'Ab Crunch Machine' },
  'squat': { folder: 'Bodyweight_Squat', sourceName: 'Bodyweight Squat' },
  'glute-bridge': { folder: 'Single_Leg_Glute_Bridge', sourceName: 'Single Leg Glute Bridge', note: 'Use both feet for the programmed bilateral glute bridge.' },
  'hinge': { folder: 'Good_Morning', sourceName: 'Good Morning', note: 'Reference the hip-hinge shape only; this warm-up is unloaded.' },

  // Mobility / warm-up
  'arm-circles': { folder: 'Arm_Circles', sourceName: 'Arm Circles' },
  'scapula': { folder: 'Band_Pull_Apart', sourceName: 'Band Pull Apart', note: 'Used to visualize shoulder-blade retraction.' },
  'wall-slide': { folder: 'Round_The_World_Shoulder_Stretch', sourceName: 'Round The World Shoulder Stretch', note: 'Shoulder-mobility reference; follow JayFit wall-slide instructions.' },
  'cat-cow': { folder: 'Cat_Stretch', sourceName: 'Cat Stretch' },
  'rotation': { folder: 'Standing_Cable_Wood_Chop', sourceName: 'Standing Cable Wood Chop', note: 'Rotation visual only; perform the unloaded thoracic rotation prescribed by JayFit.' },
  'hip-circle': { folder: 'Standing_Hip_Circles', sourceName: 'Standing Hip Circles' },
  'leg-swing': { folder: 'Front_Leg_Raises', sourceName: 'Front Leg Raises' },
  'leg-swing-side': { folder: 'Side_Leg_Raises', sourceName: 'Side Leg Raises' },

  // Cooldown / stretching
  'chest-stretch': { folder: 'Chest_And_Front_Of_Shoulder_Stretch', sourceName: 'Chest And Front Of Shoulder Stretch', note: 'Follow JayFit doorway positioning.' },
  'triceps-stretch': { folder: 'Overhead_Triceps', sourceName: 'Overhead Triceps' },
  'shoulder-stretch': { folder: 'Shoulder_Stretch', sourceName: 'Shoulder Stretch' },
  'neck-stretch': { folder: 'Side_Neck_Stretch', sourceName: 'Side Neck Stretch' },
  'lat-stretch': { folder: 'Latissimus_Dorsi-SMR', sourceName: 'Latissimus Dorsi-SMR', note: 'Lat-position reference; follow the gentler JayFit stretch instructions.' },
  'child-pose': { folder: 'Childs_Pose', sourceName: "Child's Pose" },
  'rear-delt-stretch': { folder: 'Shoulder_Stretch', sourceName: 'Shoulder Stretch', note: 'Closest public-domain upper-back/rear-delt stretch demo.' },
  'biceps-stretch': { folder: 'Standing_Biceps_Stretch', sourceName: 'Standing Biceps Stretch' },
  'chin-tuck': { folder: 'Side_Neck_Stretch', sourceName: 'Side Neck Stretch', note: 'Posture reference only; perform unloaded chin tucks as prescribed.' },
  'hamstring-stretch': { folder: '90_90_Hamstring', sourceName: '90/90 Hamstring' },
  'quad-stretch': { folder: 'All_Fours_Quad_Stretch', sourceName: 'All Fours Quad Stretch' },
  'hip-flexor-stretch': { folder: 'Standing_Hip_Flexors', sourceName: 'Standing Hip Flexors' },
  'figure-four': { folder: 'Seated_Glute', sourceName: 'Seated Glute' },
  'calf-stretch': { folder: 'Standing_Hamstring_and_Calf_Stretch', sourceName: 'Standing Hamstring and Calf Stretch' },

  // Cardio / recovery
  'cardio': { folder: 'Elliptical_Trainer', sourceName: 'Elliptical Trainer' },
  'bike': { folder: 'Bicycling_Stationary', sourceName: 'Bicycling, Stationary' },
  'elliptical': { folder: 'Elliptical_Trainer', sourceName: 'Elliptical Trainer' },
  'walk': { folder: 'Walking_Treadmill', sourceName: 'Walking, Treadmill' },
  'breathing': { folder: 'Childs_Pose', sourceName: "Child's Pose", note: 'Calm recovery visual; use the JayFit breathing instructions.' },
};

export const PUBLIC_DOMAIN_IMAGE_ROOT = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export function stockFrameUrls(visual: string) {
  const media = STOCK_MEDIA[visual];
  if (!media) return null;
  return {
    first: `${PUBLIC_DOMAIN_IMAGE_ROOT}/${media.folder}/0.jpg`,
    second: `${PUBLIC_DOMAIN_IMAGE_ROOT}/${media.folder}/1.jpg`,
    ...media,
  };
}
