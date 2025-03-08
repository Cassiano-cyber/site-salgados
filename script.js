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
        if (autoSlideActive) {
            stopAutoSlide();
            startAutoSlide();
        }
    };

    return { init, startAutoSlide, stopAutoSlide, restartAutoSlide };
})();

/// ============================================================================
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
        initializeTheme(); // Inicializa o tema ao carregar a página
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
    let isPrincipalCheckout = false;

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

    const checkout = (principal) => {
        isPrincipalCheckout = principal;
        if (cart.length === 0) {
            alert("Carrinho vazio! Adicione itens ao carrinho.");
            return;
        }

        // Coletar dados do endereço
        let deliveryOption, addressData;

        if (isPrincipalCheckout) {
            deliveryOption = document.querySelector('input[name="delivery-principal"]:checked').value;
            if (deliveryOption === 'entrega') {
                addressData = {
                    cep: document.getElementById('cep-principal').value,
                    rua: document.getElementById('rua-principal').value,
                    numero: document.getElementById('numero-principal').value,
                    complemento: document.getElementById('complemento-principal').value,
                    bairro: document.getElementById('bairro-principal').value,
                    cidade: document.getElementById('cidade-principal').value,
                    estado: document.getElementById('estado-principal').value,
                };
            }
        } else {
            deliveryOption = document.querySelector('input[name="delivery"]:checked').value;
            if (deliveryOption === 'entrega') {
                addressData = {
                    cep: document.getElementById('cep').value,
                    rua: document.getElementById('rua').value,
                    numero: document.getElementById('numero').value,
                    complemento: document.getElementById('complemento').value,
                    bairro: document.getElementById('bairro').value,
                    cidade: document.getElementById('cidade').value,
                    estado: document.getElementById('estado').value,
                };
            }
        }
        if (deliveryOption === 'entrega' && !addressData.numero) {
            alert("Por favor, insira o número da casa.");
            return;
        }
        
        // Formatar a mensagem do WhatsApp
        let message = "Novo pedido:\n\n";
        cart.forEach(item => {
            message += `${item.name} - R$ ${item.price.toFixed(2)}\n`;
        });
        message += `\nTotal: R$ ${total.toFixed(2)}\n`;

        if (deliveryOption === 'entrega') {
            message += `\nEndereço:\nCEP: ${addressData.cep}\nRua: ${addressData.rua}, ${addressData.numero} ${addressData.complemento}\nBairro: ${addressData.bairro}\nCidade: ${addressData.cidade}, ${addressData.estado}\n`;
        } else {
            message += "\nRetirar no local.\n";
        }

        // Enviar mensagem via WhatsApp
        const phoneNumber = "5517996780618";
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return { init, addItem, removeItem, checkout, updateCartDisplay };
})();

// ============================================================================
// Inicialização Geral
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
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

    document.getElementById("checkoutButton")?.addEventListener("click", () => cartModule.checkout(true));
    document.querySelector(".checkout-container button")?.addEventListener("click", () => cartModule.checkout(false));
    cartModule.updateCartDisplay();
});
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário principal
    const retirarRadioPrincipal = document.getElementById('retirar-principal');
    const entregaRadioPrincipal = document.getElementById('entrega-principal');
    const enderecoContainerPrincipal = document.getElementById('endereco-container-principal');
    const cepInputPrincipal = document.getElementById('cep-principal');
    const buscarEnderecoButtonPrincipal = document.getElementById('buscar-endereco-principal');
    const ruaInputPrincipal = document.getElementById('rua-principal');
    const numeroInputPrincipal = document.getElementById('numero-principal');
    const complementoInputPrincipal = document.getElementById('complemento-principal');
    const bairroInputPrincipal = document.getElementById('bairro-principal');
    const cidadeInputPrincipal = document.getElementById('cidade-principal');
    const estadoInputPrincipal = document.getElementById('estado-principal');

    // Elementos do formulário secundário
    const retirarRadio = document.getElementById('retirar');
    const entregaRadio = document.getElementById('entrega');
    const enderecoContainer = document.getElementById('endereco-container');
    const cepInput = document.getElementById('cep');
    const buscarEnderecoButton = document.getElementById('buscar-endereco');
    const ruaInput = document.getElementById('rua');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // Função para buscar endereço pelo CEP
    const buscarEndereco = (cep, ruaInput, bairroInput, cidadeInput, estadoInput, enderecoCompletoId) => {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado.');
                    return;
                }
                ruaInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;
                document.getElementById(enderecoCompletoId).style.display = 'block';
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o CEP. Tente novamente.');
            });
    };

    // Função para atualizar a visibilidade do contêiner de endereço
    const updateEnderecoContainerVisibility = (radio, container) => {
        container.style.display = radio.checked ? 'block' : 'none';
    };

    // Inicializar a visibilidade do contêiner de endereço
    updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);

    // Eventos para o formulário principal
    entregaRadioPrincipal.addEventListener('change', function() {
        updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    });

    retirarRadioPrincipal.addEventListener('change', function() {
        updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    });

    buscarEnderecoButtonPrincipal.addEventListener('click', function() {
        const cep = cepInputPrincipal.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInputPrincipal, bairroInputPrincipal, cidadeInputPrincipal, estadoInputPrincipal, 'endereco-completo-principal');
    });

    // Eventos para o formulário secundário
    entregaRadio.addEventListener('change', function() {
        updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);
    });

    retirarRadio.addEventListener('change', function() {
        updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);
    });

    buscarEnderecoButton.addEventListener('click', function() {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInput, bairroInput, cidadeInput, estadoInput, 'endereco-completo');
    });
});
