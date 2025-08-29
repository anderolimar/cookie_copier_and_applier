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
  if (info.menuItemId === "copyCookies") {
    chrome.storage.sync.get({ cookieNames: [] }, async (items) => {
      const cookies = await chrome.cookies.getAll({ url: tab.url });
      copiedCookies = cookies.filter(c => items.cookieNames.includes(c.name));
      await navigator.clipboard.writeText(JSON.stringify(copiedCookies, null, 2));
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
