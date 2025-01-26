// Inicialização do Carrossel
function initializeCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    const nextButton = document.querySelector(".carousel-button.next");
    const prevButton = document.querySelector(".carousel-button.prev");
    let currentSlide = 0;

    if (!slides.length || !nextButton || !prevButton) {
        console.error("Carrossel ou botões não encontrados.");
        return;
    }

    const showSlide = (index) => {
        const track = document.querySelector(".carousel-track");
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
    };

    nextButton.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });

    prevButton.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });

    showSlide(currentSlide);
}

// Alternância de Tema (Claro/Escuro)
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", theme);
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
    if (button) {
        button.textContent = document.body.classList.contains("dark-mode")
            ? "🌞 Modo Claro"
            : "🌙 Modo Escuro";
    }
}

// Funções do Carrinho
let cart = [];
let total = 0;

function updateCart() {
    const cartList = document.querySelector(".cart-list");
    const totalElement = document.getElementById("total");

    if (!cartList || !totalElement) {
        console.error("Elementos do carrinho não encontrados.");
        return;
    }

    cartList.innerHTML = "";
    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - R$ ${item.price.toFixed(2)} 
            <button onclick="removeItem(${index})">🗑️</button>`;
        cartList.appendChild(li);
    });

    totalElement.textContent = `R$ ${total.toFixed(2)}`;
}

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
    alert(`${name} foi adicionado ao carrinho!`);
}

function removeItem(index) {
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

// Inicialização Geral
document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeCarousel();

    const themeToggleButton = document.getElementById("toggleTheme");
    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", toggleTheme);
    }

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const name = button.getAttribute("data-name");
            const price = parseFloat(button.getAttribute("data-price"));
            if (name && !isNaN(price)) {
                addToCart(name, price);
            }
        });
    });

    const checkoutButton = document.getElementById("checkoutButton");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkout);
    }
});
