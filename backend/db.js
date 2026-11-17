const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '20072006',
    database: 'phukienmaytinh'
});

connection.connect((err) => {
    if (err) {
        console.error('Kết nối MySQL thất bại:', err.message);
        return;
    }

    console.log('Kết nối MySQL thành công!');
});

module.exports = connection;
