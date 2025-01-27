
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Koneksi ke database
const bcrypt = require('bcrypt'); // Untuk hashing kata sandi
const jwt = require('jsonwebtoken'); // Untuk token JWT

// SECRET KEY untuk JWT (ubah dengan nilai yang aman)
const SECRET_KEY = 'your_secret_key';

//1. POST /register - Registrasi pengguna
router.post('/register', async (req, res) => {
    const { nama, email, kata_sandi, peran, dibuat_pada } = req.body;

    // Validasi input
    if (!nama || !email || !kata_sandi || !peran || !dibuat_pada) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    try {
        // Cek apakah email sudah digunakan
        const [existingUser] = await db.promise().query('SELECT * FROM pengguna WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan!' });
        }

        // Hash kata sandi
        const hashedPassword = await bcrypt.hash(kata_sandi, 10);

        // Simpan pengguna ke database
        const result = await db.promise().query(
            'INSERT INTO pengguna (nama, email, kata_sandi, peran, dibuat_pada) VALUES (?, ?, ?, ?, ?)',
            [nama, email, hashedPassword, peran, dibuat_pada]
        );

        // Respon berhasil
        res.status(201).json({
            message: 'Pengguna berhasil didaftarkan',
            data: {
                id: result[0].insertId,
                nama,
                email,
                peran,
                dibuat_pada,
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 2. POST /login - Login pengguna
router.post('/login', async (req, res) => {
    const { email, kata_sandi } = req.body;

    if (!email || !kata_sandi) {
        return res.status(400).json({ message: 'Email dan kata sandi harus diisi!' });
    }

    try {
        // Cek apakah pengguna ada
        const [users] = await db.promise().query('SELECT * FROM pengguna WHERE email = ?', [email]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        // Bandingkan kata sandi
        const isMatch = await bcrypt.compare(kata_sandi, user.kata_sandi);
        if (!isMatch) {
            return res.status(401).json({ message: 'Kata sandi salah!' });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login berhasil',
            token, // Kirimkan token ke client
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Menyimpan data token yang terverifikasi
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Token tidak valid!' });
    }
};

// 3. GET /pengguna - Mendapatkan daftar pengguna (Perlu token JWT)
router.get('/pengguna', verifyToken, async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT id, nama, email, peran, dibuat_pada FROM pengguna');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 4. GET /pengguna/:id - Mendapatkan detail pengguna berdasarkan ID (Perlu token JWT)
router.get('/pengguna/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const [users] = await db.promise().query(
            'SELECT id, nama, email, peran, dibuat_pada FROM pengguna WHERE id = ?',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 5. PUT /pengguna/:id - Memperbarui data pengguna
router.put('/pengguna/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;
    const { nama, email, peran } = req.body;

    try {
        await db.promise().query(
            'UPDATE pengguna SET nama = ?, email = ?, peran = ? WHERE id = ?',
            [nama, email, peran, userId]
        );
        res.status(200).json({ message: 'Pengguna berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// 6. DELETE /pengguna/:id - Menghapus pengguna
router.delete('/pengguna/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;
    try {
        await db.promise().query('DELETE FROM pengguna WHERE id = ?', [userId]);
        res.status(200).json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

module.exports = router;
