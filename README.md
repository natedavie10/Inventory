# Karie Anne's — Inventory Tracker

A location-locked weekly inventory tracker for Italian Ice & Custard, designed for iPad use at three locations: Bountiful Trailer, Stadium Vendor, and Storage Facility.

---

## Getting it live on GitHub Pages (step by step)

### Step 1 — Create a new GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it something like `karies-inventory`
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Upload the file

1. On your new repository page, click **Add file** → **Upload files**
2. Drag in `karie-annes-inventory.html`
3. **Important:** rename the file to `index.html` before uploading (GitHub Pages serves `index.html` as the homepage)
4. Scroll down and click **Commit changes**

### Step 3 — Enable GitHub Pages

1. In your repository, click **Settings** (top nav)
2. In the left sidebar, click **Pages**
3. Under "Branch", select `main` and keep the folder as `/ (root)`
4. Click **Save**
5. Wait 1–2 minutes, then your site will be live at:
   `https://YOUR-GITHUB-USERNAME.github.io/karies-inventory/`

### Step 4 — Set your real PINs

Before sharing the URL with staff:

1. Open `index.html` in any text editor (Notepad, TextEdit, VS Code)
2. Find this section near the bottom of the file:
   ```
   const PINS = { bountiful: '1111', stadium: '2222', storage: '3333' };
   ```
3. Replace `1111`, `2222`, `3333` with your chosen 4-digit PINs
4. Save the file and re-upload it to GitHub (same process as Step 2)
5. Remove the demo PIN hint line — find and delete this line in the HTML:
   ```
   Demo PINs — Bountiful: 1111 | Stadium: 2222 | Storage: 3333
   ```

### Step 5 — Add to iPad home screens

On each iPad:
1. Open **Safari** and navigate to your GitHub Pages URL
2. Tap the **Share** button (box with arrow pointing up)
3. Tap **Add to Home Screen**
4. Name it `KA Inventory` and tap **Add**

It will appear as an app icon on the home screen. Consider using **Guided Access** (Settings → Accessibility → Guided Access) to lock the iPad to only this app.

---

## Setting up text & email alerts (optional — requires ~30 min setup)

Real SMS and email notifications require a small backend. Here's the recommended free/low-cost setup:

### Services you'll need

| Service | Purpose | Cost |
|---|---|---|
| [Twilio](https://twilio.com) | Send text messages | ~$0.01/message |
| [SendGrid](https://sendgrid.com) | Send emails | Free up to 100/day |
| [Render](https://render.com) or [Railway](https://railway.app) | Host the backend | Free tier available |

### How it works

When staff saves a count, the app will POST the inventory data to a small server you control. That server checks for items below threshold and fires off texts/emails.

### Backend setup (Node.js)

Create a file called `server.js`:

```js
const express = require('express');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const app = express();
app.use(express.json());

// Fill these in with your credentials
const TWILIO_SID    = 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_TOKEN  = 'YOUR_TWILIO_AUTH_TOKEN';
const TWILIO_FROM   = '+1XXXXXXXXXX'; // your Twilio number
const SENDGRID_KEY  = 'YOUR_SENDGRID_API_KEY';
const ALERT_PHONE   = '+1XXXXXXXXXX'; // your phone number
const ALERT_EMAIL   = 'you@example.com';

sgMail.setApiKey(SENDGRID_KEY);
const twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);

app.post('/check-stock', async (req, res) => {
  const { location, lowItems } = req.body;
  if (!lowItems || lowItems.length === 0) return res.json({ ok: true });

  const itemList = lowItems.map(i => `  • ${i.name}: ${i.qty} ${i.unit} (min: ${i.threshold})`).join('\n');
  const message  = `Low stock alert — Karie Anne's (${location}):\n\n${itemList}`;

  // Send SMS
  await twilioClient.messages.create({ body: message, from: TWILIO_FROM, to: ALERT_PHONE });

  // Send email
  await sgMail.send({
    to: ALERT_EMAIL, from: ALERT_EMAIL,
    subject: `Low stock alert — ${location}`,
    text: message,
  });

  res.json({ ok: true });
});

app.listen(3000, () => console.log('Running on port 3000'));
```

### Connecting the app to your backend

Once your backend is deployed, open `index.html` and add this inside the `saveCount()` function, after `localStorage.setItem(...)`:

```js
// After saving, check for low stock and send alerts
const t = getT();
const lowItems = ITEMS
  .filter(item => t[item.id] > 0 && data[item.id] !== undefined && data[item.id] <= t[item.id])
  .map(item => ({ name: item.name, qty: data[item.id], unit: item.unit, threshold: t[item.id] }));

if (lowItems.length > 0) {
  fetch('https://YOUR-BACKEND-URL.com/check-stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: LOC_LABELS[activeLoc], lowItems })
  });
}
```

Replace `https://YOUR-BACKEND-URL.com` with the URL Render or Railway gives you when you deploy.

---

## Data & privacy notes

- All inventory counts are stored locally on each iPad (browser localStorage). Data entered at the stadium stays on the stadium iPad, and vice versa.
- No inventory data is sent anywhere unless you set up the notifications backend above.
- PINs are stored in the app code itself — not a bank-vault, but sufficient for internal staff use. For higher security, move PIN verification to the backend.

---

## Need help?

If you get stuck on any of these steps, just paste this README back into a chat with Claude and ask for help with the specific step.
