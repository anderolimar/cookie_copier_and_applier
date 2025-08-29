// IDs dos menus
const MENU_COPY = "menu_copy_cookies";
const MENU_APPLY = "menu_apply_cookies";

// Cria o menu de contexto em todas as páginas
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_COPY,
    title: "Copy cookies (configured list)",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: MENU_APPLY,
    title: "Apply cookies copied here",
    contexts: ["all"]
  });
});

// Utilitário: obtém URL da aba alvo do clique
async function getTabUrl(info, tab) {
  if (tab && tab.url) return tab.url;
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return activeTab?.url || null;
}

// Lê nomes configurados nas opções
async function getConfiguredCookieNames() {
  const { cookieNames } = await chrome.storage.local.get({ cookieNames: [] });
  return Array.isArray(cookieNames) ? cookieNames.filter(Boolean) : [];
}

// Copia texto para clipboard na página (Content Script ad hoc)
async function copyTextToClipboardOnPage(tabId, text) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (t) => navigator.clipboard.writeText(t),
      args: [text]
    });
  } catch (e) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (t) => {
        const ta = document.createElement("textarea");
        ta.value = t;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      },
      args: [text]
    });
  }
}

// Extrai cookies por nomes para uma URL
async function fetchCookiesForUrl(url, names) {
  const found = [];
  for (const name of names) {
    const cookie = await chrome.cookies.get({ url, name }).catch(() => null);
    if (cookie) {
      found.push({
        name: cookie.name,
        value: cookie.value,
        secure: !!cookie.secure,
        httpOnly: !!cookie.httpOnly,
        sameSite: cookie.sameSite || "no_restriction"
      });
    }
  }
  return found;
}

// Aplica cookies salvos para uma URL (domínio da aba atual)
async function applyCookiesToUrl(url, savedCookies) {
  for (const c of savedCookies) {
    const details = {
      url,
      name: c.name,
      value: c.value,
      path: "/",
      secure: !!c.secure,
    };
    if (c.sameSite && c.sameSite !== "unspecified") {
      details.sameSite = c.sameSite;
    }
    try {
      await chrome.cookies.set(details);
    } catch (err) {
      console.warn("Cookie application failed", c.name, err);
    }
  }
}

// Clique nos menus
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;
  const url = await getTabUrl(info, tab);
  if (!url || !tabId) return;

  if (info.menuItemId === MENU_COPY) {
    const names = await getConfiguredCookieNames();
    if (!names.length) {
      chrome.notifications?.create?.({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Cookie Copier",
        message: "No cookie name set in Options."
      });
      return;
    }
    const cookies = await fetchCookiesForUrl(url, names);
    await chrome.storage.local.set({ copiedCookies: cookies, copiedFrom: url, copiedAt: Date.now() });
    const json = JSON.stringify(cookies, null, 2);
    await copyTextToClipboardOnPage(tabId, json);
    console.log("[Cookie Copier] Copied:", cookies.map(c => c.name));
  }

  /*if (info.menuItemId === MENU_APPLY) {
    const { copiedCookies } = await chrome.storage.local.get({ copiedCookies: [] });
    if (!copiedCookies || !copiedCookies.length) {
      chrome.notifications?.create?.({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Cookie Applier",
        message: "Nenhum cookie salvo para aplicar. Use 'Copiar cookies' antes."
      });
      return;
    }
    await applyCookiesToUrl(url, copiedCookies);
    console.log("[Cookie Applier] Aplicados:", copiedCookies.map(c => c.name));
  }*/

if (info.menuItemId === MENU_APPLY) {
  const { copiedCookies, staticCookies } = await chrome.storage.local.get({ copiedCookies: [], staticCookies: [] });
  
  if ((!copiedCookies || !copiedCookies.length) && (!staticCookies || !staticCookies.length)) {
    chrome.notifications?.create?.({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Cookie Applier",
      message: "No saved or static cookies to apply."
    });
    return;
  }

  // aplica copiados
  if (copiedCookies?.length) {
    await applyCookiesToUrl(url, copiedCookies);
    console.log("[Cookie Applier] Copied applied:", copiedCookies.map(c => c.name));
  }

  // aplica estáticos
  if (staticCookies?.length) {
    await applyCookiesToUrl(url, staticCookies);
    console.log("[Cookie Applier] Statics applied:", staticCookies.map(c => c.name));
  }
}


});