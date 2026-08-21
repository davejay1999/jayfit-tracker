export type StockExerciseMedia = {
  folder: string;
  sourceName: string;
  note?: string;
};

// Source: yuhonas/free-exercise-db — public domain / Unlicense.
// Each folder contains 0.jpg (start) and 1.jpg (end). JayFit animates the
// two real exercise frames in the active workout view and uses frame 0 as
// the lightweight card thumbnail.
export const STOCK_MEDIA: Record<string, StockExerciseMedia> = {
  // Push / chest / shoulders / triceps
  'chest-press': { folder: 'Leverage_Incline_Chest_Press', sourceName: 'Leverage Incline Chest Press' },
  'shoulder-press': { folder: 'Seated_Cable_Shoulder_Press', sourceName: 'Seated Cable Shoulder Press' },
  'pec-deck': { folder: 'Butterfly', sourceName: 'Butterfly' },
  'lateral-raise': { folder: 'Side_Lateral_Raise', sourceName: 'Side Lateral Raise' },
  'pushdown': { folder: 'Triceps_Pushdown_-_Rope_Attachment', sourceName: 'Triceps Pushdown - Rope Attachment' },
  'overhead-triceps': { folder: 'Cable_Rope_Overhead_Triceps_Extension', sourceName: 'Cable Rope Overhead Triceps Extension' },
  'cable-crunch': { folder: 'Cable_Crunch', sourceName: 'Cable Crunch' },
  'pallof': { folder: 'Pallof_Press', sourceName: 'Pallof Press' },
  'pushup': { folder: 'Incline_Push-Up', sourceName: 'Incline Push-Up' },
  'external-rotation': { folder: 'External_Rotation_with_Cable', sourceName: 'External Rotation with Cable' },

  // Pull / back / biceps
  'pulldown': { folder: 'Wide-Grip_Lat_Pulldown', sourceName: 'Wide-Grip Lat Pulldown' },
  'row': { folder: 'Seated_Cable_Rows', sourceName: 'Seated Cable Rows' },
  'reverse-fly': { folder: 'Reverse_Flyes', sourceName: 'Reverse Flyes' },
  'straight-arm-pulldown': { folder: 'Straight-Arm_Pulldown', sourceName: 'Straight-Arm Pulldown' },
  'preacher-curl': { folder: 'Machine_Preacher_Curls', sourceName: 'Machine Preacher Curls' },
  'hammer-curl': { folder: 'Cable_Hammer_Curls_-_Rope_Attachment', sourceName: 'Cable Hammer Curls - Rope Attachment' },
  'biceps-curl': { folder: 'Standing_Biceps_Cable_Curl', sourceName: 'Standing Biceps Cable Curl' },
  'face-pull': { folder: 'Face_Pull', sourceName: 'Face Pull' },
  'scapular-pulldown': { folder: 'Scapular_Pull-Up', sourceName: 'Scapular Pull-Up', note: 'Closest stock demonstration for scapular depression.' },

  // Legs / glutes / abs
  'leg-press': { folder: 'Leg_Press', sourceName: 'Leg Press' },
  'leg-curl': { folder: 'Seated_Leg_Curl', sourceName: 'Seated Leg Curl' },
  'leg-extension': { folder: 'Leg_Extensions', sourceName: 'Leg Extensions' },
  'hip-thrust': { folder: 'Barbell_Hip_Thrust', sourceName: 'Barbell Hip Thrust', note: 'Same hip-thrust pattern; machine setup differs.' },
  'rdl': { folder: 'Romanian_Deadlift_from_Deficit', sourceName: 'Romanian Deadlift from Deficit', note: 'Same hinge pattern; do not copy the deficit unless prescribed.' },
  'calf-raise': { folder: 'Seated_Calf_Raise', sourceName: 'Seated Calf Raise' },
  'knee-raise': { folder: 'Knee_Hip_Raise_On_Parallel_Bars', sourceName: 'Knee/Hip Raise On Parallel Bars' },
  'ab-crunch': { folder: 'Ab_Crunch_Machine', sourceName: 'Ab Crunch Machine' },
  'squat': { folder: 'Bodyweight_Squat', sourceName: 'Bodyweight Squat' },
  'glute-bridge': { folder: 'Single_Leg_Glute_Bridge', sourceName: 'Single Leg Glute Bridge', note: 'Use both feet for the JayFit bilateral warm-up.' },
  'hinge': { folder: 'Good_Morning', sourceName: 'Good Morning', note: 'Used only to visualize the hip-hinge pattern.' },

  // Mobility / warm-up
  'arm-circles': { folder: 'Arm_Circles', sourceName: 'Arm Circles' },
  'scapula': { folder: 'Band_Pull_Apart', sourceName: 'Band Pull Apart', note: 'Closest public-domain visual for scapular retraction.' },
  'wall-slide': { folder: 'Shoulder_Stretch', sourceName: 'Shoulder Stretch', note: 'Mobility visual; follow JayFit wall-slide instructions.' },
  'cat-cow': { folder: 'Cat_Stretch', sourceName: 'Cat Stretch' },
  'rotation': { folder: 'Standing_Torso_Twist_Stretch', sourceName: 'Standing Torso Twist Stretch' },
  'hip-circle': { folder: 'Standing_Hip_Circles', sourceName: 'Standing Hip Circles' },
  'leg-swing': { folder: 'Dynamic_Leg_Swing_Stretch', sourceName: 'Dynamic Leg Swing Stretch' },
  'leg-swing-side': { folder: 'Adductor_Groin', sourceName: 'Adductor/Groin', note: 'Closest public-domain lateral hip mobility visual.' },

  // Cooldown / stretching
  'chest-stretch': { folder: 'Chest_Stretch_on_Stability_Ball', sourceName: 'Chest Stretch on Stability Ball', note: 'Follow the JayFit doorway-stretch positioning.' },
  'triceps-stretch': { folder: 'Overhead_Triceps', sourceName: 'Overhead Triceps' },
  'shoulder-stretch': { folder: 'Shoulder_Stretch', sourceName: 'Shoulder Stretch' },
  'neck-stretch': { folder: 'Side_Neck_Stretch', sourceName: 'Side Neck Stretch' },
  'lat-stretch': { folder: 'Latissimus_Dorsi-SMR', sourceName: 'Latissimus Dorsi-SMR', note: 'Closest stock lat-lengthening visual; follow the prescribed stretch.' },
  'child-pose': { folder: 'Childs_Pose', sourceName: "Child's Pose" },
  'rear-delt-stretch': { folder: 'Shoulder_Stretch', sourceName: 'Shoulder Stretch' },
  'biceps-stretch': { folder: 'Seated_Biceps', sourceName: 'Seated Biceps' },
  'chin-tuck': { folder: 'Seated_Head_Harness_Neck_Resistance', sourceName: 'Seated Head Harness Neck Resistance', note: 'Reference posture only; perform unloaded chin tucks as prescribed.' },
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
  'breathing': { folder: 'Childs_Pose', sourceName: "Child's Pose", note: 'Calm recovery visual; use JayFit breathing instructions.' },
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
