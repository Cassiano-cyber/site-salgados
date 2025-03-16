const carouselModule = (() => {
    const carousels = {};

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
            autoSlideActive: true
        };

        nextButton.addEventListener("click", () => {
            stopAutoSlide(carouselId);
            showNextSlide(carouselId);
            restartAutoSlide(carouselId);
        });
        prevButton.addEventListener("click", () => {
            stopAutoSlide(carouselId);
            showPrevSlide(carouselId);
            restartAutoSlide(carouselId);
        });

        carouselContainer.addEventListener("mouseenter", () => stopAutoSlide(carouselId));
        carouselContainer.addEventListener("mouseleave", () => {
            if (carousels[carouselId].autoSlideActive) {
                startAutoSlide(carouselId);
            }
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
        carousel.currentSlide = (carousel.currentSlide + 1) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    const showPrevSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        carousel.currentSlide = (carousel.currentSlide - 1 + carousel.slides.length) % carousel.slides.length;
        showSlide(carouselId, carousel.currentSlide);
    };

    const startAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        if (carousel.autoSlideActive) {
            carousel.intervalId = setInterval(() => showNextSlide(carouselId), 5000);
        }
    };

    const stopAutoSlide = (carouselId) => {
        const carousel = carousels[carouselId];
        clearInterval(carousel.intervalId);
    };

    const restartAutoSlide = (carouselId) => {
        stopAutoSlide(carouselId);
        startAutoSlide(carouselId);
    };

    return { init };
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
            console.error("Cart elements not found.");
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

        // Event listener para os botões "Adicionar" das promoções, bebidas e sabores.
        document.body.addEventListener('click', function(event) {
            if (event.target.classList.contains('add-to-cart')) {
                const name = event.target.dataset.name;
                const price = parseFloat(event.target.dataset.price);
                if (name && !isNaN(price)) {
                    addItem(name, price);
                }
            }
        });

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
            alert("Empty cart! Add items to cart.");
            return;
        }

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
            alert("Please enter the house number.");
            return;
        }

        let message = "New order:\n\n";
        cart.forEach(item => {
            message += `${item.name} - R$ ${item.price.toFixed(2)}\n`;
        });
        message += `\nTotal: R$ ${total.toFixed(2)}\n`;

        if (deliveryOption === 'entrega') {
            message += `\nAddress:\nCEP: ${addressData.cep}\nRua: ${addressData.rua}, ${addressData.numero} ${addressData.complemento}\nBairro: ${addressData.bairro}\nCidade: ${addressData.cidade}, ${addressData.estado}\n`;
        } else {
            message += "\nPick up on site.\n";
        }

        const phoneNumber = "5517996780618";
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return { init, addItem, removeItem, checkout, updateCartDisplay };
})();

document.addEventListener("DOMContentLoaded", () => {
    themeModule.init();
    cartModule.init();

    // Inicializa os carrosséis
    carouselModule.init('tipos-salgado');
    carouselModule.init('sabores');

    const tiposCarrossel = document.getElementById('tipos-salgado');
    const saboresCarrossel = document.getElementById('sabores');
    const saboresTrack = document.getElementById('carousel-track-sabores');
    const tipoSelecionadoSpan = document.getElementById('tipo-selecionado');
    const saborSelecionadoSpan = document.getElementById('sabor-selecionado');
    const adicionarAoCarrinhoButton = document.getElementById('adicionar-ao-carrinho');
    const selecaoSection = document.getElementById('selecao'); // Adicionado

    let tipoSelecionado = null;
    let saborSelecionado = null;
    let saboresDisponiveis = []; // Agora armazena os dados dos sabores

    tiposCarrossel.addEventListener('click', function(event) {
        if (event.target.classList.contains('select-type')) {
            tipoSelecionado = event.target.dataset.tipo;
            tipoSelecionadoSpan.textContent = tipoSelecionado;
            atualizarSabores(tipoSelecionado);
            saborSelecionado = null;
            saborSelecionadoSpan.textContent = 'Nenhum';
            adicionarAoCarrinhoButton.disabled = true;
        }
    });

    // Evento de clique nos sabores (para ativar o botão "Adicionar") - CORRIGIDO
    saboresCarrossel.addEventListener('click', function(event) {
        // Garante que o clique ocorreu em um elemento product dentro do carrossel
        if (event.target.closest('.carousel-slide.product')) {
            // Encontra o elemento product clicado
            const saborElemento = event.target.closest('.carousel-slide.product');
            if (saborElemento) {
                saborSelecionado = saborElemento.dataset.sabor; // Define o sabor selecionado

                // Atualiza o texto na "Comanda"
                const saborNome = saboresDisponiveis.find(s => s.sabor === saborSelecionado)?.nome || 'Nenhum';
                saborSelecionadoSpan.textContent = saborNome;

                adicionarAoCarrinhoButton.disabled = false;
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
                    { nome: 'Calabresa com Cheddar', preco: 7.50, imagem: 'https://images.pexels.com/photos/17402718/pexels-photo-17402718/free-photo-of-comida-alimento-refeicao-pizza.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'coxinha', sabor: 'calabresa-com-cheddar' }
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
                    { nome: 'Frango', preco: 6.00, imagem: 'https://images.pexels.com/photos/8679380/pexels-photo-8679380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'empada', sabor: 'frango' },
                    { nome: 'Palmito', preco: 6.50, imagem: 'https://images.pexels.com/photos/8679380/pexels-photo-8679380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'empada', sabor: 'palmito' },
                     { nome: 'Queijo', preco: 6.50, imagem: 'https://cdn.pixabay.com/photo/2017/01/11/19/56/cheese-1972744_1280.jpg', tipo: 'empada', sabor: 'queijo' }
                ];
                break;
            case 'tortinha':
                saboresDisponiveis = [
                    { nome: 'Legumes', preco: 4.50, imagem: 'https://images.pexels.com/photos/4577379/pexels-photo-4577379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'tortinha', sabor: 'legumes' },
                    { nome: 'Frango', preco: 4.50, imagem: 'https://images.pexels.com/photos/4577379/pexels-photo-4577379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', tipo: 'tortinha', sabor: 'frango' }
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

    // Adicionar ao Carrinho (após selecionar tipo e sabor) - REMOVIDO - Já está no body event listener

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
});
