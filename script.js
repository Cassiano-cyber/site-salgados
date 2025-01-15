// Função para alternar entre os temas claro e escuro
function toggleTheme() {
    document.body.classList.toggle('dark-mode');

    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Função para inicializar o tema com base no armazenamento local
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Carrossel
let currentIndex = 0;
function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    items.forEach((item, index) => {
        item.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
        item.style.transition = 'transform 0.5s ease-in-out';
    });
}

function nextCarouselItem() {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }
}

function prevCarouselItem() {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }
}

// Carrinho de compras
let cart = [];
let total = 0;

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

    document.getElementById("total").textContent = total.toFixed(2);
}

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
}

function removeItem(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

document.getElementById('checkoutButton').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Carrinho vazio! Adicione itens ao carrinho.');
        return;
    }

    let orderDetails = 'Pedido:\n';
    cart.forEach(item => {
        orderDetails += `- ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    });
    orderDetails += `\nTotal: R$ ${total.toFixed(2)}`;

    const phoneNumber = '+5517996780618';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
});

// Inicialização do Documento
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema
    initializeTheme();

    // Configurar botão de alternância de tema
    const themeToggleBtn = document.getElementById('toggleTheme');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Configurar controle do carrossel
    const nextBtn = document.querySelector('.carousel-control.next');
    const prevBtn = document.querySelector('.carousel-control.prev');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextCarouselItem);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevCarouselItem);
    }

    // Exibir os itens do carrossel corretamente
    updateCarousel();

    // Configurar botões de adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));

            addToCart(name, price);
        });
    });
});
