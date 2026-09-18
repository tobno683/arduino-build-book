/* ==========================================================================
   i18n.js - Swedish.

   English is the source language and the KEY. AB.t('Home') returns 'Hem'
   in Swedish and 'Home' in English, and anything missing from the table
   falls through to the English text rather than showing a bare key. That
   matters on a site being translated a piece at a time: an untranslated
   string reads as English, which is fine, instead of as 'nav.home',
   which is not.

   The cost of keying on English is that two identical English strings
   meaning different things would collide. Where that happens, prefix a
   context: 'table|Wire' against 'legend|Wire'.

   Project guides are a separate problem - 400,000 words - and live in a
   `sv` block inside each project file. build-index.js reports how many
   are done.
   ========================================================================== */
window.AB = window.AB || {};

AB.languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'sv', name: 'Svenska', short: 'SV' }
];

AB.i18n = {
sv: {

/* --- chrome and navigation -------------------------------------------- */
'Home': 'Hem',
'All projects': 'Alla projekt',
'New boards': 'Nya kort',
'Which board': 'Vilket kort',
'Drones': 'Drönare',
'3D printing': '3D-utskrift',
'Tools & buying': 'Verktyg och inköp',
'Soldering': 'Lödning',
'Electronics': 'Elektronik',
'Programming': 'Programmering',
'Glossary': 'Ordlista',
'Basics': 'Grunderna',
'Guides': 'Guider',
'Projects': 'Projekt',
'Skip to content': 'Hoppa till innehåll',
'Menu': 'Meny',
'Save offline': 'Spara offline',
'Save the whole book for offline use': 'Spara hela boken för offline-användning',
'Install the Build Book as an app': 'Installera Build Book som en app',
'Install app': 'Installera app',
'Switch light or dark': 'Växla ljust eller mörkt',
'Language': 'Språk',
'Switch to Svenska': 'Byt till svenska',
'Switch to English': 'Byt till engelska',
'A new version is ready.': 'En ny version är klar.',
'Reload': 'Ladda om',
'On this page': 'På den här sidan',

/* --- project page sections -------------------------------------------- */
'What you are building': 'Vad du bygger',
'What to buy, and what it costs': 'Vad du ska köpa, och vad det kostar',
'Wiring it up': 'Koppla ihop det',
'Soldering, joint by joint': 'Lödning, fog för fog',
'Putting it together': 'Sätta ihop det',
'The code': 'Koden',
'Uploading and first run': 'Ladda upp och första körningen',
'Calibration and tuning': 'Kalibrering och trimning',
'When it does not work': 'När det inte fungerar',
'Where to take it next': 'Vart du går härnäst',
'Safety': 'Säkerhet',
'What it does': 'Vad det gör',
'How it works': 'Hur det fungerar',
'Skills you will pick up': 'Färdigheter du får med dig',
'Libraries': 'Bibliotek',
'Related projects': 'Relaterade projekt',

/* --- project metadata -------------------------------------------------- */
'Cost': 'Kostnad',
'Level': 'Nivå',
'Time': 'Tid',
'Board': 'Kort',
'Soldering needed': 'Lödning krävs',
'No soldering': 'Ingen lödning',
'to build': 'att bygga',
'to build them all': 'att bygga allihop',
'project': 'projekt',
'projects': 'projekt',
'item': 'post',
'items': 'poster',
'terms': 'termer',
'themes': 'teman',
'boards': 'kort',
'parts priced': 'priser på delar',

/* --- levels ------------------------------------------------------------ */
'Beginner': 'Nybörjare',
'Easy': 'Lätt',
'Intermediate': 'Medel',
'Advanced': 'Avancerad',
'Expert': 'Expert',

/* --- bill of materials -------------------------------------------------- */
'Part': 'Del',
'Qty': 'Antal',
'Price': 'Pris',
'Each': 'Styck',
'Total': 'Totalt',
'Where to buy': 'Var man köper',
'Shipping to': 'Levereras till',
'International': 'Internationellt',
'Sweden': 'Sverige',
'You probably own this already': 'Du har förmodligen redan detta',
'Shared stock - buy once': 'Gemensamt lager - köp en gång',
'own stock': 'eget lager',
'Tools you need': 'Verktyg du behöver',

/* --- wiring table and 3D ------------------------------------------------ */
'From': 'Från',
'To': 'Till',
'Pin': 'Stift',
'Wire': 'Ledning',
'What it carries': 'Vad den bär',
'Drag to orbit - scroll to zoom': 'Dra för att rotera - skrolla för att zooma',
'3/4 view': '3/4-vy',
'Top': 'Ovanifrån',
'Front': 'Framifrån',
'Side': 'Från sidan',
'Pin labels': 'Stiftetiketter',
'Wires': 'Ledningar',
'Explode': 'Sprängskiss',
'Signal': 'Signal',
'Power': 'Spänning',
'Ground': 'Jord',
'Load / high current': 'Last / hög ström',
'Reading this table': 'Så läser du tabellen',

/* --- code blocks -------------------------------------------------------- */
'Copy': 'Kopiera',
'Copied': 'Kopierat',
'Arduino C++': 'Arduino C++',
'Python': 'Python',
'Shell': 'Skal',

/* --- filters and search -------------------------------------------------- */
'Search': 'Sök',
'Theme': 'Tema',
'All themes': 'Alla teman',
'Any board': 'Vilket kort som helst',
'Any': 'Alla',
'Budget': 'Budget',
'Under': 'Under',
'Under $15': 'Under $15',
'Under $30': 'Under $30',
'Under $60': 'Under $60',
'Either': 'Båda',
'Yes': 'Ja',
'None needed': 'Behövs inte',
'Show': 'Visa',
'Sort': 'Sortera',
'Nothing matches that': 'Inget matchar det',
'Try a shorter search.': 'Prova en kortare sökning.',
'Try a shorter search, or set the filters back to Anything.':
  'Prova en kortare sökning, eller ställ tillbaka filtren på Alla.',
'No project matches that': 'Inget projekt matchar det',
'No term matches that': 'Ingen term matchar det',

/* --- news shelf ---------------------------------------------------------- */
'Shipping': 'Säljs nu',
'Preorder': 'Förbeställning',
'Announced': 'Annonserad',
'Rumour': 'Rykte',
'You can buy this today': 'Du kan köpa detta idag',
'Money now, board later': 'Pengar nu, kort senare',
'Real specs, not yet buyable': 'Riktiga specifikationer, går inte att köpa än',
'Unconfirmed - treat as fiction': 'Obekräftat - behandla som påhitt',
'What it means here': 'Vad det betyder här',
'Availability': 'Tillgänglighet',
'Source': 'Källa',
'Last checked': 'Senast kontrollerad',
'days ago': 'dagar sedan',

/* --- board guide ---------------------------------------------------------- */
'Good at': 'Bra på',
'Bad at': 'Dålig på',
'Pick it when': 'Välj det när',
'Do not pick it when': 'Välj det inte när',
'The things that will cost you an evening': 'Sakerna som kostar dig en kväll',
'Processor': 'Processor',
'RAM': 'RAM',
'Flash': 'Flash',
'Usable I/O': 'Användbara I/O',
'Logic level': 'Logiknivå',
'USB': 'USB',
'Radio': 'Radio',
'Power draw': 'Strömförbrukning',
'none': 'ingen',

/* --- the untranslated-guide notice ----------------------------------------- */
'This guide has not been translated yet':
  'Den här guiden är inte översatt än',
'The page furniture is in Swedish but the guide itself is still in English. Translating 102 guides is ongoing work and this one has not been reached yet.':
  'Sidans ramverk är på svenska men själva guiden är fortfarande på engelska. Att översätta 102 guider är ett pågående arbete och den här är inte klar än.',
'Read it in English': 'Läs den på engelska'

}
};
