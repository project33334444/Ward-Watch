/* Ward Watch: SIMULATION. Everything here is invented. The sign in is a demo only. */
const R = {
  guest:  {x:20,  y:30,  n:"Waiting area",   s:"Guest Wi-Fi"},
  nurse:  {x:260, y:30,  n:"Nurse station",  s:"Staff computers"},
  icu:    {x:500, y:30,  n:"Intensive care", s:"Life-support devices"},
  imaging:{x:20,  y:250, n:"Imaging",        s:"MRI scanner"},
  server: {x:260, y:250, n:"Server room",    s:"Patient records"},
  net:    {x:500, y:250, n:"Internet",       s:"The outside world", net:true}
};
const W = 180, H = 90;
const OK = new Set(["nurse>server", "icu>server", "imaging>server"]);
const normal = [{from:"nurse",to:"server"}, {from:"icu",to:"server"}, {from:"imaging",to:"server"}];
const attack = [{from:"guest",to:"server",devices:1}, {from:"icu",to:"net",devices:1}, {from:"nurse",to:"icu",devices:9}];

// ---- simple, explainable rules ----
function detect(flows) {
  const out = [];
  flows.forEach(f => { const id = f.from + ">" + f.to;
    if (f.to === "net" && (f.from === "icu" || f.from === "imaging"))
      out.push({id, f, level:"High", title:"A life-support device is sending data to the internet",
        why:"Medical devices should only talk to our own servers.",
        fix:"Block outside traffic only. The device keeps running and stays monitored.", did:"Outside traffic blocked. The device kept running."});
    else if (f.to === "icu" && f.devices >= 4)
      out.push({id, f, level:"Medium", title:"One computer is knocking on every ICU device",
        why:`It contacted ${f.devices} devices in a short time, which is how attackers look for a way in.`,
        fix:"Cut that one computer off the network and investigate. Patient devices are untouched.", did:"That computer was cut off. Patient devices were untouched."});
    else if (!OK.has(id))
      out.push({id, f, level:"High", title:"A guest's phone tried to open patient records",
        why:"Guest Wi-Fi must never reach the server room.",
        fix:"Block that one connection. Everything else keeps working.", did:"The connection was blocked. Everything else kept working."});
  });
  return out;
}

// ---- state ----
const alerts = detect(normal.concat(attack));
let decided = {}, when = {}, tries = 0, locked = false;
const USER = "officer", PASS = "ward123";   // demo only. Never hard-code passwords in a real system.
const $ = id => document.getElementById(id), NS = "http://www.w3.org/2000/svg";
const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
const mid = k => ({x:R[k].x + W/2, y:R[k].y + H/2});
function edge(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), ux = dx/d, uy = dy/d;
  const t = Math.min(W/2 / Math.abs(ux || 1e-9), H/2 / Math.abs(uy || 1e-9)) + 8;
  return {x:a.x + ux*t, y:a.y + uy*t};
}

// ---- map (used on screens 2 and 3) ----
function drawMap(svgId) {
  const m = $(svgId); m.innerHTML = "";
  const defs = el("defs", {}, m);
  [["r","#E2362F"],["g","#1F9D6B"],["y","#F2A33A"],["n","#6f8f8c"]].forEach(([id, c]) => {
    const mk = el("marker", {id:svgId+id, markerWidth:6, markerHeight:6, refX:4, refY:3, orient:"auto"}, defs);
    el("path", {d:"M0 0 L6 3 L0 6 z", fill:c}, mk); });
  normal.concat(attack).forEach(f => {
    const a = alerts.find(x => x.f === f), st = a ? (decided[a.id] === "yes" ? "good" : decided[a.id] ? "skip" : "bad") : "";
    const p1 = edge(mid(f.from), mid(f.to)), p2 = edge(mid(f.to), mid(f.from));
    el("path", {d:`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`, class:"arrow " + st, stroke:st ? "" : "#9DB8B5", opacity:st ? 1 : .6,
      "marker-end":`url(#${svgId}${st === "good" ? "g" : st === "skip" ? "y" : st ? "r" : "n"})`}, m); });
  Object.entries(R).forEach(([k, r]) => {
    const hit = alerts.filter(a => a.f.from === k || a.f.to === k);
    const cls = k === "net" ? "net" : !hit.length ? "" : hit.some(a => !decided[a.id]) ? "bad" : hit.some(a => decided[a.id] === "no") ? "open" : "good";
    const g = el("g", {class:"room " + cls}, m);
    el("rect", {x:r.x, y:r.y, width:W, height:H, rx:6}, g);
    el("text", {x:r.x+14, y:r.y+32, class:"rn"}, g).textContent = r.n;
    el("text", {x:r.x+14, y:r.y+54, class:"rs"}, g).textContent = r.s;
    if (k !== "net") el("text", {x:r.x+14, y:r.y+78, class:"rt"}, g).textContent = cls === "bad" ? "At risk" : cls === "good" ? "Protected" : cls === "open" ? "Still open" : "Normal"; });
}

// ---- screens ----
function show(n) {
  [1,2,3].forEach(i => $("s"+i).classList.toggle("on", i === n));
  $("bar").hidden = n === 1;
  [...$("steps").children].forEach((li, i) => li.classList.toggle("on", i < n));
  window.scrollTo(0, 0);
  if (n === 2) renderProblem();
  if (n === 3) renderResult();
}

function renderProblem() {
  const left = alerts.filter(a => !decided[a.id]).length;
  drawMap("map2");
  $("b2").className = "banner " + (left ? "bad" : "");
  $("b2").textContent = left ? "Patients are at risk" : "All threats reviewed";
  $("say2").textContent = left ? `Ward Watch found ${left} problem${left > 1 ? "s" : ""}. Nothing changes until you approve it.` : "You have reviewed every problem. Continue to see the result.";
  $("cards").innerHTML = alerts.map(a => { const d = decided[a.id];
    return `<div class="card ${d === "yes" ? "done" : ""}"><span class="lvl ${a.level}">${a.level} risk</span>
      <h3>${a.title}</h3><p>${a.why}</p><p class="fix"><b>Our suggestion:</b> ${a.fix}</p>
      ${d ? `<p class="${d === "yes" ? "tick" : "skipt"}">${d === "yes" ? "Approved by a person." : "Ignored. Still being watched."}</p>`
      : `<div class="row"><button class="btn yes" data-i="${a.id}" data-v="yes">Approve</button><button class="btn" data-i="${a.id}" data-v="no">Ignore</button></div>`}</div>`; }).join("");
  $("cards").querySelectorAll("button").forEach(b => b.onclick = () => {
    decided[b.dataset.i] = b.dataset.v; when[b.dataset.i] = new Date().toLocaleTimeString(); renderProblem(); });
  $("next").disabled = left > 0;
}

function renderResult() {
  const yes = alerts.filter(a => decided[a.id] === "yes").length, open = alerts.length - yes;
  drawMap("map3");
  $("b3").className = "banner " + (open ? "open" : "");
  $("b3").textContent = open ? `${open} threat${open > 1 ? "s" : ""} still open` : "Patients are safe. Problem fixed.";
  $("stats").innerHTML = [[alerts.length, "Problems found"], [yes, "Fixed by a person"], [open, "Left open"], [0, "Life-support devices switched off"]]
    .map(([n, l]) => `<div class="stat"><b>${n}</b>${l}</div>`).join("");
  $("report").innerHTML = alerts.map(a => `<li><b>${a.title}.</b> ${decided[a.id] === "yes" ? a.did : "Left open and still being watched."} <i>(${decided[a.id] === "yes" ? "approved" : "ignored"} by ${USER} at ${when[a.id]})</i></li>`).join("");
}

// ---- login (demo) ----
$("form").onsubmit = e => {
  e.preventDefault();
  if (locked) return;
  if ($("u").value.trim().toLowerCase() === USER && $("p").value === PASS) {
    tries = 0; $("err").textContent = ""; $("p").value = ""; $("who").textContent = "Signed in as Duty Security Officer";
    decided = {}; when = {}; show(2);
  } else if (++tries >= 3) {
    locked = true; $("signin").disabled = true; let s = 10;
    const t = setInterval(() => { $("err").textContent = `Too many tries. Locked for ${s--} seconds.`;
      if (s < 0) { clearInterval(t); locked = false; tries = 0; $("signin").disabled = false; $("err").textContent = ""; } }, 1000);
  } else $("err").textContent = `Wrong username or password. Try ${tries} of 3.`;
};
$("next").onclick = () => show(3);
$("again").onclick = () => { decided = {}; when = {}; show(2); };
$("out").onclick = () => { decided = {}; when = {}; $("u").value = ""; show(1); };
show(1);