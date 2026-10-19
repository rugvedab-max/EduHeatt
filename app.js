/**
 * EduHeat — Standalone Vanilla JS Application for GitHub & GitHub Pages
 * Loads data from data.json or live FastAPI backend when available.
 */

let appData = null;
let campusMap = null;
let placesMap = null;
let placesMarkersGroup = null;

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  await loadData();
  initDashboard();
  initPlaces();
  initCampusMap();
  initCalculator();
});

// Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }

      // Invalidate maps if switching into their tab
      if (targetId === "campus" && campusMap) {
        setTimeout(() => campusMap.invalidateSize(), 150);
      }
      if (targetId === "places" && placesMap) {
        setTimeout(() => placesMap.invalidateSize(), 150);
      }
    });
  });
}

// Load Application Data
async function loadData() {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) throw new Error("Could not load local data.json");
    appData = await res.json();
    console.log("Loaded local data.json successfully:", appData.project);
  } catch (err) {
    console.warn("Using embedded fallback data:", err);
  }
}

// 1. Dashboard View
function initDashboard() {
  if (!appData || !appData.weather) return;
  const w = appData.weather;
  const tempEl = document.getElementById("dash-temp");
  const feelEl = document.getElementById("dash-feel");
  const adviceEl = document.getElementById("dash-advice");
  const comfortEl = document.getElementById("dash-comfort");
  const uvEl = document.getElementById("dash-uv");
  const humEl = document.getElementById("dash-hum");

  if (tempEl) tempEl.textContent = `${w.temperature_c}°C`;
  if (feelEl) feelEl.textContent = `Feels like ${w.apparent_temperature_c}°C • Mumbai`;
  if (adviceEl) adviceEl.textContent = w.summary_advice;
  if (comfortEl) comfortEl.textContent = `${w.comfort_score}/100`;
  if (uvEl) uvEl.textContent = w.uv_index;
  if (humEl) humEl.textContent = `${w.humidity_pct}%`;
}

// 2. Cooling Places & Search
function initPlaces() {
  if (!appData || !appData.cooling_places) return;

  const mapContainer = document.getElementById("places-map");
  if (mapContainer && typeof L !== "undefined") {
    placesMap = L.map("places-map").setView([19.0760, 72.8877], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(placesMap);
    placesMarkersGroup = L.layerGroup().addTo(placesMap);
  }

  renderPlaces(appData.cooling_places);

  // Search input handler (Chembur, Ghatkopar, Kurla, Dadar, Powai, Andheri, Vidyavihar)
  const searchInput = document.getElementById("places-search-input");
  const searchBtn = document.getElementById("places-search-btn");

  function handleFilter() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const filtered = appData.cooling_places.filter((p) => {
      const haystack = `${p.name} ${p.locality || ""} ${p.address || ""} ${p.category}`.toLowerCase();
      return query === "" || haystack.includes(query);
    });
    renderPlaces(filtered);

    // If query matches a known Mumbai locality, center map
    const matchLoc = (appData.localities || []).find((l) => l.name.toLowerCase().includes(query));
    if (matchLoc && placesMap) {
      placesMap.setView([matchLoc.lat, matchLoc.lon], 14);
    }
  }

  if (searchInput) searchInput.addEventListener("input", handleFilter);
  if (searchBtn) searchBtn.addEventListener("click", handleFilter);
}

function renderPlaces(places) {
  const listEl = document.getElementById("places-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (placesMarkersGroup) placesMarkersGroup.clearLayers();

  if (places.length === 0) {
    listEl.innerHTML = "<p style='color:var(--text-muted);font-size:13px;'>No cooling locations match your query.</p>";
    return;
  }

  places.forEach((p) => {
    // DOM card
    const card = document.createElement("div");
    card.className = "place-card";
    const tagClass = p.ac ? "tag-ac" : p.water ? "tag-water" : "tag-park";
    const tagLabel = p.ac ? "❄ Cooled" : p.water ? "💧 Water" : "🌳 Shade";

    card.innerHTML = `
      <div>
        <div class="place-title">${p.name}</div>
        <div class="place-sub">${p.address || p.locality || "Mumbai"}</div>
      </div>
      <div>
        <span class="tag ${tagClass}">${tagLabel}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      if (placesMap) {
        placesMap.setView([p.lat, p.lon], 16);
      }
    });
    listEl.appendChild(card);

    // Leaflet Marker
    if (placesMarkersGroup && typeof L !== "undefined") {
      const marker = L.marker([p.lat, p.lon]);
      marker.bindPopup(`<b>${p.name}</b><br><small>${p.address}</small><br>Hours: ${p.hours}`);
      placesMarkersGroup.addLayer(marker);
    }
  });
}

// 3. Somaiya Campus Map
function initCampusMap() {
  if (!appData || !appData.campus) return;
  const c = appData.campus;
  const mapEl = document.getElementById("campus-map");
  if (!mapEl || typeof L === "undefined") return;

  campusMap = L.map("campus-map").setView(c.center, c.zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors & Somaiya Vidyavihar",
  }).addTo(campusMap);

  // 65-Acre Campus Perimeter Polygon
  if (c.boundary) {
    L.polygon(c.boundary, {
      color: "#059669",
      fillColor: "#10B981",
      fillOpacity: 0.08,
      weight: 2,
    }).bindPopup("<b>Somaiya Vidyavihar University 65-Acre Campus</b>").addTo(campusMap);
  }

  // Building Footprints
  if (c.buildings) {
    c.buildings.forEach((b) => {
      L.polygon(b.coords, {
        color: b.heat_risk === "comfortable" ? "#059669" : "#D97706",
        fillColor: b.heat_risk === "comfortable" ? "#34D399" : "#FBBF24",
        fillOpacity: 0.35,
        weight: 1.5,
      }).bindPopup(`<b>${b.name}</b><br><small>${b.notes}</small>`).addTo(campusMap);
    });
  }

  // Campus POIs
  if (c.pois) {
    c.pois.forEach((poi) => {
      const marker = L.marker([poi.lat, poi.lon]);
      marker.bindPopup(`<b>${poi.name}</b><br><small>${poi.desc}</small>`);
      marker.addTo(campusMap);
    });
  }
}

// 4. AC & Cooling Electricity Calculator
function initCalculator() {
  const form = document.getElementById("cooling-calc-form");
  if (!form) return;

  function update() {
    const appliance = document.getElementById("calc-appliance").value;
    const star = parseInt(document.getElementById("calc-star").value, 10);
    const hours = parseFloat(document.getElementById("calc-hours").value);
    const tariff = parseFloat(document.getElementById("calc-tariff").value);
    const setTemp = parseFloat(document.getElementById("calc-temp").value);

    // Baseline wattage estimates
    let baseWatts = 1500;
    if (appliance === "split_ac_1_ton") baseWatts = 1100;
    if (appliance === "inverter_ac_1_5_ton") baseWatts = 1400;
    if (appliance === "window_ac_1_5_ton") baseWatts = 1800;
    if (appliance === "air_cooler") baseWatts = 200;

    // Star rating efficiency factor
    const starEfficiencyFactor = 1.0 - (star - 3) * 0.06;

    // Temperature adjustment factor: +4% energy per degree below 24C
    const tempFactor = 1.0 + (24.0 - setTemp) * 0.04;

    const actualWatts = baseWatts * starEfficiencyFactor * Math.max(0.7, tempFactor);
    const dailyKwh = (actualWatts * hours) / 1000.0;
    const monthlyKwh = dailyKwh * 30.0;
    const monthlyCost = monthlyKwh * tariff;

    // Potential savings if setting temp to 25C instead of lower
    const optimizedWatts = baseWatts * starEfficiencyFactor * (1.0 + (24.0 - 25.0) * 0.04);
    const optMonthlyCost = ((optimizedWatts * hours) / 1000.0) * 30.0 * tariff;
    const savings = Math.max(0, monthlyCost - optMonthlyCost);

    const costEl = document.getElementById("calc-monthly-cost");
    const kwhEl = document.getElementById("calc-monthly-kwh");
    const saveEl = document.getElementById("calc-savings");

    if (costEl) costEl.textContent = `₹${Math.round(monthlyCost).toLocaleString("en-IN")}`;
    if (kwhEl) kwhEl.textContent = `${monthlyKwh.toFixed(1)} kWh / month`;
    if (saveEl) saveEl.textContent = `Save ₹${Math.round(savings).toLocaleString("en-IN")}/mo at 25°C BEE recommended setpoint`;
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
}
