fetch('../clientes/clientes-chegaai.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('clientes');
    for (const numero in data) {
      const cliente = data[numero];
      const bloco = document.createElement('div');
      bloco.className = 'cliente';
      bloco.innerHTML = `
        <strong>Nome:</strong> ${cliente.nomeCliente || 'Não informado'}<br>
        <strong>Número:</strong> ${numero}<br>
        <strong>Última mensagem:</strong> ${cliente.historico?.slice(-1)[0]?.mensagem || 'Sem mensagens'}<br>
        <strong>Data:</strong> ${new Date(cliente.historico?.slice(-1)[0]?.hora || '').toLocaleString()}
      `;
      container.appendChild(bloco);
    }
  })
  .catch(err => {
    document.getElementById('clientes').innerText = 'Erro ao carregar dados.';
    console.error(err);
  });