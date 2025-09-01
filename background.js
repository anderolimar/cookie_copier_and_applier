let copiedCookies = [];

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "copyCookies",
    title: "Copy cookies (configured list)",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "applyCookies",
    title: "Apply copied cookies here",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;
  if (info.menuItemId === "copyCookies") {
    chrome.storage.sync.get({ cookieNames: [] }, async (items) => {
      const cookies = await chrome.cookies.getAll({ url: tab.url });
      copiedCookies = cookies.filter(c => items.cookieNames.includes(c.name));
      // await navigator.clipboard.writeText(JSON.stringify(copiedCookies, null, 2));
      await copyTextToClipboardOnPage(tabId, JSON.stringify(copiedCookies, null, 2));
      console.log("Copied cookies:", copiedCookies);
    });
  }
  if (info.menuItemId === "applyCookies") {
    chrome.storage.sync.get({ staticCookies: [] }, async (items) => {
      const url = new URL(tab.url);
      for (const c of copiedCookies) {
        chrome.cookies.set({
          url: url.origin,
          name: c.name,
          value: c.value,
          path: "/"
        });
      }
      for (const s of items.staticCookies) {
        const [name, value] = s.split("=");
        if (name && value !== undefined) {
          chrome.cookies.set({
            url: url.origin,
            name: name.trim(),
            value: value.trim(),
            path: "/"
          });
        }
      }
      console.log("Applied cookies (copied + static)");
    });
  }
});

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
