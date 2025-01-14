let currentIndex = 0;
const cart = [];
let points = 0;

function showSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function changeSlide(step) {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + step + items.length) % items.length;
    document.querySelector('.carousel-inner').style.transform = `translateX(-${currentIndex * 100}%)`;
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    points += Math.floor(price / 2);
    updateCart();
}

function removeFromCart(name) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex !== -1) {
        const item = cart[itemIndex];
        points -= Math.floor(item.price / 2) * item.quantity;
        cart.splice(itemIndex, 1);
        updateCart();
    }
}

function updateQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        const oldPoints = Math.floor(item.price / 2) * item.quantity;
        item.quantity = Math.max(1, newQuantity);
        const newPoints = Math.floor(item.price / 2) * item.quantity;
        points += newPoints - oldPoints;
        updateCart();
    }
}

function updateCart() {
    const cartList = document.getElementById('cart');
    const totalDisplay = document.getElementById('total');
    const pointsDisplay = document.getElementById('points');
    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name}</span>
            <div class="actions">
                <input class="quantity-input" type="number" value="${item.quantity}" min="1">
                <button class="delete-item">🗑️</button>
            </div>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        `;

        li.querySelector('.quantity-input').addEventListener('change', (e) => {
            updateQuantity(item.name, parseInt(e.target.value));
        });

        li.querySelector('.delete-item').addEventListener('click', () => {
            removeFromCart(item.name);
        });

        cartList.appendChild(li);
    });

    totalDisplay.textContent = total.toFixed(2);
    pointsDisplay.textContent = Math.max(points, 0);
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
document.querySelector('.next').addEventListener('click', () => changeSlide(1));
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        addToCart(name, price);
    });
});

document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

document.getElementById('checkoutButton').addEventListener('click', () => {
    alert("Pedido finalizado com sucesso! Pontos acumulados: " + points);
    points = 0;
    cart.length = 0;
    updateCart();
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
