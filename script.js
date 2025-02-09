// ============================================================================
// Módulo de Carrossel
// ============================================================================
const carouselModule = (() => {
    let currentSlide = 0;
    let slides, nextButton, prevButton, track, carouselContainer;
    let intervalId; // Para armazenar o ID do intervalo
    let autoSlideActive = true; // Flag para controlar o avanço automático

    const init = () => {
        slides = document.querySelectorAll(".carousel-slide");
        nextButton = document.querySelector(".carousel-button.next");
        prevButton = document.querySelector(".carousel-button.prev");
        track = document.querySelector(".carousel-track");
        carouselContainer = document.querySelector(".carousel"); // Obtém o container do carrossel

        if (!slides.length || !nextButton || !prevButton || !track || !carouselContainer) {
            console.error("Carrossel ou elementos não encontrados.");
            return false;
        }

        nextButton.addEventListener("click", () => {
          stopAutoSlide();
          showNextSlide();
          restartAutoSlide();
        });
        prevButton.addEventListener("click", () => {
          stopAutoSlide();
          showPrevSlide();
          restartAutoSlide();
        });
        showSlide(currentSlide);

       // Eventos para pausar/retomar o auto slide no hover
        carouselContainer.addEventListener("mouseenter", () => {
          stopAutoSlide();
        });

        carouselContainer.addEventListener("mouseleave", () => {
          if (autoSlideActive) {
           startAutoSlide();
           }
        });


        // Iniciar o avanço automático a cada 5 segundos
        startAutoSlide();

        return true;
    };

    const showSlide = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
    };

    const showNextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    const showPrevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    };

    const startAutoSlide = () => {
      if (autoSlideActive) {
        intervalId = setInterval(showNextSlide, 5000);
      }
    };

    const stopAutoSlide = () => {
        clearInterval(intervalId);
    };

    const restartAutoSlide = () => {
       if(autoSlideActive){
           stopAutoSlide();
           startAutoSlide();
       }
    };

    return { init, startAutoSlide, stopAutoSlide, restartAutoSlide };
})();

// ============================================================================
// Módulo de Tema (Claro/Escuro)
// ============================================================================
const themeModule = (() => {
    let toggleButton;

    const init = () => {
        toggleButton = document.getElementById("toggleTheme");
        if (!toggleButton) {
            console.error("O botão de tema não foi encontrado");
            return false;
        }
        toggleButton.addEventListener("click", toggleTheme);
        return true;
    };

    const toggleTheme = () => {
        document.body.classList.toggle("dark-mode");
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", theme);
        updateThemeButton();
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
        }
        updateThemeButton();
    };

    const updateThemeButton = () => {
        if (toggleButton) {
            toggleButton.innerHTML = document.body.classList.contains("dark-mode")
                ? '<i class="fas fa-sun"></i> Modo Claro'
                : '<i class="fas fa-moon"></i> Modo Escuro';
        }
    };

    return { init, initializeTheme, toggleTheme, updateThemeButton };
})();

// ============================================================================
// Módulo do Carrinho
// ============================================================================
const cartModule = (() => {
    let cart = [];
    let total = 0;
    let cartList, totalElement, cartCount, cartItemsList, cartTotalDisplay, cartMenu;

    const init = () => {
        cartList = document.querySelector(".cart-list");
        totalElement = document.getElementById("total");
        cartCount = document.getElementById("cart-count");
        cartItemsList = document.getElementById("cart-items");
        cartTotalDisplay = document.getElementById("cart-total");
        cartMenu = document.getElementById("cart-menu");

        if (!cartList || !totalElement || !cartCount || !cartItemsList || !cartTotalDisplay) {
            console.error("Elementos do carrinho não encontrados.");
            return false;
        }

        cartList.addEventListener("click", handleRemoveItem);
        cartItemsList.addEventListener("click", handleRemoveItem);

        const cartIcon = document.querySelector(".cart-icon");
        if (cartIcon) {
            cartIcon.addEventListener("click", toggleCartMenu);
        }

        const closeCartButton = document.querySelector(".close-cart-button");
        if (closeCartButton) {
            closeCartButton.addEventListener("click", toggleCartMenu);
        }

        return true;
    };

    const updateCartDisplay = () => {
        cartList.innerHTML = "";
        cartItemsList.innerHTML = "";

        let totalValue = 0;

        cart.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            cartList.appendChild(listItem);
            cartItemsList.appendChild(listItem.cloneNode(true));
            totalValue += item.price;
        });

        total = totalValue;
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
        cartCount.textContent = cart.length;
        cartTotalDisplay.textContent = `R$ ${total.toFixed(2)}`;
    };

    const addItem = (name, price) => {
        cart.push({ name, price });
        updateCartDisplay();
        alert(`${name} foi adicionado ao carrinho!`);
    };

    const removeItem = (index) => {
        if (index >= 0 && index < cart.length) {
            total -= cart[index].price;
            cart.splice(index, 1);
            updateCartDisplay();
        }
    };

    const handleRemoveItem = (event) => {
        if (event.target.closest(".remove-item")) {
            const index = parseInt(event.target.closest(".remove-item").getAttribute("data-index"), 10);
            removeItem(index);
        }
    };

    const toggleCartMenu = () => {
        cartMenu.classList.toggle("active");
    };

    const checkout = () => {
        if (cart.length === 0) {
            alert("Carrinho vazio! Adicione itens ao carrinho.");
            return;
        }
        const phoneNumber = "5517996780618";
        let orderDetails = `Pedido:\n` + cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)}`).join("\n");
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`, "_blank");
    };

    return { init, addItem, removeItem, checkout };
})();

// ============================================================================
// Inicialização Geral
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    themeModule.initializeTheme();
    themeModule.init();
    carouselModule.init();
    cartModule.init();

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const product = button.closest(".product");
            const name = product.getAttribute("data-name");
            const price = parseFloat(product.getAttribute("data-price"));
            if (name && !isNaN(price)) cartModule.addItem(name, price);
        });
    });

    document.getElementById("checkoutButton")?.addEventListener("click", cartModule.checkout);
    cartModule.updateCartDisplay();
});
