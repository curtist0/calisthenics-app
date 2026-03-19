// Conditioning and prep exercises that help build toward specific skills
// These are supplementary movements that strengthen weak links needed for each skill

export interface ConditioningExercise {
  name: string;
  description: string;
  sets: number;
  reps: string; // e.g. "10" or "30s" for holds
  reason: string; // why this helps
}

// Maps a target skill to conditioning exercises that prepare the body for it
export const skillConditioning: Record<string, ConditioningExercise[]> = {
  "elbow-lever": [
    { name: "Reverse Hand Push-Ups", description: "Push-ups with fingers pointing toward feet", sets: 3, reps: "8", reason: "Builds wrist strength and flexibility needed for elbow lever" },
    { name: "Wrist Push-Up Position Holds", description: "Hold push-up position with fingers pointing backward", sets: 3, reps: "20s", reason: "Conditions wrists for the elbow pressure" },
    { name: "Plank Lean Forward", description: "In plank, lean shoulders past wrists", sets: 3, reps: "15s", reason: "Teaches the forward lean balance" },
  ],
  "crow-pose": [
    { name: "Wrist Circles & Stretches", description: "Circle wrists in both directions, then stretch extensors", sets: 2, reps: "30s each", reason: "Wrist mobility for supporting bodyweight" },
    { name: "Frog Stand on Fingertips", description: "Squat with hands on floor, shift weight forward onto fingertips", sets: 3, reps: "15s", reason: "Builds finger and wrist strength for crow balance" },
    { name: "Knee-to-Elbow Plank", description: "From plank, bring knee to same-side elbow and hold", sets: 3, reps: "5 each side", reason: "Mimics the crow position and builds core control" },
  ],
  "l-sit": [
    { name: "Seated Leg Raises", description: "Sit with hands beside hips, lift straight legs off floor", sets: 3, reps: "10", reason: "Builds hip flexor compression needed for L-sit" },
    { name: "Parallette Support Hold", description: "Press up on parallettes or floor, hold body off ground with bent knees", sets: 3, reps: "20s", reason: "Builds shoulder depression strength" },
    { name: "Tucked L-Sit", description: "L-sit position but with knees bent/tucked", sets: 3, reps: "15s", reason: "Easier L-sit progression building toward straight legs" },
  ],
  "handstand-push-up": [
    { name: "Wall Shoulder Taps", description: "In wall handstand, lift one hand to tap shoulder", sets: 3, reps: "5 each", reason: "Builds overhead stability and balance" },
    { name: "Elevated Pike Push-Ups", description: "Pike push-ups with feet on a box for steeper angle", sets: 3, reps: "8", reason: "Closer to vertical pressing angle of HSPU" },
    { name: "Wall Handstand Hold", description: "Hold a wall-assisted handstand for time", sets: 3, reps: "30s", reason: "Builds shoulder endurance in inverted position" },
  ],
  "freestanding-handstand": [
    { name: "Wall Handstand Toe Pulls", description: "In wall handstand, slowly pull toes off wall", sets: 3, reps: "5 × 5s", reason: "Teaches freestanding balance from wall support" },
    { name: "Kick-Up Practice", description: "Practice kicking up to handstand (use spotter or wall)", sets: 5, reps: "3 attempts", reason: "Builds the kick-up motor pattern" },
    { name: "Chest-to-Wall Handstand", description: "Face the wall, walk feet up into handstand with chest touching wall", sets: 3, reps: "20s", reason: "Better alignment than back-to-wall" },
  ],
  "muscle-up": [
    { name: "High Pull-Ups", description: "Pull-ups pulling to sternum/chest level", sets: 3, reps: "5", reason: "Builds explosive pulling height needed for transition" },
    { name: "Straight Bar Dips", description: "Dips on a pull-up bar (top of muscle-up position)", sets: 3, reps: "8", reason: "Strengthens the transition and push phase" },
    { name: "Negative Muscle-Ups", description: "Start above bar, slowly lower through the transition", sets: 3, reps: "3", reason: "Teaches the transition pattern eccentrically" },
  ],
  "tuck-planche": [
    { name: "Planche Lean", description: "From push-up position, lean shoulders far past wrists", sets: 3, reps: "15s", reason: "Builds straight-arm shoulder strength" },
    { name: "Pseudo Planche Push-Ups", description: "Push-ups with hands by hips, fingers back", sets: 3, reps: "8", reason: "Strengthens the planche-specific pressing angle" },
    { name: "Band-Assisted Tuck Planche", description: "Use a resistance band for support in tuck planche", sets: 3, reps: "10s", reason: "Allows longer hold times to build endurance" },
  ],
  "front-lever": [
    { name: "Active Hang Lat Pulls", description: "Hang and depress/retract shoulders without bending arms", sets: 3, reps: "10", reason: "Builds lat engagement needed for lever" },
    { name: "Tuck Front Lever Raises", description: "From hang, pull into tuck front lever and lower", sets: 3, reps: "5", reason: "Dynamic front lever strength" },
    { name: "Dragon Flag Negatives", description: "Slowly lower from vertical to horizontal on a bench", sets: 3, reps: "3", reason: "Builds anti-extension core strength" },
  ],
  "back-lever": [
    { name: "German Hang", description: "Hang with arms behind you (end position of skin the cat)", sets: 3, reps: "15s", reason: "Builds shoulder extension flexibility" },
    { name: "Skin the Cat", description: "Full rotation through on bar or rings", sets: 3, reps: "5", reason: "Progressive shoulder conditioning for back lever" },
    { name: "Tuck Back Lever", description: "Back lever position with knees tucked", sets: 3, reps: "10s", reason: "Easier back lever progression" },
  ],
  "pistol-squat": [
    { name: "Assisted Pistol Squat", description: "Hold a pole or door frame for balance, do single-leg squat", sets: 3, reps: "5 each", reason: "Builds single-leg strength with support" },
    { name: "Box Pistol Squat", description: "Sit to a box/chair on one leg, stand up", sets: 3, reps: "6 each", reason: "Limits range of motion to build up progressively" },
    { name: "Cossack Squat", description: "Wide squat shifting weight to one leg", sets: 3, reps: "8 each", reason: "Builds lateral single-leg strength and mobility" },
  ],
  "dragon-flag": [
    { name: "Lying Leg Raises", description: "Lie on back, raise straight legs to 90°", sets: 3, reps: "12", reason: "Builds core anti-extension strength" },
    { name: "Eccentric Dragon Flag", description: "Start vertical, slowly lower body like a rigid plank", sets: 3, reps: "3", reason: "Negative-only builds strength for the full movement" },
    { name: "Single Leg Dragon Flag", description: "Dragon flag with one leg bent to reduce leverage", sets: 3, reps: "5", reason: "Reduced difficulty while maintaining the pattern" },
  ],
};

// Get conditioning exercises for a target skill
export function getConditioningForSkill(skillId: string): ConditioningExercise[] {
  return skillConditioning[skillId] || [];
}
