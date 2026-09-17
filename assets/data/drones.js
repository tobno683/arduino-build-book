/* ==========================================================================
   drones.js - the reference behind basics/drones.html.

   Not a project. This is the background you need before any of the drone
   projects make sense: how the classes differ, how to dimension a power
   system, and the specific ways builds go wrong.

   Numbers here are the ones that change a decision. Thrust-to-weight,
   stator size, KV against cell count and prop pitch are the whole design
   space; everything else follows from them.
   ========================================================================== */
window.AB = window.AB || {};

AB.droneGuide = {
  updated: '2026-09-17',

  firstBuild: 'freestyle5',
  firstBuildWhy: 'The 5 inch freestyle quad is the standard for a reason: every part is commodity, every ' +
                 'problem has been written up a thousand times, and it is forgiving enough to survive being ' +
                 'learned on. Build this before anything smaller, larger or cleverer.',

  /* The single most useful number in the whole discipline. */
  thrustRule: [
    { ratio: '2:1',  verdict: 'The absolute minimum to leave the ground and stay controllable. Feels sluggish and cannot recover from a mistake.' },
    { ratio: '3:1',  verdict: 'Fine for a camera platform or a long-range build where you fly smoothly on purpose.' },
    { ratio: '5:1',  verdict: 'The freestyle target. Enough authority to flip, and to catch yourself when it goes wrong.' },
    { ratio: '8:1+', verdict: 'Race builds. Brutal, twitchy, and eats batteries. Not what you learn on.' }
  ]
};

/* --- the classes ------------------------------------------------------- */
AB.droneClasses = [
{
  id: 'tinywhoop',
  name: 'Tiny whoop',
  prop: '31-40 mm, ducted',
  cells: '1S, occasionally 2S',
  motor: '0802-0804, 19,000-25,000 KV',
  auw: '20-35 g',
  flight: '2-4 minutes',
  cost: '$80-150 ready to fly',
  useFor: [
    'Flying indoors, through a house, around furniture and people.',
    'Learning to fly without destroying anything, including yourself.',
    'Practising in winter, in a garage, at 2 am.'
  ],
  avoid: 'Any wind at all. A light breeze outdoors is unflyable.',
  note: 'Under 250 g by an enormous margin, so it sidesteps most regulation. Genuinely the best way to learn ' +
        'to fly, and the flight time is short enough that you want several batteries.'
},
{
  id: 'cinewhoop',
  name: 'Cinewhoop',
  prop: '2.5-3.5 inch, ducted',
  cells: '4S',
  motor: '1404-1507, 3000-4500 KV',
  auw: '250-400 g with camera',
  flight: '3-5 minutes',
  cost: '$250-450',
  useFor: [
    'Smooth indoor and close-proximity video with a real camera on top.',
    'Flying near people, where the ducts are a genuine safety feature rather than a style.',
    'Property and interior work where a big quad is out of the question.'
  ],
  avoid: 'Speed, range and efficiency. Ducts cost a lot of flight time.',
  note: 'The ducts do two jobs: they protect people from the props and the props from walls, and at low ' +
        'speed they genuinely add thrust. Above about 30 km/h they are just drag.'
},
{
  id: 'freestyle5',
  name: '5 inch freestyle',
  prop: '5 inch tri-blade',
  cells: '4S or 6S',
  motor: '2207 at 1750-1950 KV on 6S, or 2400-2600 KV on 4S',
  auw: '550-700 g with battery',
  flight: '4-7 minutes',
  cost: '$250-400 to build',
  useFor: [
    'Everything. This is the default build and the one every guide assumes.',
    'Flips, rolls, dives, and flying through gaps.',
    'Learning to build, because every part is standard and every failure is documented.'
  ],
  avoid: 'Flying anywhere near people. It is fast, sharp and carries real energy.',
  note: 'Start here even if you want something else eventually. The parts are commodity, the community ' +
        'knowledge is vast, and the skills transfer to every other class.'
},
{
  id: 'racing5',
  name: '5 inch racer',
  prop: '5 inch bi-blade',
  cells: '6S',
  motor: '2207 at 1900-2100 KV, or 2306 for more torque',
  auw: '380-500 g',
  flight: '2-3 minutes flat out',
  cost: '$350-600',
  useFor: [
    'Track racing against other people, which is the only real point of it.',
    'Absolute speed. A good race quad passes 160 km/h.'
  ],
  avoid: 'Learning on. Everything happens too fast and repairs are constant.',
  note: 'Built light and stripped of anything not needed to go quickly. Bi-blade props for efficiency at ' +
        'speed, minimal camera gear, and an acceptance that it is disposable.'
},
{
  id: 'longrange7',
  name: '7 inch long range',
  prop: '7 inch bi-blade',
  cells: '6S, high capacity',
  motor: '2806-2807, 1300-1500 KV',
  auw: '800 g-1.2 kg',
  flight: '15-25 minutes',
  cost: '$400-700',
  useFor: [
    'Covering distance - several kilometres out and back on one pack.',
    'Landscape and exploration flying, smoothly, at altitude.',
    'Anywhere the point is the view rather than the flying.'
  ],
  avoid: 'Tight spaces and proximity flying. It is heavy, slow to change direction and hits hard.',
  note: 'A different discipline from freestyle. Efficiency is everything: low KV, big low-pitch props, and ' +
        'a battery chosen so the extra weight still pays for itself. GPS rescue is close to mandatory.'
},
{
  id: 'cinelifter',
  name: 'Cinelifter',
  prop: '8-10 inch',
  cells: '6S or 8S',
  motor: '2810-3115, 900-1200 KV',
  auw: '2-4 kg with camera',
  flight: '5-8 minutes',
  cost: '$1,200+',
  useFor: [
    'Carrying a full-size cinema camera that costs more than the drone.',
    'Professional work where the footage justifies the whole apparatus.'
  ],
  avoid: 'Being anywhere near it. This class is genuinely dangerous and is professional equipment.',
  note: 'Included for completeness and as a warning. A 3 kg quad with 10 inch props is an industrial machine, ' +
        'and it is not a hobby build - it is a job with insurance and a risk assessment.'
},
{
  id: 'camera',
  name: 'GPS camera drone',
  prop: 'Folding, 8-10 inch',
  cells: '4S intelligent pack',
  motor: 'Low KV, heavily geared to efficiency',
  auw: '250 g-900 g',
  flight: '25-45 minutes',
  cost: 'Bought, not built',
  useFor: [
    'Stable aerial photography with no piloting skill required.',
    'Automatic return to home, obstacle avoidance and a gimbal that actually works.'
  ],
  avoid: 'Building one. This is the one class where buying is unambiguously the right answer.',
  note: 'Different engineering entirely - the value is in the flight software, the gimbal and the sensor, ' +
        'none of which you can match at home. Buy a DJI, and build FPV for the things it cannot do.'
}
];

/* --- frame geometry ---------------------------------------------------- */
AB.droneFrames = [
{
  id: 'truex',
  name: 'True X',
  shape: 'All four arms the same length, motors on the corners of a square.',
  goodFor: 'Racing and any flying where symmetry matters. Behaves identically in every direction.',
  badFor: 'Video - the front props are in shot on a wide lens.',
  note: 'The purest geometry and what most race frames use. Predictable because there is nothing asymmetric to compensate for.'
},
{
  id: 'stretchedx',
  name: 'Stretched X',
  shape: 'Longer front to back than side to side, so the motors form a rectangle.',
  goodFor: 'Freestyle. The extra length front to back damps pitch and makes it feel locked in.',
  badFor: 'Nothing much, which is why it is the default.',
  note: 'The standard freestyle geometry. Slightly more stable in pitch than roll, which suits the way people actually fly.'
},
{
  id: 'deadcat',
  name: 'Deadcat',
  shape: 'Front arms swept forward and out, to clear the camera view.',
  goodFor: 'Any build with a forward-facing camera on a wide lens. No props in shot.',
  badFor: 'Handling. The asymmetry is real and it flies slightly differently in pitch and roll.',
  note: 'A deliberate trade: worse flight characteristics for cleaner footage. For cinematic work that is the right trade.'
},
{
  id: 'hframe',
  name: 'H frame',
  shape: 'Two side rails with motors at the corners, a rectangular body between them.',
  goodFor: 'Cinewhoops and cinelifters. Lots of flat space for batteries and camera mounts.',
  badFor: 'Weight and aerodynamics. It is a brick.',
  note: 'Chosen for what it can carry rather than how it flies. Usually paired with ducts.'
},
{
  id: 'ducted',
  name: 'Ducted',
  shape: 'Props enclosed in shrouds, usually on an H or square body.',
  goodFor: 'Flying near people and hard surfaces. Bumping a wall is a bump rather than a crash.',
  badFor: 'Efficiency and speed. Expect to lose a third of your flight time.',
  note: 'The ducts add static thrust at low speed and pure drag at high speed. Worth it indoors, pointless outdoors.'
}
];

/* --- the pitfalls ------------------------------------------------------ */
AB.dronePitfalls = [
{
  h: 'No capacitor on the battery leads',
  symptom: 'Random reboots in flight, corrupted video, a quad that falls out of the sky under hard throttle.',
  cause: 'ESCs switching tens of amps create voltage spikes on the power leads. Long battery leads make it worse.',
  fix: 'A low-ESR electrolytic - 35 V, 470-1000 uF - soldered directly across the XT60 pads. This is not optional and it is the single most skipped step in the hobby.'
},
{
  h: 'Over-propped motors',
  symptom: 'Motors too hot to hold after a two minute flight. Short flight times. Eventual desync.',
  cause: 'Too much prop for the motor and cell count - usually too much pitch, or a tri-blade where the motor wanted a bi-blade.',
  fix: 'Land after one minute and touch each motor. Warm is fine, uncomfortable is not. Drop a prop size or a pitch step.'
},
{
  h: 'Desync',
  symptom: 'A motor stops dead mid-manoeuvre and the quad flips itself into the ground.',
  cause: 'The ESC loses track of the rotor position under rapid throttle change, usually when over-propped or with the wrong timing.',
  fix: 'Update the ESC firmware, raise motor timing, reduce prop load. It nearly always means the power system is over-committed somewhere.'
},
{
  h: 'Soft-mounting done wrong, or not at all',
  symptom: 'Hot motors with no obvious cause, oscillation that tuning will not fix, jello in the video.',
  cause: 'Frame vibration reaching the gyro. The flight controller chases noise and the motors pay for it.',
  fix: 'Rubber grommets on the FC, balanced props, and nothing rigidly coupling the FC stack to the arms. Check the gyro trace in Betaflight before blaming the PIDs.'
},
{
  h: 'Testing with props on',
  symptom: 'Injuries. Real ones.',
  cause: 'Every configuration mistake - reversed motor, wrong protocol, a stray throttle - becomes a spinning blade at head height.',
  fix: 'Props off for every single bench test, every time, including the one where you are certain. Props go on last, outdoors, facing away.'
},
{
  h: 'Failsafe never configured',
  symptom: 'The quad flies away and is never seen again.',
  cause: 'Losing the radio link with no defined behaviour, so it holds its last command and keeps going.',
  fix: 'Set failsafe to drop or to GPS rescue, then TEST it by switching the transmitter off with the quad on the ground, props removed.'
},
{
  h: 'Motor direction and prop direction mismatched',
  symptom: 'It flips instantly on takeoff, or will not lift at all.',
  cause: 'Props fitted to the wrong motors, or the motor directions never set in configurator.',
  fix: 'Set directions in software, then match the props to them. Props-out is the modern default and it makes a prop strike less likely to eat the frame.'
},
{
  h: 'First power-up straight onto a battery',
  symptom: 'A short becomes a fire and a ruined stack in under a second.',
  cause: 'A solder bridge on the ESC pads, which is by far the commonest build fault.',
  fix: 'Use a smoke stopper - a lamp in series with the battery lead - for every first power-up. It turns a fire into a glowing bulb for about five dollars.'
},
{
  h: 'Battery sag misread as a bad pack',
  symptom: 'Voltage alarm at half throttle, then recovers when you ease off.',
  cause: 'Normal sag under load, or an old pack with high internal resistance.',
  fix: 'Judge a pack by its RESTING voltage after landing, not the reading in flight. If it recovers above 3.7 V per cell you landed too early.'
},
{
  h: 'GPS mounted next to the power wiring',
  symptom: 'GPS rescue that flies the wrong way. A wandering compass heading.',
  cause: 'The magnetometer reading the magnetic field of 60 A of motor current instead of the Earth.',
  fix: 'GPS and compass on a mast, as far from the power wiring as the build allows. This is why long-range builds have that little tower on the back.'
}
];
