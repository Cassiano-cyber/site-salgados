document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    alert('Mensagem enviada com sucesso!');
    document.getElementById('contactForm').reset(); // Limpa o formulário
});
