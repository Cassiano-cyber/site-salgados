let currentIndex = 0;
const cart = [];

// Função para atualizar o carrossel
function showSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

// Avançar ou retroceder o slide
function changeSlide(step) {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + step + items.length) % items.length;
    showSlide(currentIndex);
}

// Adicionar item ao carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
}

// Atualizar o carrinho
function updateCart() {
    const cartList = document.getElementById('cart');
    const totalDisplay = document.getElementById('total');
    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.innerHTML = `${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`;
        cartList.appendChild(li);
    });

    totalDisplay.textContent = total.toFixed(2);
}

// Configurar botões
document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
document.querySelector('.next').addEventListener('click', () => changeSlide(1));
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        addToCart(name, price);
    });
});
