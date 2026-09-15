const sections = [...document.querySelectorAll(".page-section")];
const links = [...document.querySelectorAll(".nav-link")];
const pageName = document.getElementById("pageName");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");

const pageTitles = {
  overview: "Overview",
  process: "Process flow",
  systems: "System screens",
  equipment: "Equipment",
  readings: "Readings",
  "filter-cycle": "Filter cycle",
  alarms: "Alarm lab",
  trends: "Trends",
  notes: "Daily notes"
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function navigate(id) {
  const target = document.getElementById(id) ? id : "overview";
  sections.forEach(section => section.classList.toggle("active", section.id === target));
  links.forEach(link => link.classList.toggle("active", link.dataset.section === target));
  pageName.textContent = pageTitles[target];
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (location.hash !== "#" + target) history.replaceState(null, "", "#" + target);
}

links.forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  navigate(link.dataset.section);
}));

document.querySelectorAll("[data-jump]").forEach(item => {
  item.addEventListener("click", () => {
    if (item.dataset.topic) markTopic(item.dataset.topic);
    navigate(item.dataset.jump);
  });
});

document.getElementById("menuButton").addEventListener("click", () => sidebar.classList.toggle("open"));
document.addEventListener("click", event => {
  if (window.innerWidth <= 780 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && event.target.id !== "menuButton") {
    sidebar.classList.remove("open");
  }
});

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
}
updateClock();
setInterval(updateClock, 1000);

let explored = JSON.parse(localStorage.getItem("pacoil-explored") || "[]");
function renderTopics() {
  document.querySelectorAll("[data-topic]").forEach(card => card.classList.toggle("done", explored.includes(card.dataset.topic)));
  document.getElementById("completedCount").textContent = explored.length;
}
function markTopic(topic) {
  if (!explored.includes(topic)) {
    explored.push(topic);
    localStorage.setItem("pacoil-explored", JSON.stringify(explored));
    renderTopics();
  }
}
renderTopics();

const processData = {
  feed: {
    step: "STEP 01",
    title: "Incoming oil",
    body: "The oil enters the bleaching section from the previous stage of the refinery.",
    watch: ["Incoming flow rate", "Feed temperature", "Source tank and pump status"],
    key: "The pump provides the force that moves oil through the pipe."
  },
  bleach: {
    step: "STEP 02",
    title: "Bleaching vessel",
    body: "The oil is heated and mixed with a controlled quantity of bleaching earth, which attracts colour pigments and unwanted compounds.",
    watch: ["Vessel temperature", "Vacuum or pressure", "Bleaching earth dosing and mixing"],
    key: "Bleaching is treatment, not filtering. The unwanted material attaches to the bleaching earth here."
  },
  filter: {
    step: "STEP 03",
    title: "Pressure filter",
    body: "The treated mixture enters the filter. Oil passes through while bleaching earth and captured impurities form a filter cake.",
    watch: ["Inlet and outlet pressure", "Flow rate", "Current filter-cycle stage"],
    key: "A rising pressure difference can show increasing resistance as the filter cake builds."
  },
  out: {
    step: "STEP 04",
    title: "Filtered oil",
    body: "After solids are removed, the cleaner oil leaves filtration and continues to the next refinery process or holding tank.",
    watch: ["Outlet flow", "Product clarity or quality", "Destination tank status"],
    key: "The final purpose is cleaner oil that is ready for the next processing stage."
  }
};

document.querySelectorAll(".process-node").forEach(node => {
  node.addEventListener("click", () => {
    document.querySelectorAll(".process-node").forEach(item => item.classList.remove("selected"));
    node.classList.add("selected");
    const data = processData[node.dataset.node];
    document.getElementById("processExplain").innerHTML =
      '<span class="explain-step">' + data.step + '</span>' +
      '<h2>' + data.title + '</h2>' +
      '<p>' + data.body + '</p>' +
      '<div class="watch-list"><span>WHAT TO NOTICE</span><ul>' +
      data.watch.map(item => "<li>" + item + "</li>").join("") +
      '</ul></div><div class="key-point"><b>Key idea</b><p>' + data.key + "</p></div>";
    markTopic(node.dataset.node === "feed" ? "flow" : "purpose");
  });
});


const systemData = {
  bleaching: {
    code: "B602", label: "BLEACHING SECTION", title: "Bleaching",
    body: "Crude oil is heated and mixed with a measured dose of bleaching earth. The earth captures colour pigments and other unwanted material before filtration.",
    points: ["Crude-oil flow and temperature", "Bleaching-earth dosing rate", "B602 level, temperature and vacuum", "Pump and control-valve status"],
    note: "Understand the purpose and important variables. You do not need to operate the dosing controls."
  },
  filters: {
    code: "F601–04", label: "PRESSURE FILTERS", title: "Four-filter system",
    body: "F601, F602, F603 and F604 perform the same separation process. Different filters may be filtering, preparing, drying or cleaning at the same time.",
    points: ["Current stage of every filter", "Filter pressure and cycle time", "Active feed and circulation route", "Batch counter and abnormal delays"],
    note: "For analytics, compare cycle duration and pressure patterns between all four filters."
  },
  ve702: {
    code: "VE702", label: "VACUUM ECONOMIZER", title: "Vacuum economizer",
    body: "This section combines heating and vacuum conditions to remove volatile material or moisture while recovering heat efficiently.",
    points: ["Vacuum pressure in mbar or Torr", "Inlet and outlet temperatures", "Steam flow and pressure", "Oil flow through the section"],
    note: "Treat this as a heat-and-vacuum process. Confirm the exact operational purpose with the process engineer."
  },
  e702: {
    code: "E702", label: "SPIRAL HEAT EXCHANGER", title: "Spiral heat exchanger",
    body: "E702 transfers heat between process streams so oil can be heated or cooled with less wasted energy.",
    points: ["Temperature before and after E702", "Flow through each side", "Steam or cooling-water condition", "Unexpected temperature difference"],
    note: "A useful analysis is heat-exchanger performance: compare inlet/outlet temperatures with flow."
  },
  utilities: {
    code: "UTIL", label: "SUPPORTING SERVICES", title: "Utilities",
    body: "The main process depends on steam, cooling water, compressed air and electrical power. Utility problems can affect several process areas at once.",
    points: ["3-bar, 9-bar and 12-bar steam", "Clean and dirty cooling water", "Plant air and instrument air", "Voltage, current and power usage"],
    note: "Utility trends can help explain process alarms even when the process equipment itself is healthy."
  },
  vacuum: {
    code: "VAC", label: "VACUUM SYSTEM", title: "Vacuum system",
    body: "The vacuum equipment maintains pressure below atmospheric level for parts of the process that require gas or moisture removal.",
    points: ["Vacuum measurement and stability", "Steam and water availability", "Vacuum-pump status", "Leaks or loss-of-vacuum alarms"],
    note: "Learn the relationship: lower absolute pressure means a stronger vacuum. Confirm which unit the operators normally use."
  }
};

function renderSystem(key) {
  const data = systemData[key];
  document.getElementById("systemDetail").innerHTML =
    '<div class="system-symbol"><div><b>' + data.code + '</b><small>' + data.label + '</small></div></div>' +
    '<div class="system-copy"><span class="eyebrow">SYSTEM PURPOSE</span><h2>' + data.title + '</h2><p>' + data.body + '</p></div>' +
    '<div class="system-points"><span>WHAT TO WATCH</span><ul>' + data.points.map(point => "<li>" + point + "</li>").join("") + '</ul></div>' +
    '<div class="system-note"><b>Intern focus:</b> ' + data.note + '</div>';
  document.querySelectorAll("[data-system]").forEach(button => button.classList.toggle("active", button.dataset.system === key));
}

document.querySelectorAll("[data-system]").forEach(button => {
  button.addEventListener("click", () => {
    renderSystem(button.dataset.system);
    markTopic("equipment");
  });
});
renderSystem("bleaching");

const svRange = document.getElementById("svRange");
const pvRange = document.getElementById("pvRange");
function updateSimulator() {
  const sv = Number(svRange.value);
  const pv = Number(pvRange.value);
  const difference = sv - pv;
  const absolute = Math.abs(difference);
  document.getElementById("svLabel").textContent = sv + "°C";
  document.getElementById("pvLabel").textContent = pv + "°C";
  document.getElementById("gaugeValue").textContent = pv;
  document.getElementById("errorValue").textContent = difference;
  document.getElementById("gauge").style.setProperty("--gauge-angle", Math.max(0, Math.min(180, (pv - 70) * 2)) + "deg");

  const result = document.getElementById("simResult");
  if (absolute <= 5) {
    result.className = "sim-result normal";
    result.innerHTML = "<span>● NORMAL</span><p>PV is close to the target.</p>";
  } else if (absolute <= 20) {
    result.className = "sim-result warning";
    result.innerHTML = "<span>● DEVIATION</span><p>PV is moving away from the target.</p>";
  } else {
    result.className = "sim-result danger";
    result.innerHTML = "<span>● ABNORMAL</span><p>Large difference. This requires attention.</p>";
  }
  markTopic("pvsv");
}
svRange.addEventListener("input", updateSimulator);
pvRange.addEventListener("input", updateSimulator);

const cycles = [
  { name: "Ready", icon: "✓", text: "The filter is available and waiting for the sequence to begin.", watch: [["Primary value", "Ready / enable"], ["Equipment", "All interlocks"], ["Goal", "Safe to start"]] },
  { name: "Vacuum", icon: "◌", text: "Air and gases are removed to prepare the filter for filling.", watch: [["Primary value", "Vacuum"], ["Equipment", "Vacuum system"], ["Goal", "Prepare filter"]] },
  { name: "Filling", icon: "↧", text: "The filter is filled with the oil and bleaching-earth mixture.", watch: [["Primary value", "Level / time"], ["Equipment", "Feed valve"], ["Goal", "Fill safely"]] },
  { name: "Backrun", icon: "↶", text: "Oil is routed through the defined backrun step before normal filtration.", watch: [["Primary value", "Stage timer"], ["Equipment", "Routing valves"], ["Goal", "Prepare flow path"]] },
  { name: "Filtration", icon: "≋", text: "Oil passes through the filter medium while bleaching earth and captured impurities remain as filter cake.", watch: [["Primary value", "Pressure"], ["Equipment", "Filter + pump"], ["Goal", "Separate solids"]] },
  { name: "Circulation", icon: "⟳", text: "Oil circulates until the required clarity or stable process condition is achieved.", watch: [["Primary value", "Flow / clarity"], ["Equipment", "Circulation line"], ["Goal", "Stabilise quality"]] },
  { name: "Emptying", icon: "↘", text: "Remaining liquid is displaced or drained from the filter.", watch: [["Primary value", "Level / flow"], ["Equipment", "Outlet valve"], ["Goal", "Recover oil"]] },
  { name: "Drying", icon: "≈", text: "The filter cake is dried to recover remaining oil and prepare for discharge.", watch: [["Primary value", "Time / pressure"], ["Equipment", "Air or steam"], ["Goal", "Dry filter cake"]] },
  { name: "Post-empty", icon: "⋯", text: "A short confirmation stage completes emptying before ventilation and cleaning.", watch: [["Primary value", "Watchover timer"], ["Equipment", "Drain route"], ["Goal", "Confirm empty"]] },
  { name: "Ventilation", icon: "≋", text: "The filter pressure is safely equalised and the vessel is prepared for cleaning.", watch: [["Primary value", "Pressure / timer"], ["Equipment", "Vent line"], ["Goal", "Make condition safe"]] },
  { name: "Cleaning", icon: "✦", text: "Accumulated filter cake is removed so the filter can return to ready state.", watch: [["Primary value", "Cycle status"], ["Equipment", "Vibrator / mechanism"], ["Goal", "Reset filter"]] }
];

function renderCycle(index) {
  document.getElementById("cycleSteps").innerHTML = cycles.map((cycle, i) =>
    '<button class="cycle-step ' + (i === index ? "active" : "") + '" data-cycle="' + i + '"><span>0' + (i + 1) + '</span><b>' + cycle.name.toUpperCase() + "</b></button>"
  ).join("");
  const cycle = cycles[index];
  document.getElementById("cycleDetail").innerHTML =
    '<div class="cycle-illustration">' + cycle.icon + '</div>' +
    '<div><span class="eyebrow">STAGE 0' + (index + 1) + '</span><h2>' + cycle.name + '</h2><p>' + cycle.text + '</p></div>' +
    '<div><ul>' + cycle.watch.map(item => "<li><span>" + item[0] + "</span><b>" + item[1] + "</b></li>").join("") + "</ul></div>";
  document.querySelectorAll("[data-cycle]").forEach(button => button.addEventListener("click", () => {
    renderCycle(Number(button.dataset.cycle));
    markTopic("status");
  }));
}
renderCycle(0);

document.querySelectorAll("#answers button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#answers button").forEach(item => item.classList.remove("correct", "wrong"));
    const correct = button.dataset.correct === "true";
    button.classList.add(correct ? "correct" : "wrong");
    document.getElementById("quizFeedback").textContent = correct
      ? "Correct. The PV is 0.8 bar, well below the 3.0 bar target."
      : "Not quite. Compare the 0.8 bar PV with the 3.0 bar normal target.";
    markTopic("alarms");
  });
});

const checklistItems = [
  "Explain the complete crude-oil to filtration flow",
  "Explain the purpose of bleaching vessel B602",
  "Identify filters F601, F602, F603 and F604",
  "Explain VE702, E702, utilities and vacuum at a high level",
  "Recognise PT, TT, FT, LT and their units",
  "Explain PV, SV and MV",
  "Name the complete filter-cycle sequence",
  "Explain alarm tag, timestamp, description and status",
  "Ask for normal operating ranges and tag definitions",
  "Ask whether historical data can be exported safely"
]
let checks = JSON.parse(localStorage.getItem("pacoil-checks") || "[]");
function renderChecks() {
  document.getElementById("dailyChecks").innerHTML = checklistItems.map((item, index) =>
    '<label class="check-row ' + (checks.includes(index) ? "checked" : "") + '"><input type="checkbox" data-check="' + index + '" ' + (checks.includes(index) ? "checked" : "") + "><span>" + item + "</span></label>"
  ).join("");
  const percent = Math.round((checks.length / checklistItems.length) * 100);
  document.getElementById("checkProgress").textContent = percent + "%";
  document.querySelectorAll("[data-check]").forEach(box => box.addEventListener("change", () => {
    const index = Number(box.dataset.check);
    checks = box.checked ? [...new Set([...checks, index])] : checks.filter(item => item !== index);
    localStorage.setItem("pacoil-checks", JSON.stringify(checks));
    renderChecks();
  }));
}
renderChecks();

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
document.getElementById("resetChecks").addEventListener("click", () => {
  checks = [];
  localStorage.setItem("pacoil-checks", "[]");
  renderChecks();
  showToast("Checklist reset");
});

const learned = document.getElementById("learned");
const questions = document.getElementById("questions");
learned.value = localStorage.getItem("pacoil-learned") || "";
questions.value = localStorage.getItem("pacoil-questions") || "";
[learned, questions].forEach(field => field.addEventListener("input", () => {
  document.getElementById("saveStatus").textContent = "Unsaved changes";
}));
document.getElementById("saveNotes").addEventListener("click", () => {
  localStorage.setItem("pacoil-learned", learned.value);
  localStorage.setItem("pacoil-questions", questions.value);
  document.getElementById("saveStatus").textContent = "Saved locally";
  showToast("Daily notes saved");
});

window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
navigate(location.hash.slice(1) || "overview");