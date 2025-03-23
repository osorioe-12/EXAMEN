require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json()); 


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la BD:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});


app.post('/productos', (req, res) => {
    const { nombre, precio, descripcion, categoria } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son obligatorios.' });
    }

    const sql = 'INSERT INTO producto (nombre, precio, descripcion, categoria) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, precio, descripcion, categoria], (err, result) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).json({ error: 'Error al insertar producto en la base de datos.' });
        }
        res.status(201).json({
            id: result.insertId,
            nombre,
            precio,
            descripcion,
            categoria
        });
    });
});


app.get('/productos', (req, res) => {
    db.query('SELECT * FROM producto', (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ error: 'Error al obtener productos de la base de datos.' });
        }
        res.json(results);
    });
});


app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descripcion, categoria } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son obligatorios.' });
    }

    const sql = 'UPDATE producto SET nombre=?, precio=?, descripcion=?, categoria=? WHERE id=?';
    db.query(sql, [nombre, precio, descripcion, categoria, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).json({ error: 'Error al actualizar producto en la base de datos.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    });
});


app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM producto WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ error: 'Error al eliminar el producto de la base de datos.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
