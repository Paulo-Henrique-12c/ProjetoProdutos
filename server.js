const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO COM OS DADOS QUE VOCÊ PASSOU
const db = mysql.createConnection({
    host: 'benserverplex.ddns.net',
    port: 3306,
    user: 'alunos',
    password: 'senhaAlunos',
    database: 'web_03mc'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao servidor remoto:', err.message);
        return;
    }
    console.log('Conectado com sucesso ao banco remoto web_03mc!');
});




app.get('/produtos', (req, res) => {
    const query = 'SELECT * FROM produtos_projeto'; 
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/produtos', (req, res) => {
    const { nome, preco, descricao } = req.body;
    const query = 'INSERT INTO produtos_projeto (nome, preco, descricao) VALUES (?, ?, ?)';
    db.query(query, [nome, preco, descricao], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Produto cadastrado!', id: results.insertId });
    });
});


app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM produtos_projeto WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto deletado!' });
    });
});

app.listen(3000, () => {
    console.log('Servidor local rodando em http://localhost:3000');
    console.log('Aguardando conexão com o banco remoto...');
});