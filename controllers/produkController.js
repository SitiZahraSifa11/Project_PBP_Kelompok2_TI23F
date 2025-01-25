const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Koneksi ke database

// 7. POST /api/produk - Menambahkan produk baru
router.post('/produk', async (req, res) => {
    const { nama, deskripsi, harga, stok, dibuat_pada } = req.body;

    if (!nama || !deskripsi || !harga || !stok || !dibuat_pada) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        const result = await db.promise().query(
            'INSERT INTO produk (nama, deskripsi, harga, stok, dibuat_pada) VALUES (?, ?, ?, ?, ?)',
            [nama, deskripsi, harga, stok, dibuat_pada]
        );

        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: {
                id: result[0].insertId,
                nama,
                deskripsi,
                harga,
                stok,
                dibuat_pada,
            },
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 8. GET /api/produk - Mendapatkan daftar semua produk
router.get('/produk', async (req, res) => {
    try {
        const [products] = await db.promise().query('SELECT * FROM produk');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

//9. GET /api/produk/:id - Mendapatkan detail produk berdasarkan ID
router.get('/produk/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const [products] = await db.promise().query('SELECT * FROM produk WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan!' });
        }

        res.status(200).json(products[0]);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

//10. PUT /api/produk/:id - Memperbarui data produk
router.put('/produk/:id', async (req, res) => {
    const productId = req.params.id;
    const { nama, deskripsi, harga, stok } = req.body;

    if (!nama || !deskripsi || !harga || !stok) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        await db.promise().query(
            'UPDATE produk SET nama = ?, deskripsi = ?, harga = ?, stok = ? WHERE id = ?',
            [nama, deskripsi, harga, stok, productId]
        );

        res.status(200).json({ message: 'Produk berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

//11. DELETE /api/produk/:id - Menghapus produk
router.delete('/produk/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await db.promise().query('DELETE FROM produk WHERE id = ?', [productId]);
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;
