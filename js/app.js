
"use strict";

/* =========================================================
   ITCare — IT Helpdesk & Asset Management
   Portfolio demo | HTML + CSS + JavaScript + localStorage
   ========================================================= */

const STORAGE = {
  tickets: "itcare-tickets",
  assets: "itcare-assets"
};

const STATUS = {
  Open: "Terbuka",
  "In Progress": "Diproses",
  Resolved: "Selesai"
};

const PRIORITY = {
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah"
};

const CONDITION = {
  Good: "Baik",
  Maintenance: "Perlu perawatan",
  Damaged: "Rusak"
};

const CATEGORY = {
  Hardware: "Hardware",
  Software: "Software",
  Network: "Jaringan",
  Account: "Akun & akses",
  Other: "Lainnya",
  Laptop: "Laptop",
  "Desktop PC": "Desktop PC",
  Printer: "Printer",
  Peripheral: "Peripheral"
};

const $ = (selector) => document.querySelector(selector);

function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateISO(date);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHTML(value);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function generateId(prefix, items) {
  const numbers = items
    .map((item) => Number(String(item.id || "").replace(prefix, "")))
    .filter(Number.isFinite);

  const next = Math.max(0, ...numbers) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key}:`, error);
    return fallback;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    showToast("Data gagal disimpan. Periksa penyimpanan browser.", true);
    return false;
  }
}

/* Contoh data awal hanya digunakan saat penyimpanan masih kosong. */
function createSampleTickets() {
  return [
    {
      id: "TK-001",
      title: "Komputer tidak dapat menyala",
      reporter: "Andi Pratama",
      category: "Hardware",
      priority: "High",
      status: "Open",
      date: daysAgoISO(0),
      description: "Komputer tidak merespons saat tombol power ditekan."
    },
    {
      id: "TK-002",
      title: "Koneksi Wi-Fi tidak stabil",
      reporter: "Siti Rahma",
      category: "Network",
      priority: "Medium",
      status: "In Progress",
      date: daysAgoISO(1),
      description: "Koneksi internet sering terputus di ruang kerja."
    },
    {
      id: "TK-003",
      title: "Instalasi aplikasi perkantoran",
      reporter: "Budi Santoso",
      category: "Software",
      priority: "Low",
      status: "Resolved",
      date: daysAgoISO(2),
      description: "Permintaan instalasi aplikasi perkantoran."
    },
    {
      id: "TK-004",
      title: "Printer tidak dapat mencetak",
      reporter: "Dewi Lestari",
      category: "Hardware",
      priority: "Medium",
      status: "Open",
      date: daysAgoISO(3),
      description: "Printer terdeteksi tetapi dokumen tidak tercetak."
    },
    {
      id: "TK-005",
      title: "Reset kata sandi akun",
      reporter: "Rizky Maulana",
      category: "Account",
      priority: "Low",
      status: "Resolved",
      date: daysAgoISO(5),
      description: "Pengguna membutuhkan bantuan pemulihan akses."
    }
  ];
}

function createSampleAssets() {
  return [
    {
      id: "AST-001",
      name: "Laptop Lenovo ThinkPad",
      category: "Laptop",
      location: "Ruang IT",
      condition: "Good",
      maintenanceDate: daysAgoISO(-30)
    },
    {
      id: "AST-002",
      name: "Desktop PC Administrasi",
      category: "Desktop PC",
      location: "Ruang Administrasi",
      condition: "Good",
      maintenanceDate: daysAgoISO(-45)
    },
    {
      id: "AST-003",
      name: "Printer HP LaserJet",
      category: "Printer",
      location: "Ruang Guru",
      condition: "Maintenance",
      maintenanceDate: daysAgoISO(-3)
    },
    {
      id: "AST-004",
      name: "Switch jaringan 24 port",
      category: "Network",
      location: "Ruang Server",
      condition: "Damaged",
      maintenanceDate: daysAgoISO(2)
    }
  ];
}

let tickets = loadData(STORAGE.tickets, null);
let assets = loadData(STORAGE.assets, null);

if (tickets === null) {
  tickets = createSampleTickets();
  saveData(STORAGE.tickets, tickets);
}

if (assets === null) {
  assets = createSampleAssets();
  saveData(STORAGE.assets, assets);
}

/* Normalisasi data lama supaya struktur yang sudah ada tetap dapat digunakan. */
tickets = tickets.map((ticket, index) => ({
  id: String(ticket.id || `TK-${String(index + 1).padStart(3, "0")}`),
  title: String(ticket.title || ticket.subject || "Permasalahan IT"),
  reporter: String(ticket.reporter || ticket.requester || ticket.name || "Pengguna"),
  category: ticket.category || "Other",
  priority: ["High", "Medium", "Low"].includes(ticket.priority) ? ticket.priority : "Medium",
  status: ["Open", "In Progress", "Resolved"].includes(ticket.status) ? ticket.status : "Open",
  date: ticket.date || ticket.createdAt || localDateISO(),
  description: String(ticket.description || "")
}));

assets = assets.map((asset, index) => ({
  id: String(asset.id || `AST-${String(index + 1).padStart(3, "0")}`),
  name: String(asset.name || asset.title || "Perangkat IT"),
  category: asset.category || "Other",
  location: String(asset.location || "Belum ditentukan"),
  condition: ["Good", "Maintenance", "Damaged"].includes(asset.condition) ? asset.condition : "Good",
  maintenanceDate: asset.maintenanceDate || asset.nextMaintenance || ""
}));

saveData(STORAGE.tickets, tickets);
saveData(STORAGE.assets, assets);

/* =========================================================
   Utilitas tampilan
   ========================================================= */

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function showToast(message, isError = false) {
  const container = $("#toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;

  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", isError ? "alert-circle" : "check-circle-2");

  const text = document.createElement("span");
  text.textContent = message;

  toast.append(icon, text);
  container.appendChild(toast);
  renderIcons();

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function getStatusBadge(status) {
  const classes = {
    Open: "status-open",
    "In Progress": "status-progress",
    Resolved: "status-resolved"
  };

  return `<span class="status-badge ${classes[status] || "status-open"}">${escapeHTML(STATUS[status] || status)}</span>`;
}

function getPriorityBadge(priority) {
  const classes = {
    High: "priority-high",
    Medium: "priority-medium",
    Low: "priority-low"
  };

  return `<span class="priority-badge ${classes[priority] || "priority-medium"}">${escapeHTML(PRIORITY[priority] || priority)}</span>`;
}

function getConditionBadge(condition) {
  const classes = {
    Good: "condition-good",
    Maintenance: "condition-maintenance",
    Damaged: "condition-damaged"
  };

  return `<span class="condition-badge ${classes[condition] || "condition-good"}">${escapeHTML(CONDITION[condition] || condition)}</span>`;
}

function persistTickets() {
  return saveData(STORAGE.tickets, tickets);
}

function persistAssets() {
  return saveData(STORAGE.assets, assets);
}

/* =========================================================
   Navigasi halaman
   ========================================================= */

const pageTitles = {
  dashboard: "Dashboard",
  tickets: "Manajemen Tiket",
  assets: "Inventaris Aset",
  about: "Tentang Proyek"
};

function navigateTo(page) {
  if (!pageTitles[page]) return;

  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("active", section.id === `page-${page}`);
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  $("#breadcrumbTitle").textContent = pageTitles[page];
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderIcons();
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => navigateTo(button.dataset.page));
});

document.querySelectorAll("[data-goto]").forEach((button) => {
  button.addEventListener("click", () => navigateTo(button.dataset.goto));
});

$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (window.innerWidth <= 950 &&
      !event.target.closest("#sidebar") &&
      !event.target.closest("#menuToggle")) {
    $("#sidebar").classList.remove("open");
  }
});

$("#todayButton").addEventListener("click", () => {
  showToast(`Hari ini: ${formatDate(localDateISO())}`);
});

/* =========================================================
   Dashboard dan grafik
   ========================================================= */

function countStatus(status) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

function countCondition(condition) {
  return assets.filter((asset) => asset.condition === condition).length;
}

function renderDashboard() {
  const total = tickets.length;
  const open = countStatus("Open");
  const progress = countStatus("In Progress");
  const resolved = countStatus("Resolved");
  const percentage = total ? Math.round((resolved / total) * 100) : 0;

  $("#statTotalTickets").textContent = total;
  $("#statOpenTickets").textContent = open;
  $("#statProgressTickets").textContent = progress;
  $("#statResolvedTickets").textContent = resolved;
  $("#resolvedPercentage").textContent = `${percentage}%`;
  $("#navOpenCount").textContent = open + progress;

  $("#ticketPageTotal").textContent = total;
  $("#ticketPageOpen").textContent = open;
  $("#ticketPageProgress").textContent = progress;
  $("#ticketPageResolved").textContent = resolved;

  $("#statTotalAssets").textContent = assets.length;
  $("#assetGoodCount").textContent = countCondition("Good");
  $("#assetMaintenanceCount").textContent = countCondition("Maintenance");
  $("#assetDamagedCount").textContent = countCondition("Damaged");

  $("#assetPageTotal").textContent = assets.length;
  $("#assetPageGood").textContent = countCondition("Good");
  $("#assetPageMaintenance").textContent = countCondition("Maintenance");
  $("#assetPageDamaged").textContent = countCondition("Damaged");

  renderTicketActivityChart();
  renderTicketDonut(total, open, progress, resolved);
  renderRecentTickets();
  renderAssetSummary();
}

function renderTicketActivityChart() {
  const chart = $("#ticketActivityChart");
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const iso = localDateISO(date);

    days.push({
      iso,
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      count: tickets.filter((ticket) => ticket.date === iso).length,
      today: offset === 0
    });
  }

  const max = Math.max(1, ...days.map((day) => day.count));
  const weeklyTotal = days.reduce((sum, day) => sum + day.count, 0);

  chart.innerHTML = days.map((day) => {
    const height = day.count ? Math.max(5, (day.count / max) * 100) : 3;

    return `
      <div class="bar-column${day.today ? " today" : ""}" title="${escapeHTML(day.label)}: ${day.count} tiket">
        <span class="bar-value">${day.count}</span>
        <div class="bar-track">
          <div class="bar-fill" style="height:${height}%"></div>
        </div>
        <span class="bar-day">${escapeHTML(day.label)}</span>
      </div>`;
  }).join("");

  $("#weeklyTicketTotal").textContent = `${weeklyTotal} tiket`;
}

function renderTicketDonut(total, open, progress, resolved) {
  $("#donutTotal").textContent = total;
  $("#legendOpen").textContent = open;
  $("#legendProgress").textContent = progress;
  $("#legendResolved").textContent = resolved;

  if (!total) {
    $("#ticketDonut").style.background = "conic-gradient(#e9edf5 0 100%)";
    return;
  }

  const openEnd = (open / total) * 100;
  const progressEnd = openEnd + (progress / total) * 100;

  $("#ticketDonut").style.background =
    `conic-gradient(
      #f2a23a 0% ${openEnd}%,
      #8a63db ${openEnd}% ${progressEnd}%,
      #24b47e ${progressEnd}% 100%
    )`;
}

function renderRecentTickets() {
  const recent = [...tickets]
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id))
    .slice(0, 5);

  $("#recentTicketsBody").innerHTML = recent.map((ticket) => `
    <tr>
      <td><span class="ticket-code">${escapeHTML(ticket.id)}</span></td>
      <td><div class="ticket-title-cell" title="${escapeHTML(ticket.title)}">${escapeHTML(ticket.title)}</div></td>
      <td>${getPriorityBadge(ticket.priority)}</td>
      <td>${getStatusBadge(ticket.status)}</td>
    </tr>
  `).join("");

  $("#recentTicketsEmpty").classList.toggle("hidden", recent.length > 0);
}

function renderAssetSummary() {
  const total = assets.length || 1;
  const good = countCondition("Good");
  const maintenance = countCondition("Maintenance");
  const damaged = countCondition("Damaged");

  $("#assetGoodBar").style.width = `${(good / total) * 100}%`;
  $("#assetMaintenanceBar").style.width = `${(maintenance / total) * 100}%`;
  $("#assetDamagedBar").style.width = `${(damaged / total) * 100}%`;
}

/* =========================================================
   Manajemen tiket
   ========================================================= */

function getFilteredTickets() {
  const query = $("#ticketSearch").value.trim().toLowerCase();
  const status = $("#ticketStatusFilter").value;
  const priority = $("#ticketPriorityFilter").value;

  return tickets.filter((ticket) => {
    const searchable = [
      ticket.id,
      ticket.title,
      ticket.reporter,
      ticket.category,
      ticket.description
    ].join(" ").toLowerCase();

    return (!query || searchable.includes(query)) &&
      (!status || ticket.status === status) &&
      (!priority || ticket.priority === priority);
  }).sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id));
}

function renderTicketsTable() {
  const filtered = getFilteredTickets();

  $("#ticketsTableBody").innerHTML = filtered.map((ticket) => `
    <tr>
      <td><span class="ticket-code">${escapeHTML(ticket.id)}</span></td>
      <td>
        <div class="ticket-title-cell" title="${escapeHTML(ticket.title)}">${escapeHTML(ticket.title)}</div>
        <div style="margin-top:5px;color:#9aa4b5;font-size:9px">${escapeHTML(CATEGORY[ticket.category] || ticket.category)}</div>
      </td>
      <td>${escapeHTML(ticket.reporter)}</td>
      <td>${getPriorityBadge(ticket.priority)}</td>
      <td>${getStatusBadge(ticket.status)}</td>
      <td>${formatDate(ticket.date)}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn" data-ticket-action="edit" data-id="${escapeHTML(ticket.id)}" title="Edit tiket" aria-label="Edit tiket">
            <i data-lucide="pencil"></i>
          </button>
          <button class="action-btn" data-ticket-action="status" data-id="${escapeHTML(ticket.id)}" title="Ubah status" aria-label="Ubah status">
            <i data-lucide="refresh-cw"></i>
          </button>
          <button class="action-btn delete" data-ticket-action="delete" data-id="${escapeHTML(ticket.id)}" title="Hapus tiket" aria-label="Hapus tiket">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  $("#ticketsEmpty").classList.toggle("hidden", filtered.length > 0);
  $("#ticketCountLabel").textContent = `Menampilkan ${filtered.length} dari ${tickets.length} tiket`;
  renderIcons();
}

["ticketSearch", "ticketStatusFilter", "ticketPriorityFilter"].forEach((id) => {
  $(`#${id}`).addEventListener(id === "ticketSearch" ? "input" : "change", renderTicketsTable);
});

function openModal(id) {
  $(`#${id}`).classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderIcons();
}

function closeModal(id) {
  $(`#${id}`).classList.add("hidden");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach((modal) => closeModal(modal.id));
  }
});

function openTicketForm(ticket = null) {
  $("#ticketForm").reset();
  $("#ticketId").value = ticket?.id || "";
  $("#ticketTitle").value = ticket?.title || "";
  $("#ticketReporter").value = ticket?.reporter || "";
  $("#ticketCategory").value = ticket?.category || "Hardware";
  $("#ticketPriority").value = ticket?.priority || "Medium";
  $("#ticketStatus").value = ticket?.status || "Open";
  $("#ticketDescription").value = ticket?.description || "";
  $("#ticketModalTitle").textContent = ticket ? "Edit tiket" : "Buat tiket baru";
  openModal("ticketModal");
  $("#ticketTitle").focus();
}

$("#addTicket").addEventListener("click", () => openTicketForm());
$("#quickAddTicket").addEventListener("click", () => openTicketForm());

$("#ticketForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("#ticketId").value;
  const existing = tickets.find((ticket) => ticket.id === id);

  const ticket = {
    id: id || generateId("TK-", tickets),
    title: $("#ticketTitle").value.trim(),
    reporter: $("#ticketReporter").value.trim(),
    category: $("#ticketCategory").value,
    priority: $("#ticketPriority").value,
    status: $("#ticketStatus").value,
    date: existing?.date || localDateISO(),
    description: $("#ticketDescription").value.trim()
  };

  if (!ticket.title || !ticket.reporter) {
    showToast("Lengkapi judul permasalahan dan nama pelapor.", true);
    return;
  }

  if (existing) {
    tickets = tickets.map((item) => item.id === id ? ticket : item);
  } else {
    tickets.unshift(ticket);
  }

  if (!persistTickets()) return;

  closeModal("ticketModal");
  refreshAll();
  showToast(existing ? "Tiket berhasil diperbarui." : "Tiket baru berhasil dibuat.");
});

$("#ticketsTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-ticket-action]");
  if (!button) return;

  const { ticketAction, id } = button.dataset;
  const ticket = tickets.find((item) => item.id === id);
  if (!ticket) return;

  if (ticketAction === "edit") {
    openTicketForm(ticket);
    return;
  }

  if (ticketAction === "status") {
    const sequence = ["Open", "In Progress", "Resolved"];
    const next = sequence[(sequence.indexOf(ticket.status) + 1) % sequence.length];

    tickets = tickets.map((item) => item.id === id ? { ...item, status: next } : item);
    if (!persistTickets()) return;

    refreshAll();
    showToast(`Status ${id} diubah menjadi ${STATUS[next]}.`);
    return;
  }

  if (ticketAction === "delete") {
    if (!window.confirm(`Hapus tiket ${id}? Tindakan ini tidak dapat dibatalkan.`)) return;

    tickets = tickets.filter((item) => item.id !== id);
    if (!persistTickets()) return;

    refreshAll();
    showToast(`Tiket ${id} berhasil dihapus.`);
  }
});

/* =========================================================
   Ekspor CSV
   ========================================================= */

function downloadCSV(filename, rows) {
  const csv = rows.map((row) =>
    row.map((cell) => {
      let value = String(cell ?? "");

      // Mencegah nilai teks CSV diperlakukan sebagai formula spreadsheet.
      if (/^[\s]*[=+\-@]/.test(value)) value = `'${value}`;

      return `"${value.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportTickets() {
  const rows = [
    ["ID Tiket", "Permasalahan", "Pelapor", "Kategori", "Prioritas", "Status", "Tanggal", "Deskripsi"],
    ...getFilteredTickets().map((ticket) => [
      ticket.id,
      ticket.title,
      ticket.reporter,
      CATEGORY[ticket.category] || ticket.category,
      PRIORITY[ticket.priority] || ticket.priority,
      STATUS[ticket.status] || ticket.status,
      ticket.date,
      ticket.description
    ])
  ];

  downloadCSV(`itcare-tickets-${localDateISO()}.csv`, rows);
  showToast("Ekspor CSV tiket berhasil.");
}

$("#exportTickets").addEventListener("click", exportTickets);
$("#dashboardExport").addEventListener("click", exportTickets);

/* =========================================================
   Manajemen aset
   ========================================================= */

function getFilteredAssets() {
  const query = $("#assetSearch").value.trim().toLowerCase();
  const condition = $("#assetConditionFilter").value;

  return assets.filter((asset) => {
    const searchable = [
      asset.id,
      asset.name,
      asset.category,
      asset.location
    ].join(" ").toLowerCase();

    return (!query || searchable.includes(query)) &&
      (!condition || asset.condition === condition);
  }).sort((a, b) => a.id.localeCompare(b.id));
}

function renderAssetsTable() {
  const filtered = getFilteredAssets();

  $("#assetsTableBody").innerHTML = filtered.map((asset) => `
    <tr>
      <td><span class="ticket-code">${escapeHTML(asset.id)}</span></td>
      <td><div class="ticket-title-cell" title="${escapeHTML(asset.name)}">${escapeHTML(asset.name)}</div></td>
      <td>${escapeHTML(CATEGORY[asset.category] || asset.category)}</td>
      <td>${escapeHTML(asset.location)}</td>
      <td>${getConditionBadge(asset.condition)}</td>
      <td>${formatDate(asset.maintenanceDate)}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn" data-asset-action="edit" data-id="${escapeHTML(asset.id)}" title="Edit aset" aria-label="Edit aset">
            <i data-lucide="pencil"></i>
          </button>
          <button class="action-btn delete" data-asset-action="delete" data-id="${escapeHTML(asset.id)}" title="Hapus aset" aria-label="Hapus aset">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  $("#assetsEmpty").classList.toggle("hidden", filtered.length > 0);
  $("#assetCountLabel").textContent = `Menampilkan ${filtered.length} dari ${assets.length} aset`;
  renderIcons();
}

["assetSearch", "assetConditionFilter"].forEach((id) => {
  $(`#${id}`).addEventListener(id === "assetSearch" ? "input" : "change", renderAssetsTable);
});

function openAssetForm(asset = null) {
  $("#assetForm").reset();
  $("#assetId").value = asset?.id || "";
  $("#assetName").value = asset?.name || "";
  $("#assetCategory").value = asset?.category || "Laptop";
  $("#assetLocation").value = asset?.location || "";
  $("#assetCondition").value = asset?.condition || "Good";
  $("#assetMaintenanceDate").value = asset?.maintenanceDate || "";
  $("#assetModalTitle").textContent = asset ? "Edit data aset" : "Tambah aset baru";
  openModal("assetModal");
  $("#assetName").focus();
}

$("#addAsset").addEventListener("click", () => openAssetForm());

$("#assetForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("#assetId").value;
  const existing = assets.find((asset) => asset.id === id);

  const asset = {
    id: id || generateId("AST-", assets),
    name: $("#assetName").value.trim(),
    category: $("#assetCategory").value,
    location: $("#assetLocation").value.trim(),
    condition: $("#assetCondition").value,
    maintenanceDate: $("#assetMaintenanceDate").value
  };

  if (!asset.name || !asset.location) {
    showToast("Lengkapi nama perangkat dan lokasi.", true);
    return;
  }

  if (existing) {
    assets = assets.map((item) => item.id === id ? asset : item);
  } else {
    assets.push(asset);
  }

  if (!persistAssets()) return;

  closeModal("assetModal");
  refreshAll();
  showToast(existing ? "Data aset berhasil diperbarui." : "Aset baru berhasil ditambahkan.");
});

$("#assetsTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-asset-action]");
  if (!button) return;

  const { assetAction, id } = button.dataset;
  const asset = assets.find((item) => item.id === id);
  if (!asset) return;

  if (assetAction === "edit") {
    openAssetForm(asset);
    return;
  }

  if (assetAction === "delete") {
    if (!window.confirm(`Hapus aset ${id} (${asset.name})?`)) return;

    assets = assets.filter((item) => item.id !== id);
    if (!persistAssets()) return;

    refreshAll();
    showToast(`Aset ${id} berhasil dihapus.`);
  }
});

/* =========================================================
   Refresh seluruh tampilan
   ========================================================= */

function refreshAll() {
  renderDashboard();
  renderTicketsTable();
  renderAssetsTable();
  renderIcons();
}

refreshAll();