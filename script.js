const carouselModule = (() => {
    const carousels = {};
    const AUTO_SLIDE_INTERVAL = 8000; // 8 segundos
    const AUTO_SLIDE_RESUME_DELAY = 15000; // 15 segundos

    const init = (carouselId) => {
        const carouselContainer = document.getElementById(carouselId);
        if (!carouselContainer) {
            console.error(`Carousel with ID "${carouselId}" not found.`);
            return false;
        }

        const slides = carouselContainer.querySelectorAll(".carousel-slide");
        const nextButton = carouselContainer.querySelector(".carousel-button.next");
        const prevButton = carouselContainer.querySelector(".carousel-button.prev");
        const track = carouselContainer.querySelector(".carousel-track");

        if (!slides.length || !nextButton || !prevButton || !track) {
            console.error(`Carousel elements "${carouselId}" not found.`);
            return false;
        }

        carousels[carouselId] = {
            currentSlide: 0,
            slides: slides,
            nextButton: nextButton,
            prevButton: prevButton,
            track: track,
            intervalId: null,
            autoSlideActive: true,
            startX: 0,
            endX: 0,
            resumeTimeout: null,
            locked: false // trava para impedir navegação após seleção
        };

        function pauseAndResumeAutoSlide() {
            stopAutoSlide(carouselId);
            clearTimeout(carousels[carouselId].resumeTimeout);
            carousels[carouselId].resumeTimeout = setTimeout(() => {
                if (carousels[carouselId].autoSlideActive && !carousels[carouselId].locked) {
                    startAutoSlide(carouselId);
                }
            }, AUTO_SLIDE_RESUME_DELAY);
        }

        nextButton.addEventListener("click", () => {
            if (carousels[carouselId].locked) return;
            pauseAndResumeAutoSlide();
            showNextSlide(carouselId);
        });
        prevButton.addEventListener("click", () => {
            if (carousels[carouselId].locked) return;
            pauseAndResumeAutoSlide();
            showPrevSlide(carouselId);
        });

        carouselContainer.addEventListener("mouseenter", () => stopAutoSlide(carouselId));
        carouselContainer.addEventListener("mouseleave", () => {
            if (carousels[carouselId].autoSlideActive && !carousels[carouselId].locked) {
                startAutoSlide(carouselId);
            }
        });

        // Adiciona suporte a gestos de deslizar (swipe)
        carouselContainer.addEventListener("touchstart", (e) => {
            if (carousels[carouselId].locked) return;
            handleTouchStart(e, carouselId);
        });
        carouselContainer.addEventListener("touchmove", (e) => {
            if (carousels[carouselId].locked) return;
            handleTouchMove(e, carouselId);
        });
        carouselContainer.addEventListener("touchend", () => {
            if (carousels[carouselId].locked) return;
            handleTouchEnd(carouselId);
        });

        showSlide(carouselId, 0);
        startAutoSlide(carouselId);

        return true;
    };

    const showSlide = (carouselId, index) => {
        const carousel = carousels[carouselId];
        carousel.track.style.transform = `translateX(-${index * 100}%)`;
    };

    const showNextSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel.locked) return;
        carousel.currentSlide = (carousel.currentSlide + 1) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    const showPrevSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel.locked) return;
        carousel.currentSlide = (carousel.currentSlide - 1 + carousel.slides.length) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    const startAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        stopAutoSlide(carouselId); // Garante que não há múltiplos intervalos
        if (carousel.autoSlideActive && !carousel.locked) {
            carousel.intervalId = setInterval(() => showNextSlide(carouselId), AUTO_SLIDE_INTERVAL);
        }
    };

    const stopAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        clearInterval(carousel.intervalId);
    };

    // Permite parar o auto-slide externamente (ex: ao selecionar tipo de salgado)
    const stopAutoSlideExternally = (carouselId) => {
        if (carousels[carouselId]) {
            carousels[carouselId].autoSlideActive = false;
            stopAutoSlide(carouselId);
            clearTimeout(carousels[carouselId].resumeTimeout);
        }
    };

    // Trava o carrossel no slide atual (impede navegação e auto-slide)
    const lockCarousel = (carouselId, slideIndex) => {
        if (carousels[carouselId]) {
            carousels[carouselId].locked = true;
            carousels[carouselId].autoSlideActive = false;
            stopAutoSlide(carouselId);
            clearTimeout(carousels[carouselId].resumeTimeout);
            if (typeof slideIndex === "number") {
                carousels[carouselId].currentSlide = slideIndex;
                showSlide(carouselId, slideIndex);
            }
        }
    };

    // Funções para suporte a gestos de deslizar (swipe)
    const handleTouchStart = (e, carouselId) => {
        const carousel = carousels[carouselId];
        carousel.startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e, carouselId) => {
        const carousel = carousels[carouselId];
        carousel.endX = e.touches[0].clientX;
    };

    const handleTouchEnd = (carouselId) => {
        const carousel = carousels[carouselId];
        const deltaX = carousel.startX - carousel.endX;

        if (Math.abs(deltaX) > 50) { // Define um limite para considerar como swipe
            stopAutoSlide(carouselId);
            if (deltaX > 0) {
                showNextSlide(carouselId); // Swipe para a esquerda
            } else {
                showPrevSlide(carouselId); // Swipe para a direita
            }
            clearTimeout(carousel.resumeTimeout);
            carousel.resumeTimeout = setTimeout(() => {
                if (carousel.autoSlideActive && !carousel.locked) {
                    startAutoSlide(carouselId);
                }
            }, AUTO_SLIDE_RESUME_DELAY);
        }
    };

    return { init, stopAutoSlideExternally, lockCarousel };
})();

const themeModule = (() => {
    let toggleButton;

    const init = () => {
        toggleButton = document.getElementById("toggleTheme");
        if (!toggleButton) {
            console.error("Theme button not found");
            return false;
        }
        toggleButton.addEventListener("click", toggleTheme);
        initializeTheme();
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
                ? '<i class="fas fa-sun"></i> Light Mode'
                : '<i class="fas fa-moon"></i> Dark Mode';
        }
    };

    return { init, initializeTheme, toggleTheme, updateThemeButton };
})();

const cartModule = (() => {
    const cart = [];
    const cartMenu = document.getElementById('cart-menu');
    const cartItemsList = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalDisplay = document.getElementById('cart-total');

    if (!cartMenu || !cartItemsList || !cartCount || !cartTotalDisplay) {
        console.error("Cart elements not found.");
        return { init: () => false };
    }

    const updateCartDisplay = () => {
        cartItemsList.innerHTML = '';
        let totalValue = 0;

        cart.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            cartItemsList.appendChild(listItem);
            totalValue += item.price;
        });

        cartCount.textContent = cart.length;
        cartTotalDisplay.textContent = `R$ ${totalValue.toFixed(2)}`;
    };

    const addItem = (name, price) => {
        cart.push({ name, price });
        updateCartDisplay();
        // alert(`${name} foi adicionado ao carrinho!`); // Removido o aviso
    };

    const removeItem = (index) => {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            updateCartDisplay();
        }
    };

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);

            // Adiciona o item ao carrinho
            addItem(name, price);

            // Animação de "sugar" o item para o carrinho
            // Suporte para .product OU .salgado-item (para seção especiais)
            let productCard = button.closest('.product');
            if (!productCard) {
                productCard = button.closest('.salgado-item');
            }
            if (productCard) {
                const cartIcon = document.querySelector('.cart-icon');
                const img = productCard.querySelector('img'); // Sempre seleciona a imagem

                if (img && cartIcon) { // Verifica se a imagem e o ícone do carrinho existem
                    const clone = img.cloneNode(true);
                    clone.classList.add('product-clone'); // Adiciona a classe para animação e estilo
                    const rect = img.getBoundingClientRect(); // Pega as dimensões da imagem original

                    // Estilos iniciais do clone
                    clone.style.position = 'fixed';
                    clone.style.top = `${rect.top}px`;
                    clone.style.left = `${rect.left}px`;
                    clone.style.width = `${rect.width}px`; // Usa a largura da imagem original
                    clone.style.height = `${rect.height}px`; // Usa a altura da imagem original
                    clone.style.borderRadius = '50%'; // Deixa a imagem redonda durante a animação
                    clone.style.objectFit = 'cover'; // Garante que a imagem cubra o espaço
                    clone.style.transition = 'all 0.8s cubic-bezier(.4,2,.6,1)';
                    clone.style.zIndex = '9999';
                    clone.style.pointerEvents = 'none';
                    document.body.appendChild(clone);

                    const cartRect = cartIcon.getBoundingClientRect();
                    // Calcula o centro do ícone do carrinho
                    const cartCenterX = cartRect.left + cartRect.width / 2;
                    const cartCenterY = cartRect.top + cartRect.height / 2;
                    // Calcula o centro do clone (imagem)
                    const cloneWidth = rect.width * 0.2;
                    const cloneHeight = rect.height * 0.2;

                    setTimeout(() => {
                        clone.style.top = `${cartCenterY - cloneHeight / 2}px`; // Centraliza verticalmente
                        clone.style.left = `${cartCenterX - cloneWidth / 2}px`; // Centraliza horizontalmente
                        clone.style.width = `${cloneWidth}px`; // Reduz o tamanho da imagem no final
                        clone.style.height = `${cloneHeight}px`; // Reduz o tamanho da imagem no final
                        clone.style.opacity = '0.4';
                    }, 20);

                    setTimeout(() => {
                        if (clone.parentNode) clone.parentNode.removeChild(clone);
                    }, 850);
                }
            }
        }

        if (event.target.closest('.remove-item')) {
            const index = parseInt(event.target.closest('.remove-item').dataset.index, 10);
            removeItem(index);
        }
    });

    return { init: () => updateCartDisplay(), addItem, removeItem, cart, total: () => cart.reduce((sum, item) => sum + item.price, 0) }; // Expondo addItem, removeItem, cart e total
})();

const loyaltyModule = (() => {
    let clienteCadastrado = null;

    const init = () => {
        clienteCadastrado = JSON.parse(localStorage.getItem("cliente")) || null;

        const cadastrarButton = document.getElementById("cadastrar-fidelidade");
        const resgatarButton = document.getElementById("resgatar-desconto");
        const cadastroDiv = document.getElementById("cadastro-fidelidade");
        const carteiraDiv = document.getElementById("carteira-digital");

        if (!cadastrarButton || !resgatarButton || !cadastroDiv || !carteiraDiv) {
            console.error("Elementos de fidelidade não encontrados.");
            return false;
        }

        cadastrarButton.addEventListener("click", (event) => {
            event.preventDefault();
            const nome = document.getElementById("nome-fidelidade").value;
            const telefone = document.getElementById("telefone-fidelidade").value;

            if (nome && telefone) {
                clienteCadastrado = { nome, telefone, pontos: 0, historicoPedidos: [] };
                localStorage.setItem("cliente", JSON.stringify(clienteCadastrado));
                exibirCarteiraDigital();
            } else {
                alert("Por favor, preencha todos os campos.");
            }
        });

        return true;
    };

    const exibirCarteiraDigital = () => {
        const cadastroDiv = document.getElementById("cadastro-fidelidade");
        const carteiraDiv = document.getElementById("carteira-digital");
        const nomeClienteSpan = document.getElementById("nome-cliente");
        const pontosClienteSpan = document.getElementById("pontos-cliente");

        cadastroDiv.style.display = "none";
        carteiraDiv.style.display = "block";
        nomeClienteSpan.textContent = clienteCadastrado.nome;
        pontosClienteSpan.textContent = clienteCadastrado.pontos;
    };

    const adicionarPontos = (valorCompra) => {
        if (clienteCadastrado) {
            const pontosGanhos = Math.floor(valorCompra / 10); // Ex: 1 ponto a cada R$ 10
            clienteCadastrado.pontos += pontosGanhos;
            localStorage.setItem("cliente", JSON.stringify(clienteCadastrado));
            exibirCarteiraDigital(); // Atualiza a exibição
            console.log(`Adicionados ${pontosGanhos} pontos. Total: ${clienteCadastrado.pontos}`);
        }
    };

    const getCliente = () => {
        return clienteCadastrado;
    };

    return { init, adicionarPontos, getCliente }; // Expondo adicionarPontos e getCliente
})();

const suggestionModule = (() => {
    let produtos = [
        { id: 1, nome: "Coxinha de Frango", preco: 3.50, tipo: "salgado" },
        { id: 2, nome: "Enroladinho de Salsicha", preco: 4.00, tipo: "salgado" },
        { id: 3, nome: "Coca-Cola Lata", preco: 5.00, tipo: "bebida" },
        { id: 4, nome: "Combo Coxinha de Frango", preco: 15.00, tipo: "combo" },
    ];

    const exibirSugestoesPersonalizadas = () => {
        const sugestoesContainer = document.getElementById("sugestoes-produtos");
        sugestoesContainer.innerHTML = ""; // Limpar sugestões anteriores
        const cliente = loyaltyModule.getCliente(); // Use loyaltyModule.getCliente()

        if (cliente && cliente.historicoPedidos.length > 0) {
            // Lógica de sugestão baseada no histórico
            const ultimoPedido = cliente.historicoPedidos[cliente.historicoPedidos.length - 1];
            const produtosSugeridos = produtos.filter(p => p.tipo === ultimoPedido.tipo && p.id !== ultimoPedido.id);

            produtosSugeridos.forEach(produto => {
                const card = document.createElement("article");
                card.className = "promotion-item";
                card.innerHTML = `
                    <h3>${produto.nome}</h3>
                    <p>Que tal experimentar este?</p>
                    <button class="add-to-cart button" data-name="${produto.nome}" data-price="${produto.preco}">Adicionar ao Carrinho</button>
                `;
                sugestoesContainer.appendChild(card);
            });
        } else {
            // Sugestões padrão (se não houver histórico)
            const sugestaoPadrao = produtos[0]; // Primeiro produto como sugestão
            const card = document.createElement("article");
            card.className = "promotion-item";
            card.innerHTML = `
                <h3>${sugestaoPadrao.nome}</h3>
                <p>Experimente o nosso carro-chefe!</p>
                <button class="add-to-cart button" data-name="${sugestaoPadrao.nome}" data-price="${sugestaoPadrao.preco}">Adicionar ao Carrinho</button>
            `;
            sugestoesContainer.appendChild(card);
        }
    };

    return { exibirSugestoesPersonalizadas };
})();

document.addEventListener("DOMContentLoaded", () => {
    themeModule.init();
    cartModule.init();
    loyaltyModule.init();

    // Inicializa os carrosséis
    carouselModule.init('tipos-salgado');
    carouselModule.init('sabores');

    const tiposCarrossel = document.getElementById('tipos-salgado');
    const saboresCarrossel = document.getElementById('sabores');
    const saboresTrack = document.getElementById('carousel-track-sabores');
    const tipoSelecionadoSpan = document.getElementById('tipo-selecionado');
    const saborSelecionadoSpan = document.getElementById('sabor-selecionado');
    // const adicionarAoCarrinhoButton = document.getElementById('adicionar-ao-carrinho'); // Reavaliar necessidade
    const selecaoSection = document.getElementById('selecao'); // Referência à seção Comanda

    let tipoSelecionado = null;
    let saborSelecionado = null;
    let saboresDisponiveis = [];

    tiposCarrossel.addEventListener('click', function(event) {
        if (event.target.classList.contains('select-type')) {
            tipoSelecionado = event.target.dataset.tipo;
            tipoSelecionadoSpan.textContent = tipoSelecionado.charAt(0).toUpperCase() + tipoSelecionado.slice(1);
            atualizarSabores(tipoSelecionado);
            saborSelecionado = null;
            saborSelecionadoSpan.textContent = 'Nenhum';
            // Parar o carrossel de tipos ao selecionar
            carouselModule.stopAutoSlideExternally('tipos-salgado');
        }
    });

    // Evento de clique nos sabores (para ativar o botão "Adicionar") - corrigido erro de variável
    saboresCarrossel.addEventListener('click', function(event) {
        const productSlide = event.target.closest('.carousel-slide.product');
        if (productSlide) {
            saborSelecionado = productSlide.dataset.sabor;
            const saborNome = saboresDisponiveis.find(s => s.sabor === saborSelecionado)?.nome || 'Nenhum';
            saborSelecionadoSpan.textContent = saborNome;

            // Trava o carrossel no produto selecionado (funciona em todos os dispositivos)
            const slides = Array.from(saboresCarrossel.querySelectorAll('.carousel-slide.product'));
            const slideIndex = slides.indexOf(productSlide);
            if (slideIndex !== -1) {
                carouselModule.lockCarousel('sabores', slideIndex);
            }
        }
    });

    // Função para atualizar o carrossel de sabores
   function atualizarSabores(tipo) {
        saboresTrack.innerHTML = '';
        saboresDisponiveis = []; // Limpa os sabores disponíveis

        switch (tipo) {
            case 'coxinha':
                saboresDisponiveis = [
                    { nome: 'Frango', preco: 7.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'coxinha', sabor: 'frango' },
                    { nome: 'Costela', preco: 8.00, imagem: 'https://images.pexels.com/photos/8964567/pexels-photo-8964567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'coxinha', sabor: 'costela' },
                    { nome: 'Calabresa com Cheddar', preco: 7.50, imagem: 'https://images.pexels.com/photos/17402718/pexels-photo-17402718/free-photo-of-comida-alimento-refeicao-pizza.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'coxinha', sabor: 'calabresa-com-cheddar' },
                   // Sabores doces adicionados
                    { nome: 'Chocolate com Café', preco: 9.00, imagem: '/imagens/chocolate-com-cafe.png', tipo: 'coxinha', sabor: 'chocolate-com-cafe'},
                    { nome: 'Sorvete', preco: 9.50, imagem: '/imagens/coxinha-sorvete.png', tipo: 'coxinha', sabor: 'sorvete'}
                ];

                break;
            case 'enroladinho':
                saboresDisponiveis = [
                    { nome: 'Salsicha', preco: 6.00, imagem: 'https://images.pexels.com/photos/357576/pexels-photo-357576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'enroladinho', sabor: 'salsicha' },
                    { nome: 'Queijo e Presunto', preco: 6.50, imagem: 'https://images.pexels.com/photos/9615585/pexels-photo-9615585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'enroladinho', sabor: 'queijo-e-presunto' }
                ];
                break;
            case 'bolinha':
                saboresDisponiveis = [
                    { nome: 'Carne com Queijo', preco: 6.00, imagem: 'https://cdn.pixabay.com/photo/2019/10/13/02/18/tomato-meat-sauce-4545230_1280.jpg', tipo: 'bolinha', sabor: 'carne-com-queijo' },
                    { nome: 'Calabresa', preco: 6.00, imagem: 'https://images.pexels.com/photos/6004718/pexels-photo-6004718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'bolinha', sabor: 'calabresa' }
                ];
                break;
            case 'empada':
                saboresDisponiveis = [
                    { nome: 'Frango', preco: 6.00, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'empada', sabor: 'frango' },
                    { nome: 'Palmito', preco: 6.50, imagem: 'https://images.pexels.com/photos/8679380/pexels-photo-8679380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'empada', sabor: 'palmito' },
                     { nome: 'Queijo', preco: 6.50, imagem: 'https://cdn.pixabay.com/photo/2017/01/11/19/56/cheese-1972744_1280.jpg', tipo: 'empada', sabor: 'queijo' }
                ];
                break;
            case 'tortinha':
                saboresDisponiveis = [
                    { nome: 'Legumes', preco: 4.50, imagem: 'https://images.pexels.com/photos/4577379/pexels-photo-4577379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'tortinha', sabor: 'legumes' },
                    { nome: 'Frango', preco: 4.50, imagem: 'https://images.pexels.com/photos/12361995/pexels-photo-12361995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'tortinha', sabor: 'frango' }
                ];
                break;
            case 'torta':
                saboresDisponiveis = [
                    { nome: 'Frango com Catupiry', preco: 5.00, imagem: 'https://receitasdepesos.com.br/wp-content/uploads/2024/09/file-de-frango-com-catupiry.jpeg.webp', tipo: 'torta', sabor: 'frango-com-catupiry' },
                    { nome: 'Calabresa com Queijo', preco: 5.00, imagem: 'https://cdn.pixabay.com/photo/2021/10/16/12/50/fire-chicken-6714952_1280.jpg', tipo: 'torta', sabor: 'calabresa-com-queijo' }
                ];
                break;
            default:
                saboresTrack.innerHTML = '<p>Nenhum sabor disponível para este tipo de salgado.</p>';
                return;
        }

        saboresDisponiveis.forEach(function(sabor) {
            const slide = document.createElement('article');
            slide.classList.add('carousel-slide', 'product');
            slide.dataset.sabor = sabor.sabor; // Armazena o nome do sabor
            slide.dataset.preco = sabor.preco.toFixed(2);
            slide.innerHTML = `
                <img src="${sabor.imagem}" alt="Sabor ${sabor.nome}" loading="lazy" width="300" height="200">
                <h3>${sabor.nome}</h3>
                <button class="add-to-cart cta" data-name="${tipoSelecionado} de ${sabor.nome}" data-price="${sabor.preco.toFixed(2)}">Adicionar</button>
            `;
            saboresTrack.appendChild(slide);
        });

        // Inicialize o carrossel de sabores após adicionar os slides
        carouselModule.init('sabores');
    }

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

    const updateEnderecoContainerVisibility = (radio, container) => {
        container.style.display = radio.checked ? 'block' : 'none';
    };

    updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);

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

    const finalizarPedido = () => {
        const opcaoEntregaSelecionada = document.querySelector('input[name="opcao-entrega"]:checked');
        const isPrincipalCheckout = opcaoEntregaSelecionada && opcaoEntregaSelecionada.closest('#carrinho'); // Verifica se o checkout é o principal

        // Lógica de validação de endereço (se entrega for selecionada)
        if (opcaoEntregaSelecionada && opcaoEntregaSelecionada.value === 'entrega') {
            const cepInput = isPrincipalCheckout ? cepInputPrincipal : cepInput;
            const ruaInput = isPrincipalCheckout ? ruaInputPrincipal : ruaInput;
            const numeroInput = isPrincipalCheckout ? numeroInputPrincipal : numeroInput;

            if (!cepInput.value || !ruaInput.value || !numeroInput.value) {
                alert('Por favor, preencha o endereço completo para entrega.');
                return; // Impede a finalização do pedido
            }
        }

        // Adicionar pontos ao cliente ANTES de limpar o carrinho
        const totalCompra = cartModule.total(); // Usa a função total exposta
        loyaltyModule.adicionarPontos(totalCompra);

        // Atualizar histórico de pedidos (simulação)
        const cliente = loyaltyModule.getCliente();
        if (cliente) {
            const tipoPedido = cartModule.cart.length > 0 ? cartModule.cart[0].name.split(' ')[0] : 'salgado';
            cliente.historicoPedidos.push({
                id: Date.now(), // Usar timestamp como ID único simulado
                tipo: tipoPedido,
                valor: totalCompra,
                data: new Date().toLocaleDateString()
            });
            localStorage.setItem("cliente", JSON.stringify(cliente));
            suggestionModule.exibirSugestoesPersonalizadas(); // Exibir sugestões após o pedido
        }

        // Mensagem de sucesso (simulação)
        alert('Pedido finalizado com sucesso!');


        // Limpar o carrinho
        cartModule.cart.length = 0; // Acessa o array diretamente (se exposto) ou usa um método clearCart()
        cartModule.updateCartDisplay();

        // Opcional: Limpar campos de endereço após finalizar
        if (isPrincipalCheckout) {
            cepInputPrincipal.value = '';
            ruaInputPrincipal.value = '';
            numeroInputPrincipal.value = '';
            complementoInputPrincipal.value = '';
            bairroInputPrincipal.value = '';
            cidadeInputPrincipal.value = '';
            estadoInputPrincipal.value = '';
            enderecoContainerPrincipal.style.display = 'none';
            retirarRadioPrincipal.checked = true; // Volta para retirar como padrão
        } else {
            cepInput.value = '';
            ruaInput.value = '';
            numeroInput.value = '';
            complementoInput.value = '';
            bairroInput.value = '';
            cidadeInput.value = '';
            estadoInput.value = '';
            enderecoContainer.style.display = 'none';
            retirarRadio.checked = true; // Volta para retirar como padrão
        }
    };

    suggestionModule.exibirSugestoesPersonalizadas(); // Exibe sugestões ao carregar a página

    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', finalizarPedido);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.container-coxinhas');
    const coxinha1 = document.getElementById('coxinha1');
    const coxinha2 = document.getElementById('coxinha2');
    const coxinha3 = document.getElementById('coxinha3');
    const coxinha4 = document.getElementById('coxinha4');
    const comentariosDiv = document.querySelector('.comentarios-container');
    const comentarios = document.querySelectorAll('.comentario');
    let comentarioAtual = 0;

    // Função para renderizar as estrelas com base na nota
    function renderizarEstrelas(ratingContainer) {
        const rating = parseFloat(ratingContainer.dataset.rating);
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        ratingContainer.innerHTML = stars + ` ${rating}`;
    }

    // Inicializa os comentários e as estrelas
    comentarios.forEach((comentario, index) => {
        comentario.style.display = index === 0 ? 'block' : 'none';
        renderizarEstrelas(comentario.querySelector('[data-rating]'));
    });

    // Função para mostrar o próximo comentário
    function mostrarProximoComentario() {
        // Esconde o comentário atual
        comentarios[comentarioAtual].style.display = 'none';
        // Calcula o próximo índice
        comentarioAtual = (comentarioAtual + 1) % comentarios.length;
        // Mostra o próximo comentário
        comentarios[comentarioAtual].style.display = 'block';
    }

    // Define o intervalo para trocar os comentários a cada 5 segundos
    setInterval(mostrarProximoComentario, 5000);

    window.addEventListener('scroll', function () {
        let scrollY = window.scrollY;
        let containerTop = container.offsetTop;
        let windowHeight = window.innerHeight;

        if (scrollY > containerTop - windowHeight && scrollY < containerTop + container.offsetHeight) {
            let relativeScroll = scrollY - (containerTop - windowHeight);

            // Coxinhas interligadas, com rotações suaves e sincronizadas
            coxinha1.style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * 0.01 - 5}deg)`;
            coxinha2.style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * -0.01 + 175}deg)`;
            coxinha3.style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * 0.01 + 5}deg)`;
            coxinha4.style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * -0.01 - 3}deg)`;

            // Verificar se as coxinhas estão atrás dos comentários/avaliações
            const coxinhas = [coxinha1, coxinha2, coxinha3, coxinha4];
            const blurValues = [0, 1, 3, 5]; // Intensidades de blur para cada coxinha

            coxinhas.forEach((coxinha, index) => {
                const coxinhaRect = coxinha.getBoundingClientRect();
                const comentariosRect = comentariosDiv.getBoundingClientRect();

                // Calcula a interseção entre a coxinha e a div de comentários
                const intersectionTop = Math.max(coxinhaRect.top, comentariosRect.top);
                const intersectionBottom = Math.min(coxinhaRect.bottom, comentariosRect.bottom);
                const intersectionLeft = Math.max(coxinhaRect.left, comentariosRect.left);
                const intersectionRight = Math.min(coxinhaRect.right, comentariosRect.right);

                const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
                const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

                const coxinhaArea = coxinhaRect.width * coxinhaRect.height;
                const intersectionArea = intersectionWidth * intersectionHeight;

                // Calcula a porcentagem da coxinha que está dentro da div de comentários
                const percentageInside = (intersectionArea / coxinhaArea) * 100;

                // Define o desfoque baseado na porcentagem de cobertura
                if (percentageInside > 0) {
                    coxinha.style.filter = `blur(${blurValues[index] * (percentageInside / 100)}px)`;
                } else {
                    coxinha.style.filter = 'none';
                }
            });
        } else {
            coxinha1.style.transform = 'translateY(0) rotate(-5deg)';
            coxinha2.style.transform = 'translateY(0) rotate(175deg)';
            coxinha3.style.transform = 'translateY(0) rotate(5deg)';
            coxinha4.style.transform = 'translateY(0) rotate(-3deg)';
            coxinha1.style.filter = 'none';
            coxinha2.style.filter = 'none';
            coxinha3.style.filter = 'none';
            coxinha4.style.filter = 'none';
        }
    });
});

const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav'); // Ou o ul: .main-nav-links
const toggleThemeButton = document.getElementById('toggleTheme');
const body = document.body;

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active'); // Adiciona/remove classe para mostrar/esconder
        // Opcional: Altera ícone do botão
         mobileMenuToggle.querySelector('i').classList.toggle('fa-bars');
         mobileMenuToggle.querySelector('i').classList.toggle('fa-times');
    });
}

// Lógica do botão de tema (adapte conforme sua implementação de tema escuro)
if (toggleThemeButton) {
    // Verifica tema salvo ou preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
         body.classList.add('theme-dark');
    } else {
         body.classList.remove('theme-dark'); // Garante estado inicial claro se não for dark
    }


    toggleThemeButton.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        // Salva a preferência
        if (body.classList.contains('theme-dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
            localStorage.removeItem('theme'); // Ou remova explicitamente
        }
    });
     // Atualiza ícones no botão de tema (exemplo inicial)
     function updateThemeIcons() {
        const isDark = body.classList.contains('theme-dark');
        const moonIcon = toggleThemeButton.querySelector('.fa-moon');
        const sunIcon = toggleThemeButton.querySelector('.fa-sun');
        if (moonIcon && sunIcon) {
            moonIcon.style.display = isDark ? 'none' : 'inline-block';
            sunIcon.style.display = isDark ? 'inline-block' : 'none';
        }
    }
     updateThemeIcons(); // Chamar na inicialização
     toggleThemeButton.addEventListener('click', updateThemeIcons); // Chamar ao clicar
}

function toggleCart() {
    const cartMenu = document.getElementById('cart-menu');
    cartMenu.classList.toggle('open'); // Alterna a classe 'open' para mostrar/ocultar o carrinho
}

// --- Correção para formulário de fidelidade e carteira digital ---
const fidelidadeForm = document.getElementById('form-fidelidade');
if (fidelidadeForm) {
    fidelidadeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-fidelidade').value;
        const telefone = document.getElementById('telefone-fidelidade').value;

        const response = await fetch('/api/fidelidade/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone }),
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('nome-cliente').textContent = data.nome;
            document.getElementById('pontos-cliente').textContent = data.pontos;
            document.getElementById('cadastro-fidelidade').style.display = 'none';
            document.getElementById('carteira-digital').style.display = 'block';
        } else {
            alert('Erro ao cadastrar. Tente novamente.');
        }
    });
}

async function atualizarCarteira() {
    const pontosCliente = document.getElementById('pontos-cliente');
    const historico = document.getElementById('historico-transacoes');
    if (!pontosCliente || !historico) return;
    const response = await fetch('/api/fidelidade/saldo');
    if (response.ok) {
        const data = await response.json();
        pontosCliente.textContent = data.pontos;
        historico.innerHTML = '';
        data.historico.forEach((transacao) => {
            const li = document.createElement('li');
            li.textContent = `${transacao.descricao} - ${transacao.pontos} pontos`;
            historico.appendChild(li);
        });
    }
}

const carteiraDigital = document.getElementById('carteira-digital');
if (carteiraDigital) {
    carteiraDigital.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', async () => {
            const pontos = button.getAttribute('data-pontos');
            const response = await fetch('/api/fidelidade/resgatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pontos }),
            });

            if (response.ok) {
                alert('Recompensa resgatada com sucesso!');
                atualizarCarteira();
            } else {
                alert('Erro ao resgatar recompensa. Verifique seus pontos.');
            }
        });
    });
}
