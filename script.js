// Alterna entre temas claro e escuro
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Inicializa o tema com base no localStorage
function initializeTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Atualiza o estado do carrossel
function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}

// Alterna para o próximo ou anterior item do carrossel
function changeCarouselItem(direction) {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + direction + items.length) % items.length;
    updateCarousel();
}

// Atualiza o carrinho
function updateCart() {
    const cartList = document.querySelector('.cart ul');
    cartList.innerHTML = cart.map((item, index) => `
        <li>
            ${item.name} - R$ ${item.price.toFixed(2)}
            <button class="delete-item" data-index="${index}">🗑️</button>
        </li>
    `).join('');

    document.getElementById("total").textContent = total.toFixed(2);
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', () => removeItem(button.dataset.index));
    });
}

// Adiciona um item ao carrinho
function addToCart(name, price) {
    if (isNaN(price)) {
        console.error("Preço inválido:", price);
        return;
    }
    cart.push({ name, price });
    total += price;
    updateCart();
    alert(`${name} foi adicionado ao carrinho!`);
}

// Remove um item do carrinho
function removeItem(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

// Envia o pedido para o WhatsApp
function checkout() {
    if (!cart.length) {
        alert('Carrinho vazio! Adicione itens ao carrinho.');
        return;
    }
    const orderDetails = cart.map(item => `- ${item.name} - R$ ${item.price.toFixed(2)}`).join('\n');
    const phoneNumber = '+5517996780618';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`Pedido:\n${orderDetails}\n\nTotal: R$ ${total.toFixed(2)}`)}`;
    window.open(whatsappUrl, '_blank');
}

// Inicializa o documento
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    updateCarousel();

    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
    document.querySelector('.carousel-control.next').addEventListener('click', () => changeCarouselItem(1));
    document.querySelector('.carousel-control.prev').addEventListener('click', () => changeCarouselItem(-1));
    document.getElementById('checkoutButton').addEventListener('click', checkout);

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            addToCart(name, price);
        });
    });
});
