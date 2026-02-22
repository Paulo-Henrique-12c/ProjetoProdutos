const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'web_03mc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos_seu_nome (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      descricao TEXT,
      preco DECIMAL(10, 2) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/produtos', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos_seu_nome ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos', detalhes: error.message });
  }
});

app.post('/api/produtos', async (req, res) => {
  const { nome, descricao, preco } = req.body;

  if (!nome || preco === undefined || preco === null) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO produtos_seu_nome (nome, descricao, preco) VALUES (?, ?, ?)',
      [nome, descricao || '', preco]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      descricao: descricao || '',
      preco
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhes: error.message });
  }
});

app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM produtos_seu_nome WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json({ mensagem: 'Produto apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao apagar produto', detalhes: error.message });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'produtos.html'));
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Falha ao inicializar o banco de dados:', error.message);
    process.exit(1);
  });
