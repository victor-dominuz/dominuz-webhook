import re

code = """
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const botsDir = './bots';

function carregarOuCriarBot(numero) {
  const nomeArquivo = `${botsDir}/${numero}.json`;

  if (!fs.existsSync(botsDir)) {
    fs.mkdirSync(botsDir);
  }

  if (!fs.existsSync(nomeArquivo)) {
    const modelo = {
      etapa: 1,
      nomeCliente: '',
      historico: []
    };
    fs.writeFileSync(nomeArquivo, JSON.stringify(modelo, null, 2));
  }

  return JSON.parse(fs.readFileSync(nomeArquivo));
}

function salvarBot(numero, dados) {
  const nomeArquivo = `${botsDir}/${numero}.json`;
  fs.writeFileSync(nomeArquivo, JSON.stringify(dados, null, 2));
}

app.post('/webhook', async (req, res) => {
  const numero = req.body.From.replace('whatsapp:', '');
  const mensagem = req.body.Body?.trim().toLowerCase() || '';
  const dados = carregarOuCriarBot(numero);

  let resposta = '';

  if (mensagem.includes('reiniciar')) {
    dados.etapa = 1;
    dados.historico = [];
    resposta = 'Conversa reiniciada! Me diga com o que posso te ajudar.';
  } else {
    switch (dados.etapa) {
      case 1:
        resposta = 'Olá! Bem-vindo ao atendimento da Dominuz. Qual produto ou serviço você viu no anúncio?';
        dados.etapa = 2;
        break;

      case 2:
        resposta = 'Legal! Me diga um pouco mais sobre o que você está buscando, pra eu te ajudar melhor.';
        dados.etapa = 3;
        break;

      default:
        resposta = 'Tô aqui se tiver mais dúvidas! Me avise.';
        break;
    }
  }

  dados.historico.push({ mensagem, resposta, hora: new Date().toISOString() });
  salvarBot(numero, dados);

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${resposta}</Message></Response>`);
});

app.listen(port, () => {
  console.log(`Dominuz rodando na Twilio, porta ${port}`);
});
"""

# Let's prepare to refactor this logic by routing through bot-dominuz.json (coração)
# and delegating to a bot-cliente (ex: bot-chegaai.json) and salvando dados em clientes/

code_lines = code.splitlines()
updated_code_lines = []

# flag to later mark where we will inject logic for bot-coração e clientes
injection_point = None

for i, line in enumerate(code_lines):
    updated_code_lines.append(line)
    if 'const botsDir = ' in line:
        injection_point = i + 1

injection_code = """
const coreBotFile = `${botsDir}/bot-dominuz.json`;

function getBotCliente(numero) {
  const botDominuz = JSON.parse(fs.readFileSync(coreBotFile));
  const nomeBot = botDominuz.numeroParaBot?.[numero] || 'bot-default.json';
  const caminho = `${botsDir}/${nomeBot}`;
  if (fs.existsSync(caminho)) {
    return JSON.parse(fs.readFileSync(caminho));
  }
  return null;
}

function salvarCliente(botNome, numero, mensagem, resposta) {
  const clientesDir = './clientes';
  const arquivoClientes = `${clientesDir}/clientes-${botNome}.json`;

  if (!fs.existsSync(clientesDir)) fs.mkdirSync(clientesDir);

  let dadosClientes = {};
  if (fs.existsSync(arquivoClientes)) {
    dadosClientes = JSON.parse(fs.readFileSync(arquivoClientes));
  }

  if (!dadosClientes[numero]) {
    dadosClientes[numero] = {
      nomeCliente: '',
      historico: []
    };
  }

  dadosClientes[numero].historico.push({ mensagem, resposta, hora: new Date().toISOString() });

  fs.writeFileSync(arquivoClientes, JSON.stringify(dadosClientes, null, 2));
}
