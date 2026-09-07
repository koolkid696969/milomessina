/* ─────────────────────────────────────────────────────────────
   University autocomplete.

   Two jobs, both about the sheet rather than the applicant:
   a typed school becomes the same string every other applicant
   used, and an obvious misspelling ("univercity of michagan")
   gets fixed to the real name instead of landing as its own row.

   Nothing here blocks a submission. A school that isn't on the
   list below — a community college, somewhere abroad — is typed
   in and left exactly as typed.

   Wire a field up with:  wireSchoolField(input)
   ───────────────────────────────────────────────────────────── */

/* name|aliases people actually type. Roughly ordered by how often
   we expect to see them, which only matters as a tie-break. */
const SCHOOL_DATA = `
University of Michigan|umich;u of m;michigan;u mich;uofm
Michigan State University|msu;michigan state
Ohio State University|osu;ohio state;the ohio state university
University of Wisconsin-Madison|uw madison;wisconsin;wisco;madison
University of Minnesota|umn;minnesota;u of m twin cities
University of Illinois Urbana-Champaign|uiuc;illinois;u of i;champaign
University of Illinois Chicago|uic
Indiana University Bloomington|iu;indiana;iub
Purdue University|purdue
University of Iowa|iowa;u iowa
Iowa State University|iowa state
University of Nebraska-Lincoln|unl;nebraska
University of Maryland|umd;maryland;terps;college park
Penn State University|psu;penn state;happy valley
Rutgers University|rutgers;ru
University of Washington|uw;udub;washington
Washington State University|wsu;wazzu;washington state
University of Oregon|uo;oregon;ducks
Oregon State University|oregon state;beavers
University of California, Berkeley|berkeley;cal;ucb;uc berkeley
University of California, Los Angeles|ucla;uc la
University of California, San Diego|ucsd;uc san diego
University of California, Davis|ucd;uc davis
University of California, Irvine|uci;uc irvine
University of California, Santa Barbara|ucsb;uc santa barbara
University of California, Santa Cruz|ucsc;uc santa cruz
University of California, Riverside|ucr;uc riverside
University of California, Merced|uc merced
San Diego State University|sdsu
San Jose State University|sjsu
San Francisco State University|sfsu
California Polytechnic State University, San Luis Obispo|cal poly;slo;cal poly slo
California State Polytechnic University, Pomona|cal poly pomona;cpp
California State University, Long Beach|csulb;long beach state
California State University, Fullerton|csuf;fullerton
California State University, Northridge|csun;northridge
California State University, Sacramento|sac state
California State University, San Diego|csu san diego
Arizona State University|asu;arizona state;sun devils
University of Arizona|u of a;arizona;wildcats;ua
Northern Arizona University|nau
University of Colorado Boulder|cu boulder;colorado;cu;boulder
Colorado State University|csu;colorado state
University of Denver|du;denver
University of Utah|utah;u of u
Utah State University|usu;utah state
Brigham Young University|byu;brigham young
University of Nevada, Las Vegas|unlv;vegas
University of Nevada, Reno|unr;nevada reno
University of New Mexico|unm;new mexico
University of Texas at Austin|ut austin;ut;texas;longhorns;utexas
Texas A&M University|tamu;texas a m;aggies;a and m
Texas Tech University|ttu;texas tech
University of Houston|uh;houston;coogs
University of North Texas|unt;north texas
Texas State University|txst;texas state
University of Texas at Dallas|utd;ut dallas
University of Texas at Arlington|uta;ut arlington
University of Texas at San Antonio|utsa
Southern Methodist University|smu
Texas Christian University|tcu
Baylor University|baylor
Rice University|rice
University of Oklahoma|ou;oklahoma;sooners
Oklahoma State University|okstate;oklahoma state
University of Arkansas|uark;arkansas;razorbacks
University of Kansas|ku;kansas;jayhawks
Kansas State University|k state;kstate;kansas state
University of Missouri|mizzou;missouri
Saint Louis University|slu;st louis university
Washington University in St. Louis|wustl;wash u;washu
University of Kentucky|uk;kentucky;wildcats lexington
University of Louisville|uofl;louisville;cards
University of Tennessee|ut knoxville;tennessee;vols;utk
Middle Tennessee State University|mtsu
Tennessee State University|tn state
University of Memphis|memphis
Belmont University|belmont
Vanderbilt University|vandy;vanderbilt
University of Alabama|bama;alabama;roll tide;ua tuscaloosa
University of Alabama at Birmingham|uab
Auburn University|auburn;war eagle
Troy University|troy
University of Georgia|uga;georgia;dawgs;athens
Georgia Institute of Technology|georgia tech;gt;gatech
Georgia State University|gsu;georgia state
Kennesaw State University|ksu;kennesaw
University of Florida|uf;florida;gators;gainesville
Florida State University|fsu;florida state;noles
University of Central Florida|ucf;central florida
University of South Florida|usf;south florida
Florida International University|fiu
Florida Atlantic University|fau
Florida A&M University|famu
University of Miami|the u;um miami;canes
University of South Carolina|usc columbia;south carolina;gamecocks
Clemson University|clemson
University of North Carolina at Chapel Hill|unc;chapel hill;tar heels;north carolina
North Carolina State University|nc state;ncsu
North Carolina A&T State University|ncat;nc a and t
University of North Carolina at Charlotte|uncc;unc charlotte
University of North Carolina Wilmington|uncw
East Carolina University|ecu
Appalachian State University|app state;appalachian
Wake Forest University|wake forest;wake;demon deacons
Duke University|duke;blue devils
Elon University|elon
High Point University|hpu;high point
University of Virginia|uva;virginia;charlottesville
Virginia Tech|vt;virginia tech;hokies;virginia polytechnic institute
James Madison University|jmu
George Mason University|gmu;mason
Old Dominion University|odu
Virginia Commonwealth University|vcu
Radford University|radford
West Virginia University|wvu;west virginia
University of Pittsburgh|pitt;pittsburgh
Carnegie Mellon University|cmu;carnegie mellon
Temple University|temple;owls
Drexel University|drexel
Villanova University|nova;villanova
Saint Joseph's University|sju;st josephs
La Salle University|la salle
Duquesne University|duquesne
University of Scranton|scranton
West Chester University|west chester
Lehigh University|lehigh
Bucknell University|bucknell
University of Pennsylvania|penn;upenn;u penn;wharton
Princeton University|princeton;tigers
Harvard University|harvard;crimson
Yale University|yale;bulldogs
Columbia University|columbia;cu nyc
Brown University|brown;bruno
Dartmouth College|dartmouth;big green
Cornell University|cornell;big red
Stanford University|stanford;the farm
Massachusetts Institute of Technology|mit
California Institute of Technology|caltech
Northwestern University|northwestern;nu evanston
University of Chicago|uchicago;u chicago;uofc
Johns Hopkins University|jhu;hopkins;johns hopkins
Georgetown University|georgetown;hoyas
George Washington University|gwu;gw
American University|american u;au dc
Howard University|howard;hu dc
University of Notre Dame|notre dame;nd;fighting irish
Boston University|bu;boston u
Boston College|bc;boston college
Northeastern University|northeastern;neu
Tufts University|tufts;jumbos
Brandeis University|brandeis
Harvard Extension School|extension school
New York University|nyu;new york u
Fordham University|fordham;rams
Syracuse University|cuse;syracuse;orange
Pace University|pace
The New School|new school;parsons the new school
Hofstra University|hofstra
Adelphi University|adelphi
Marist College|marist
Quinnipiac University|quinnipiac;qu
Sacred Heart University|sacred heart
Stony Brook University|stony brook;suny stony brook
University at Buffalo|ub;suny buffalo;buffalo
Binghamton University|binghamton;suny binghamton;bing
University at Albany|suny albany;albany
SUNY Cortland|cortland
SUNY Oswego|oswego
SUNY Geneseo|geneseo
Hunter College|hunter;cuny hunter
Baruch College|baruch;cuny baruch
Brooklyn College|brooklyn college;cuny brooklyn
City College of New York|ccny;city college;cuny city college
Queens College|queens college;cuny queens
University of Rochester|u of r;rochester;urochester
Rochester Institute of Technology|rit
Rensselaer Polytechnic Institute|rpi;rensselaer
Worcester Polytechnic Institute|wpi
Stevens Institute of Technology|stevens
Illinois Institute of Technology|iit
Rose-Hulman Institute of Technology|rose hulman
Case Western Reserve University|case western;cwru;case
Ithaca College|ithaca
Colgate University|colgate;raiders
Hamilton College|hamilton
Williams College|williams;ephs
Amherst College|amherst
Wesleyan University|wesleyan;wes
Middlebury College|middlebury;midd
Bowdoin College|bowdoin;polar bears
Colby College|colby
Bates College|bates
Swarthmore College|swat;swarthmore
Haverford College|haverford
Bryn Mawr College|bryn mawr
Vassar College|vassar
Barnard College|barnard
Wellesley College|wellesley
Smith College|smith
Mount Holyoke College|mount holyoke;mo ho
Oberlin College|oberlin
Kenyon College|kenyon
Denison University|denison
Davidson College|davidson
Pomona College|pomona
Claremont McKenna College|cmc;claremont mckenna
Harvey Mudd College|harvey mudd;mudd
Scripps College|scripps
Pitzer College|pitzer
Occidental College|oxy;occidental
Reed College|reed
Whitman College|whitman
Colorado College|colorado college;cc
Trinity College|trinity;trinity hartford
Connecticut College|conn college;connecticut college
Skidmore College|skidmore
Union College|union
Lafayette College|lafayette
Franklin & Marshall College|fandm;f and m;franklin and marshall
Dickinson College|dickinson
Gettysburg College|gettysburg
Sarah Lawrence College|sarah lawrence
Bard College|bard
Clark University|clark
Babson College|babson
Bentley University|bentley
Berklee College of Music|berklee
The Juilliard School|juilliard
Pratt Institute|pratt
Rhode Island School of Design|risd
School of the Art Institute of Chicago|saic;art institute of chicago
Savannah College of Art and Design|scad
Fashion Institute of Technology|fit
Emerson College|emerson
Suffolk University|suffolk
University of Southern California|usc;southern cal;trojans
Pepperdine University|pepperdine
Santa Clara University|scu;santa clara
Loyola Marymount University|lmu
Chapman University|chapman
University of San Diego|usd;san diego
University of San Francisco|usf sf;san francisco
Gonzaga University|gonzaga;zags
Seattle University|seattle u
Western Washington University|wwu;western washington
Portland State University|portland state
University of Portland|u of p portland
Boise State University|boise state
University of Idaho|idaho
University of Montana|montana
Montana State University|montana state
University of Wyoming|wyoming
University of Hawaii at Manoa|hawaii;uh manoa
University of Alaska Anchorage|uaa;alaska anchorage
University of Connecticut|uconn;connecticut;huskies
University of Rhode Island|uri;rhode island
University of Massachusetts Amherst|umass;umass amherst;zoomass
University of Massachusetts Boston|umass boston
University of Massachusetts Lowell|umass lowell;uml
University of New Hampshire|unh;new hampshire
University of Vermont|uvm;vermont
University of Maine|umaine;maine
University of Delaware|udel;delaware;blue hens
Towson University|towson
Salisbury University|salisbury
Loyola University Maryland|loyola maryland
Morgan State University|morgan state
Spelman College|spelman
Morehouse College|morehouse
Hampton University|hampton
Jackson State University|jackson state
Southern University|southern u
Prairie View A&M University|prairie view
Texas Southern University|texas southern
Xavier University of Louisiana|xula;xavier louisiana
Louisiana State University|lsu;louisiana state;geaux tigers
University of Louisiana at Lafayette|ul lafayette;louisiana lafayette
Tulane University|tulane;green wave
University of Mississippi|ole miss;mississippi
Mississippi State University|miss state;mississippi state
Seton Hall University|seton hall
St. John's University|st johns;saint johns
Providence College|providence
Xavier University|xavier;xavier cincinnati
Butler University|butler
Creighton University|creighton
Marquette University|marquette
DePaul University|depaul
Loyola University Chicago|loyola chicago;luc
University of Dayton|dayton;flyers
Ohio University|ohio u;ohio university;bobcats
Miami University|miami ohio;miami oh;redhawks
Kent State University|kent state
University of Cincinnati|cincinnati;cincy;bearcats
University of Toledo|toledo
Bowling Green State University|bgsu;bowling green
Wright State University|wright state
Cleveland State University|cleveland state
University of Akron|akron;zips
Ball State University|ball state
Indiana State University|indiana state
Valparaiso University|valpo
Western Michigan University|wmu;western michigan
Central Michigan University|central michigan;cmich
Eastern Michigan University|emu;eastern michigan
Grand Valley State University|gvsu;grand valley
Wayne State University|wayne state
Oakland University|oakland u
University of Wisconsin-Milwaukee|uw milwaukee;uwm
University of Wisconsin-La Crosse|uw la crosse
University of Wisconsin-Eau Claire|uw eau claire
Northern Illinois University|niu;northern illinois
Southern Illinois University|siu;southern illinois
Illinois State University|illinois state;ilstu
Marshall University|marshall
North Dakota State University|ndsu;north dakota state
University of North Dakota|und;north dakota
South Dakota State University|sd state;south dakota state
University of South Dakota|usd vermillion
Drake University|drake
University of Northern Iowa|uni;northern iowa
Embry-Riddle Aeronautical University|embry riddle
University of Toronto|u of t;uoft;toronto
McGill University|mcgill
University of British Columbia|ubc
University of Waterloo|waterloo
Western University|western ontario;uwo
Queen's University|queens ontario
McMaster University|mcmaster;mac
York University|york u
Concordia University|concordia
University of Alberta|u of a alberta;alberta
University of Oxford|oxford
University of Cambridge|cambridge
Imperial College London|imperial
London School of Economics|lse
University College London|ucl
King's College London|kcl;kings college london
University of Edinburgh|edinburgh
University of Manchester|manchester
`;

/* the words that carry no signal when someone is typing a school name, so
   "univercity of michagan" gets compared as "michagan" — misspelled filler
   included, since that's half of what people get wrong */
const SCHOOL_STOP = ['the', 'of', 'at', 'and', 'in'];
const SCHOOL_TYPE = { university: 'university', universities: 'university', univ: 'university',
  college: 'college', colleges: 'college', institute: 'institute', school: 'school', academy: 'academy' };

function schoolNorm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}
/* '' for a word that carries meaning, otherwise what kind of filler it is:
   'stop', or the type word it's a spelling of */
function schoolFiller(w) {
  if (SCHOOL_STOP.indexOf(w) > -1) return 'stop';
  if (SCHOOL_TYPE[w]) return SCHOOL_TYPE[w];
  if (w.length >= 5) {
    if (schoolSim(w, 'university') >= 0.78) return 'university';
    if (schoolSim(w, 'college') >= 0.78) return 'college';
    if (schoolSim(w, 'institute') >= 0.8) return 'institute';
  }
  return '';
}
function schoolKeywords(n) {
  const t = n.split(' ').filter(w => w && !schoolFiller(w));
  return t.length ? t.join(' ') : n;
}
/* "college" and "university" are filler right up until they're the whole
   difference between two real schools — Boston College and Boston
   University, Trinity College and Trinity University. So the word is
   dropped for matching, then checked separately before anything is
   rewritten on someone's behalf. */
function schoolType(n) {
  const t = n.split(' ');
  for (let i = t.length - 1; i >= 0; i--) {
    const f = schoolFiller(t[i]);
    if (f && f !== 'stop') return f;
  }
  return '';
}

const SCHOOLS = SCHOOL_DATA.trim().split('\n').map((line, i) => {
  const [name, aliases] = line.split('|');
  const keys = [name].concat(aliases ? aliases.split(';') : []).map(schoolNorm);
  return { name: name.trim(), rank: i, keys: keys, kws: keys.map(schoolKeywords),
    type: schoolType(keys[0]) };
});

/* edit distance, bailing out once the strings are too far apart to matter.
   Swapped letters ("stanfrod") count as one edit rather than two, because
   that typo is as common as any other and two would put it out of reach. */
function schoolDist(a, b, cap) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d = Math.min(d, prev2[j - 2] + 1);
      row[j] = d;
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > cap) return cap + 1;
    prev2 = prev; prev = row;
  }
  return prev[b.length];
}
function schoolSim(a, b) {
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  const cap = Math.max(1, Math.min(4, Math.floor(max / 3)));
  const d = schoolDist(a, b, cap);
  return d > cap ? 0 : 1 - d / max;
}

/* one entry scored against what's been typed. `kind` is what the match was
   made on, which is what decides later whether we're sure enough to rewrite
   the field for someone. */
function schoolScore(q, qk, qt, entry) {
  let best = null;
  for (let i = 0; i < entry.keys.length; i++) {
    const k = entry.keys[i], kk = entry.kws[i];
    let hit = null;
    if (k === q) hit = { kind: 'exact', score: 1000, sim: 1 };
    /* same name once the filler is dropped — "univ of florida" against
       "University of Florida". Scored as a prefix so that an equally good
       runner-up ("miami" answering to two schools) still blocks a rewrite. */
    else if (kk && qk && kk === qk) hit = { kind: 'prefix', score: 900, sim: 1 };
    else if (k.startsWith(q)) hit = { kind: 'prefix', score: 800 - (k.length - q.length), sim: q.length / k.length };
    else if (kk && qk && kk.startsWith(qk)) hit = { kind: 'prefix', score: 740 - (kk.length - qk.length), sim: qk.length / kk.length };
    else if (k.indexOf(' ' + q) > -1) hit = { kind: 'contains', score: 600, sim: q.length / k.length };
    else {
      /* on the keywords rather than the whole string: "rider university"
         against "rice university" is 88% of the same characters, and
         "rider" against "rice" is the comparison that means something */
      const sim = schoolSim(qk, kk);
      if (sim >= 0.7) hit = { kind: 'fuzzy', score: 200 + sim * 300, sim: sim };
      else if (qk.length >= 4 && kk.length > qk.length) {
        /* halfway through typing it, and already misspelling it: compare
           against as much of the name as they've got to. Only ever a
           suggestion — 'near' is not a kind anything auto-corrects on. */
        const head = schoolSim(qk, kk.slice(0, qk.length));
        if (head >= 0.8) hit = { kind: 'near', score: 150 + head * 200, sim: head };
      }
    }
    /* they typed a "university" and this school is a "college", or the other
       way round: worth offering in the list, never worth rewriting to. The
       school's own name decides this, so a bare alias can't slip past it. */
    if (hit && qt && entry.type && qt !== entry.type && hit.kind !== 'exact')
      hit = { kind: 'contains', score: Math.min(hit.score, 600), sim: hit.sim };
    if (hit && (!best || hit.score > best.score)) best = hit;
  }
  if (!best) return null;
  /* aliases are exact matches on something a person actually types ("umich"),
     so treat them as confidently as the full name */
  if (best.kind === 'exact' && entry.keys[0] !== q) best.kind = 'alias';
  best.name = entry.name;
  best.score -= entry.rank * 0.01;
  return best;
}

function schoolMatches(value, limit) {
  const q = schoolNorm(value);
  if (q.length < 2) return [];
  const qk = schoolKeywords(q), qt = schoolType(q);
  const out = [];
  for (const e of SCHOOLS) {
    const m = schoolScore(q, qk, qt, e);
    if (m) out.push(m);
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit || 7);
}

/* the one call the pages make. Keeps the field free text: an unlisted school
   is left alone, and nothing here can stop a submission. */
function wireSchoolField(input) {
  if (!input || input.dataset.acWired) return;
  input.dataset.acWired = '1';
  const field = input.closest('.f') || input.parentElement;
  field.classList.add('ac-field');

  const list = document.createElement('ul');
  list.className = 'ac-list';
  list.id = 'ac-' + Math.random().toString(36).slice(2, 8);
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  input.insertAdjacentElement('afterend', list);

  const note = document.createElement('span');
  note.className = 'hint ac-note';
  note.hidden = true;
  list.insertAdjacentElement('afterend', note);

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocapitalize', 'words');
  input.setAttribute('spellcheck', 'false');

  let items = [], at = -1;

  const close = () => {
    list.hidden = true; list.innerHTML = ''; items = []; at = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };
  const clearNote = () => { note.hidden = true; note.textContent = ''; };

  const mark = i => {
    at = i;
    [...list.children].forEach((li, n) => li.classList.toggle('on', n === i));
    if (i > -1) {
      input.setAttribute('aria-activedescendant', list.children[i].id);
      list.children[i].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const take = name => {
    input.value = name;
    clearNote(); close();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const open = () => {
    items = schoolMatches(input.value);
    /* nothing to offer, or they've already got the name exactly right —
       which is also what closes the list again after one is picked */
    if (!items.length || items[0].kind === 'exact') return close();
    list.innerHTML = '';
    items.forEach((m, i) => {
      const li = document.createElement('li');
      li.id = list.id + '-' + i;
      li.setAttribute('role', 'option');
      li.textContent = m.name;
      li.addEventListener('mousedown', e => e.preventDefault());
      li.addEventListener('click', () => take(m.name));
      list.appendChild(li);
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    mark(-1);
  };

  /* the fix-ups. Only run when we're sure: an alias, a prefix only one school
     answers to, or a near-miss that is clearly nearer than the runner-up. */
  const correct = () => {
    const typed = input.value.trim();
    if (!typed) return;
    /* 'near' is a mid-typing guess, too weak to correct on and too weak to
       veto a correction as the runner-up, so it sits this out entirely */
    const m = schoolMatches(typed, 4).filter(x => x.kind !== 'near');
    if (!m.length || m[0].kind === 'exact') return;
    const best = m[0], next = m[1];
    const sure =
      best.kind === 'alias' ||
      (best.kind === 'prefix' && schoolNorm(typed).length >= 4 && (!next || next.score < best.score - 40)) ||
      (best.kind === 'fuzzy' && best.sim >= 0.84 && (!next || next.sim < best.sim - 0.05));
    if (!sure || schoolNorm(best.name) === schoolNorm(typed)) return;
    input.value = best.name;
    note.hidden = false;
    note.innerHTML = 'Read that as <b></b>. ';
    note.querySelector('b').textContent = best.name;
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'ac-undo';
    undo.textContent = 'undo';
    undo.addEventListener('click', () => { input.value = typed; clearNote(); input.focus(); });
    note.appendChild(undo);
  };

  input.addEventListener('input', () => { clearNote(); open(); });
  input.addEventListener('focus', () => { if (input.value.trim()) open(); });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (list.hidden) { open(); if (list.hidden) return; }
      e.preventDefault();
      const n = items.length;
      mark(e.key === 'ArrowDown' ? (at + 1) % n : (at <= 0 ? n - 1 : at - 1));
    } else if (e.key === 'Enter') {
      if (!list.hidden && at > -1) { e.preventDefault(); take(items[at].name); }
      else { close(); correct(); }
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.stopPropagation(); close(); }
    } else if (e.key === 'Tab') {
      if (!list.hidden && at > -1) take(items[at].name);
      else { close(); correct(); }
    }
  });

  input.addEventListener('blur', () => { close(); correct(); });
  document.addEventListener('click', e => { if (!field.contains(e.target)) close(); });
}
