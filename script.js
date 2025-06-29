/**
 * Módulo para gerenciar carrosséis.
 * CORREÇÃO: Usa 'var' e verificação para evitar erro de redeclaração.
 */
var carouselModule = carouselModule || (() => {
    const carousels = {};
    const AUTO_SLIDE_INTERVAL = 8000;
    const AUTO_SLIDE_RESUME_DELAY = 15000;
    const SWIPE_THRESHOLD = 50;

    const init = (carouselId) => {
        if (carousels[carouselId]) return true;

        const carouselContainer = document.getElementById(carouselId);
        if (!carouselContainer) return false;

        const slides = carouselContainer.querySelectorAll(".carousel-slide");
        const nextButton = carouselContainer.querySelector(".carousel-button.next");
        const prevButton = carouselContainer.querySelector(".carousel-button.prev");
        const track = carouselContainer.querySelector(".carousel-track");

        if (slides.length === 0 || !nextButton || !prevButton || !track) {
            if (carouselId !== 'sabores') console.warn(`Carousel elements for "${carouselId}" incomplete.`);
            return false;
        }

        carousels[carouselId] = {
            container: carouselContainer, track, nextButton, prevButton,
            slides: Array.from(slides), currentSlide: 0, intervalId: null,
            autoSlideActive: true, locked: false, startX: 0, endX: 0, resumeTimeout: null,
        };

        setupEventListeners(carouselId);
        showSlide(carouselId, 0);
        startAutoSlide(carouselId);
        return true;
    };

    const update = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel) return init(carouselId);

        const newSlides = carousel.container.querySelectorAll(".carousel-slide");
        carousel.slides = Array.from(newSlides);
        carousel.currentSlide = 0;
        carousel.locked = false;
        carousel.autoSlideActive = true;

        showSlide(carouselId, 0);
        startAutoSlide(carouselId);
        return true;
    };

    const setupEventListeners = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel) return;

        const handleInteraction = (action) => {
            if (carousel.locked) return;
            stopAutoSlide(carouselId);
            action();
            clearTimeout(carousel.resumeTimeout);
            carousel.resumeTimeout = setTimeout(() => {
                if (carousel.autoSlideActive && !carousel.locked) startAutoSlide(carouselId);
            }, AUTO_SLIDE_RESUME_DELAY);
        };

        carousel.nextButton.addEventListener("click", () => handleInteraction(() => showNextSlide(carouselId)));
        carousel.prevButton.addEventListener("click", () => handleInteraction(() => showPrevSlide(carouselId)));
        carousel.container.addEventListener("mouseenter", () => stopAutoSlide(carouselId));
        carousel.container.addEventListener("mouseleave", () => {
            if (carousel.autoSlideActive && !carousel.locked) startAutoSlide(carouselId);
        });
        carousel.container.addEventListener("touchstart", (e) => handleTouchStart(e, carouselId), { passive: true });
        carousel.container.addEventListener("touchmove", (e) => handleTouchMove(e, carouselId), { passive: true });
        carousel.container.addEventListener("touchend", () => handleInteraction(() => handleTouchEnd(carouselId)));
    };

    const showSlide = (carouselId, index) => {
        const carousel = carousels[carouselId];
        if (!carousel || !carousel.track) return;
        const validIndex = Math.max(0, Math.min(index, carousel.slides.length - 1));
        carousel.track.style.transform = `translateX(-${validIndex * 100}%)`;
        carousel.currentSlide = validIndex;
    };

    const showNextSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || carousel.locked) return;
        const nextIndex = (carousel.currentSlide + 1) % carousel.slides.length;
        showSlide(carouselId, nextIndex);
    };

    const showPrevSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || carousel.locked) return;
        const prevIndex = (carousel.currentSlide - 1 + carousel.slides.length) % carousel.slides.length;
        showSlide(carouselId, prevIndex);
    };

    const startAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || !carousel.autoSlideActive || carousel.locked) return;
        stopAutoSlide(carouselId);
        carousel.intervalId = setInterval(() => showNextSlide(carouselId), AUTO_SLIDE_INTERVAL);
    };

    const stopAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel) clearInterval(carousel.intervalId);
    };

    const stopAutoSlideExternally = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel) {
            carousel.autoSlideActive = false;
            stopAutoSlide(carouselId);
            clearTimeout(carousel.resumeTimeout);
        }
    };

    const lockCarousel = (carouselId, slideIndex) => {
        const carousel = carousels[carouselId];
        if (carousel) {
            carousel.locked = true;
            stopAutoSlideExternally(carouselId);
            if (typeof slideIndex === "number") showSlide(carouselId, slideIndex);
        }
    };

    const handleTouchStart = (e, carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel && !carousel.locked) {
            carousel.startX = e.touches[0].clientX;
            carousel.endX = carousel.startX;
        }
    };

    const handleTouchMove = (e, carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel && !carousel.locked) carousel.endX = e.touches[0].clientX;
    };

    const handleTouchEnd = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || carousel.locked) return;
        const deltaX = carousel.startX - carousel.endX;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX > 0) showNextSlide(carouselId);
            else showPrevSlide(carouselId);
        }
    };

    return { init, update, stopAutoSlideExternally, lockCarousel };
})();


var themeModule = themeModule || (() => {
    let toggleButton;
    const THEME_STORAGE_KEY = "theme";

    const init = () => {
        toggleButton = document.getElementById("toggleTheme");
        if (!toggleButton) return false;
        toggleButton.addEventListener("click", toggleTheme);
        initializeTheme();
        return true;
    };

    const toggleTheme = () => {
        document.body.classList.toggle("dark-mode");
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        updateThemeButton();
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.body.classList.add("dark-mode");
        }
        updateThemeButton();
    };

    const updateThemeButton = () => {
        if (toggleButton) {
            const isDarkMode = document.body.classList.contains("dark-mode");
            toggleButton.innerHTML = isDarkMode ?
                '<i class="fas fa-sun"></i> Light Mode' :
                '<i class="fas fa-moon"></i> Dark Mode';
        }
    };

    return { init };
})();

var cartModule = cartModule || (() => {
    const cart = [];
    let cartMenu, cartItemsList, cartCount, cartTotalDisplay;

    const init = () => {
        cartMenu = document.getElementById('cart-menu');
        cartItemsList = document.getElementById('cart-items');
        cartCount = document.getElementById('cart-count');
        cartTotalDisplay = document.getElementById('cart-total');
        if (!cartMenu || !cartItemsList || !cartCount || !cartTotalDisplay) return false;
        document.body.addEventListener('click', handleBodyClick);
        updateCartDisplay();
        return true;
    };

    const updateCartDisplay = () => {
        cartItemsList.innerHTML = '';
        const totalValue = cart.reduce((sum, item) => sum + item.price, 0);
        cart.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${item.name} - R$ ${item.price.toFixed(2)}</span><button class="remove-item" data-index="${index}" aria-label="Remover ${item.name}"><i class="fas fa-trash"></i></button>`;
            cartItemsList.appendChild(listItem);
        });
        cartCount.textContent = cart.length;
        cartTotalDisplay.textContent = `R$ ${totalValue.toFixed(2)}`;
    };

    const addItem = (name, price) => {
        cart.push({ name, price });
        updateCartDisplay();
    };

    const removeItem = (index) => {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            updateCartDisplay();
        }
    };

    const handleBodyClick = (event) => {
        const addToCartButton = event.target.closest('.add-to-cart');
        if (addToCartButton) {
            const name = addToCartButton.dataset.name;
            const price = parseFloat(addToCartButton.dataset.price);
            if (name && !isNaN(price)) {
                addItem(name, price);
                animateItemToCart(addToCartButton);
            }
        }
        const removeItemButton = event.target.closest('.remove-item');
        if (removeItemButton) {
            const index = parseInt(removeItemButton.dataset.index, 10);
            if (!isNaN(index)) removeItem(index);
        }
    };

    const animateItemToCart = (button) => {
        const productCard = button.closest('.product, .salgado-item, .bebida-item, .promotion-item');
        if (!productCard) return;
        const cartIcon = document.querySelector('.cart-icon');
        const img = productCard.querySelector('img');
        if (!img || !cartIcon) return;

        const clone = img.cloneNode(true);
        const rect = img.getBoundingClientRect();
        Object.assign(clone.style, {
            position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
            width: `${rect.width}px`, height: `${rect.height}px`,
            borderRadius: '50%', objectFit: 'cover',
            transition: 'all 0.8s cubic-bezier(.4,2,.6,1)',
            zIndex: '9999', pointerEvents: 'none',
        });
        document.body.appendChild(clone);
        const cartRect = cartIcon.getBoundingClientRect();
        const cartCenterX = cartRect.left + cartRect.width / 2;
        const cartCenterY = cartRect.top + cartRect.height / 2;
        const cloneFinalWidth = Math.min(rect.width * 0.2, 30);
        setTimeout(() => {
            Object.assign(clone.style, {
                top: `${cartCenterY - (cloneFinalWidth / 2)}px`,
                left: `${cartCenterX - (cloneFinalWidth / 2)}px`,
                width: `${cloneFinalWidth}px`, height: `${cloneFinalWidth}px`,
                opacity: '0.4',
            });
        }, 20);
        setTimeout(() => clone.remove(), 850);
    };

    return { init, cart, total: () => cart.reduce((sum, item) => sum + item.price, 0), updateCartDisplay };
})();

var loyaltyModule = loyaltyModule || (() => {
    let clienteCadastrado = null;
    const CLIENT_STORAGE_KEY = "cliente";

    const init = () => {
        try {
            clienteCadastrado = JSON.parse(localStorage.getItem(CLIENT_STORAGE_KEY)) || null;
        } catch (e) {
            clienteCadastrado = null;
        }
        const cadastrarButton = document.getElementById("cadastrar-fidelidade");
        if (cadastrarButton) cadastrarButton.addEventListener("click", handleCadastro);
        if (clienteCadastrado) exibirCarteiraDigital();
        return true;
    };

    const exibirCarteiraDigital = () => {
        if (!clienteCadastrado) return;
        const cadastroDiv = document.getElementById("cadastro-fidelidade");
        const carteiraDiv = document.getElementById("carteira-digital");
        const nomeClienteSpan = document.getElementById("nome-cliente");
        const pontosClienteSpan = document.getElementById("pontos-cliente");
        if (cadastroDiv) cadastroDiv.style.display = "none";
        if (carteiraDiv) carteiraDiv.style.display = "block";
        if (nomeClienteSpan) nomeClienteSpan.textContent = clienteCadastrado.nome;
        if (pontosClienteSpan) pontosClienteSpan.textContent = clienteCadastrado.pontos;
    };

    const handleCadastro = (event) => {
        event.preventDefault();
        const nomeInput = document.getElementById("nome-fidelidade");
        const telefoneInput = document.getElementById("telefone-fidelidade");
        if (nomeInput && telefoneInput && nomeInput.value.trim() && telefoneInput.value.trim()) {
            clienteCadastrado = { nome: nomeInput.value.trim(), telefone: telefoneInput.value.trim(), pontos: 0, historicoPedidos: [] };
            localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clienteCadastrado));
            exibirCarteiraDigital();
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    };

    const adicionarPontos = (valorCompra) => {
        if (clienteCadastrado && valorCompra > 0) {
            const pontosGanhos = Math.floor(valorCompra / 10);
            if (pontosGanhos > 0) {
                clienteCadastrado.pontos += pontosGanhos;
                clienteCadastrado.historicoPedidos.push({
                    id: Date.now(),
                    valor: valorCompra,
                    data: new Date().toLocaleDateString('pt-BR')
                });
                localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clienteCadastrado));
                exibirCarteiraDigital();
            }
        }
    };

    return { init, adicionarPontos, getCliente: () => clienteCadastrado };
})();

var suggestionModule = suggestionModule || (() => {
    const produtos = [
        { id: 1, nome: "Coxinha de Frango", preco: 7.50, tipo: "salgado", imagem: "https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { id: 2, nome: "Enroladinho de Salsicha", preco: 6.00, tipo: "salgado", imagem: "https://images.pexels.com/photos/357576/pexels-photo-357576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
        { id: 3, nome: "Coca-Cola", preco: 5.00, tipo: "bebida", imagem: "https://cdn.pixabay.com/photo/2020/05/26/09/38/coca-cola-5222420_1280.jpg" },
        { id: 4, nome: "Combo Coxinha de Frango", preco: 15.00, tipo: "combo", imagem: "https://cdn.pixabay.com/photo/2019/04/27/23/13/coxinha-4161606_1280.jpg" },
    ];

    const init = () => exibirSugestoesPersonalizadas();

    const exibirSugestoesPersonalizadas = () => {
        const sugestoesContainer = document.getElementById("sugestoes-produtos");
        if (!sugestoesContainer) return;
        sugestoesContainer.innerHTML = "";
        const cliente = loyaltyModule.getCliente();
        const createSuggestionCard = (produto, mensagem) => {
            const card = document.createElement("article");
            card.className = "promotion-item product";
            card.innerHTML = `<img src="${produto.imagem}" alt="${produto.nome}" loading="lazy" width="300" height="200"><h3>${produto.nome}</h3><p>${mensagem}</p><button class="add-to-cart button" data-name="${produto.nome}" data-price="${produto.preco}">Adicionar</button>`;
            return card;
        };
        let sugestao = produtos[0];
        if (cliente && cliente.historicoPedidos.length > 0) {
            const idsComprados = new Set(cliente.historicoPedidos.map(p => p.id));
            const sugestaoNaoComprada = produtos.find(p => !idsComprados.has(p.id) && p.tipo === "salgado");
            if (sugestaoNaoComprada) {
                sugestao = sugestaoNaoComprada;
                sugestoesContainer.appendChild(createSuggestionCard(sugestao, "Que tal experimentar este?"));
                return;
            }
        }
        sugestoesContainer.appendChild(createSuggestionCard(sugestao, "Experimente o nosso carro-chefe!"));
    };

    return { init, exibirSugestoesPersonalizadas };
})();


// --- LÓGICA PRINCIPAL DA APLICAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    themeModule.init();
    cartModule.init();
    loyaltyModule.init();
    carouselModule.init('tipos-salgado');
    carouselModule.init('sabores');
    suggestionModule.init();

    const tiposCarrossel = document.getElementById('tipos-salgado');
    const saboresCarrossel = document.getElementById('sabores');
    const saboresTrack = document.getElementById('carousel-track-sabores');
    const tipoSelecionadoSpan = document.getElementById('tipo-selecionado');
    const saborSelecionadoSpan = document.getElementById('sabor-selecionado');
    const checkoutButton = document.getElementById('checkoutButton');
    const entregaRadio = document.getElementById('entrega');

    let tipoSelecionado = null;
    let saboresDisponiveis = [];

    const capitalizeFirstLetter = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1) : '';

    const atualizarSabores = (tipo) => {
        if (!saboresTrack) return;
        saboresTrack.innerHTML = '';
        const saboresMap = {
            'coxinha': [{ nome: 'Frango', preco: 7.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' }, { nome: 'Costela', preco: 8.00, imagem: 'https://images.pexels.com/photos/8964567/pexels-photo-8964567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'costela' }, { nome: 'Calabresa com Cheddar', preco: 7.50, imagem: 'https://images.pexels.com/photos/17402718/pexels-photo-17402718/free-photo-of-comida-alimento-refeicao-pizza.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'calabresa-com-cheddar' }, { nome: 'Chocolate com Café', preco: 9.00, imagem: './imagens/chocolate-com-cafe.webp', sabor: 'chocolate-com-cafe' }, { nome: 'Sorvete', preco: 9.50, imagem: './imagens/coxinha-sorvete.webp', sabor: 'sorvete' }, { nome: 'Doce de Leite', preco: 9.00, imagem: './imagens/Doce-de-leite.webp', sabor: 'doce-de-leite' }],
            'enroladinho': [{ nome: 'Salsicha', preco: 6.00, imagem: 'https://images.pexels.com/photos/357576/pexels-photo-357576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'salsicha' }, { nome: 'Queijo e Presunto', preco: 6.50, imagem: 'https://images.pexels.com/photos/9615585/pexels-photo-9615585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'queijo-e-presunto' }],
            'bolinha': [{ nome: 'Carne com Queijo', preco: 6.00, imagem: 'https://cdn.pixabay.com/photo/2019/10/13/02/18/tomato-meat-sauce-4545230_1280.jpg', sabor: 'carne-com-queijo' }, { nome: 'Calabresa', preco: 6.00, imagem: 'https://images.pexels.com/photos/6004718/pexels-photo-6004718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'calabresa' }],
            'empada': [{ nome: 'Frango', preco: 6.00, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' }, { nome: 'Palmito', preco: 6.50, imagem: 'https://images.pexels.com/photos/8679380/pexels-photo-8679380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'palmito' }, { nome: 'Queijo', preco: 6.50, imagem: 'https://cdn.pixabay.com/photo/2017/01/11/19/56/cheese-1972744_1280.jpg', sabor: 'queijo' }],
            'tortinha': [{ nome: 'Legumes', preco: 4.50, imagem: 'https://images.pexels.com/photos/4577379/pexels-photo-4577379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'legumes' }, { nome: 'Frango', preco: 4.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' }],
            'torta': [{ nome: 'Frango com Catupiry', preco: 5.00, imagem: 'https://receitasdepesos.com.br/wp-content/uploads/2024/09/file-de-frango-com-catupiry.jpeg.webp', sabor: 'frango-com-catupiry' }, { nome: 'Calabresa com Queijo', preco: 5.00, imagem: 'https://cdn.pixabay.com/photo/2021/10/16/12/50/fire-chicken-6714952_1280.jpg', sabor: 'calabresa-com-queijo' }]
        };
        saboresDisponiveis = saboresMap[tipo] || [];
        if (saboresDisponiveis.length === 0) {
            saboresTrack.innerHTML = '<p>Nenhum sabor disponível para este tipo de salgado.</p>';
        } else {
            saboresDisponiveis.forEach(sabor => {
                const slide = document.createElement('article');
                slide.className = 'carousel-slide product';
                slide.dataset.sabor = sabor.sabor;
                slide.innerHTML = `<img src="${sabor.imagem}" alt="Sabor ${sabor.nome}" loading="lazy" width="300" height="200"><h3>${sabor.nome}</h3><button class="add-to-cart cta" data-name="${capitalizeFirstLetter(tipo)} de ${sabor.nome}" data-price="${sabor.preco.toFixed(2)}">Adicionar</button>`;
                saboresTrack.appendChild(slide);
            });
        }
        carouselModule.update('sabores');
    };

    const finalizarPedido = async () => {
        if (cartModule.cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }
        // Monta o objeto do pedido
        const pedido = {
            itens: cartModule.cart.map(item => ({ nome: item.name, preco: item.price })),
            total: cartModule.total(),
            data: new Date().toISOString()
        };
        try {
            const response = await fetch('http://localhost:3000/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
            if (response.ok) {
                alert('Pedido enviado com sucesso!');
                cartModule.cart.length = 0;
                cartModule.updateCartDisplay();
                suggestionModule.exibirSugestoesPersonalizadas();
            } else {
                alert('Erro ao enviar pedido. Tente novamente.');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    };

    if (tiposCarrossel) {
        tiposCarrossel.addEventListener('click', (event) => {
            const selectButton = event.target.closest('.select-type');
            if (selectButton) {
                tipoSelecionado = selectButton.dataset.tipo;
                if (tipoSelecionadoSpan) tipoSelecionadoSpan.textContent = capitalizeFirstLetter(tipoSelecionado);
                if (saborSelecionadoSpan) saborSelecionadoSpan.textContent = 'Nenhum';
                atualizarSabores(tipoSelecionado);
                carouselModule.stopAutoSlideExternally('tipos-salgado');
            }
        });
    }

    if (saboresCarrossel) {
        saboresCarrossel.addEventListener('click', (event) => {
            const productSlide = event.target.closest('.carousel-slide.product');
            if (productSlide) {
                const saborSelecionadoId = productSlide.dataset.sabor;
                const sabor = saboresDisponiveis.find(s => s.sabor === saborSelecionadoId);
                if (sabor && saborSelecionadoSpan) saborSelecionadoSpan.textContent = sabor.nome;
                const slides = Array.from(saboresCarrossel.querySelectorAll('.carousel-slide.product'));
                const slideIndex = slides.indexOf(productSlide);
                if (slideIndex !== -1) carouselModule.lockCarousel('sabores', slideIndex);
            }
        });
    }

    if (checkoutButton) checkoutButton.addEventListener('click', finalizarPedido);
});

// Animações de Scroll e Comentários
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container-coxinhas');
    if (!container) return;
    const coxinhas = Array.from(container.querySelectorAll('.coxinha'));
    const comentarios = Array.from(container.querySelectorAll('.comentario'));
    let comentarioAtual = 0;

    const renderizarEstrelas = (ratingContainer) => {
        if (!ratingContainer) return;
        const rating = parseFloat(ratingContainer.dataset.rating);
        if (isNaN(rating)) return;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
        ratingContainer.innerHTML = `${starsHTML} ${rating.toFixed(1)}`;
    };

    if (comentarios.length > 0) {
        // CORREÇÃO: Lógica para mostrar/esconder comentários
        const mostrarProximoComentario = () => {
            comentarios.forEach((com, index) => {
                com.classList.remove('active'); // Remove a classe de todos
            });
            comentarioAtual = (comentarioAtual + 1) % comentarios.length;
            comentarios[comentarioAtual].classList.add('active'); // Adiciona a classe apenas ao atual
        };
        comentarios.forEach(com => renderizarEstrelas(com.querySelector('[data-rating]')));
        comentarios[0].classList.add('active'); // Mostra o primeiro
        setInterval(mostrarProximoComentario, 5000);
    }

    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;
        let containerTop = container.offsetTop;
        let windowHeight = window.innerHeight;
        if (scrollY > containerTop - windowHeight && scrollY < containerTop + container.offsetHeight) {
            let relativeScroll = scrollY - (containerTop - windowHeight);
            if (coxinhas.length > 0) {
                if(coxinhas[0]) coxinhas[0].style.transform = `translateY(${relativeScroll*0.08}px) translateX(${Math.sin(relativeScroll*0.01)*10}px) rotate(${relativeScroll*0.01-5}deg)`;
                if(coxinhas[1]) coxinhas[1].style.transform = `translateY(${relativeScroll*0.08}px) translateX(${Math.cos(relativeScroll*0.01)*10}px) rotate(${relativeScroll*-0.01+175}deg)`;
                if(coxinhas[2]) coxinhas[2].style.transform = `translateY(${relativeScroll*0.08}px) translateX(${Math.sin(relativeScroll*0.01)*-10}px) rotate(${relativeScroll*0.01+5}deg)`;
                if(coxinhas[3]) coxinhas[3].style.transform = `translateY(${relativeScroll*0.08}px) translateX(${Math.cos(relativeScroll*0.01)*-10}px) rotate(${relativeScroll*-0.01-3}deg)`;
            }
        }
    }, { passive: true });
});

// Funções Globais e Menu Mobile
function toggleCart() {
    const cartMenu = document.getElementById('cart-menu');
    if (cartMenu) cartMenu.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
});
document.getElementById('checkoutButton').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Carrinho vazio! Adicione itens ao carrinho.');
        return;
    }

    let total = 0;
    let orderDetails = 'Pedido:\n';

    cart.forEach(item => {
        orderDetails += `- ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        total += item.price;
    });

    orderDetails += `\nTotal: R$ ${total.toFixed(2)}`;

    const phoneNumber = '5517996780618'; // sem o "+" no link do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
});
