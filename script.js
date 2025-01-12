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

// Remover item do carrinho
function removeFromCart(name) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        updateCart();
    }
}

// Atualizar quantidade de itens no carrinho
function updateQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(1, newQuantity); // Não permite valores menores que 1
        updateCart();
    }
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

        li.innerHTML = `
            <span>${item.name}</span>
            <div class="actions">
                <input class="quantity-input" type="number" value="${item.quantity}" min="1">
                <button class="delete-item">🗑️</button>
            </div>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        `;

        // Eventos para os controles
        li.querySelector('.quantity-input').addEventListener('change', (e) => {
            updateQuantity(item.name, parseInt(e.target.value));
        });

        li.querySelector('.delete-item').addEventListener('click', () => {
            removeFromCart(item.name);
        });

        cartList.appendChild(li);
    });

    totalDisplay.textContent = total.toFixed(2);
}

// Configurar botões do carrossel e promoções
document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
document.querySelector('.next').addEventListener('click', () => changeSlide(1));

// Adicionar funcionalidade aos botões "Adicionar" no carrossel e promoções
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        addToCart(name, price);
    });
});
