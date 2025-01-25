// const express = require('express');
// const bodyparser = require('body-parser');
// const penggunaController = require('./controllers/penggunaController');
// const produkController=require('./controllers/produkController');
// require("dotenv").config();

// const app = express();

// app.use(bodyparser.json());
// app.use('/api', penggunaController);
// app.use('/api', produkController);

// app.listen(3000, () => {
//   console.log('Server berjalan di http://localhost:3000');
// });

const express = require('express');
const penggunaController = require('./controllers/penggunaController');
const produkController = require('./controllers/produkController');
const pesananController = require('./controllers/pesananController');
const detailpesananController = require('./controllers/detailpesananController');
require("dotenv").config();

const app = express();

// Middleware untuk parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menggunakan controller dengan prefix yang lebih spesifik
app.use('/api', penggunaController);
app.use('/api', produkController);
app.use('/api', pesananController);
app.use('/api', detailpesananController);

// Middleware global untuk error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

// Jalankan server dengan port dari .env atau default ke 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
