const express = require('express');
const sgMail = require('@sendgrid/mail');
const app = express();
app.use(express.json());
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Headers', 'Content-Type'); next(); });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
SendGrid');  // ← paste your API key here

const ALERT_EMAIL = 'bountiful@karieannes.com';  // ← email to SEND alerts TO
const FROM_EMAIL  = 'bountiful@karieannes.com';  // ← your verified SendGrid sender email

app.post('/check-stock', async (req, res) => {
  const { location, lowItems } = req.body;
  if (!lowItems || lowItems.length === 0) return res.json({ ok: true });

  const itemList = lowItems.map(i => `• ${i.name}: ${i.qty} ${i.unit} (minimum: ${i.threshold})`).join('\n');

  await sgMail.send({
    to: ALERT_EMAIL,
    from: FROM_EMAIL,
    subject: `Low stock alert — Karie Anne's (${location})`,
    text: `Hi! This is an automated alert from your inventory tracker.\n\nThe following items are running low at ${location}:\n\n${itemList}\n\nLog in to update your inventory at https://natedavie10.github.io/Inventory/`,
  });

  res.json({ ok: true });
});

app.get('/', (req, res) => res.send('Karie Anne\'s inventory alert server is running.'));
app.listen(3000, () => console.log('Server running'));
