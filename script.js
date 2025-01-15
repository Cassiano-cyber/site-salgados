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

// Eventos do Carrinho
function addToCart(itemName, itemPrice) {
    const cart = document.querySelector('.cart ul');

    if (cart) {
        const listItem = document.createElement('li');
        listItem.textContent = `${itemName} - R$ ${itemPrice.toFixed(2)}`;
        cart.appendChild(listItem);
    }
}

function clearCart() {
    const cart = document.querySelector('.cart ul');

    if (cart) {
        cart.innerHTML = '';
    }
}

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
});
