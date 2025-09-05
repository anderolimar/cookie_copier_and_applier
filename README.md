# Cookie Copier & Applier (Chrome Extension)

![](/icons/icon16.png)

This Google Chrome extension allows you to **copy selected cookies** from one page and **apply them to another**, as well as add **static cookies** configured manually.

---

## 🚀 Features

- **Copy cookies**: copies only the cookies with names configured in the extension's options page.
- **Apply cookies**: applies the copied cookies + static cookies to the current tab.
- **Static cookies**: manually configured (in `name=value` format), always applied together with the copied ones.
- **Extension options**: allows you to configure which cookie names should be copied and which static cookies should always be set.
- **Clipboard**: when copying, cookies are also exported as Javascript code.

---

## 📥 Installation in Developer Mode

1. **Download/clone** this repository or the extension `.zip` file.
2. Extract the files to a local folder.
3. Open Chrome and go to:
   ```
   chrome://extensions
   ```
4. Enable **Developer mode** (top right corner).
5. Click **Load unpacked** and select the extension folder.
6. The extension will appear in the list, with icon and options button.

---

## ⚙️ How to use

1. Go to a page that contains the desired cookies.
2. Right-click → **Copy cookies (configured list)**  
   - Cookies are saved internally and exported to the clipboard.
3. Go to the destination page.
4. Right-click → **Apply copied cookies here**  
   - The extension applies the copied cookies + the static cookies you defined.
5. Use the extension options page to:
   - Define **cookie names** to be copied.
   - Define **static cookies** that will always be applied.

---

## 📂 File Structure

- `manifest.json` → Extension configuration.
- `background.js` → Main logic (context menus, copy/apply cookies).
- `options.html` → Options page (cookie names and static cookies).
- `options.js` → Options page logic.
- `icons/` → Extension icons in various sizes.

---

## ⚠️ Limitations

- **HttpOnly cookies**: can be read, but the `httpOnly` flag is ignored when setting cookies via the API.
- Cookies with **domain/path**: by default are applied with `path="/"` on the current tab's domain.  
  (If you want to preserve them, adjust the code in `background.js`).
- Chrome may prevent applying cookies to different domains depending on security policies.

---

## 📝 License

Free to use for testing, learning, and internal integrations.
