let cart = [];
let total = 0;
let points = 0;

// Alterna entre temas claro e escuro
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

// Inicializa o tema com base no armazenamento local
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Atualiza o carrinho
function updateCart() {
    const cartList = document.querySelector('.cart ul');
    cartList.innerHTML = '';

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => removeItem(index));

        li.appendChild(deleteButton);
        cartList.appendChild(li);
    });

    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('points').textContent = points;
}

// Adiciona item ao carrinho
function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    points += Math.floor(price); // Acumula 1 ponto para cada R$ 1,00
    updateCart();
}

// Remove item do carrinho
function removeItem(index) {
    points -= Math.floor(cart[index].price); // Remove os pontos correspondentes
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

// Finaliza o pedido
function checkout() {
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
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();

    // Botão para alternar tema
    document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

    // Configura o carrossel
    new Swiper('.swiper-container', {
        loop: true,
        slidesPerView: 1,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });

    // Adiciona itens ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            addToCart(name, price);
        });
    });

    // Botão de finalizar pedido
    document.getElementById('checkoutButton').addEventListener('click', checkout);
});
