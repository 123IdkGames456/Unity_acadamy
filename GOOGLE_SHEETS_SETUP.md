# Google Sheets sync setup

This connects Unity Coach to the spreadsheet you provided:

https://docs.google.com/spreadsheets/d/1TnUJxij2NXL05-TKsQJcDgY1Sf_apnRGgM4-4uSssvA/edit

## 1. Open Apps Script

1. Open the spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Open the editor file named `Code.gs`.
4. Replace its contents with the code in this repository's `google-apps-script.gs`.
5. In the first few lines, replace `REPLACE_WITH_YOUR_OWN_LONG_RANDOM_TOKEN` with a long, unique token you make up. Keep it private. Do not commit your real token to GitHub.
6. Save the Apps Script project.

## 2. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Select **Web app** as the deployment type.
3. Set **Execute as** to **Me**.
4. Set access to **Anyone** so the GitHub Pages site can reach the endpoint.
5. Click **Deploy** and approve Google's permission prompt to access this spreadsheet.
6. Copy the Web app URL ending in `/exec`.

The script checks your token before reading or writing data. Anyone who has both the web app URL and token can access the synced data, so keep the token private and avoid putting sensitive information in the sheet. If you change the script after deployment, deploy a new version.

## 3. Connect Unity Coach

1. Open https://123idkgames456.github.io/Unity_acadamy/
2. Go to **Settings → Google Sheets sync**.
3. Paste the Web app URL into **Apps Script web app URL**.
4. Paste the same token you set in `SYNC_TOKEN` into **Sync token**.
5. Click **Save sync settings**.
6. Click **Test & load from Sheets**.

After connecting, chat, shared notes, long-term memory, and coach preferences sync automatically. Use **Sync now** to send the current data manually.

## What is and isn't synced

- Synced: chat text, notes, long-term memory, communication preferences, selected model, and code teaching mode.
- Not synced: Gemini API key, Apps Script URL, sync token, and image file bytes. Image messages keep a placeholder in Sheets; images stay in the browser.
- The browser keeps a local copy too. Export a backup before testing with important data.

## Troubleshooting

- **Invalid sync token:** make sure the token matches exactly in Apps Script and the site.
- **Timed out / cannot load:** use the deployed Web app URL ending in `/exec`, not the Apps Script editor URL.
- **Permission error:** open the spreadsheet as the same Google account that authorized the Apps Script deployment.
- **Changes not appearing:** click **Sync now**, then refresh the spreadsheet. Confirm the `Unity Coach Data` tab appears.
- **You edited the Apps Script after deploying:** go to **Deploy → Manage deployments → Edit**, select a new version, and deploy it.
