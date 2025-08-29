const textarea = document.getElementById("cookieNames");
const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");

function parseNames(text) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function renderPreview(names) {
  previewEl.innerHTML = names.length
    ? names.map(n => `<span class="pill">${n}</span>`).join(" ")
    : `<span class="muted">No name configured.</span>`;
}

async function load() {
  const { cookieNames } = await chrome.storage.local.get({ cookieNames: [] });
  textarea.value = cookieNames.join("\n");
  renderPreview(cookieNames);
  statusEl.textContent = "";
}

async function save() {
  const names = parseNames(textarea.value);
  await chrome.storage.local.set({ cookieNames: names });
  renderPreview(names);
  statusEl.textContent = "Saved!";
  setTimeout(() => (statusEl.textContent = ""), 1500);
}

saveBtn.addEventListener("click", save);
loadBtn.addEventListener("click", load);
document.addEventListener("DOMContentLoaded", load);


const staticTextarea = document.getElementById("staticCookies");
const statusStaticEl = document.getElementById("statusStatic");
const previewStaticEl = document.getElementById("previewStatic");
const saveStaticBtn = document.getElementById("saveStaticBtn");
const loadStaticBtn = document.getElementById("loadStaticBtn");

function parseStaticCookies(text) {
  return text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const [name, ...rest] = line.split("=");
      return { name: name.trim(), value: rest.join("=").trim() };
    })
    .filter(c => c.name && c.value);
}

function renderStaticPreview(cookies) {
  previewStaticEl.innerHTML = cookies.length
    ? cookies.map(c => `<span class="pill">${c.name}=${c.value}</span>`).join(" ")
    : `<span class="muted">No static cookies set.</span>`;
}

async function loadStatic() {
  const { staticCookies } = await chrome.storage.local.get({ staticCookies: [] });
  staticTextarea.value = staticCookies.map(c => `${c.name}=${c.value}`).join("\n");
  renderStaticPreview(staticCookies);
  statusStaticEl.textContent = "";
}

async function saveStatic() {
  const cookies = parseStaticCookies(staticTextarea.value);
  await chrome.storage.local.set({ staticCookies: cookies });
  renderStaticPreview(cookies);
  statusStaticEl.textContent = "Saved!";
  setTimeout(() => (statusStaticEl.textContent = ""), 1500);
}

saveStaticBtn.addEventListener("click", saveStatic);
loadStaticBtn.addEventListener("click", loadStatic);
document.addEventListener("DOMContentLoaded", loadStatic);
