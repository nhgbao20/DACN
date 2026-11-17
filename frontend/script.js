let products = [];
let cart = [];

// Hiển thị danh sách sản phẩm
function displayProducts(productList) {
    const productContainer = document.getElementById('product-list');

    productContainer.innerHTML = '';

    if (productList.length === 0) {
        productContainer.innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
        return;
    }

    productList.forEach(product => {
        productContainer.innerHTML += `
            <div class="product">
                <h3>${product.name}</h3>

                <button onclick="showProductDetail(${product.id})">
                    Xem chi tiết
                </button>

                <p>${product.description}</p>

                <p>
                    Giá:
                    ${Number(product.price).toLocaleString('vi-VN')}đ
                </p>

                <p>Còn lại: ${product.stock}</p>

                <button onclick="addToCart(${product.id})">
                    Thêm vào giỏ hàng
                </button>
            </div>
        `;
    });
}

// Lấy danh sách sản phẩm
fetch('/api/products')
    .then(response => response.json())
    .then(data => {
        products = data;

        displayProducts(products);
    })
    .catch(error => {
        console.error('Lỗi khi lấy sản phẩm:', error);
    });

// Tìm kiếm sản phẩm
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

function filterProducts() {
    const keyword = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchName = product.name.toLowerCase().includes(keyword);

        const matchCategory =
            category === 'all' ||
            String(product.category_id) === category;

        return matchName && matchCategory;
    });

    displayProducts(filteredProducts);
}

searchInput.addEventListener('input', filterProducts);

categoryFilter.addEventListener('change', filterProducts);

// Hiển thị chi tiết sản phẩm
function showProductDetail(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const detail = document.getElementById('product-detail');

    detail.innerHTML = `
        <div class="product-detail">
            <h2>${product.name}</h2>

            <p>${product.description}</p>

            <p>
                Giá:
                ${Number(product.price).toLocaleString('vi-VN')}đ
            </p>

            <p>
                Số lượng còn lại:
                ${product.stock}
            </p>

            <button onclick="addToCart(${product.id})">
                Thêm vào giỏ hàng
            </button>
        </div>
    `;

    detail.scrollIntoView({
        behavior: 'smooth'
    });
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });
    }

    displayCart();
}

// Tăng số lượng
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity++;
        displayCart();
    }
}

// Giảm số lượng
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);

    if (item && item.quantity > 1) {
        item.quantity--;
        displayCart();
    }
}

// Xóa sản phẩm khỏi giỏ
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    displayCart();
}

// Hiển thị giỏ hàng
function displayCart() {
    const cartSection = document.getElementById('cart');

    if (cart.length === 0) {
        cartSection.innerHTML = `
            <h2>Giỏ hàng</h2>
            <p>Giỏ hàng của bạn đang trống.</p>
        `;
        return;
    }

    let total = 0;

    let html = `
        <h2>Giỏ hàng</h2>
    `;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;

        total += itemTotal;

        html += `
            <div class="cart-item">
                <h3>${item.name}</h3>

                <p>
                    Giá:
                    ${item.price.toLocaleString('vi-VN')}đ
                </p>

                <button onclick="decreaseQuantity(${item.id})">
                    -
                </button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity(${item.id})">
                    +
                </button>

                <p>
                    Thành tiền:
                    ${itemTotal.toLocaleString('vi-VN')}đ
                </p>

                <button onclick="removeFromCart(${item.id})">
                    Xóa
                </button>
            </div>
        `;
    });

    html += `
        <h3>
            Tổng tiền:
            ${total.toLocaleString('vi-VN')}đ
        </h3>

        <button onclick="showOrderForm()">
            Đặt hàng
        </button>
    `;

    cartSection.innerHTML = html;
}

// Hiển thị form đặt hàng
function showOrderForm() {
    const cartSection = document.getElementById('cart');

    cartSection.innerHTML += `
        <div id="order-form">
            <h3>Thông tin đặt hàng</h3>

            <input
                type="text"
                id="order-phone"
                placeholder="Số điện thoại"
            >

            <input
                type="text"
                id="order-address"
                placeholder="Địa chỉ nhận hàng"
            >

            <button onclick="placeOrder()">
                Xác nhận đặt hàng
            </button>
        </div>
    `;
}

// Đăng ký tài khoản
document.getElementById('register-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
            phone: phone,
            address: address
        })
    })
        .then(response => response.json())
        .then(data => {
            const message = document.getElementById('register-message');

            message.textContent = data.message;

            if (data.success) {
                document.getElementById('register-form').reset();
            }
        })
        .catch(error => {
            console.error('Lỗi đăng ký:', error);
        });
});

// Đăng nhập
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            const message = document.getElementById('login-message');

            message.textContent = data.message;

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));

                alert('Đăng nhập thành công!');

                console.log('Người dùng đăng nhập:', data.user);
            }
        })
        .catch(error => {
            console.error('Lỗi đăng nhập:', error);
        });
});

// Đặt hàng
function placeOrder() {
    const phone = document.getElementById('order-phone').value;
    const address = document.getElementById('order-address').value;

    if (!phone || !address) {
        alert('Vui lòng nhập số điện thoại và địa chỉ nhận hàng.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('Vui lòng đăng nhập trước khi đặt hàng.');
        return;
    }

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user.id,
            phone: phone,
            shipping_address: address,
            cart: cart
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(
                    data.message +
                    ' Mã đơn hàng: ' +
                    data.order_id
                );

                cart = [];

                displayCart();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Lỗi đặt hàng:', error);

            alert('Không thể kết nối đến máy chủ.');
        });
}