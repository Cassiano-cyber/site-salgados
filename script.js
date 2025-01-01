let cart = [];
let total = 0;

function updateCart() {
    const cartList = document.getElementById("cart");
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

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));

        cart.push({ name, price });
        total += price;

        updateCart();
    });
});

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

    let orderDetails = `Pedido:\n`;
    cart.forEach(item => {
        orderDetails += `- ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    });
    orderDetails += `\nTotal: R$ ${total.toFixed(2)}`;

    const phoneNumber = '+5517996780618';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
});

let currentIndex = 0;

function showSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    if (index < 0) {
        currentIndex = totalItems - 1;
    } else if (index >= totalItems) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    const carouselInner = document.querySelector('.carousel-inner');
    carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

setInterval(() => {
    nextSlide();
}, 5000);
