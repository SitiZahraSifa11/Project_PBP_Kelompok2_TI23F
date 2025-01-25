const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Pastikan koneksi database benar

/**
 * POST /api/detailpesanan - Menambahkan detail pesanan baru dengan total harga otomatis
 */
router.post('/detailpesanan', async (req, res) => {
    try {
        let { pesanan_id, produk_id, jumlah, dibuat_pada } = req.body;

        // Validasi input dasar
        if (!pesanan_id || !produk_id || !jumlah || !dibuat_pada) {
            return res.status(400).json({ message: 'Semua field harus diisi!' });
        }

        // Konversi tipe data yang aman
        pesanan_id = Number(pesanan_id);
        produk_id = Number(produk_id);
        jumlah = Number(jumlah);

        if (isNaN(pesanan_id) || isNaN(produk_id) || isNaN(jumlah)) {
            return res.status(400).json({ message: 'ID pesanan, ID produk, dan jumlah harus berupa angka!' });
        }

        // Cek apakah produk ada di database
        const [produk] = await db.promise().query('SELECT harga FROM produk WHERE id = ?', [produk_id]);
        if (produk.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan!' });
        }

        // Hitung total harga
        const harga_produk = parseFloat(produk[0].harga);
        const total_harga = jumlah * harga_produk;

        // Insert ke database
        const [result] = await db.promise().query(
            'INSERT INTO detailpesanan (pesanan_id, produk_id, jumlah, dibuat_pada, total_harga) VALUES (?, ?, ?, ?, ?)',
            [pesanan_id, produk_id, jumlah, dibuat_pada, total_harga]
        );

        res.status(201).json({
            message: 'Detail pesanan berhasil ditambahkan',
            data: {
                id: result.insertId,
                pesanan_id,
                produk_id,
                jumlah,
                dibuat_pada,
                total_harga
            }
        });
    } catch (error) {
        console.error('Error adding order detail:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

/**
 * 20. GET /api/detailpesanan/:pesanan_id - Mendapatkan semua item dalam pesanan berdasarkan pesanan_id
 */
router.get('/detailpesanan/:pesanan_id', async (req, res) => {
    try {
        const pesanan_id = Number(req.params.pesanan_id);
        if (isNaN(pesanan_id)) {
            return res.status(400).json({ message: 'ID pesanan harus berupa angka' });
        }

        const [items] = await db.promise().query(
            `SELECT dp.*, p.nama, p.harga 
             FROM detailpesanan dp 
             JOIN produk p ON dp.produk_id = p.id 
             WHERE dp.pesanan_id = ?`,
            [pesanan_id]
        );

        if (items.length === 0) {
            return res.status(404).json({ message: 'Tidak ada detail pesanan untuk pesanan ini.' });
        }

        res.json({ message: 'Detail pesanan ditemukan', data: items });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

/**
 * 17.GET /api/detailpesanan - Mendapatkan semua detail pesanan
 */
router.get('/detailpesanan', async (req, res) => {
    try {
        const [items] = await db.promise().query(
            `SELECT dp.*, p.nama, p.harga 
             FROM detailpesanan dp 
             JOIN produk p ON dp.produk_id = p.id`
        );

        if (items.length === 0) {
            return res.status(404).json({ message: 'Tidak ada detail pesanan tersedia.' });
        }

        res.json({ message: 'Detail pesanan ditemukan', data: items });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

/**
 * 18. PUT /api/detailpesanan/:id - Memperbarui jumlah item dalam pesanan
 */
router.put('/detailpesanan/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const jumlah = Number(req.body.jumlah);

        if (isNaN(id) || isNaN(jumlah)) {
            return res.status(400).json({ message: 'ID dan jumlah harus berupa angka!' });
        }

        // Cek apakah detail pesanan ada
        const [detail] = await db.promise().query('SELECT produk_id FROM detailpesanan WHERE id = ?', [id]);
        if (detail.length === 0) {
            return res.status(404).json({ message: 'Detail pesanan tidak ditemukan!' });
        }

        // Ambil harga produk untuk perhitungan ulang
        const produk_id = detail[0].produk_id;
        const [produk] = await db.promise().query('SELECT harga FROM produk WHERE id = ?', [produk_id]);
        if (produk.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan!' });
        }

        const harga_produk = parseFloat(produk[0].harga);
        const total_harga = jumlah * harga_produk;

        await db.promise().query(
            'UPDATE detailpesanan SET jumlah = ?, total_harga = ? WHERE id = ?',
            [jumlah, total_harga, id]
        );

        res.json({ message: 'Detail pesanan berhasil diperbarui', jumlah, total_harga });
    } catch (error) {
        console.error('Error updating order detail:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

/**
 * 19.DELETE /api/detailpesanan/:id - Menghapus item dalam pesanan
 */
router.delete('/detailpesanan/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID harus berupa angka' });
        }

        const [detail] = await db.promise().query('SELECT * FROM detailpesanan WHERE id = ?', [id]);
        if (detail.length === 0) {
            return res.status(404).json({ message: 'Detail pesanan tidak ditemukan!' });
        }

        await db.promise().query('DELETE FROM detailpesanan WHERE id = ?', [id]);

        res.json({ message: 'Detail pesanan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting order detail:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;
