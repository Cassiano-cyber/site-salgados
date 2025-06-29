const express = require('express');
const app = express();
app.use(express.json());

const db = require('./firebase');

let clientes = [];
let transacoes = [];

app.post('/api/fidelidade/cadastrar', (req, res) => {
    const { nome, telefone } = req.body;
    const cliente = { id: clientes.length + 1, nome, telefone, pontos: 0 };
    clientes.push(cliente);
    res.json(cliente);
});

app.get('/api/fidelidade/saldo', (req, res) => {
    const cliente = clientes[0]; // Exemplo: pegar o primeiro cliente
    const historico = transacoes.filter((t) => t.clienteId === cliente.id);
    res.json({ pontos: cliente.pontos, historico });
});

app.post('/api/fidelidade/resgatar', (req, res) => {
    const { pontos } = req.body;
    const cliente = clientes[0]; // Exemplo: pegar o primeiro cliente
    if (cliente.pontos >= pontos) {
        cliente.pontos -= pontos;
        transacoes.push({ clienteId: cliente.id, descricao: 'Resgate de recompensa', pontos: -pontos });
        res.json({ sucesso: true });
    } else {
        res.status(400).json({ erro: 'Pontos insuficientes' });
    }
});

app.post('/api/pedidos', async (req, res) => {
    try {
        const pedido = req.body;
        const docRef = await db.collection('pedidos').add({
            ...pedido,
            criadoEm: new Date()
        });
        res.status(201).json({ id: docRef.id, ...pedido });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar pedido', detalhes: error.message });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
