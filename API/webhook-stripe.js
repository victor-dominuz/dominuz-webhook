require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.raw({ type: 'application/json' }));

app.post('/webhook-stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Evento recebido:", event.type);
  res.status(200).send("Evento recebido com sucesso");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor webhook rodando na porta ${PORT}`);
});