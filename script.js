document.addEventListener("DOMContentLoaded", function() {
    const vendedores = [
        "5511999596666",
        "5511998636666"
    ];

    const categoriasMenu = [
        { nome: 'TODAS CATEGORIAS', href: 'catalogo.html', icone: 'fa-solid fa-bars', destaque: true },
        { nome: 'Áudio e Wearables', href: 'catalogo.html?categoria=audio', categoria: 'audio' },
        { nome: 'Automotivo', href: 'catalogo.html?categoria=automotivo', categoria: 'automotivo' },
        { nome: 'Bebê e Infantil', href: 'catalogo.html?categoria=bebe-infantil', categoria: 'bebe-infantil' },
        { nome: 'Beleza e Cuidados Pessoais', href: 'catalogo.html?categoria=beleza', categoria: 'beleza' },
        { nome: 'Camping e Aventura', href: 'catalogo.html?categoria=camping', categoria: 'camping' },
        { nome: 'Casa e Cozinha', href: 'catalogo.html?categoria=cozinha', categoria: 'cozinha' },
        { nome: 'Eletrônicos', href: 'catalogo.html?categoria=eletronicos', categoria: 'eletronicos' },
        { nome: 'Eletroportáteis', href: 'catalogo.html?categoria=eletroportateis', categoria: 'eletroportateis' },
        { nome: 'Ferramentas e Construção', href: 'catalogo.html?categoria=ferramentas', categoria: 'ferramentas' },
        { nome: 'Fitness e Saúde', href: 'catalogo.html?categoria=fitness', categoria: 'fitness' },
        { nome: 'Games e Consoles', href: 'catalogo.html?categoria=games', categoria: 'games' },
        { nome: 'Informática e Acessórios', href: 'catalogo.html?categoria=informatica', categoria: 'informatica' },
        { nome: 'Intimidade e Bem-Estar', href: 'catalogo.html?categoria=intimidade', categoria: 'intimidade' },
        { nome: 'Pet Shop', href: 'catalogo.html?categoria=pet-shop', categoria: 'pet-shop' },
        { nome: 'Utilidades Domésticas', href: 'catalogo.html?categoria=utilidades', categoria: 'utilidades' }
    ];

    const produtosCatalogoOriginais = Array.isArray(window.produtosCatalogo)
        ? window.produtosCatalogo
        : [];
    const produtosCatalogo = prepararProdutosCatalogo(produtosCatalogoOriginais);
    const CHAVE_COTACAO = 'weiProdutosCotacao';
    const produtosPorId = new Map(produtosCatalogo.map(produto => [produto.idCotacao, produto]));
    const produtosPorSku = new Map(produtosCatalogo.map(produto => [produto.sku, produto]));

    function prepararProdutosCatalogo(produtos) {
        const produtosUnicos = [];
        const chavesVistas = new Set();

        produtos.forEach((produto, indice) => {
            const chaveProduto = [
                produto.sku,
                produto.nome,
                produto.categoria,
                produto.caixa,
                produto.imagem || ''
            ].join('|');

            if (chavesVistas.has(chaveProduto)) {
                return;
            }

            chavesVistas.add(chaveProduto);
            produtosUnicos.push({
                ...produto,
                idCotacao: produto.imagem || produto.sku || `produto-${indice}`
            });
        });

        return produtosUnicos;
    }

    function normalizarTexto(texto) {
        return String(texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function obterNomeCategoria(categoria) {
        const categoriaEncontrada = categoriasMenu.find(item => item.categoria === categoria);
        return categoriaEncontrada ? categoriaEncontrada.nome : categoria;
    }

    function obterCategoriaDaUrl() {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get('categoria') || '';
    }

    function atualizarCabecalhoCategoria(categoria) {
        const categoriaEncontrada = categoriasMenu.find(item => item.categoria === categoria);
        const cabecalho = document.querySelector('.category-header');

        if (!categoriaEncontrada || !cabecalho) {
            return;
        }

        const titulo = cabecalho.querySelector('h2');
        const descricao = cabecalho.querySelector('p');

        if (titulo) {
            titulo.textContent = `Catálogo de ${categoriaEncontrada.nome}`;
        }
        if (descricao) {
            descricao.textContent = 'Vendemos a partir de uma caixa, somente caixa fechada.';
        }
        document.title = `${categoriaEncontrada.nome} - Wei Import`;
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
            const produtosSalvos = JSON.parse(localStorage.getItem(CHAVE_COTACAO)) || [];

            if (!Array.isArray(produtosSalvos)) {
                return [];
            }

            return produtosSalvos.flatMap(produtoSalvo => {
                const produtoAtual = produtosPorId.get(String(produtoSalvo.idCotacao || ''))
                    || produtosPorSku.get(String(produtoSalvo.sku || ''));

                if (!produtoAtual) {
                    return [];
                }

                return [{
                    idCotacao: produtoAtual.idCotacao,
                    sku: produtoAtual.sku,
                    nome: produtoAtual.nome,
                    caixa: produtoAtual.caixa,
                    categoria: produtoAtual.categoria,
                    imagem: produtoAtual.imagem
                }];
            });
        } catch (erro) {
            return [];
        }
    }

    function salvarCotacao(produtos) {
        localStorage.setItem(CHAVE_COTACAO, JSON.stringify(produtos));
    }

    function produtoEstaNaCotacao(produtoId) {
        return carregarCotacao().some(produto => (produto.idCotacao || produto.sku) === produtoId);
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
            const selecionado = produtoEstaNaCotacao(botao.dataset.produtoId);

            botao.classList.toggle('is-selected', selecionado);
            botao.disabled = selecionado;
            botao.setAttribute('aria-pressed', selecionado ? 'true' : 'false');
            botao.textContent = selecionado ? 'Produto cotado' : 'Cotar produto';
        });
    }

    function adicionarProdutoNaCotacao(produtoId) {
        const produtoSelecionado = produtosCatalogo.find(produto => produto.idCotacao === produtoId);

        if (!produtoSelecionado || produtoEstaNaCotacao(produtoSelecionado.idCotacao)) {
            return;
        }

        const cotacao = carregarCotacao();
        cotacao.push({
            idCotacao: produtoSelecionado.idCotacao,
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

    function removerProdutoDaCotacao(produtoId) {
        const cotacaoAtualizada = carregarCotacao()
            .filter(produto => (produto.idCotacao || produto.sku) !== produtoId);

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
        const produtoSelecionado = produtoEstaNaCotacao(produto.idCotacao);

        return `
            <div class="product-card">
                <div class="product-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="product-info">
                    <span class="product-sku">Cód: ${produto.sku}</span>
                    <h3 class="product-title">${produto.nome}</h3>
                    <p class="product-category">Categoria: ${obterNomeCategoria(produto.categoria)}</p>
                    <p class="product-box">${produto.caixa}</p>
                    <button type="button" class="btn-cotar-produto${produtoSelecionado ? ' is-selected' : ''}" data-produto-id="${produto.idCotacao}" aria-pressed="${produtoSelecionado ? 'true' : 'false'}" ${produtoSelecionado ? 'disabled' : ''}>${produtoSelecionado ? 'Produto cotado' : 'Cotar produto'}</button>
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

        const categoriaSolicitada = vitrine.dataset.categoria || obterCategoriaDaUrl();
        const categoriaAtual = categoriasMenu.some(item => item.categoria === categoriaSolicitada)
            ? categoriaSolicitada
            : '';
        const produtosDaCategoria = categoriaAtual
            ? produtosCatalogo.filter(produto => produto.categoria === categoriaAtual)
            : produtosCatalogo;
        const campoBusca = document.querySelector('.search-box input');
        const termoInicial = campoBusca ? campoBusca.value : obterTermoBuscaDaUrl();

        atualizarCabecalhoCategoria(categoriaAtual);

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

            adicionarProdutoNaCotacao(botao.dataset.produtoId);
        });
    }

    function montarItemCotacao(produto) {
        const produtoId = produto.idCotacao || produto.sku;

        return `
            <article class="quote-item">
                <div class="quote-item-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="quote-item-info">
                    <span class="product-sku">Cód: ${produto.sku}</span>
                    <h3>${produto.nome}</h3>
                    <p>Categoria: ${obterNomeCategoria(produto.categoria)}</p>
                    <p>${produto.caixa}</p>
                </div>
                <button type="button" class="btn-remover-cotacao" data-produto-id="${produtoId}">Remover</button>
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
                `Categoria: ${obterNomeCategoria(produto.categoria)}`,
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

            removerProdutoDaCotacao(botao.dataset.produtoId);
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

    function montarItemMenu(categoria) {
        const classeItem = categoria.destaque ? ' class="menu-header"' : '';
        const icone = categoria.icone ? `<i class="${categoria.icone}"></i>` : '';

        return `
            <li${classeItem}>
                <a href="${categoria.href}">
                    ${icone}
                    <span>${categoria.nome}</span>
                </a>
            </li>
        `;
    }

    function configurarMenuCategorias() {
        document.querySelectorAll('.menu ul').forEach(listaMenu => {
            listaMenu.innerHTML = categoriasMenu.map(montarItemMenu).join('');
        });
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

    salvarCotacao(carregarCotacao());
    configurarMenuCategorias();
    configurarMenuMobile();
    configurarWhatsappRotativo();
    configurarSlider();
    configurarBuscaGlobal();
    configurarVitrine();
    configurarCotacao();
    atualizarContadorCotacao();
});
