let cart = [];
let total = 0;

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
    updateThemeButton();
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
    updateThemeButton();
}

function updateThemeButton() {
    const button = document.getElementById("toggleTheme");
    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "🌞 Modo Claro";
    } else {
        button.textContent = "🌙 Modo Escuro";
    }
}

function updateCart() {
    const cartList = document.querySelector(".cart-list");
    cartList.innerHTML = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Remover item";
        deleteButton.addEventListener("click", () => removeItem(index));

        li.appendChild(deleteButton);
        cartList.appendChild(li);
    });

    document.getElementById("total").textContent = total.toFixed(2);
}

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
    alert(`${name} foi adicionado ao carrinho!`);
}

function removeItem(index) {
    alert(`${cart[index].name} foi removido do carrinho.`);
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Carrinho vazio! Adicione itens ao carrinho.");
        return;
    }

    let orderDetails = "Pedido:\n";
    cart.forEach((item) => {
        orderDetails += `- ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    });
    orderDetails += `\nTotal: R$ ${total.toFixed(2)}`;

    const phoneNumber = "+5517996780618";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, "_blank");
}

function initializeCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? "block" : "none";
        });
    }

    document.querySelector(".carousel-button.next").addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });

    document.querySelector(".carousel-button.prev").addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });

    showSlide(currentSlide);
}

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeCarousel();

    document.getElementById("toggleTheme").addEventListener("click", toggleTheme);

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const name = button.getAttribute("data-name");
            const price = parseFloat(button.getAttribute("data-price"));
            addToCart(name, price);
        });
    });

    document.getElementById("checkoutButton").addEventListener("click", checkout);
});
