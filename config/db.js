const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       // Sesuaikan dengan host MySQL Anda
  user: 'root',            // Sesuaikan dengan username MySQL Anda
  password: '',            // Sesuaikan dengan password MySQL Anda
  database: 'tokoonline'
});

connection.connect((err) => {
  if (err) {
    console.error('Kesalahan koneksi ke database: ', err);
    return;
  }
  console.log('Koneksi ke database berhasil!');
});

module.exports = connection;