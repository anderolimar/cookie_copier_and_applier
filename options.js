function renderList(listId, items, onRemove) {
  const ul = document.getElementById(listId);
  ul.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "collection-item";

    const input = document.createElement("input");
    input.type = "text";
    input.value = item;
    input.className = "browser-default";
    input.dataset.index = index;

    const removeBtn = document.createElement("a");
    removeBtn.className = "btn-small red waves-effect waves-light action-btn";
    removeBtn.innerHTML = '<i class="material-icons">delete</i>';
    removeBtn.addEventListener("click", () => onRemove(index));

    li.appendChild(input);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(
    { cookieNames: [], staticCookies: [] },
    (items) => {
      renderList("cookieNamesList", items.cookieNames, (i) => {
        items.cookieNames.splice(i, 1);
        chrome.storage.sync.set({ cookieNames: items.cookieNames });
        restoreOptions();
      });
      renderList("staticCookiesList", items.staticCookies, (i) => {
        items.staticCookies.splice(i, 1);
        chrome.storage.sync.set({ staticCookies: items.staticCookies });
        restoreOptions();
      });
    }
  );
}

// Add cookie name
document.getElementById("addCookieName").addEventListener("click", () => {
  const input = document.getElementById("newCookieName");
  const value = input.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ cookieNames: [] }, (items) => {
    items.cookieNames.push(value);
    chrome.storage.sync.set({ cookieNames: items.cookieNames }, restoreOptions);
  });
  input.value = "";
});

// Add static cookie
document.getElementById("addStaticCookie").addEventListener("click", () => {
  const input = document.getElementById("newStaticCookie");
  const value = input.value.trim();
  if (!value) return;
  chrome.storage.sync.get({ staticCookies: [] }, (items) => {
    items.staticCookies.push(value);
    chrome.storage.sync.set({ staticCookies: items.staticCookies }, restoreOptions);
  });
  input.value = "";
});

// Save options
document.getElementById("save").addEventListener("click", () => {
  const cookieInputs = document.querySelectorAll("#cookieNamesList input");
  const staticInputs = document.querySelectorAll("#staticCookiesList input");

  const cookieNames = Array.from(cookieInputs).map((i) => i.value.trim()).filter(Boolean);
  const staticCookies = Array.from(staticInputs).map((i) => i.value.trim()).filter(Boolean);

  chrome.storage.sync.set({ cookieNames, staticCookies }, () => {
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});

// Export JSON
document.getElementById("exportOptions").addEventListener("click", () => {
  chrome.storage.sync.get({ cookieNames: [], staticCookies: [] }, (items) => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cookie_copier_options.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

// Import JSON
document.getElementById("importOptions").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      chrome.storage.sync.set(
        {
          cookieNames: data.cookieNames || [],
          staticCookies: data.staticCookies || []
        },
        restoreOptions
      );
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
});

document.addEventListener("DOMContentLoaded", restoreOptions);
