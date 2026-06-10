document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Captura TODOS os botões que têm a classe 'btn-whatsapp-rotativo'
    const botoesWhatsapp = document.querySelectorAll('.btn-whatsapp-rotativo');

    // 2. Os números da sua equipe de vendas (DDI 55 + DDD + Número)
    const vendedores = [
        "5511999596666", 
        "5511959668888", 
        "5511998636666"  
    ];

    // 3. A mensagem padrão de contato
    const mensagem = "Olá! Gostaria de receber o catálogo de produtos e entender as condições de fornecimento em atacado.";

    // 4. Aplica a função de clique para cada botão encontrado na página
    botoesWhatsapp.forEach(function(botao) {
        botao.addEventListener('click', function(event) {
            event.preventDefault(); // Evita que a tela pule

            // Sorteia um número
            const numeroSorteado = vendedores[Math.floor(Math.random() * vendedores.length)];
            
            // Monta o link
            const url = `https://wa.me/${numeroSorteado}?text=${encodeURIComponent(mensagem)}`;
            
            // Abre o WhatsApp
            window.open(url, '_blank');
        });
    });
});
document.addEventListener("DOMContentLoaded", function() {
    
    // --- LÓGICA DO SLIDER DE IMAGENS ---
    const slides = document.querySelectorAll('.slide');
    let slideAtual = 0;

    // Só executa se encontrar imagens na página
    if (slides.length > 0) {
        function passarSlide() {
            slides[slideAtual].classList.remove('active');
            slideAtual = (slideAtual + 1) % slides.length;
            slides[slideAtual].classList.add('active');
        }

        // Troca de imagem a cada 4 segundos (4000 milissegundos)
        setInterval(passarSlide, 4000);
    }
    //
// 1. BANCO DE DADOS EM JSON (Sua lista de produtos)

const produtosDeAudio = [
    {
        "sku": "WEI-1001",
        "nome": "Caixa de Som Bluetooth Portátil 50W Pro",
        "preco": "145,00",
        "imagem": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400&auto=format&fit=crop",
        "link": "detalhes-produto.html"
    },
    {
        "sku": "WEI-1002",
        "nome": "Fone de Ouvido Headphone Noise Cancelling",
        "preco": "89,90",
        "imagem": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop",
        "link": "detalhes-produto.html"
    },
    {
        "sku": "WEI-1003",
        "nome": "Microfone Condensador Profissional USB Studio",
        "preco": "210,00",
        "imagem": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop",
        "link": "detalhes-produto.html"
    },
    {
        "sku": "WEI-1004",
        "nome": "Fone Intra-auricular TWS Esportivo",
        "preco": "45,50",
        "imagem": "",
        "link": "detalhes-produto.html"
    }
];

// 2. MOTOR DE RENDERIZAÇÃO
// Localiza a div onde os produtos vão entrar
const vitrine = document.getElementById('vitrine-produtos');

// Verifica se a página atual tem uma vitrine (evita erros em outras páginas)
if (vitrine) {
    
    // Limpa a vitrine por segurança
    vitrine.innerHTML = '';

    // Loop que passa por todos os produtos do JSON
    produtosDeAudio.forEach(produto => {
        
        // Cria a estrutura do cartão injetando as variáveis do JSON (${...})
        const cartaoHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="product-info">
                    <span class="product-sku">Ref: ${produto.sku}</span>
                    <h3 class="product-title">${produto.nome}</h3>
                    
                    <div class="product-bottom">
                        <span class="product-price">R$ ${produto.preco} <span>/unid. no atacado</span></span>
                        <a href="${produto.link}" class="btn-detalhes">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;

        // Joga o cartão pronto dentro do HTML da vitrine
        vitrine.innerHTML += cartaoHTML;
    }
);
}
});