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

        // Evita re-inicializar um carrossel já existente
        if (carousels[carouselId]) {
            console.warn(`Carousel with ID "${carouselId}" is already initialized. Skipping re-initialization.`);
            return true; // Retorna true para indicar que está inicializado
        }

        // Armazena o estado e os elementos do carrossel
        carousels[carouselId] = {
            currentSlide: 0,
            slides: Array.from(slides), // Armazena como Array para conveniência
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
        if (!carousel) return; // Segurança adicional

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
        const carousel = carousels[carouselId];
        if (!carousel) return;

        stopAutoSlide(carouselId);
        action(); // Executa a ação de navegação
        clearTimeout(carousel.resumeTimeout); // Limpa qualquer timeout pendente
        // Agenda a retomada do auto-slide após um delay
        carousel.resumeTimeout = setTimeout(() => {
            if (carousel.autoSlideActive && !carousel.locked) {
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
        // Garante que o índice esteja dentro dos limites válidos
        const validIndex = Math.max(0, Math.min(index, carousel.slides.length - 1));
        carousel.track.style.transform = `translateX(-${validIndex * 100}%)`;
        carousel.currentSlide = validIndex; // Atualiza o índice atual
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
        carousel.intervalId = null; // Reseta o ID do intervalo
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
                carousel.currentSlide = slideIndex; // Define o slide atual para o índice travado
                showSlide(carouselId, carousel.currentSlide); // Move para o slide travado
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
        if (!carousel) return;
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
        if (!carousel) return;
        carousel.endX = e.touches[0].clientX;
    };

    /**
     * Processa o swipe quando o toque termina.
     * @param {string} carouselId - O ID do carrossel.
     */
    const handleTouchEnd = (carouselId) => {
        const carousel = carousels[carouselId];
        if (!carousel) return;
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

// ---- RESTANTE DOS SEUS MÓDULOS E INITIALIZAÇÃO DO DOM ----

// Módulos `themeModule`, `cartModule`, `loyaltyModule`, `suggestionModule` (e suas funções auxiliares)
// ... (cole aqui o restante do seu código dos outros módulos e do DOMContentLoaded) ...
// Certifique-se de que o `carouselModule` seja o único declarado.

// --- Exemplo de como o final ficaria após colar os outros módulos ---
// ... (themeModule, cartModule, loyaltyModule, suggestionModule) ...

/**
 * Função auxiliar para capitalizar a primeira letra de uma string.
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Inicializa todos os módulos da aplicação quando o DOM estiver pronto.
 */
document.addEventListener("DOMContentLoaded", () => {
    themeModule.init();
    cartModule.init();
    loyaltyModule.init();

    // Inicializa os carrosséis da página
    carouselModule.init('tipos-salgado'); // VERIFIQUE SE ESTE ID ESTÁ CORRETO NO SEU HTML
    carouselModule.init('sabores');      // VERIFIQUE SE ESTE ID ESTÁ CORRETO NO SEU HTML

    const tiposCarrossel = document.getElementById('tipos-salgado');
    const saboresCarrossel = document.getElementById('sabores');
    const saboresTrack = document.getElementById('carousel-track-sabores'); // VERIFIQUE SE ESTE ID ESTÁ CORRETO NO SEU HTML
    const tipoSelecionadoSpan = document.getElementById('tipo-selecionado');
    const saborSelecionadoSpan = document.getElementById('sabor-selecionado');

    let tipoSelecionado = null;
    let saborSelecionado = null;
    let saboresDisponiveis = [];

    if (tiposCarrossel) { // Verifica se o carrossel de tipos existe
        tiposCarrossel.addEventListener('click', function(event) {
            if (event.target.classList.contains('select-type')) {
                const selectedTypeElement = event.target;
                tipoSelecionado = selectedTypeElement.dataset.tipo;

                if (tipoSelecionadoSpan) tipoSelecionadoSpan.textContent = capitalizeFirstLetter(tipoSelecionado);
                atualizarSabores(tipoSelecionado); // Chama a função para atualizar os sabores

                saborSelecionado = null;
                if (saborSelecionadoSpan) saborSelecionadoSpan.textContent = 'Nenhum';

                carouselModule.stopAutoSlideExternally('tipos-salgado');
            }
        });
    } else {
        console.warn("Element with ID 'tipos-salgado' not found. Carousel for types will not function.");
    }


    if (saboresCarrossel) { // Verifica se o carrossel de sabores existe
        saboresCarrossel.addEventListener('click', function(event) {
            const productSlide = event.target.closest('.carousel-slide.product');
            if (productSlide) {
                saborSelecionado = productSlide.dataset.sabor;
                const saborInfo = saboresDisponiveis.find(s => s.sabor === saborSelecionado);
                if (saborSelecionadoSpan) saborSelecionadoSpan.textContent = saborInfo ? saborInfo.nome : 'Nenhum';

                const slides = Array.from(saboresCarrossel.querySelectorAll('.carousel-slide.product'));
                const slideIndex = slides.indexOf(productSlide);
                if (slideIndex !== -1) {
                    carouselModule.lockCarousel('sabores', slideIndex);
                }
            }
        });
    } else {
        console.warn("Element with ID 'sabores' not found. Carousel for flavors will not function.");
    }


    function atualizarSabores(tipo) {
        if (!saboresTrack) {
            console.error("Element with ID 'carousel-track-sabores' not found. Cannot update flavors.");
            return;
        }
        saboresTrack.innerHTML = '';
        saboresDisponiveis = [];

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
                saboresTrack.innerHTML = '<p>Nenhum sabor disponível para este tipo de salgado.</p>';
                return;
        }

        saboresDisponiveis.forEach(function(sabor) {
            const slide = document.createElement('article');
            slide.classList.add('carousel-slide', 'product');
            slide.dataset.sabor = sabor.sabor;
            slide.dataset.preco = sabor.preco.toFixed(2);
            slide.innerHTML = `
                <img src="${sabor.imagem}" alt="Sabor ${sabor.nome}" loading="lazy" width="300" height="200">
                <h3>${sabor.nome}</h3>
                <button class="add-to-cart cta" data-name="${capitalizeFirstLetter(tipo)} de ${sabor.nome}" data-price="${sabor.preco.toFixed(2)}">Adicionar</button>
            `;
            saboresTrack.appendChild(slide);
        });

        // Re-inicializa o carrossel de sabores APÓS adicionar os novos slides.
        // Isso é CRUCIAL para que o carrossel de sabores reconheça os elementos criados.
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

    const buscarEndereco = (cep, ruaInputRef, bairroInputRef, cidadeInputRef, estadoInputRef, enderecoCompletoId) => {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado.');
                    return;
                }
                ruaInputRef.value = data.logradouro || '';
                bairroInputRef.value = data.bairro || '';
                cidadeInputRef.value = data.localidade || '';
                estadoInputRef.value = data.uf || '';
                document.getElementById(enderecoCompletoId).style.display = 'block';
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o CEP. Tente novamente.');
            });
    };

    const updateEnderecoContainerVisibility = (radio, container) => {
        if (radio && container) {
            container.style.display = radio.checked ? 'block' : 'none';
        }
    };

    if(entregaRadioPrincipal && enderecoContainerPrincipal) updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal);
    if(entregaRadio && enderecoContainer) updateEnderecoContainerVisibility(entregaRadio, enderecoContainer);

    if(entregaRadioPrincipal) entregaRadioPrincipal.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal));
    if(retiradaRadioPrincipal) retiradaRadioPrincipal.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadioPrincipal, enderecoContainerPrincipal));

    if(buscarEnderecoButtonPrincipal && cepInputPrincipal) buscarEnderecoButtonPrincipal.addEventListener('click', () => {
        const cep = cepInputPrincipal.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInputPrincipal, bairroInputPrincipal, cidadeInputPrincipal, estadoInputPrincipal, 'endereco-completo-principal');
    });

    if(entregaRadio) entregaRadio.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadio, enderecoContainer));
    if(retiradaRadio) retiradaRadio.addEventListener('change', () => updateEnderecoContainerVisibility(entregaRadio, enderecoContainer));

    if(buscarEnderecoButton && cepInput) buscarEnderecoButton.addEventListener('click', () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('CEP inválido. Digite um CEP com 8 dígitos.');
            return;
        }
        buscarEndereco(cep, ruaInput, bairroInput, cidadeInput, estadoInput, 'endereco-completo');
    });

    const finalizarPedido = () => {
        const opcaoEntregaSelecionada = document.querySelector('input[name="opcao-entrega"]:checked');
        const isPrincipalCheckout = opcaoEntregaSelecionada && opcaoEntregaSelecionada.closest('#carrinho');

        if (opcaoEntregaSelecionada && opcaoEntregaSelecionada.value === 'entrega') {
            const cepInputRef = isPrincipalCheckout ? cepInputPrincipal : cepInput;
            const ruaInputRef = isPrincipalCheckout ? ruaInputPrincipal : ruaInput;
            const numeroInputRef = isPrincipalCheckout ? numeroInputPrincipal : numeroInput;

            if (!cepInputRef.value.trim() || !ruaInputRef.value.trim() || !numeroInputRef.value.trim()) {
                alert('Por favor, preencha o endereço completo para entrega.');
                return;
            }
        }

        const totalCompra = cartModule.total();
        loyaltyModule.adicionarPontos(totalCompra);

        const cliente = loyaltyModule.getCliente();
        if (cliente) {
            const primeiroItemNome = cartModule.cart.length > 0 ? cartModule.cart[0].name : '';
            const tipoPedido = primeiroItemNome.split(' ')[0].toLowerCase();

            cliente.historicoPedidos.push({
                id: Date.now(),
                tipo: tipoPedido,
                valor: totalCompra,
                data: new Date().toLocaleDateString('pt-BR')
            });
            localStorage.setItem("cliente", JSON.stringify(cliente));
            suggestionModule.exibirSugestoesPersonalizadas();
        }

        alert(`Pedido finalizado com sucesso! Valor total: R$ ${totalCompra.toFixed(2)}`);

        cartModule.cart.length = 0;
        cartModule.updateCartDisplay();

        const resetAddressFields = (cepInputRef, ruaInputRef, numeroInputRef, complementoInputRef, bairroInputRef, cidadeInputRef, estadoInputRef, enderecoContainerRef) => {
            cepInputRef.value = ''; ruaInputRef.value = ''; numeroInputRef.value = ''; complementoInputRef.value = '';
            bairroInputRef.value = ''; cidadeInputRef.value = ''; estadoInputRef.value = '';
            if(enderecoContainerRef) enderecoContainerRef.style.display = 'none';
        };

        if (isPrincipalCheckout) {
            resetAddressFields(cepInputPrincipal, ruaInputPrincipal, numeroInputPrincipal, complementoInputPrincipal, bairroInputPrincipal, cidadeInputPrincipal, estadoInputPrincipal, enderecoContainerPrincipal);
            if(retiradaRadioPrincipal) retiradaRadioPrincipal.checked = true;
        } else {
            resetAddressFields(cepInput, ruaInput, numeroInput, complementoInput, bairroInput, cidadeInput, estadoInput, enderecoContainer);
            if(retiradaRadio) retiradaRadio.checked = true;
        }

        tipoSelecionado = null;
        saborSelecionado = null;
        if(tipoSelecionadoSpan) tipoSelecionadoSpan.textContent = 'Nenhum';
        if(saborSelecionadoSpan) saborSelecionadoSpan.textContent = 'Nenhum';
    };

    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', finalizarPedido);
    }

    suggestionModule.exibirSugestoesPersonalizadas();
});

// --- Animações de Scroll (Mantenha este bloco separado se não fez alterações nele) ---
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

    if (!containerCoxinhas || comentarios.length === 0 || coxinhas.some(c => !c)) {
        console.warn("Alguns elementos para animação de scroll não foram encontrados. Animações de scroll desativadas.");
        return;
    }

    function renderizarEstrelas(ratingContainer) {
        const rating = parseFloat(ratingContainer.dataset.rating);
        if (isNaN(rating)) return;

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        ratingContainer.innerHTML = starsHTML + ` ${rating.toFixed(1)}`;
    }

    comentarios.forEach((comentario, index) => {
        comentario.style.display = index === 0 ? 'block' : 'none';
        const ratingContainer = comentario.querySelector('[data-rating]');
        if (ratingContainer) {
            renderizarEstrelas(ratingContainer);
        }
    });

    function mostrarProximoComentario() {
        if (comentarios.length === 0) return;

        comentarios[comentarioAtual].style.display = 'none';
        comentarioAtual = (comentarioAtual + 1) % comentarios.length;
        comentarios[comentarioAtual].style.display = 'block';
    }

    const commentInterval = setInterval(mostrarProximoComentario, 5000);

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const containerTop = containerCoxinhas.offsetTop;
        const windowHeight = window.innerHeight;

        if (scrollY > containerTop - windowHeight && scrollY < containerTop + containerCoxinhas.offsetHeight) {
            let relativeScroll = scrollY - (containerTop - windowHeight);

            coxinhas[0].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * 0.01 - 5}deg)`;
            coxinhas[1].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * 10}px) rotate(${relativeScroll * -0.01 + 175}deg)`;
            coxinhas[2].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.sin(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * 0.01 + 5}deg)`;
            coxinhas[3].style.transform = `translateY(${relativeScroll * 0.08}px) translateX(${Math.cos(relativeScroll * 0.01) * -10}px) rotate(${relativeScroll * -0.01 - 3}deg)`;

            const blurValues = [0, 1, 3, 5];

            coxinhas.forEach((coxinha, index) => {
                const coxinhaRect = coxinha.getBoundingClientRect();
                const comentariosRect = comentariosDiv.getBoundingClientRect();

                const intersectionTop = Math.max(coxinhaRect.top, comentariosRect.top);
                const intersectionBottom = Math.min(coxinhaRect.bottom, comentariosRect.bottom);
                const intersectionLeft = Math.max(coxinhaRect.left, comentariosRect.left);
                const intersectionRight = Math.min(coxinhaRect.right, comentariosRect.right);

                const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
                const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

                const coxinhaArea = coxinhaRect.width * coxinhaRect.height;
                const intersectionArea = intersectionWidth * intersectionHeight;

                const percentageInside = coxinhaArea > 0 ? (intersectionArea / coxinhaArea) * 100 : 0;

                if (percentageInside > 0) {
                    coxinha.style.filter = `blur(${blurValues[index] * (percentageInside / 100)}px)`;
                } else {
                    coxinha.style.filter = 'none';
                }
            });
        } else {
            coxinhas.forEach((coxinha, index) => {
                coxinha.style.transform = 'none';
                coxinha.style.filter = 'none';
            });
        }
    });
});

// --- Navegação Mobile e Tema ---
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toggleThemeButton = document.getElementById('toggleTheme');
const body = document.body;

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
}

if (toggleThemeButton) {
    const THEME_STORAGE_KEY = "theme";

    const updateThemeIcons = () => {
        const isDark = body.classList.contains('dark-mode');
        const moonIcon = toggleThemeButton.querySelector('.fa-moon');
        const sunIcon = toggleThemeButton.querySelector('.fa-sun');
        if (moonIcon && sunIcon) {
            moonIcon.style.display = isDark ? 'none' : 'inline-block';
            sunIcon.style.display = isDark ? 'inline-block' : 'none';
        }
    };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
    updateThemeIcons();

    toggleThemeButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        updateThemeIcons();
    });
}

function toggleCart() {
    const cartMenu = document.getElementById('cart-menu');
    if (cartMenu) {
        cartMenu.classList.toggle('open');
    }
}

// --- Fidelidade e API ---
const fidelidadeForm = document.getElementById('form-fidelidade');
if (fidelidadeForm) {
    fidelidadeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-fidelidade').value.trim();
        const telefone = document.getElementById('telefone-fidelidade').value.trim();

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

async function atualizarCarteira() {
    const pontosClienteSpan = document.getElementById('pontos-cliente');
    const historicoTransacoesList = document.getElementById('historico-transacoes');

    if (!pontosClienteSpan || !historicoTransacoesList) {
        return;
    }

    try {
        const response = await fetch('/api/fidelidade/saldo');
        if (response.ok) {
            const data = await response.json();
            pontosClienteSpan.textContent = data.pontos;
            historicoTransacoesList.innerHTML = '';
            data.historico.forEach((transacao) => {
                const li = document.createElement('li');
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

const carteiraDigitalSection = document.getElementById('carteira-digital');
if (carteiraDigitalSection) {
    carteiraDigitalSection.querySelectorAll('button[data-pontos]').forEach((button) => {
        button.addEventListener('click', async () => {
            const pontosNecessarios = parseInt(button.dataset.pontos, 10);

            if (isNaN(pontosNecessarios) || pontosNecessarios <= 0) {
                alert('Esta recompensa é inválida ou não tem pontos associados.');
                return;
            }

            const cliente = loyaltyModule.getCliente();
            if (!cliente || cliente.pontos < pontosNecessarios) {
                alert(`Você precisa de ${pontosNecessarios} pontos para resgatar esta recompensa.`);
                return;
            }

            try {
                const response = await fetch('/api/fidelidade/resgatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pontos: pontosNecessarios }),
                });

                if (response.ok) {
                    alert('Recompensa resgatada com sucesso!');
                    atualizarCarteira();
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
