'use strict';
const express = require('express');
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(express.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/', function(req, res) {
  res.send('Karie Annes inventory server is running.');
});

app.post('/check-stock', async function(req, res) {
  try {
    var location = req.body.location;
    var lowItems = req.body.lowItems;
    if (!lowItems || lowItems.length === 0) return res.json({ ok: true });
    var itemList = lowItems.map(function(i) {
      return '• ' + i.name + ': ' + i.qty + ' ' + i.unit + ' (minimum: ' + i.threshold + ')';
    }).join('\n');
    var message = 'Low stock alert — Karie Annes (' + location + '):\n\n' + itemList + '\n\nLog in at https://natedavie10.github.io/Inventory/';
    await sgMail.send({
      to: process.env.ALERT_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: 'Low stock alert — ' + location,
      text: message
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});
