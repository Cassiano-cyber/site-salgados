let currentIndex = 0;

// Função para mostrar o slide atual
function showSlide(index) {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
        item.classList.remove('active');
        if (i === index) {
            item.classList.add('active');
        }
    });
}

// Função para avançar e retroceder o slide
function changeSlide(step) {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + step + items.length) % items.length; // Garantir índice válido
    showSlide(currentIndex);
}

// Eventos dos botões
document.querySelector('.prev').addEventListener('click', () => changeSlide(-1));
document.querySelector('.next').addEventListener('click', () => changeSlide(1));

// Auto-avançar o carrossel
let autoSlide = setInterval(() => changeSlide(1), 5000);

// Pausar auto-avançar ao interagir
document.querySelector('.carousel').addEventListener('mouseenter', () => {
    clearInterval(autoSlide);
});

document.querySelector('.carousel').addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => changeSlide(1), 5000);
});

// Inicializa o carrossel no índice 0
showSlide(currentIndex);
