const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Koneksi ke database

// Middleware untuk parsing JSON (pastikan ini ada di app.js/server.js)
router.use(express.json());

// 12.POST /api/pesanan - Menambahkan pesanan baru
router.post('/pesanan', async (req, res) => {
    try {
        let { pengguna_id, status, total_harga, dibuat_pada } = req.body;
        
        // Validasi input
        if (!pengguna_id || !status || !total_harga || !dibuat_pada) {
            return res.status(400).json({ message: 'Semua field harus diisi!' });
        }
        
        // Konversi tipe data
        pengguna_id = parseInt(pengguna_id, 10);
        total_harga = parseFloat(total_harga);
        dibuat_pada = dibuat_pada.trim();

        // Insert ke database
        const [result] = await db.promise().query(
            'INSERT INTO pesanan (pengguna_id, status, total_harga, dibuat_pada) VALUES (?, ?, ?, ?)',
            [pengguna_id, status, total_harga, dibuat_pada]
        );

        res.status(201).json({
            message: 'Pesanan berhasil ditambahkan',
            data: {
                id: result.insertId,
                pengguna_id,
                status,
                total_harga,
                dibuat_pada,
            },
        });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 13.GET /api/pesanan - Mendapatkan daftar semua pesanan
router.get('/pesanan', async (req, res) => {
    try {
        const [orders] = await db.promise().query('SELECT * FROM pesanan');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 14.GET /api/pesanan/:id - Mendapatkan detail pesanan berdasarkan ID
router.get('/pesanan/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const [orders] = await db.promise().query('SELECT * FROM pesanan WHERE id = ?', [orderId]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan!' });
        }
        res.status(200).json(orders[0]);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

//15. PUT /api/pesanan/:id - Memperbarui data pesanan
router.put('/pesanan/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        let { status, total_harga } = req.body;

        // Validasi input
        if (!status || !total_harga) {
            return res.status(400).json({ message: 'Status dan total harga harus diisi!' });
        }
        total_harga = parseFloat(total_harga);

        await db.promise().query(
            'UPDATE pesanan SET status = ?, total_harga = ? WHERE id = ?',
            [status, total_harga, orderId]
        );

        res.status(200).json({ message: 'Pesanan berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 16.DELETE /api/pesanan/:id - Menghapus pesanan
router.delete('/pesanan/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        await db.promise().query('DELETE FROM pesanan WHERE id = ?', [orderId]);
        res.status(200).json({ message: 'Pesanan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;
