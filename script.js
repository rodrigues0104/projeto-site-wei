document.addEventListener("DOMContentLoaded", function() {
    const vendedores = [
        "5511999596666",
        "5511998636666"
    ];

    const produtosCatalogo = Array.isArray(window.produtosCatalogo)
        ? window.produtosCatalogo
        : [];
    const CHAVE_COTACAO = 'weiProdutosCotacao';

    function normalizarTexto(texto) {
        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function obterTermoBuscaDaUrl() {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get('q') || '';
    }

    function obterPaginaAtual() {
        const partesDoCaminho = window.location.pathname.split('/');
        return (partesDoCaminho.pop() || 'index.html').toLowerCase();
    }

    function irParaPaginaDeBusca(termoBusca) {
        const termoLimpo = String(termoBusca || '').trim();

        if (!termoLimpo) {
            return;
        }

        window.location.href = `busca.html?q=${encodeURIComponent(termoLimpo)}`;
    }

    function carregarCotacao() {
        try {
            const produtos = JSON.parse(localStorage.getItem(CHAVE_COTACAO)) || [];
            return Array.isArray(produtos) ? produtos : [];
        } catch (erro) {
            return [];
        }
    }

    function salvarCotacao(produtos) {
        localStorage.setItem(CHAVE_COTACAO, JSON.stringify(produtos));
    }

    function produtoEstaNaCotacao(sku) {
        return carregarCotacao().some(produto => produto.sku === sku);
    }

    function atualizarContadorCotacao() {
        const quantidade = carregarCotacao().length;

        document.querySelectorAll('.cart-action').forEach(carrinho => {
            let contador = carrinho.querySelector('.cart-count');

            if (!contador) {
                contador = document.createElement('span');
                contador.className = 'cart-count';
                carrinho.appendChild(contador);
            }

            contador.textContent = quantidade;
            contador.hidden = quantidade === 0;
        });

        document.querySelectorAll('.actions .action').forEach(acao => {
            const titulo = acao.querySelector('strong');
            const subtitulo = acao.querySelector('span');

            if (!titulo || !subtitulo || !titulo.textContent.toLowerCase().includes('cota')) {
                return;
            }

            subtitulo.textContent = quantidade === 0
                ? 'Minhas compras'
                : `${quantidade} produto${quantidade > 1 ? 's' : ''}`;
        });
    }

    function atualizarBotoesCotacao() {
        document.querySelectorAll('.btn-cotar-produto').forEach(botao => {
            const selecionado = produtoEstaNaCotacao(botao.dataset.sku);

            botao.classList.toggle('is-selected', selecionado);
            botao.disabled = selecionado;
            botao.setAttribute('aria-pressed', selecionado ? 'true' : 'false');
            botao.textContent = selecionado ? 'Produto cotado' : 'Cotar produto';
        });
    }

    function adicionarProdutoNaCotacao(sku) {
        const produtoSelecionado = produtosCatalogo.find(produto => produto.sku === sku);

        if (!produtoSelecionado || produtoEstaNaCotacao(produtoSelecionado.sku)) {
            return;
        }

        const cotacao = carregarCotacao();
        cotacao.push({
            sku: produtoSelecionado.sku,
            nome: produtoSelecionado.nome,
            caixa: produtoSelecionado.caixa,
            categoria: produtoSelecionado.categoria,
            imagem: produtoSelecionado.imagem
        });

        salvarCotacao(cotacao);
        atualizarContadorCotacao();
        atualizarBotoesCotacao();
    }

    function removerProdutoDaCotacao(sku) {
        const cotacaoAtualizada = carregarCotacao()
            .filter(produto => produto.sku !== sku);

        salvarCotacao(cotacaoAtualizada);
        atualizarContadorCotacao();
        atualizarBotoesCotacao();
        renderizarCotacao();
    }

    function montarImagemProduto(produto) {
        if (produto.imagem) {
            return `<img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">`;
        }

        return '<div class="product-image-placeholder" aria-hidden="true"></div>';
    }

    function montarCardProduto(produto) {
        const produtoSelecionado = produtoEstaNaCotacao(produto.sku);

        return `
            <div class="product-card">
                <div class="product-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="product-info">
                    <span class="product-sku">Cód: ${produto.sku}</span>
                    <h3 class="product-title">${produto.nome}</h3>
                    <p class="product-box">${produto.caixa}</p>
                    <button type="button" class="btn-cotar-produto${produtoSelecionado ? ' is-selected' : ''}" data-sku="${produto.sku}" aria-pressed="${produtoSelecionado ? 'true' : 'false'}" ${produtoSelecionado ? 'disabled' : ''}>${produtoSelecionado ? 'Produto cotado' : 'Cotar produto'}</button>
                </div>
            </div>
        `;
    }

    function filtrarProdutos(produtos, termoBusca) {
        const termoNormalizado = normalizarTexto(termoBusca);

        if (!termoNormalizado) {
            return produtos;
        }

        return produtos.filter(produto => {
            const textoProduto = normalizarTexto(`${produto.sku} ${produto.nome} ${produto.categoria}`);
            return textoProduto.includes(termoNormalizado);
        });
    }

    function renderizarVitrine(vitrine, produtos, termoBusca) {
        const produtosFiltrados = filtrarProdutos(produtos, termoBusca);

        if (produtosFiltrados.length === 0) {
            const mensagem = normalizarTexto(termoBusca)
                ? 'Nenhum produto encontrado para esta busca.'
                : 'Nenhum produto cadastrado nesta categoria.';

            vitrine.innerHTML = `<p class="empty-state">${mensagem}</p>`;
            return;
        }

        vitrine.innerHTML = produtosFiltrados.map(montarCardProduto).join('');
    }

    function configurarBuscaGlobal() {
        const camposBusca = document.querySelectorAll('.search-box input');
        const termoUrl = obterTermoBuscaDaUrl();
        const paginaAtual = obterPaginaAtual();

        camposBusca.forEach(campoBusca => {
            if (paginaAtual === 'busca.html' && termoUrl) {
                campoBusca.value = termoUrl;
            }

            campoBusca.addEventListener('keydown', function(event) {
                if (event.key !== 'Enter') {
                    return;
                }

                event.preventDefault();
                irParaPaginaDeBusca(campoBusca.value);
            });
        });
    }

    function configurarVitrine() {
        const vitrine = document.getElementById('vitrine-produtos');

        if (!vitrine) {
            return;
        }

        const categoriaAtual = vitrine.dataset.categoria || '';
        const produtosDaCategoria = categoriaAtual
            ? produtosCatalogo.filter(produto => produto.categoria === categoriaAtual)
            : produtosCatalogo;
        const campoBusca = document.querySelector('.search-box input');
        const termoInicial = campoBusca ? campoBusca.value : obterTermoBuscaDaUrl();

        renderizarVitrine(vitrine, produtosDaCategoria, termoInicial);

        if (campoBusca) {
            campoBusca.addEventListener('input', function() {
                renderizarVitrine(vitrine, produtosDaCategoria, campoBusca.value);
            });
        }

        vitrine.addEventListener('click', function(event) {
            const botao = event.target.closest('.btn-cotar-produto');

            if (!botao) {
                return;
            }

            adicionarProdutoNaCotacao(botao.dataset.sku);
        });
    }

    function montarItemCotacao(produto) {
        return `
            <article class="quote-item">
                <div class="quote-item-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="quote-item-info">
                    <span class="product-sku">Cód: ${produto.sku}</span>
                    <h3>${produto.nome}</h3>
                    <p>${produto.caixa}</p>
                </div>
                <button type="button" class="btn-remover-cotacao" data-sku="${produto.sku}">Remover</button>
            </article>
        `;
    }

    function renderizarCotacao() {
        const listaCotacao = document.getElementById('lista-cotacao');
        const botaoEnviar = document.getElementById('btn-enviar-whatsapp');

        if (!listaCotacao) {
            return;
        }

        const cotacao = carregarCotacao();

        if (cotacao.length === 0) {
            listaCotacao.innerHTML = '<p class="empty-state">Sua cotação ainda está vazia. Selecione produtos no catálogo para continuar.</p>';
            if (botaoEnviar) {
                botaoEnviar.disabled = true;
            }
            return;
        }

        listaCotacao.innerHTML = cotacao.map(montarItemCotacao).join('');

        if (botaoEnviar) {
            botaoEnviar.disabled = false;
        }
    }

    function montarMensagemCotacao() {
        const cotacao = carregarCotacao();
        const linhasProdutos = cotacao.map(produto => {
            return [
                `Cód: ${produto.sku}`,
                `Produto: ${produto.nome}`,
                `Caixa: ${produto.caixa}`
            ].join('\n');
        }).join('\n\n');

        return `Olá! Gostaria de fazer uma cotação dos produtos abaixo:\n\n${linhasProdutos}`;
    }

    function abrirWhatsappComMensagem(mensagem) {
        const numeroSorteado = vendedores[Math.floor(Math.random() * vendedores.length)];
        const url = `https://wa.me/${numeroSorteado}?text=${encodeURIComponent(mensagem)}`;

        window.open(url, '_blank');
    }

    function configurarCotacao() {
        const listaCotacao = document.getElementById('lista-cotacao');
        const botaoEnviar = document.getElementById('btn-enviar-whatsapp');

        if (!listaCotacao) {
            return;
        }

        renderizarCotacao();

        listaCotacao.addEventListener('click', function(event) {
            const botao = event.target.closest('.btn-remover-cotacao');

            if (!botao) {
                return;
            }

            removerProdutoDaCotacao(botao.dataset.sku);
        });

        if (botaoEnviar) {
            botaoEnviar.addEventListener('click', function() {
                const cotacao = carregarCotacao();

                if (cotacao.length === 0) {
                    return;
                }

                abrirWhatsappComMensagem(montarMensagemCotacao());
            });
        }
    }

    function configurarWhatsappRotativo() {
        const botoesWhatsapp = document.querySelectorAll('.btn-whatsapp-rotativo');
        const mensagem = "Olá! Gostaria de receber o catálogo de produtos e entender as condições de fornecimento em atacado.";

        botoesWhatsapp.forEach(function(botao) {
            botao.addEventListener('click', function(event) {
                event.preventDefault();
                abrirWhatsappComMensagem(mensagem);
            });
        });
    }

    function configurarSlider() {
        const slides = document.querySelectorAll('.slide');
        let slideAtual = 0;

        if (slides.length === 0) {
            return;
        }

        function passarSlide() {
            slides[slideAtual].classList.remove('active');
            slideAtual = (slideAtual + 1) % slides.length;
            slides[slideAtual].classList.add('active');
        }

        setInterval(passarSlide, 4000);
    }

    function configurarMenuMobile() {
        const menu = document.querySelector('.menu');
        const listaMenu = menu ? menu.querySelector('ul') : null;

        if (!menu || !listaMenu || menu.querySelector('.mobile-menu-toggle')) {
            return;
        }

        if (!listaMenu.id) {
            listaMenu.id = 'menu-categorias';
        }

        const botaoMenu = document.createElement('button');
        botaoMenu.type = 'button';
        botaoMenu.className = 'mobile-menu-toggle';
        botaoMenu.setAttribute('aria-expanded', 'false');
        botaoMenu.setAttribute('aria-controls', listaMenu.id);
        botaoMenu.innerHTML = `
            <span><i class="fa-solid fa-bars"></i> Categorias</span>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        `;

        menu.classList.add('has-mobile-menu');
        menu.querySelector('.container').insertBefore(botaoMenu, listaMenu);

        botaoMenu.addEventListener('click', function() {
            const menuAberto = menu.classList.toggle('menu-open');
            botaoMenu.setAttribute('aria-expanded', menuAberto ? 'true' : 'false');
        });

        listaMenu.addEventListener('click', function(event) {
            if (!event.target.closest('a')) {
                return;
            }

            menu.classList.remove('menu-open');
            botaoMenu.setAttribute('aria-expanded', 'false');
        });
    }

    configurarMenuMobile();
    configurarWhatsappRotativo();
    configurarSlider();
    configurarBuscaGlobal();
    configurarVitrine();
    configurarCotacao();
    atualizarContadorCotacao();
});
