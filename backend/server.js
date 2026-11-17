const express = require('express');
const db = require('./db');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// Cho phép đọc dữ liệu JSON
app.use(express.json());

// Hiển thị giao diện frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API kiểm tra máy chủ


// API lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi lấy sản phẩm:', err.message);
            return res.status(500).json({
                message: 'Không thể lấy danh sách sản phẩm.'
            });
        }

        res.json(results);
    });
});

// API đăng ký tài khoản
app.post('/api/register', (req, res) => {
    console.log('Đã nhận yêu cầu đăng ký:', req.body);
    const { full_name, email, password, phone, address } = req.body;

    const sql = `
        INSERT INTO users (full_name, email, password, phone, address)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [full_name, email, password, phone, address],
        (err, result) => {
            if (err) {
                console.error('Lỗi đăng ký:', err.message);

                return res.status(500).json({
                    success: false,
                    message: 'Email đã tồn tại hoặc đăng ký thất bại.'
                });
            }

            res.json({
                success: true,
                message: 'Đăng ký tài khoản thành công!'
            });
        }
    );
});

// API đăng nhập
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `
        SELECT id, full_name, email, phone, address
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Lỗi đăng nhập:', err.message);

            return res.status(500).json({
                success: false,
                message: 'Đăng nhập thất bại.'
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng.'
            });
        }

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            user: results[0]
        });
    });
});

// API tạo đơn hàng
app.post('/api/orders', (req, res) => {
    const { user_id, phone, shipping_address, cart } = req.body;

    if (!user_id || !phone || !shipping_address || !cart || cart.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Thông tin đặt hàng chưa đầy đủ.'
        });
    }

    let totalAmount = 0;

    cart.forEach(item => {
        totalAmount += Number(item.price) * Number(item.quantity);
    });

    const orderSql = `
        INSERT INTO orders (user_id, total_amount, shipping_address, phone)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        orderSql,
        [user_id, totalAmount, shipping_address, phone],
        (err, orderResult) => {
            if (err) {
                console.error('Lỗi tạo đơn hàng:', err.message);

                return res.status(500).json({
                    success: false,
                    message: 'Không thể tạo đơn hàng.'
                });
            }

            const orderId = orderResult.insertId;

            const itemSql = `
                INSERT INTO order_items
                (order_id, product_id, quantity, unit_price)
                VALUES ?
            `;

            const values = cart.map(item => [
                orderId,
                item.id,
                item.quantity,
                item.price
            ]);

            db.query(itemSql, [values], (err) => {
                if (err) {
                    console.error('Lỗi lưu sản phẩm trong đơn:', err.message);

                    return res.status(500).json({
                        success: false,
                        message: 'Không thể lưu sản phẩm trong đơn hàng.'
                    });
                }

                res.json({
                    success: true,
                    message: 'Đặt hàng thành công!',
                    order_id: orderId
                });
            });
        }
    );
});

// Khởi động máy chủ
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});