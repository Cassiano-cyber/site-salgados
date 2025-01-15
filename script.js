// Variável global para rastrear o índice atual do carrossel
let currentIndex = 0;

// Alterna entre temas claro e escuro
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Inicializa o tema com base no armazenamento local
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Atualiza o carrossel
function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}

// Alterna para o próximo ou anterior item do carrossel
function changeCarouselItem(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        currentIndex = (currentIndex + direction + items.length) % items.length;
        updateCarousel();
    }
}

// Carrinho de compras
let cart = [];
let total = 0;
let points = 0; // Variável para acumular pontos

// Atualiza o carrinho
function updateCart() {
    const cartList = document.querySelector('.cart ul');
    cartList.innerHTML = '';

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.classList.add('delete-item');
        deleteButton.addEventListener('click', () => removeItem(index));

        li.appendChild(deleteButton);
        cartList.appendChild(li);
    });

    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('points').textContent = points; // Atualiza os pontos
}

// Adiciona item ao carrinho
function addToCart(name, price) {
    if (isNaN(price)) {
        console.error('Preço inválido:', price);
        return;
    }
    cart.push({ name, price });
    total += price;
    points += Math.floor(price); // Acumula 1 ponto para cada R$ 1,00
    updateCart();
    alert(`${name} foi adicionado ao carrinho!`);
}

// Remove item do carrinho
function removeItem(index) {
    points -= Math.floor(cart[index].price); // Remove os pontos correspondentes
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

// Inicializa o documento
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o tema
    initializeTheme();

    // Botão de alternância de tema
    const themeToggleBtn = document.getElementById('toggleTheme');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Configura controles do carrossel
    const nextBtn = document.querySelector('.carousel-control.next');
    const prevBtn = document.querySelector('.carousel-control.prev');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeCarouselItem(1));
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeCarouselItem(-1));
    }

    // Inicializa o carrossel
    updateCarousel();

    // Configura botões de adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));

            addToCart(name, price);
        });
    });

    // Botão de finalizar pedido
    document.getElementById('checkoutButton').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Carrinho vazio! Adicione itens ao carrinho.');
            return;
        }

        let orderDetails = 'Pedido:\n';
        cart.forEach(item => {
            orderDetails += `- ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        });
        orderDetails += `\nTotal: R$ ${total.toFixed(2)}\nPontos acumulados: ${points}`;

        const phoneNumber = '+5517996780618';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
        window.open(whatsappUrl, '_blank');
    });
});
