import { PrismaClient, ExerciseType, BodyRegion, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

type SeedExercise = {
  name: string;
  description: string;
  instructions: string;
  type: ExerciseType;
  region: BodyRegion;
  difficulty: Difficulty;
  equipment: string[];
  sets?: number;
  reps?: string;
  durationSec?: number;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const exercises: SeedExercise[] = [
  // STRENGTH
  { name: "Bodyweight Squat", description: "Foundational squat pattern for leg strength.", instructions: "Feet shoulder-width apart, sit hips back and down, keep chest tall, drive through heels to stand.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "12-15" },
  { name: "Goblet Squat", description: "Loaded squat using a dumbbell held at chest.", instructions: "Hold a dumbbell vertically at chest, squat between knees, keep elbows inside knees at bottom.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["Dumbbells"], sets: 3, reps: "10-12" },
  { name: "Barbell Back Squat", description: "Heavy compound squat for max leg strength.", instructions: "Bar on upper traps, brace core, squat to at least parallel, drive up through midfoot.", type: "STRENGTH", region: "QUAD", difficulty: "ADVANCED", equipment: ["Barbell", "Gym access"], sets: 4, reps: "5-8" },
  { name: "Romanian Deadlift", description: "Hip-hinge movement targeting hamstrings and glutes.", instructions: "Soft knees, hinge at hips pushing hips back, lower bar/dumbbells along shins, squeeze glutes to return.", type: "STRENGTH", region: "HAMSTRING", difficulty: "INTERMEDIATE", equipment: ["Dumbbells", "Barbell"], sets: 3, reps: "8-10" },
  { name: "Bulgarian Split Squat", description: "Single-leg squat with rear foot elevated.", instructions: "Rear foot on bench, lower front knee toward floor, keep torso upright, drive through front heel.", type: "STRENGTH", region: "QUAD", difficulty: "INTERMEDIATE", equipment: ["Dumbbells", "None (bodyweight)"], sets: 3, reps: "8-10 each" },
  { name: "Walking Lunge", description: "Dynamic single-leg strength movement.", instructions: "Step forward into a lunge, both knees to ~90°, push off front foot into next step.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)", "Dumbbells"], sets: 3, reps: "10 each" },
  { name: "Reverse Lunge", description: "Lunge variation that's easier on the knees.", instructions: "Step backward into a lunge, lower rear knee toward floor, push through front heel to return.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "10 each" },
  { name: "Hip Thrust", description: "Glute-focused hip extension exercise.", instructions: "Shoulders on bench, feet flat, drive hips up squeezing glutes, hold briefly at top.", type: "STRENGTH", region: "GLUTE", difficulty: "BEGINNER", equipment: ["None (bodyweight)", "Barbell"], sets: 3, reps: "12-15" },
  { name: "Glute Bridge", description: "Bodyweight glute activation exercise.", instructions: "Lie on back, feet flat, drive hips up, squeeze glutes at top, lower slowly.", type: "STRENGTH", region: "GLUTE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "15" },
  { name: "Single-Leg Glute Bridge", description: "Unilateral glute bridge for symmetry.", instructions: "One foot planted, other leg extended, drive hips up through planted heel.", type: "STRENGTH", region: "GLUTE", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], sets: 3, reps: "10 each" },
  { name: "Step-Up", description: "Functional single-leg strength on a box or bench.", instructions: "Step fully onto a box, drive through the lead leg, control the descent.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)", "Dumbbells"], sets: 3, reps: "10 each" },
  { name: "Nordic Hamstring Curl", description: "Eccentric hamstring strength for injury prevention.", instructions: "Kneel with ankles anchored, lower torso forward slowly under control, push back up.", type: "STRENGTH", region: "HAMSTRING", difficulty: "ADVANCED", equipment: ["Gym access"], sets: 3, reps: "6-8" },
  { name: "Standing Calf Raise", description: "Builds calf strength and ankle stability.", instructions: "Rise onto toes as high as possible, pause, lower slowly with control.", type: "STRENGTH", region: "CALF", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "15-20" },
  { name: "Seated Calf Raise", description: "Isolated soleus-focused calf exercise.", instructions: "Seated with weight on knees, raise heels, pause, lower under control.", type: "STRENGTH", region: "CALF", difficulty: "BEGINNER", equipment: ["Dumbbells", "Gym access"], sets: 3, reps: "15-20" },
  { name: "Leg Press", description: "Machine-based compound leg strength exercise.", instructions: "Feet shoulder-width on platform, lower until knees at ~90°, press through heels.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["Gym access"], sets: 3, reps: "10-12" },
  { name: "Leg Extension", description: "Isolated quadriceps machine exercise.", instructions: "Extend knees against resistance pad, pause at top, lower with control.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["Gym access"], sets: 3, reps: "12-15" },
  { name: "Leg Curl", description: "Isolated hamstring machine exercise.", instructions: "Curl heels toward glutes against resistance, pause, lower with control.", type: "STRENGTH", region: "HAMSTRING", difficulty: "BEGINNER", equipment: ["Gym access"], sets: 3, reps: "12-15" },
  { name: "Sumo Deadlift", description: "Wide-stance deadlift emphasizing inner thigh and glutes.", instructions: "Wide stance, grip inside knees, drive through floor keeping chest tall.", type: "STRENGTH", region: "GLUTE", difficulty: "ADVANCED", equipment: ["Barbell", "Gym access"], sets: 4, reps: "6-8" },
  { name: "Resistance Band Squat", description: "Band-loaded squat for home training.", instructions: "Stand on band, hold handles at shoulders, squat down and drive up against band tension.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["Resistance bands"], sets: 3, reps: "12-15" },
  { name: "Lateral Band Walk", description: "Hip abductor strength and stability exercise.", instructions: "Band around ankles, slight squat, step sideways keeping tension throughout.", type: "STRENGTH", region: "GLUTE", difficulty: "BEGINNER", equipment: ["Resistance bands"], sets: 3, reps: "10 steps each way" },
  { name: "Wall Sit", description: "Isometric quad endurance hold.", instructions: "Back flat against wall, knees at 90°, hold position for time.", type: "STRENGTH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 45 },
  { name: "Curtsy Lunge", description: "Lunge variation targeting glutes and inner thigh.", instructions: "Step one leg diagonally behind the other, lower into a lunge, return to start.", type: "STRENGTH", region: "GLUTE", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], sets: 3, reps: "10 each" },
  { name: "Box Jump", description: "Explosive lower-body power exercise.", instructions: "Swing arms, jump explosively onto a box, land softly with bent knees.", type: "STRENGTH", region: "FULL_LEG", difficulty: "ADVANCED", equipment: ["Gym access"], sets: 3, reps: "6-8" },

  // MOBILITY
  { name: "90/90 Hip Switch", description: "Improves internal and external hip rotation.", instructions: "Sit with both legs at 90°, rotate to switch sides keeping hips low and controlled.", type: "MOBILITY", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 2, reps: "8 each side" },
  { name: "World's Greatest Stretch", description: "Full-body mobility flow for hips and thoracic spine.", instructions: "Lunge forward, drop back hand to floor, rotate opposite arm up toward ceiling.", type: "MOBILITY", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 2, reps: "6 each side" },
  { name: "Deep Squat Hold", description: "Opens hips and ankles in a resting squat position.", instructions: "Squat down as deep as comfortable, elbows inside knees, hold and breathe.", type: "MOBILITY", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 60 },
  { name: "Ankle Dorsiflexion Rock", description: "Improves ankle range for squatting and running.", instructions: "Kneel in lunge, rock knee forward over toes without heel lifting, hold each rep briefly.", type: "MOBILITY", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "10 each" },
  { name: "Hip CARs", description: "Controlled articular rotations for hip joint health.", instructions: "Standing, slowly circle the knee through full range while keeping torso still.", type: "MOBILITY", region: "HIP", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], sets: 2, reps: "5 each direction" },
  { name: "Couch Stretch", description: "Deep hip flexor and quad stretch.", instructions: "Rear foot up against a wall or couch, front knee at 90°, sink hips forward.", type: "MOBILITY", region: "QUAD", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], durationSec: 45 },
  { name: "Pigeon Pose", description: "Deep hip external rotator stretch.", instructions: "Front shin angled across the body, back leg extended, fold forward over the front leg.", type: "MOBILITY", region: "HIP", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], durationSec: 45 },
  { name: "Ankle Circles", description: "Simple ankle joint mobility warm-up.", instructions: "Lift one foot off the ground, rotate the ankle slowly in both directions.", type: "MOBILITY", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 2, reps: "10 each direction" },
  { name: "Knee Circles", description: "Gentle knee joint mobility drill.", instructions: "Feet together, hands on knees, slight squat, circle knees together slowly.", type: "MOBILITY", region: "KNEE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 2, reps: "10 each direction" },
  { name: "Frog Stretch", description: "Opens hips and inner thighs deeply.", instructions: "On hands and knees, spread knees wide, rock hips back and forth gently.", type: "MOBILITY", region: "HIP", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], durationSec: 60 },
  { name: "Calf Wall Stretch", description: "Stretches gastrocnemius and soleus.", instructions: "Hands on wall, back leg straight, heel down, lean forward until a stretch is felt.", type: "MOBILITY", region: "CALF", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Standing Quad Stretch", description: "Classic quad stretch for tight thighs.", instructions: "Stand on one leg, pull the other heel toward glutes, keep knees close together.", type: "MOBILITY", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Seated Hamstring Stretch", description: "Improves hamstring flexibility.", instructions: "Sit with one leg extended, hinge forward from hips reaching toward the toes.", type: "MOBILITY", region: "HAMSTRING", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Butterfly Stretch", description: "Opens hips and groin.", instructions: "Sit with soles of feet together, gently press knees toward the floor.", type: "MOBILITY", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 45 },
  { name: "Spiderman Lunge with Rotation", description: "Dynamic hip and thoracic mobility drill.", instructions: "Lunge forward, plant hands inside foot, rotate torso toward the front leg.", type: "MOBILITY", region: "HIP", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], sets: 2, reps: "6 each side" },

  // REHAB
  { name: "Terminal Knee Extension", description: "Rehab exercise strengthening the last few degrees of knee extension.", instructions: "Band behind knee, slight bend, straighten the knee fully against band tension.", type: "REHAB", region: "KNEE", difficulty: "BEGINNER", equipment: ["Resistance bands"], sets: 3, reps: "12-15" },
  { name: "Quad Set", description: "Early-stage isometric quad activation post-injury.", instructions: "Sit with leg straight, press back of knee into floor, hold and squeeze quad.", type: "REHAB", region: "KNEE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "10 x 5s holds" },
  { name: "Straight Leg Raise", description: "Builds quad strength without bending the knee.", instructions: "Lying down, tighten quad, lift leg straight to hip height, lower slowly.", type: "REHAB", region: "KNEE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "10-12" },
  { name: "Clamshell", description: "Rehab exercise for hip stability and glute medius.", instructions: "Lying on side, knees bent, lift top knee while keeping feet together.", type: "REHAB", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "12-15 each side" },
  { name: "Ankle Alphabet", description: "Gentle range-of-motion rehab drill post ankle injury.", instructions: "Seated, trace each letter of the alphabet in the air with the toes.", type: "REHAB", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 1, reps: "1 alphabet" },
  { name: "Heel Slide", description: "Early knee rehab exercise to restore flexion range.", instructions: "Lying down, slowly slide heel toward glutes bending the knee, then slide back out.", type: "REHAB", region: "KNEE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "10-15" },
  { name: "Seated Ankle Pumps", description: "Improves circulation and range after ankle injury.", instructions: "Seated or lying, point toes away then flex back toward the shin repeatedly.", type: "REHAB", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "15-20" },
  { name: "Isometric Hamstring Bridge", description: "Low-load rehab hold for hamstring or lower back issues.", instructions: "Feet flat, lift hips slightly off the floor, hold without full glute drive.", type: "REHAB", region: "HAMSTRING", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], sets: 3, reps: "8 x 10s holds" },
  { name: "Standing Hip Abduction", description: "Rehab exercise for hip and knee stability.", instructions: "Hold onto support, lift leg out to the side keeping hips level, lower slowly.", type: "REHAB", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)", "Resistance bands"], sets: 3, reps: "12 each side" },
  { name: "Toe Raises for Plantar Fasciitis", description: "Gentle rehab for foot and calf issues.", instructions: "Seated, roll a ball or towel under the arch of the foot slowly back and forth.", type: "REHAB", region: "FOOT", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 60 },

  // BALANCE
  { name: "Single-Leg Stand", description: "Foundational balance and proprioception drill.", instructions: "Stand on one leg, keep hips level, hold as long as possible with good posture.", type: "BALANCE", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Single-Leg Stand with Eyes Closed", description: "Advanced proprioception challenge.", instructions: "Stand on one leg, close eyes, hold balance as long as possible.", type: "BALANCE", region: "ANKLE", difficulty: "ADVANCED", equipment: ["None (bodyweight)"], durationSec: 20 },
  { name: "Bosu Ball Balance", description: "Unstable-surface balance training.", instructions: "Stand on a bosu ball with feet together, engage core, hold steady.", type: "BALANCE", region: "FULL_LEG", difficulty: "INTERMEDIATE", equipment: ["Gym access"], durationSec: 30 },
  { name: "Single-Leg Romanian Deadlift", description: "Combines balance with posterior chain strength.", instructions: "Balance on one leg, hinge forward reaching toward the floor, return to standing.", type: "BALANCE", region: "HAMSTRING", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)", "Dumbbells"], sets: 3, reps: "8 each side" },
  { name: "Y-Balance Reach", description: "Dynamic single-leg balance and reach assessment/drill.", instructions: "Balance on one leg, reach the other leg forward, then to each side, without losing balance.", type: "BALANCE", region: "FULL_LEG", difficulty: "INTERMEDIATE", equipment: ["None (bodyweight)"], sets: 2, reps: "3 reaches each side" },
  { name: "Tandem Stance", description: "Narrow-base balance drill for ankle stability.", instructions: "Stand heel-to-toe in a straight line, hold position, switch front foot.", type: "BALANCE", region: "ANKLE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Single-Leg Hop and Hold", description: "Reactive balance and landing control drill.", instructions: "Hop forward on one leg, land softly and hold the landing position for 3 seconds.", type: "BALANCE", region: "FULL_LEG", difficulty: "ADVANCED", equipment: ["None (bodyweight)"], sets: 3, reps: "5 each side" },

  // STRETCH
  { name: "Standing Hamstring Stretch", description: "Simple standing stretch for hamstring flexibility.", instructions: "Place heel on a raised surface, keep leg straight, hinge forward slightly.", type: "STRETCH", region: "HAMSTRING", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Kneeling Hip Flexor Stretch", description: "Static stretch for the front of the hip.", instructions: "Kneel in a lunge, tuck pelvis under, push hips forward gently.", type: "STRETCH", region: "HIP", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "IT Band Stretch", description: "Stretches the outer thigh and hip.", instructions: "Cross one leg behind the other, lean torso to the side away from the back leg.", type: "STRETCH", region: "GLUTE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Figure-4 Glute Stretch", description: "Stretches deep glute and piriformis muscles.", instructions: "Lying down, cross one ankle over opposite knee, pull thigh toward chest.", type: "STRETCH", region: "GLUTE", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Seated Calf Stretch", description: "Simple seated stretch for the calves.", instructions: "Sit with leg extended, loop a towel around the foot, pull toes toward you.", type: "STRETCH", region: "CALF", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
  { name: "Lying Quad Stretch", description: "Alternative quad stretch performed lying on the side.", instructions: "Lie on side, grab ankle of top leg, pull heel toward glutes keeping hips stacked.", type: "STRETCH", region: "QUAD", difficulty: "BEGINNER", equipment: ["None (bodyweight)"], durationSec: 30 },
];

async function main() {
  console.log(`Seeding ${exercises.length} exercises...`);

  for (const ex of exercises) {
    const slug = slugify(ex.name);
    await prisma.exercise.upsert({
      where: { slug },
      create: { ...ex, slug },
      update: { ...ex, slug },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
