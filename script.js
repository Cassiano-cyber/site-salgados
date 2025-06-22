/**
 * Módulo para gerenciar carrosséis de forma interativa e responsiva.
 * Suporta navegação por botões, auto-slide, e gestos de toque (swipe).
 */
const carouselModule = (() => {
    const carousels = {}; // Armazena o estado de cada carrossel por seu ID
    const AUTO_SLIDE_INTERVAL = 8000; // Intervalo para troca automática de slides (8 segundos)
    const AUTO_SLIDE_RESUME_DELAY = 15000; // Tempo de espera para retomar auto-slide após interação (15 segundos)
    const SWIPE_THRESHOLD = 50; // Limite de pixels para considerar um gesto como swipe

    /**
     * Inicializa um carrossel com um determinado ID.
     * @param {string} carouselId - O ID do elemento container do carrossel.
     * @returns {boolean} - True se a inicialização for bem-sucedida, false caso contrário.
     */
    const init = (carouselId) => {
        const carouselContainer = document.getElementById(carouselId);
        if (!carouselContainer) {
            console.error(`Carousel with ID "${carouselId}" not found.`);
            return false;
        }

        // Seleciona os elementos essenciais do carrossel
        const slides = carouselContainer.querySelectorAll(".carousel-slide");
        const nextButton = carouselContainer.querySelector(".carousel-button.next");
        const prevButton = carouselContainer.querySelector(".carousel-button.prev");
        const track = carouselContainer.querySelector(".carousel-track");

        // Validação dos elementos do carrossel
        if (!slides.length || !nextButton || !prevButton || !track) {
            console.error(`One or more essential elements for carousel "${carouselId}" not found (slides, nextButton, prevButton, track).`);
            return false;
        }

        // Armazena o estado e os elementos do carrossel
        carousels[carouselId] = {
            currentSlide: 0,
            slides: slides,
            nextButton: nextButton,
            prevButton: prevButton,
            track: track,
            intervalId: null, // ID do intervalo de auto-slide
            autoSlideActive: true, // Flag para controlar a ativação do auto-slide
            startX: 0, // Posição X inicial do toque para swipe
            endX: 0, // Posição X final do toque para swipe
            resumeTimeout: null, // ID do timeout para retomar auto-slide
            locked: false // Flag para travar o carrossel (ex: após selecionar um item)
        };

        // Define os listeners de evento
        setupEventListeners(carouselId, carouselContainer);

        // Define o slide inicial e inicia o auto-slide
        showSlide(carouselId, 0);
        startAutoSlide(carouselId);

        console.log(`Carousel "${carouselId}" initialized successfully.`);
        return true;
    };

    /**
     * Configura todos os listeners de evento para um carrossel específico.
     * @param {string} carouselId - O ID do carrossel.
     * @param {HTMLElement} carouselContainer - O elemento container do carrossel.
     */
    const setupEventListeners = (carouselId, carouselContainer) => {
        const carousel = carousels[carouselId];

        // Eventos de clique nos botões de navegação
        carousel.nextButton.addEventListener("click", () => {
            if (carousel.locked) return;
            handleNavigationInteraction(carouselId, () => showNextSlide(carouselId));
        });
        carousel.prevButton.addEventListener("click", () => {
            if (carousel.locked) return;
            handleNavigationInteraction(carouselId, () => showPrevSlide(carouselId));
        });

        // Eventos de mouse para controlar auto-slide
        carouselContainer.addEventListener("mouseenter", () => stopAutoSlide(carouselId));
        carouselContainer.addEventListener("mouseleave", () => {
            if (carousel.autoSlideActive && !carousel.locked) {
                startAutoSlide(carouselId);
            }
        });

        // Eventos de toque para gestos de swipe
        carouselContainer.addEventListener("touchstart", (e) => {
            if (carousel.locked) return;
            handleTouchStart(e, carouselId);
        }, { passive: true }); // Usa passive: true para melhor performance
        carouselContainer.addEventListener("touchmove", (e) => {
            if (carousel.locked) return;
            handleTouchMove(e, carouselId);
        }, { passive: true });
        carouselContainer.addEventListener("touchend", () => {
            if (carousel.locked) return;
            handleTouchEnd(carouselId);
        });
    };

    /**
     * Gerencia a interação do usuário com os botões de navegação ou swipe.
     * Pausa o auto-slide, executa a ação e agenda a retomada.
     * @param {string} carouselId - O ID do carrossel.
     * @param {Function} action - A função a ser executada (showNextSlide ou showPrevSlide).
     */
    const handleNavigationInteraction = (carouselId, action) => {
        stopAutoSlide(carouselId);
        action(); // Executa a ação de navegação
        clearTimeout(carousels[carouselId].resumeTimeout); // Limpa qualquer timeout pendente
        // Agenda a retomada do auto-slide após um delay
        carousels[carouselId].resumeTimeout = setTimeout(() => {
            if (carousels[carouselId].autoSlideActive && !carousels[carouselId].locked) {
                startAutoSlide(carouselId);
            }
        }, AUTO_SLIDE_RESUME_DELAY);
    };

    /**
     * Move o carrossel para um slide específico.
     * @param {string} carouselId - O ID do carrossel.
     * @param {number} index - O índice do slide a ser exibido.
     */
    const showSlide = (carouselId, index) => {
        const carousel = carousels[carouselId];
        if (!carousel) return;
        // Ajusta a posição do track para exibir o slide correto
        carousel.track.style.transform = `translateX(-${index * 100}%)`;
    };

    /**
     * Mostra o próximo slide no carrossel.
     * @param {string} carouselId - O ID do carrossel.
     */
    const showNextSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || carousel.locked) return;
        // Calcula o próximo slide, voltando ao início se estiver no último
        carousel.currentSlide = (carousel.currentSlide + 1) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    /**
     * Mostra o slide anterior no carrossel.
     * @param {string} carouselId - O ID do carrossel.
     */
    const showPrevSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || carousel.locked) return;
        // Calcula o slide anterior, voltando ao último se estiver no primeiro
        carousel.currentSlide = (carousel.currentSlide - 1 + carousel.slides.length) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    /**
     * Inicia o auto-slide para um carrossel.
     * @param {string} carouselId - O ID do carrossel.
     */
    const startAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel || !carousel.autoSlideActive || carousel.locked) return;
        stopAutoSlide(carouselId); // Garante que não haja múltiplos intervalos ativos
        carousel.intervalId = setInterval(() => showNextSlide(carouselId), AUTO_SLIDE_INTERVAL);
    };

    /**
     * Para o auto-slide de um carrossel.
     * @param {string} carouselId - O ID do carrossel.
     */
    const stopAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel) return;
        clearInterval(carousel.intervalId); // Limpa o intervalo
    };

    /**
     * Para o auto-slide de um carrossel de forma externa.
     * Útil quando uma ação externa deve pausar a rotação automática.
     * @param {string} carouselId - O ID do carrossel.
     */
    const stopAutoSlideExternally = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel) {
            carousel.autoSlideActive = false; // Marca o auto-slide como inativo
            stopAutoSlide(carouselId);
            clearTimeout(carousel.resumeTimeout); // Limpa o timeout de retomada
        }
    };

    /**
     * Trava o carrossel em um slide específico, impedindo navegação e auto-slide.
     * @param {string} carouselId - O ID do carrossel.
     * @param {number} [slideIndex] - O índice do slide a ser travado (opcional). Se não fornecido, trava no slide atual.
     */
    const lockCarousel = (carouselId, slideIndex) => {
        const carousel = carousels[carouselId];
        if (carousel) {
            carousel.locked = true;
            carousel.autoSlideActive = false; // Desativa o auto-slide ao travar
            stopAutoSlide(carouselId);
            clearTimeout(carousel.resumeTimeout);
            // Se um índice específico for fornecido, move para ele antes de travar
            if (typeof slideIndex === "number" && slideIndex >= 0 && slideIndex < carousel.slides.length) {
                carousel.currentSlide = slideIndex;
                showSlide(carouselId, slideIndex);
            }
        }
    };

    // --- Funções para suporte a gestos de deslizar (swipe) ---

    /**
     * Captura o ponto de início do toque.
     * @param {TouchEvent} e - O evento de toque.
     * @param {string} carouselId - O ID do carrossel.
     */
    const handleTouchStart = (e, carouselId) => {
        const carousel = carousels[carouselId];
        carousel.startX = e.touches[0].clientX;
        carousel.endX = carousel.startX; // Reseta endX para garantir que delta seja calculado corretamente
    };

    /**
     * Atualiza o ponto final do toque durante o deslizamento.
     * @param {TouchEvent} e - O evento de toque.
     * @param {string} carouselId - O ID do carrossel.
     */
    const handleTouchMove = (e, carouselId) => {
        const carousel = carousels[carouselId];
        carousel.endX = e.touches[0].clientX;
    };

    /**
     * Processa o swipe quando o toque termina.
     * @param {string} carouselId - O ID do carrossel.
     */
    const handleTouchEnd = (carouselId) => {
        const carousel = carousels[carouselId];
        const deltaX = carousel.startX - carousel.endX; // Diferença entre início e fim do toque

        // Verifica se o movimento foi suficiente para ser considerado um swipe
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            // Pausa o auto-slide e agenda a retomada após o swipe
            handleNavigationInteraction(carouselId, () => {
                if (deltaX > 0) {
                    showNextSlide(carouselId); // Swipe para a esquerda (move para o próximo)
                } else {
                    showPrevSlide(carouselId); // Swipe para a direita (move para o anterior)
                }
            });
        }
    };

    // Retorna as funções públicas do módulo
    return { init, stopAutoSlideExternally, lockCarousel };
})();

/**
 * Módulo para gerenciar o tema da aplicação (claro/escuro) e a interação com o botão de tema.
 */
const themeModule = (() => {
    let toggleButton; // Referência ao botão de alternância de tema
    const THEME_STORAGE_KEY = "theme"; // Chave para salvar o tema no localStorage

    /**
     * Inicializa o módulo de tema. Busca o botão de toggle, define listeners e inicializa o tema.
     * @returns {boolean} - True se inicializado com sucesso, false caso contrário.
     */
    const init = () => {
        toggleButton = document.getElementById("toggleTheme");
        if (!toggleButton) {
            console.error("Theme toggle button with ID 'toggleTheme' not found.");
            return false;
        }
        toggleButton.addEventListener("click", toggleTheme);
        initializeTheme();
        console.log("Theme module initialized.");
        return true;
    };

    /**
     * Alterna entre os temas claro e escuro.
     * Salva a preferência do usuário no localStorage.
     */
    const toggleTheme = () => {
        document.body.classList.toggle("dark-mode");
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        updateThemeButton(); // Atualiza o texto/ícone do botão
    };

    /**
     * Inicializa o tema da aplicação com base nas preferências salvas no localStorage
     * ou na preferência do sistema operacional (dark mode).
     */
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode"); // Garante que o tema claro seja aplicado se não for dark
        }
        updateThemeButton();
    };

    /**
     * Atualiza o texto e o ícone do botão de alternância de tema.
     */
    const updateThemeButton = () => {
        if (!toggleButton) return; // Evita erro se o botão não existir

        const isDarkMode = document.body.classList.contains("dark-mode");
        // Usa Font Awesome para os ícones
        toggleButton.innerHTML = isDarkMode
            ? '<i class="fas fa-sun"></i> Light Mode'
            : '<i class="fas fa-moon"></i> Dark Mode';
    };

    // Retorna as funções públicas do módulo
    return { init, initializeTheme, toggleTheme, updateThemeButton };
})();

/**
 * Módulo para gerenciar o carrinho de compras.
 * Inclui adição, remoção de itens, atualização da exibição e cálculo do total.
 */
const cartModule = (() => {
    const cart = []; // Array para armazenar os itens do carrinho
    // Elementos da UI do carrinho
    const cartMenu = document.getElementById('cart-menu');
    const cartItemsList = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalDisplay = document.getElementById('cart-total');

    // Validação inicial dos elementos do carrinho
    if (!cartMenu || !cartItemsList || !cartCount || !cartTotalDisplay) {
        console.error("One or more essential cart elements not found (cart-menu, cart-items, cart-count, cart-total).");
        // Retorna um init vazio para não quebrar a aplicação caso os elementos não existam
        return { init: () => false, addItem: () => {}, removeItem: () => {}, cart: [], total: () => 0 };
    }

    /**
     * Atualiza a exibição do carrinho na interface do usuário.
     * Recalcula o total e a quantidade de itens.
     */
    const updateCartDisplay = () => {
        cartItemsList.innerHTML = ''; // Limpa a lista de itens atual
        let totalValue = 0;

        // Itera sobre os itens do carrinho para criá-los na UI
        cart.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'cart-item'; // Adiciona classe para possível estilização
            listItem.innerHTML = `
                <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item" data-index="${index}" aria-label="Remover ${item.name} do carrinho">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsList.appendChild(listItem);
            totalValue += item.price;
        });

        // Atualiza os contadores e o total na UI
        cartCount.textContent = cart.length;
        cartTotalDisplay.textContent = `R$ ${totalValue.toFixed(2)}`;
    };

    /**
     * Adiciona um item ao carrinho.
     * @param {string} name - O nome do item.
     * @param {number} price - O preço do item.
     */
    const addItem = (name, price) => {
        cart.push({ name, price });
        updateCartDisplay(); // Atualiza a exibição após adicionar
        // alert(`${name} foi adicionado ao carrinho!`); // Aviso removido para uma experiência mais fluida
    };

    /**
     * Remove um item do carrinho pelo seu índice.
     * @param {number} index - O índice do item a ser removido.
     */
    const removeItem = (index) => {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1); // Remove o item do array
            updateCartDisplay(); // Atualiza a exibição
        }
    };

    /**
     * Handler para cliques no corpo do documento, para adicionar itens ao carrinho
     * e remover itens da lista do carrinho.
     */
    document.body.addEventListener('click', (event) => {
        // Adicionar ao carrinho
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);

            if (isNaN(price)) {
                console.error(`Invalid price for item "${name}": ${button.dataset.price}`);
                return;
            }

            addItem(name, price);

            // Animação de "sugar" o item para o carrinho
            animateItemToCart(button);
        }

        // Remover do carrinho
        if (event.target.closest('.remove-item')) {
            const index = parseInt(event.target.closest('.remove-item').dataset.index, 10);
            if (!isNaN(index)) {
                removeItem(index);
            }
        }
    });

    /**
     * Animação visual para o item sendo adicionado ao carrinho.
     * Clona a imagem do produto e a move para o ícone do carrinho.
     * @param {HTMLElement} button - O botão "Adicionar ao Carrinho" clicado.
     */
    const animateItemToCart = (button) => {
        // Tenta encontrar o elemento pai do produto para pegar a imagem
        let productCard = button.closest('.product');
        if (!productCard) {
            productCard = button.closest('.salgado-item'); // Para compatibilidade com outras seções
        }

        if (!productCard) {
            console.warn("Could not find product card for animation.");
            return;
        }

        const cartIcon = document.querySelector('.cart-icon'); // Ícone do carrinho na navegação
        const img = productCard.querySelector('img'); // Imagem do produto

        if (!img || !cartIcon) {
            console.warn("Image or cart icon not found for animation.");
            return; // Não continua se não encontrar a imagem ou o ícone do carrinho
        }

        const clone = img.cloneNode(true); // Clona a imagem
        clone.classList.add('product-clone-animation'); // Classe para estilos e animação
        const rect = img.getBoundingClientRect(); // Posições e dimensões da imagem original

        // Configura o estilo inicial do clone para ser fixo na posição da imagem original
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.borderRadius = '50%'; // Torna a imagem redonda durante a animação
        clone.style.objectFit = 'cover'; // Garante que a imagem preencha o espaço
        clone.style.transition = 'all 0.8s cubic-bezier(.4,2,.6,1)'; // Transição suave e com "overshoot"
        clone.style.zIndex = '9999'; // Garante que fique acima de outros elementos
        clone.style.pointerEvents = 'none'; // Não interfere com eventos do mouse/toque
        document.body.appendChild(clone); // Adiciona o clone ao corpo do documento

        // Pega as dimensões e posição do ícone do carrinho
        const cartRect = cartIcon.getBoundingClientRect();
        // Calcula o centro do ícone do carrinho
        const cartCenterX = cartRect.left + cartRect.width / 2;
        const cartCenterY = cartRect.top + cartRect.height / 2;
        // Define o tamanho final do clone (ex: 20% do tamanho original)
        const finalCloneWidth = rect.width * 0.2;
        const finalCloneHeight = rect.height * 0.2;

        // Pequeno delay para garantir que o clone seja renderizado antes da transição
        setTimeout(() => {
            // Move o clone para o centro do ícone do carrinho e redimensiona
            clone.style.top = `${cartCenterY - finalCloneHeight / 2}px`; // Centraliza verticalmente
            clone.style.left = `${cartCenterX - finalCloneWidth / 2}px`; // Centraliza horizontalmente
            clone.style.width = `${finalCloneWidth}px`;
            clone.style.height = `${finalCloneHeight}px`;
            clone.style.opacity = '0.4'; // Reduz a opacidade
        }, 20);

        // Remove o clone do DOM após a animação terminar
        setTimeout(() => {
            if (clone.parentNode) {
                clone.parentNode.removeChild(clone);
            }
        }, 850); // O tempo de remoção deve ser um pouco maior que a duração da transição
    };

    // Retorna as funções públicas do módulo
    return { init, addItem, removeItem, cart, total: () => cart.reduce((sum, item) => sum + item.price, 0) };
})();

/**
 * Módulo de Fidelidade do Cliente.
 * Gerencia cadastro, pontos, histórico de pedidos e exibição da carteira digital.
 */
const loyaltyModule = (() => {
    let clienteCadastrado = null; // Objeto que armazena os dados do cliente logado
    const CLIENT_STORAGE_KEY = "cliente"; // Chave para salvar os dados do cliente no localStorage

    /**
     * Inicializa o módulo de fidelidade.
     * Verifica se há um cliente cadastrado no localStorage e configura os elementos da UI.
     * @returns {boolean} - True se inicializado com sucesso, false caso contrário.
     */
    const init = () => {
        // Tenta carregar dados do cliente do localStorage
        clienteCadastrado = JSON.parse(localStorage.getItem(CLIENT_STORAGE_KEY)) || null;

        // Seleciona os elementos da UI
        const cadastrarButton = document.getElementById("cadastrar-fidelidade");
        const resgatarButton = document.getElementById("resgatar-desconto"); // Botão de resgate (não utilizado na lógica atual)
        const cadastroDiv = document.getElementById("cadastro-fidelidade");
        const carteiraDiv = document.getElementById("carteira-digital");

        // Validação dos elementos
        if (!cadastrarButton || !resgatarButton || !cadastroDiv || !carteiraDiv) {
            console.error("One or more essential loyalty elements not found (cadastrar-fidelidade, resgatar-desconto, cadastro-fidelidade, carteira-digital).");
            return false;
        }

        // Adiciona listener ao botão de cadastro
        cadastrarButton.addEventListener("click", (event) => {
            event.preventDefault(); // Previne o comportamento padrão do formulário
            const nomeInput = document.getElementById("nome-fidelidade");
            const telefoneInput = document.getElementById("telefone-fidelidade");

            const nome = nomeInput.value.trim();
            const telefone = telefoneInput.value.trim();

            if (nome && telefone) {
                // Cria um novo cliente se os campos estiverem preenchidos
                clienteCadastrado = { nome, telefone, pontos: 0, historicoPedidos: [] };
                localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clienteCadastrado));
                exibirCarteiraDigital(); // Atualiza a UI para mostrar a carteira
                console.log(`Cliente "${nome}" cadastrado com sucesso.`);
            } else {
                alert("Por favor, preencha todos os campos para o cadastro.");
            }
        });

        // Se já houver um cliente cadastrado, exibe a carteira digital imediatamente
        if (clienteCadastrado) {
            exibirCarteiraDigital();
        }

        console.log("Loyalty module initialized.");
        return true;
    };

    /**
     * Exibe a seção da carteira digital e oculta o formulário de cadastro.
     * Atualiza os dados do cliente na UI.
     */
    const exibirCarteiraDigital = () => {
        const cadastroDiv = document.getElementById("cadastro-fidelidade");
        const carteiraDiv = document.getElementById("carteira-digital");
        const nomeClienteSpan = document.getElementById("nome-cliente");
        const pontosClienteSpan = document.getElementById("pontos-cliente");

        if (!cadastroDiv || !carteiraDiv || !nomeClienteSpan || !pontosClienteSpan) return; // Validação adicional

        cadastroDiv.style.display = "none";
        carteiraDiv.style.display = "block";

        // Atualiza os dados do cliente na carteira
        nomeClienteSpan.textContent = clienteCadastrado.nome;
        pontosClienteSpan.textContent = clienteCadastrado.pontos;
    };

    /**
     * Adiciona pontos ao saldo do cliente com base no valor da compra.
     * @param {number} valorCompra - O valor total da compra.
     */
    const adicionarPontos = (valorCompra) => {
        if (!clienteCadastrado) return; // Não faz nada se não houver cliente logado

        // Regra de pontuação: 1 ponto a cada R$ 10 de compra
        const pontosGanhos = Math.floor(valorCompra / 10);
        if (pontosGanhos > 0) {
            clienteCadastrado.pontos += pontosGanhos;
            localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clienteCadastrado));
            exibirCarteiraDigital(); // Atualiza a exibição da carteira com os novos pontos
            console.log(`Adicionados ${pontosGanhos} pontos para ${clienteCadastrado.nome}. Total: ${clienteCadastrado.pontos}`);
        }
    };

    /**
     * Retorna o objeto do cliente atualmente logado.
     * @returns {object | null} - O objeto do cliente ou null se nenhum cliente estiver logado.
     */
    const getCliente = () => {
        return clienteCadastrado;
    };

    // Retorna as funções públicas do módulo
    return { init, adicionarPontos, getCliente };
})();

/**
 * Módulo de Sugestões Personalizadas.
 * Exibe sugestões de produtos baseadas no histórico de pedidos do cliente (se disponível).
 */
const suggestionModule = (() => {
    // Dados de exemplo de produtos (deveriam vir de uma API em uma aplicação real)
    const produtos = [
        { id: 1, nome: "Coxinha de Frango", preco: 3.50, tipo: "salgado" },
        { id: 2, nome: "Enroladinho de Salsicha", preco: 4.00, tipo: "salgado" },
        { id: 3, nome: "Combo Coxinha de Frango", preco: 15.00, tipo: "combo" },
        // Adicionar mais produtos conforme necessário para testes
        { id: 4, nome: "Coxinha de Costela", preco: 7.50, tipo: "salgado" },
        { id: 5, nome: "Bolinha de Queijo", preco: 5.00, tipo: "salgado" },
        { id: 6, nome: "Empada de Frango", preco: 6.00, tipo: "salgado" },
    ];

    /**
     * Exibe sugestões de produtos personalizadas para o cliente.
     * Se o cliente tiver histórico, sugere produtos similares aos últimos pedidos.
     * Caso contrário, exibe uma sugestão padrão.
     */
    const exibirSugestoesPersonalizadas = () => {
        const sugestoesContainer = document.getElementById("sugestoes-produtos");
        if (!sugestoesContainer) {
            console.error("Suggestions container 'sugestoes-produtos' not found.");
            return;
        }
        sugestoesContainer.innerHTML = ""; // Limpa sugestões anteriores

        const cliente = loyaltyModule.getCliente(); // Obtém o cliente logado

        // Verifica se há histórico de pedidos
        if (cliente && cliente.historicoPedidos && cliente.historicoPedidos.length > 0) {
            // Lógica de sugestão baseada no histórico (exemplo: último pedido)
            const ultimoPedido = cliente.historicoPedidos[cliente.historicoPedidos.length - 1];
            // Sugere produtos do mesmo tipo, mas que não sejam o último pedido em si
            const produtosSugeridos = produtos.filter(p => p.tipo === ultimoPedido.tipo && p.id !== ultimoPedido.id);

            if (produtosSugeridos.length > 0) {
                // Cria cards para os produtos sugeridos
                produtosSugeridos.forEach(produto => {
                    const card = createSuggestionCard(produto, `Que tal experimentar este?`);
                    sugestoesContainer.appendChild(card);
                });
            } else {
                // Se não houver sugestões similares, exibe uma padrão
                exibirSugestaoPadrao(sugestoesContainer);
            }
        } else {
            // Exibe sugestões padrão se não houver cliente ou histórico
            exibirSugestaoPadrao(sugestoesContainer);
        }
    };

    /**
     * Cria um card de sugestão para um produto.
     * @param {object} produto - O objeto do produto.
     * @param {string} mensagem - A mensagem a ser exibida no card.
     * @returns {HTMLElement} - O elemento article representando o card de sugestão.
     */
    const createSuggestionCard = (produto, mensagem) => {
        const card = document.createElement("article");
        card.className = "promotion-item";
        card.innerHTML = `
            <h3>${produto.nome}</h3>
            <p>${mensagem}</p>
            <button class="add-to-cart button" data-name="${produto.nome}" data-price="${produto.preco.toFixed(2)}">Adicionar ao Carrinho</button>
        `;
        return card;
    };

    /**
     * Exibe uma sugestão padrão quando não há histórico de pedidos.
     * @param {HTMLElement} container - O container onde a sugestão será adicionada.
     */
    const exibirSugestaoPadrao = (container) => {
        // Usa o primeiro produto da lista como sugestão padrão
        const sugestaoPadrao = produtos.find(p => p.id === 1) || produtos[0]; // Garante que haja um produto, mesmo que a lista seja alterada
        if (sugestaoPadrao) {
            const card = createSuggestionCard(sugestaoPadrao, "Experimente o nosso carro-chefe!");
            container.appendChild(card);
        }
    };

    // Retorna a função pública
    return { exibirSugestoesPersonalizadas };
})();

/**
 * Inicializa todos os módulos da aplicação quando o DOM estiver pronto.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa os módulos principais
    themeModule.init();
    cartModule.init(); // Inicializa o carrinho (apenas atualiza a UI, o add/remove é via evento)
    loyaltyModule.init();

    // Inicializa os carrosséis da página
    carouselModule.init('tipos-salgado');
    carouselModule.init('sabores');

    // --- Configuração da Interação entre Carrosséis e Seleção ---
    const tiposCarrossel = document.getElementById('tipos-salgado');
    const saboresCarrossel = document.getElementById('sabores');
    const saboresTrack = document.getElementById('carousel-track-sabores'); // Container onde os slides de sabor são adicionados
    const tipoSelecionadoSpan = document.getElementById('tipo-selecionado'); // Span que mostra o tipo selecionado
    const saborSelecionadoSpan = document.getElementById('sabor-selecionado'); // Span que mostra o sabor selecionado

    let tipoSelecionado = null; // Armazena o tipo de salgado selecionado
    let saborSelecionado = null; // Armazena o sabor do salgado selecionado
    let saboresDisponiveis = []; // Array para armazenar os sabores do tipo selecionado

    // Listener para o carrossel de tipos de salgado
    tiposCarrossel.addEventListener('click', function(event) {
        // Verifica se o elemento clicado é um botão de seleção de tipo
        if (event.target.classList.contains('select-type')) {
            const selectedTypeElement = event.target;
            tipoSelecionado = selectedTypeElement.dataset.tipo; // Obtém o tipo do atributo data-tipo

            // Atualiza a exibição do tipo selecionado
            tipoSelecionadoSpan.textContent = capitalizeFirstLetter(tipoSelecionado);

            // Atualiza o carrossel de sabores com base no tipo selecionado
            atualizarSabores(tipoSelecionado);

            // Reseta a seleção de sabor
            saborSelecionado = null;
            saborSelecionadoSpan.textContent = 'Nenhum';

            // Para o auto-slide do carrossel de tipos ao selecionar um item
            carouselModule.stopAutoSlideExternally('tipos-salgado');
        }
    });

    // Listener para o carrossel de sabores
    saboresCarrossel.addEventListener('click', function(event) {
        // Verifica se o clique foi em um slide de produto (sabor)
        const productSlide = event.target.closest('.carousel-slide.product');
        if (productSlide) {
            // Obtém o sabor selecionado do atributo data-sabor
            saborSelecionado = productSlide.dataset.sabor;
            // Busca o nome completo do sabor a partir do array saboresDisponiveis
            const saborInfo = saboresDisponiveis.find(s => s.sabor === saborSelecionado);
            saborSelecionadoSpan.textContent = saborInfo ? saborInfo.nome : 'Nenhum';

            // Trava o carrossel no produto selecionado para que ele permaneça visível
            const slides = Array.from(saboresCarrossel.querySelectorAll('.carousel-slide.product'));
            const slideIndex = slides.indexOf(productSlide); // Encontra o índice do slide clicado
            if (slideIndex !== -1) {
                carouselModule.lockCarousel('sabores', slideIndex);
            }
        }
    });

    /**
     * Atualiza o carrossel de sabores com base no tipo de salgado selecionado.
     * @param {string} tipo - O tipo de salgado (ex: 'coxinha', 'enroladinho').
     */
    function atualizarSabores(tipo) {
        saboresTrack.innerHTML = ''; // Limpa os slides de sabor anteriores
        saboresDisponiveis = []; // Reseta o array de sabores disponíveis

        // Define os sabores com base no tipo de salgado
        switch (tipo) {
            case 'coxinha':
                saboresDisponiveis = [
                    { nome: 'Frango', preco: 7.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' },
                    { nome: 'Costela', preco: 8.00, imagem: 'https://images.pexels.com/photos/8964567/pexels-photo-8964567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'costela' },
                    { nome: 'Calabresa com Cheddar', preco: 7.50, imagem: 'https://images.pexels.com/photos/17402718/pexels-photo-17402718/free-photo-of-comida-alimento-refeicao-pizza.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'calabresa-com-cheddar' },
                    { nome: 'Chocolate com Café', preco: 7.00, imagem: '/site-salgados/imagens/chocolate-com-cafe.png', sabor: 'chocolate-com-cafe'},
                    { nome: 'Sorvete', preco: 7.50, imagem: '/site-salgados/imagens/coxinha-sorvete.png', sabor: 'sorvete'},
                    { nome: 'Doce de Leite', preco: 7.50, imagem: '/site-salgados/imagens/Doce-de-leite.png', sabor: 'doce-de-leite'}
                ];
                break;
            case 'enroladinho':
                saboresDisponiveis = [
                    { nome: 'Salsicha', preco: 6.00, imagem: 'https://images.pexels.com/photos/357576/pexels-photo-357576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'salsicha' },
                    { nome: 'Presunto e Queijo', preco: 6.50, imagem: 'https://images.pexels.com/photos/9615585/pexels-photo-9615585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'presunto-e-queijo' }
                ];
                break;
            case 'bolinha':
                saboresDisponiveis = [
                    { nome: 'Carne com Queijo', preco: 6.00, imagem: 'https://cdn.pixabay.com/photo/2019/10/13/02/18/tomato-meat-sauce-4545230_1280.jpg', sabor: 'carne-com-queijo' },
                    { nome: 'Calabresa', preco: 6.00, imagem: 'https://images.pexels.com/photos/6004718/pexels-photo-6004718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'calabresa' }
                ];
                break;
            case 'empada':
                saboresDisponiveis = [
                    { nome: 'Frango', preco: 6.00, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' },
                    { nome: 'Palmito', preco: 6.50, imagem: 'https://images.pexels.com/photos/8679380/pexels-photo-8679380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'palmito' },
                    { nome: 'Queijo', preco: 6.50, imagem: 'https://cdn.pixabay.com/photo/2017/01/11/19/56/cheese-1972744_1280.jpg', sabor: 'queijo' }
                ];
                break;
            case 'tortinha':
                saboresDisponiveis = [
                    { nome: 'Legumes', preco: 4.50, imagem: 'https://images.pexels.com/photos/4577379/pexels-photo-4577379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'legumes' },
                    { nome: 'Frango', preco: 4.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', sabor: 'frango' }
                ];
                break;
            case 'torta':
                saboresDisponiveis = [
                    { nome: 'Frango com Catupiry', preco: 5.00, imagem: 'https://receitasdepesos.com.br/wp-content/uploads/2024/09/file-de-frango-com-catupiry.jpeg.webp', sabor: 'frango-com-catupiry' },
                    { nome: 'Calabresa com Queijo', preco: 5.00, imagem: 'https://cdn.pixabay.com/photo/2021/10/16/12/50/fire-chicken-6714952_1280.jpg', sabor: 'calabresa-com-queijo' }
                ];
                break;
            default:
                // Caso nenhum tipo seja reconhecido, exibe uma mensagem
                saboresTrack.innerHTML = '<p>Nenhum sabor disponível para este tipo de salgado.</p>';
                return;
        }

        // Cria os slides para cada sabor disponível
        saboresDisponiveis.forEach(function(sabor) {
            const slide = document.createElement('article');
            slide.classList.add('carousel-slide', 'product'); // Adiciona classes para estilo e identificação
            slide.dataset.sabor = sabor.sabor; // Armazena o identificador do sabor
            slide.dataset.preco = sabor.preco.toFixed(2); // Armazena o preço
            slide.innerHTML = `
                <img src="${sabor.imagem}" alt="Sabor ${sabor.nome}" loading="lazy" width="300" height="200">
                <h3>${sabor.nome}</h3>
                <button class="add-to-cart cta" data-name="${capitalizeFirstLetter(tipo)} de ${sabor.nome}" data-price="${sabor.preco.toFixed(2)}">Adicionar</button>
            `;
            saboresTrack.appendChild(slide);
        });

        // Re-inicializa o carrossel de sabores para que ele possa reconhecer os novos slides
        carouselModule.init('sabores');
    }

    // --- Configuração de Endereço e Checkout ---
    const retiradaRadioPrincipal = document.getElementById('retirar-principal');
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

    const retiradaRadio = document.getElementById('retirar');
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

    /**
     * Busca informações de endereço usando o CEP via API do ViaCEP.
     * @param {string} cep - O CEP a ser buscado.
     * @param {HTMLElement} ruaInputRef - Referência ao input de rua.
     * @param {HTMLElement} bairroInputRef - Referência ao input de bairro.
     * @param {HTMLElement} cidadeInputRef - Referência ao input de cidade.
     * @param {HTMLElement} estadoInputRef - Referência ao input de estado.
     * @param {string} enderecoCompletoId - O ID do container que contém os inputs de endereço.
     */
    const buscarEndereco = (cep, ruaInputRef, bairroInputRef, cidadeInputRef, estadoInputRef, enderecoCompletoId) => {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) { // Verifica se o CEP é inválido ou não encontrado
                    alert('CEP não encontrado.');
                    return;
                }
                // Preenche os campos de endereço
                ruaInputRef.value = data.logradouro || '';
                bairroInputRef.value = data.bairro || '';
                cidadeInputRef.value = data.localidade || '';
                estadoInputRef.value = data.uf || '';
                // Exibe o container do endereço completo
                document.getElementById(enderecoCompletoId).style.display = 'block';
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o CEP. Tente novamente.');
            });
    };

    /**
     * Controla a visibilidade do container de endereço com base na seleção de rádio.
     * @param {HTMLInputElement} radio - O input radio de entrega.
     * @param {HTMLElement} container - O container do endereço.
     */
    const updateEnderecoContainerVisibility = (radio, container) => {
        container.style.display = radio.checked ? 'block' : 'none';
    };

    // Define o estado inicial da visibilidade dos containers de endereço
    updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);

    // Listeners para a visibilidade dos containers de endereço (checkout principal)
    entregaRadioPrincipal.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal));
    retiradaRadioPrincipal.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal));

    // Listener para o botão de buscar endereço (checkout principal)
    buscarEnderecoButtonPrincipal.addEventListener('click', () => {
        const cep = cepInputPrincipal.value.replace(/\D/g, ''); // Limpa o CEP
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInputPrincipal, bairroInputPrincipal, cidadeInputPrincipal, estadoInputPrincipal, 'endereco-completo-principal');
    });

    // Listeners para a visibilidade dos containers de endereço (checkout secundário/carrinho)
    entregaRadio.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadio, enderecoContainer));
    retiradaRadio.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadio, enderecoContainer));

    // Listener para o botão de buscar endereço (checkout secundário/carrinho)
    buscarEnderecoButton.addEventListener('click', () => {
        const cep = cepInput.value.replace(/\D/g, ''); // Limpa o CEP
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInput, bairroInput, cidadeInput, estadoInput, 'endereco-completo');
    });

    /**
     * Finaliza o pedido: adiciona pontos, atualiza histórico, limpa carrinho e reseta campos.
     */
    const finalizarPedido = () => {
        const opcaoEntregaSelecionada = document.querySelector('input[name="opcao-entrega"]:checked');
        // Determina se é o checkout principal com base na presença do elemento #carrinho
        const isPrincipalCheckout = opcaoEntregaSelecionada && opcaoEntregaSelecionada.closest('#carrinho');

        // Validação do endereço para entrega
        if (opcaoEntregaSelecionada && opcaoEntregaSelecionada.value === 'entrega') {
            const cepInputRef = isPrincipalCheckout ? cepInputPrincipal : cepInput;
            const ruaInputRef = isPrincipalCheckout ? ruaInputPrincipal : ruaInput;
            const numeroInputRef = isPrincipalCheckout ? numeroInputPrincipal : numeroInput;

            if (!cepInputRef.value.trim() || !ruaInputRef.value.trim() || !numeroInputRef.value.trim()) {
                alert('Por favor, preencha o endereço completo para entrega.');
                return; // Impede a finalização do pedido
            }
        }

        // Adiciona pontos ao cliente ANTES de limpar o carrinho
        const totalCompra = cartModule.total(); // Obtém o total do carrinho
        loyaltyModule.adicionarPontos(totalCompra);

        // Atualiza histórico de pedidos (simulação)
        const cliente = loyaltyModule.getCliente();
        if (cliente) {
            // Tenta determinar o tipo do primeiro item para o histórico
            const primeiroItemNome = cartModule.cart.length > 0 ? cartModule.cart[0].name : '';
            const tipoPedido = primeiroItemNome.split(' ')[0].toLowerCase(); // Ex: "Coxinha", "Enroladinho"

            cliente.historicoPedidos.push({
                id: Date.now(), // Usar timestamp como ID único simulado
                tipo: tipoPedido,
                valor: totalCompra,
                data: new Date().toLocaleDateString('pt-BR') // Formata a data para pt-BR
            });
            localStorage.setItem("cliente", JSON.stringify(cliente)); // Salva o cliente atualizado
            suggestionModule.exibirSugestoesPersonalizadas(); // Exibe sugestões com base no novo histórico
        }

        // Mensagem de sucesso
        alert(`Pedido finalizado com sucesso! Valor total: R$ ${totalCompra.toFixed(2)}`);

        // Limpa o carrinho
        cartModule.cart.length = 0; // Esvazia o array do carrinho
        cartModule.updateCartDisplay(); // Atualiza a UI do carrinho

        // Reseta campos de endereço e seleção (opcional: volta para o estado inicial)
        const resetAddressFields = (cepInputRef, ruaInputRef, numeroInputRef, complementoInputRef, bairroInputRef, cidadeInputRef, estadoInputRef, enderecoContainerRef) => {
            cepInputRef.value = '';
            ruaInputRef.value = '';
            numeroInputRef.value = '';
            complementoInputRef.value = '';
            bairroInputRef.value = '';
            cidadeInputRef.value = '';
            estadoInputRef.value = '';
            enderecoContainerRef.style.display = 'none';
        };

        if (isPrincipalCheckout) {
            resetAddressFields(cepInputPrincipal, ruaInputPrincipal, numeroInputPrincipal, complementoInputPrincipal, bairroInputPrincipal, cidadeInputPrincipal, estadoInputPrincipal, enderecoContainerPrincipal);
            retiradaRadioPrincipal.checked = true; // Volta para retirada como padrão
        } else {
            resetAddressFields(cepInput, ruaInput, numeroInput, complementoInput, bairroInput, cidadeInput, estadoInput, enderecoContainer);
            retiradaRadio.checked = true; // Volta para retirada como padrão
        }

        // Reseta a seleção de tipo e sabor
        tipoSelecionado = null;
        saborSelecionado = null;
        tipoSelecionadoSpan.textContent = 'Nenhum';
        saborSelecionadoSpan.textContent = 'Nenhum';

        // Reinicia os carrosséis para o estado inicial, se necessário
        carouselModule.init('tipos-salgado');
        carouselModule.init('sabores');
    };

    // Adiciona o listener ao botão de finalizar pedido
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', finalizarPedido);
    }

    // Exibe as sugestões personalizadas ao carregar a página
    suggestionModule.exibirSugestoesPersonalizadas();

    // Função auxiliar para capitalizar a primeira letra de uma string
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});

/**
 * Configuração de animações e interações visuais com scroll.
 */
document.addEventListener("DOMContentLoaded", function () {
    const containerCoxinhas = document.querySelector('.container-coxinhas');
    const coxinhas = [
        document.getElementById('coxinha1'),
        document.getElementById('coxinha2'),
        document.getElementById('coxinha3'),
        document.getElementById('coxinha4')
    ];
    const comentariosDiv = document.querySelector('.comentarios-container');
    const comentarios = document.querySelectorAll('.comentario');
    let comentarioAtual = 0;

    // Verifica se todos os elementos necessários existem
    if (!containerCoxinhas || comentarios.length === 0 || coxinhas.some(c => !c)) {
        console.warn("Alguns elementos para animação de scroll não foram encontrados. Animações de scroll desativadas.");
        return; // Sai se os elementos essenciais não existirem
    }

    /**
     * Renderiza as estrelas de avaliação em um container específico.
     * @param {HTMLElement} ratingContainer - O elemento que contém a nota e onde as estrelas serão renderizadas.
     */
    function renderizarEstrelas(ratingContainer) {
        const rating = parseFloat(ratingContainer.dataset.rating);
        if (isNaN(rating)) return; // Sai se a nota for inválida

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        // Adiciona estrelas cheias
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        // Adiciona meia estrela, se aplicável
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        // Adiciona estrelas vazias para completar as 5
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        // Atualiza o conteúdo do container com as estrelas e a nota numérica
        ratingContainer.innerHTML = starsHTML + ` ${rating.toFixed(1)}`; // Exibe a nota com uma casa decimal
    }

    // Inicializa a renderização dos comentários e suas estrelas
    comentarios.forEach((comentario, index) => {
        comentario.style.display = index === 0 ? 'block' : 'none'; // Mostra apenas o primeiro comentário
        const ratingContainer = comentario.querySelector('[data-rating]');
        if (ratingContainer) {
            renderizarEstrelas(ratingContainer);
        }
    });

    /**
     * Exibe o próximo comentário em um ciclo.
     */
    function mostrarProximoComentario() {
        if (comentarios.length === 0) return; // Não faz nada se não houver comentários

        comentarios[comentarioAtual].style.display = 'none'; // Esconde o comentário atual
        comentarioAtual = (comentarioAtual + 1) % comentarios.length; // Calcula o índice do próximo comentário
        comentarios[comentarioAtual].style.display = 'block'; // Mostra o próximo comentário
    }

    // Configura o intervalo para trocar os comentários (a cada 5 segundos)
    const commentInterval = setInterval(mostrarProximoComentario, 5000);

    // Listener de scroll para controlar as animações
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const containerTop = containerCoxinhas.offsetTop;
        const windowHeight = window.innerHeight;

        // Verifica se o container das coxinhas está visível na viewport
        if (scrollY > containerTop - windowHeight && scrollY < containerTop + containerCoxinhas.offsetHeight) {
            // Calcula a posição relativa do scroll dentro da área visível do container
            let relativeScroll = scrollY - (containerTop - windowHeight);

            // Aplica transformações às coxinhas para um efeito parallax suave e sincronizado
            // Usa funções seno e cosseno para criar um movimento mais orgânico
            coxinhas[0].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * 0.01 - 5}deg)`;
            coxinhas[1].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * -0.01 + 175}deg)`;
            coxinhas[2].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * 0.01 + 5}deg)`;
            coxinhas[3].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * -0.01 - 3}deg)`;

            // Lógica para aplicar blur nas coxinhas quando elas estão sobre a seção de comentários/avaliações
            const blurValues = [0, 1, 3, 5]; // Intensidades de blur para cada coxinha

            coxinhas.forEach((coxinha, index) => {
                const coxinhaRect = coxinha.getBoundingClientRect();
                const comentariosRect = comentariosDiv.getBoundingClientRect();

                // Calcula a área de intersecção entre a bounding box da coxinha e a da div de comentários
                const intersectionTop = Math.max(coxinhaRect.top, comentariosRect.top);
                const intersectionBottom = Math.min(coxinhaRect.bottom, comentariosRect.bottom);
                const intersectionLeft = Math.max(coxinhaRect.left, comentariosRect.left);
                const intersectionRight = Math.min(coxinhaRect.right, comentariosRect.right);

                const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
                const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

                const coxinhaArea = coxinhaRect.width * coxinhaRect.height;
                const intersectionArea = intersectionWidth * intersectionHeight;

                // Calcula a porcentagem da coxinha que está dentro da área de comentários
                const percentageInside = coxinhaArea > 0 ? (intersectionArea / coxinhaArea) * 100 : 0;

                // Aplica o blur proporcionalmente à sobreposição
                if (percentageInside > 0) {
                    coxinha.style.filter = `blur(${blurValues[index] * (percentageInside / 100)}px)`;
                } else {
                    coxinha.style.filter = 'none'; // Remove o blur se não houver sobreposição
                }
            });
        } else {
            // Resetar transformações e blur se o container não estiver visível
            coxinhas.forEach((coxinha, index) => {
                coxinha.style.transform = 'none'; // Reseta a transformação
                coxinha.style.filter = 'none'; // Remove qualquer blur aplicado
            });
        }
    });
});

// --- Configuração de Navegação Mobile e Tema ---
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav'); // Ou o seletor correto para o menu principal
const toggleThemeButton = document.getElementById('toggleTheme');
const body = document.body;

// Lógica para abrir/fechar o menu mobile
if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active'); // Toggles a classe 'active' para mostrar/esconder o menu

        // Atualiza os ícones do botão de toggle (ex: hambúrguer para X)
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
}

// Lógica para o botão de tema (Melhorias na inicialização e funcionalidade)
if (toggleThemeButton) {
    const THEME_STORAGE_KEY = "theme"; // Reutiliza a chave definida em themeModule

    // Função para atualizar os ícones do botão de tema
    const updateThemeIcons = () => {
        const isDark = body.classList.contains('dark-mode');
        const moonIcon = toggleThemeButton.querySelector('.fa-moon');
        const sunIcon = toggleThemeButton.querySelector('.fa-sun');

        if (moonIcon && sunIcon) {
            moonIcon.style.display = isDark ? 'none' : 'inline-block';
            sunIcon.style.display = isDark ? 'inline-block' : 'none';
        }
    };

    // Verifica a preferência de tema ao carregar a página
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode'); // Garante que o tema claro seja aplicado se não for dark
    }
    updateThemeIcons(); // Atualiza os ícones no carregamento

    // Adiciona o listener para alternar tema e ícones
    toggleThemeButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        updateThemeIcons();
    });
}

/**
 * Abre/fecha o menu do carrinho de compras.
 */
function toggleCart() {
    const cartMenu = document.getElementById('cart-menu');
    if (cartMenu) {
        cartMenu.classList.toggle('open');
    }
}

// --- Correções e Melhorias para Módulos de Fidelidade e API ---
// Nota: A parte de API (fetch('/api/...')) não pôde ser testada, mas a estrutura e chamadas foram mantidas.

// Event listener para o formulário de fidelidade (se ele existir)
const fidelidadeForm = document.getElementById('form-fidelidade');
if (fidelidadeForm) {
    fidelidadeForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previne o submit padrão
        const nome = document.getElementById('nome-fidelidade').value.trim();
        const telefone = document.getElementById('telefone-fidelidade').value.trim();

        // Valida os campos antes de enviar
        if (!nome || !telefone) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('/api/fidelidade/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, telefone }),
            });

            if (response.ok) {
                const data = await response.json();
                // Atualiza a UI com os dados do cliente cadastrado
                const nomeClienteSpan = document.getElementById('nome-cliente');
                const pontosClienteSpan = document.getElementById('pontos-cliente');
                const cadastroDiv = document.getElementById('cadastro-fidelidade');
                const carteiraDiv = document.getElementById('carteira-digital');

                if (nomeClienteSpan && pontosClienteSpan) {
                    nomeClienteSpan.textContent = data.nome;
                    pontosClienteSpan.textContent = data.pontos;
                }
                if (cadastroDiv && carteiraDiv) {
                    cadastroDiv.style.display = 'none';
                    carteiraDiv.style.display = 'block';
                }
                // O módulo de fidelidade já deve gerenciar o clienteCadastrado internamente,
                // mas a UI precisa ser atualizada explicitamente aqui.
            } else {
                const errorText = await response.text();
                alert(`Erro ao cadastrar: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro de fidelidade:', error);
            alert('Ocorreu um erro de rede. Tente novamente mais tarde.');
        }
    });
}

/**
 * Função para atualizar a carteira digital (saldo e histórico).
 * Necessita que os elementos correspondentes estejam presentes no DOM.
 */
async function atualizarCarteira() {
    const pontosClienteSpan = document.getElementById('pontos-cliente');
    const historicoTransacoesList = document.getElementById('historico-transacoes'); // Assumindo que esta é a lista do histórico

    if (!pontosClienteSpan || !historicoTransacoesList) {
        // console.warn("Elementos da carteira digital para atualização não encontrados.");
        return; // Não faz nada se os elementos não existirem
    }

    try {
        const response = await fetch('/api/fidelidade/saldo'); // Endpoint para buscar saldo e histórico
        if (response.ok) {
            const data = await response.json();
            pontosClienteSpan.textContent = data.pontos; // Atualiza o saldo de pontos
            historicoTransacoesList.innerHTML = ''; // Limpa o histórico atual

            // Renderiza o histórico de transações
            data.historico.forEach((transacao) => {
                const li = document.createElement('li');
                // Formata a descrição e os pontos para exibição
                li.textContent = `${transacao.descricao} - ${transacao.pontos} pontos`;
                historicoTransacoesList.appendChild(li);
            });
        } else {
            console.error(`Erro ao buscar saldo da carteira: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Erro na requisição de atualização da carteira:', error);
    }
}

// Event listeners para botões de resgate na carteira digital (se existirem)
const carteiraDigitalSection = document.getElementById('carteira-digital');
if (carteiraDigitalSection) {
    carteiraDigitalSection.querySelectorAll('button[data-pontos]').forEach((button) => {
        button.addEventListener('click', async () => {
            const pontosNecessarios = parseInt(button.dataset.pontos, 10); // Pontos necessários para o resgate

            if (isNaN(pontosNecessarios) || pontosNecessarios <= 0) {
                alert('Esta recompensa é inválida ou não tem pontos associados.');
                return;
            }

            // Validação adicional: verificar se o cliente tem pontos suficientes (se a lógica estiver disponível)
            const cliente = loyaltyModule.getCliente();
            if (!cliente || cliente.pontos < pontosNecessarios) {
                alert(`Você precisa de ${pontosNecessarios} pontos para resgatar esta recompensa.`);
                return;
            }

            try {
                const response = await fetch('/api/fidelidade/resgatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Envia os pontos a serem resgatados (ou o ID da recompensa)
                    body: JSON.stringify({ pontos: pontosNecessarios }), // Ou { recompensaId: button.dataset.rewardId }
                });

                if (response.ok) {
                    alert('Recompensa resgatada com sucesso!');
                    // Atualiza a carteira após o resgate bem-sucedido
                    atualizarCarteira(); // Chama a função de atualização
                } else {
                    const errorText = await response.text();
                    alert(`Erro ao resgatar recompensa: ${errorText || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro na requisição de resgate:', error);
                alert('Ocorreu um erro de rede. Tente novamente mais tarde.');
            }
        });
    });
}
