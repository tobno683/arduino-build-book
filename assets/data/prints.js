/* ==========================================================================
   prints.js - the downloadable prints on basics/printing.html.

   Each entry is the parameters for one print plus what to say about it.
   tools/make-prints.js reads this file and writes, for every print, from
   the same numbers:
     assets/prints/<file>.stl       what you slice
     assets/prints/<id>.scad        the same part in OpenSCAD, to change it
     assets/prints/<file>.mesh.js   what the page draws as the picture
   so the picture, the STL and the source cannot disagree. build-index.js
   regenerates them in memory and refuses to pass if the files on disk are
   out of date.

   Hole positions come only from published drawings - see boards.js `case`.
   A board whose holes are not published (the Jetson) gets a source file
   you fill in with your own measurements, and no STL.
   ========================================================================== */
window.AB = window.AB || {};

/* The Uno hole pattern, from Arduino's own board files: (550,100),
   (600,2000), (2600,300), (2600,1400) mil from the corner nearest the power
   jack, on a 2700 x 2100 mil board. The UNO Q keeps the same footprint. */
var UNO_BOARD = [68.58, 53.34];
var UNO_HOLES = [[13.97, 2.54], [15.24, 50.8], [66.04, 7.62], [66.04, 35.56]];

AB.prints = [
  {
    id: 'fit-test',
    title: 'M3 fit test',
    kind: 'fittest',
    first: true,
    fits: [],
    blurb: 'Print this before anything else. Seven through-holes from 3.0 to 3.6 mm tell you which size an M3 screw passes cleanly on your printer, and four bosses from 3.8 to 4.4 mm tell you which hole takes a heat-set insert without cracking or spinning.',
    use: [
      'Try an M3 screw in each through-hole. The smallest one it drops through without forcing is your clearance size - put that in <code>mount_hole</code> in the other files.',
      'Press an insert into each boss with the iron. Too small and the boss splits or bulges; too big and the insert spins when you tighten a screw. The size in between is your <code>standoff_hole</code> for inserts.',
      'The numbers are raised on the plate, so the result is still readable in a year when you have forgotten which was which.'
    ],
    printing: 'PLA is fine - this is a gauge, not a part. 0.2 mm layers, no supports, flat side down.',
    params: {
      plate: [84, 40], plate_t: 2.4, corner_r: 3,
      clear: [3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6], clear_x0: 9, clear_pitch: 11, clear_y: 6,
      insert: [3.8, 4.0, 4.2, 4.4], insert_x0: 15, insert_pitch: 18, insert_y: 25,
      boss_d: 8, boss_h: 6, label_h: 0.6
    },
    sv: {
      title: 'M3-passningstest',
      blurb: 'Skriv ut den här före allt annat. Sju genomgående hål från 3,0 till 3,6 mm visar vilken storlek en M3-skruv går igenom rent på din skrivare, och fyra bossar från 3,8 till 4,4 mm visar vilket hål som tar en värmeinsats utan att spricka eller snurra.'
    }
  },
  {
    id: 'uno-plate',
    title: 'Uno mounting plate',
    kind: 'plate',
    fits: ['uno', 'uno-q'],
    blurb: 'Four standoffs on the exact Uno hole pattern, on a plate with an M3 hole in each corner. Screw the board on top, and screw the plate to anything - a shelf, a panel, the inside of a bigger case.',
    use: [
      'The standoff holes are 2.5 mm, for M3 screws cutting their own thread. For heat-set inserts, set <code>standoff_hole</code> to your fit-test size and <code>standoff_d</code> to 8.',
      'The standoffs are 6 mm tall, which clears the through-hole leads under an Uno with room to spare.',
      'Mount the plate first. Two of the corner holes end up under the board once it is fitted.'
    ],
    printing: 'PETG if it goes anywhere warm, PLA otherwise. 0.2 mm layers, no supports, plate side down.',
    params: {
      board: UNO_BOARD, holes: UNO_HOLES,
      margin: 8, plate_t: 3, corner_r: 5,
      standoff_d: 6, standoff_h: 6, standoff_hole: 2.5,
      mount_hole: 3.4, mount_inset: 5
    },
    sv: {
      title: 'Monteringsplatta för Uno',
      blurb: 'Fyra distanser på Unos exakta hålmönster, på en platta med ett M3-hål i varje hörn. Skruva kortet ovanpå och skruva plattan på vad som helst - en hylla, en panel, insidan av en större låda.'
    }
  },
  {
    id: 'uno-tray',
    title: 'Uno bumper tray',
    kind: 'tray',
    fits: ['uno', 'uno-q'],
    blurb: 'A floor, four standoffs and a wall on three sides, open at the end where the USB and power jacks stick out. It keeps a loose Uno off a metal bench and stops it sliding around the desk - the most common way a board on a desk gets killed.',
    use: [
      'The open end is deliberate. The USB and barrel jacks overhang the board edge, and a closed wall would need cut-outs that only fit one make of cable.',
      'The walls stop below the headers, so jumper wires still plug in from above.',
      'On the UNO Q the floor covers the connectors on the underside that add-on carriers use. For those, use the mounting plate with taller standoffs.'
    ],
    printing: 'PLA or PETG, 0.2 mm layers, no supports, floor down. Stick-on rubber feet stop it sliding.',
    params: {
      board: UNO_BOARD, holes: UNO_HOLES,
      clearance: 1, wall: 2, ledge: 1, corner_r: 3,
      floor_t: 2, wall_h: 10,
      standoff_d: 5.6, standoff_h: 5, standoff_hole: 2.5
    },
    sv: {
      title: 'Skyddsbricka för Uno',
      blurb: 'Ett golv, fyra distanser och en vägg på tre sidor, öppen i änden där USB- och strömuttagen sticker ut. Den håller ett löst Uno-kort borta från en metallbänk och hindrar det från att glida runt på skrivbordet.'
    }
  },
  {
    id: 'pico-plate',
    title: 'Pico mounting plate',
    kind: 'plate',
    fits: ['pico'],
    blurb: 'The Pico is the best-documented board here, so this plate comes straight off the datasheet drawing: four M2 standoffs at 11.4 by 47 mm centres, on a plate with M3 corner holes.',
    use: [
      'The standoff holes are 1.7 mm, for M2 screws cutting their own thread.',
      'Fits the Pico, Pico W, Pico 2 and Pico 2 W - they share the drawing.',
      'The standoffs are 4 mm tall. The Pico has test pads underneath, not leads, so it needs little clearance.'
    ],
    printing: 'PLA or PETG, 0.2 mm layers, no supports, plate side down.',
    params: {
      board: [51, 21], holes: [[2, 4.8], [49, 4.8], [2, 16.2], [49, 16.2]],
      margin: 7, plate_t: 2.5, corner_r: 4,
      standoff_d: 4.5, standoff_h: 4, standoff_hole: 1.7,
      mount_hole: 3.4, mount_inset: 4
    },
    sv: {
      title: 'Monteringsplatta för Pico',
      blurb: 'Pico är det bäst dokumenterade kortet här, så plattan kommer direkt från databladets ritning: fyra M2-distanser med 11,4 gånger 47 mm centrumavstånd, på en platta med M3-hål i hörnen.'
    }
  },
  {
    id: 'nano-carrier',
    title: 'Nano header carrier',
    kind: 'carrier',
    fits: ['nano', 'nano-every', 'nano33ble'],
    blurb: 'A Nano has no mounting holes, so mount it the way the case table above suggests: on two strips of female headers pressed into this carrier. The board unplugs in a second, and the header pins come out underneath for your wiring.',
    use: [
      'Turn it over so the corner posts are its feet. Then press a 15-pin female header strip into each slot from the top, until the bottom of the header is flush with the underside of the plate. A drop of superglue if the fit is loose.',
      'Solder or plug your wiring to the header pins under the carrier. The feet leave about 5 mm for it.',
      'Any Nano-footprint board fits: the Nano, Nano Every and Nano 33 BLE are pin-compatible.'
    ],
    printing: 'PLA or PETG, 0.2 mm layers, no supports. Print it as shown, plate down - upside down from how it is used, which is what makes it support-free.',
    params: {
      pins: 15, pitch: 2.54, rows: 15.24, slot_w: 2.7, slot_extra: 0.4,
      plate: [58, 30], plate_t: 3, corner_r: 4,
      foot_d: 7, foot_h: 8, foot_hole: 3.4, foot_inset: 5
    },
    sv: {
      title: 'Stiftlisthållare för Nano',
      blurb: 'En Nano har inga monteringshål, så montera den som falltabellen ovan föreslår: på två honstiftlister som pressas ner i den här hållaren. Kortet går att ta loss på en sekund och stiften sticker ut under för kablaget.'
    }
  },
  {
    id: 'esp32-carrier',
    title: 'ESP32 DevKit header carrier',
    kind: 'carrier',
    fits: ['esp32'],
    blurb: 'The same idea for a 38-pin ESP32 DevKit, which usually has no mounting holes and whose clones disagree on width. There are two files, because the two header rows are 22.86 mm apart on some boards and 25.4 mm on others.',
    use: [
      '<strong>Measure yours before you print.</strong> Centre to centre across the two pin rows: 22.86 mm (0.9 inch) or 25.4 mm (1 inch). Nothing else about the board matters to this part.',
      'Turn it over so the posts are its feet, and press a 19-pin female header strip into each slot from the top, flush with the underside. For a 30-pin board, set <code>pins</code> to 15 in the source file.',
      'Keep the antenna end clear of metal once it is mounted. The carrier leaves it hanging free on purpose.'
    ],
    printing: 'PLA or PETG, 0.2 mm layers, no supports, plate down as shown.',
    params: {
      pins: 19, pitch: 2.54, rows: 25.4, slot_w: 2.7, slot_extra: 0.4,
      plate: [68, 36], plate_t: 3, corner_r: 4,
      foot_d: 7, foot_h: 8, foot_hole: 3.4, foot_inset: 5
    },
    variants: [
      { file: 'esp32-carrier-2286', label: '22.86 mm rows', params: { rows: 22.86 } },
      { file: 'esp32-carrier-2540', label: '25.4 mm rows',  params: { rows: 25.4 } }
    ],
    sv: {
      title: 'Stiftlisthållare för ESP32 DevKit',
      blurb: 'Samma idé för ett 38-stifts ESP32 DevKit, som oftast saknar monteringshål och vars kloner inte är överens om bredden. Det finns två filer, eftersom stiftraderna sitter 22,86 mm isär på vissa kort och 25,4 mm på andra.'
    }
  },
  {
    id: 'measured-plate',
    title: 'Plate for a board you measured',
    kind: 'measured',
    fits: ['jetson-orin'],
    blurb: 'For the Jetson, and any board whose hole positions are not published. There is deliberately no STL and no picture: the hole positions are the whole part, and the only honest source for them is your calipers on your board.',
    use: [
      'Measure each hole centre from one corner of the board, and the board outline. Enter them in <code>board</code> and <code>holes</code> at the top of the file.',
      'The file refuses to render until you do - it stops with a message rather than producing a plausible plate with invented holes.',
      'Print this plate before any case built on the same numbers. If a standoff is off, you have lost forty minutes, not a day.'
    ],
    printing: 'For a Jetson, PETG or ASA - PLA softens near it under load. 0.2 mm layers, no supports.',
    params: {
      board: [0, 0], holes: [],
      margin: 8, plate_t: 3, corner_r: 5,
      standoff_d: 6, standoff_h: 8, standoff_hole: 2.5,
      mount_hole: 3.4, mount_inset: 5
    },
    sv: {
      title: 'Platta för ett kort du mätt själv',
      blurb: 'För Jetson och alla kort vars hålpositioner inte är publicerade. Det finns avsiktligt ingen STL och ingen bild: hålpositionerna är hela delen, och den enda ärliga källan till dem är ditt skjutmått på ditt kort.'
    }
  }
];
