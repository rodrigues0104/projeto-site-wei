document.addEventListener('DOMContentLoaded', function() {
    const vendedores = [
        '5511999596666',
        '5511998636666'
    ];

    const categoriasMenu = [
        { nome: 'Todas as categorias', href: 'catalogo.html', icone: 'fa-solid fa-bars', destaque: true },
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

    const CHAVE_COTACAO = 'weiProdutosCotacao';
    const LIMITE_COTACAO = 10;
    const produtosCatalogoOriginais = Array.isArray(window.produtosCatalogo)
        ? window.produtosCatalogo
        : [];
    const produtosCatalogo = prepararProdutosCatalogo(produtosCatalogoOriginais);
    const produtosPorId = new Map(produtosCatalogo.map(produto => [produto.idCotacao, produto]));
    const produtosPorSku = new Map(produtosCatalogo.map(produto => [produto.sku, produto]));
    let temporizadorNotificacao;

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
                idCotacao: String(produto.imagem || produto.sku || `produto-${indice}`)
            });
        });

        return produtosUnicos;
    }

    function escaparHtml(valor) {
        return String(valor || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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

    function obterCategoriaAtual() {
        const vitrine = document.getElementById('vitrine-produtos');
        return (vitrine && vitrine.dataset.categoria) || obterCategoriaDaUrl();
    }

    function obterTermoBuscaDaUrl() {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get('q') || '';
    }

    function obterPaginaAtual() {
        const partesDoCaminho = window.location.pathname.split('/');
        return (partesDoCaminho.pop() || 'index.html').toLowerCase();
    }

    function atualizarCabecalhoCategoria(categoria) {
        const categoriaEncontrada = categoriasMenu.find(item => item.categoria === categoria);
        const cabecalho = document.querySelector('.category-header');

        if (!categoriaEncontrada || !cabecalho) {
            return;
        }

        const titulo = cabecalho.querySelector('h1, h2');
        const descricao = cabecalho.querySelector('p');

        if (titulo) {
            titulo.textContent = categoriaEncontrada.nome;
        }
        if (descricao) {
            descricao.textContent = 'Produtos disponíveis para compra no atacado, sempre em caixa fechada.';
        }
        document.title = `${categoriaEncontrada.nome} | Wei Import`;
    }

    function atualizarCabecalhoBusca(termoBusca) {
        if (obterPaginaAtual() !== 'busca.html') {
            return;
        }

        const cabecalho = document.querySelector('.category-header');
        const titulo = cabecalho ? cabecalho.querySelector('h1, h2') : null;
        const descricao = cabecalho ? cabecalho.querySelector('p') : null;

        if (titulo) {
            titulo.textContent = termoBusca ? `Resultados para “${termoBusca}”` : 'Busca de produtos';
        }
        if (descricao) {
            descricao.textContent = termoBusca
                ? 'Confira os itens encontrados no catálogo Wei Import.'
                : 'Digite um produto ou código no campo de busca.';
        }
    }

    function prepararCabecalhoPagina() {
        const cabecalho = document.querySelector('.category-header');

        if (!cabecalho || cabecalho.querySelector('.section-eyebrow')) {
            return;
        }

        const marcador = document.createElement('span');
        marcador.className = 'section-eyebrow';
        marcador.textContent = document.getElementById('lista-cotacao')
            ? 'Solicitação comercial'
            : 'Catálogo atacadista';
        cabecalho.insertBefore(marcador, cabecalho.firstChild);
    }

    function irParaPaginaDeBusca(termoBusca) {
        const termoLimpo = String(termoBusca || '').trim();

        if (!termoLimpo) {
            return;
        }

        window.location.href = `busca.html?q=${encodeURIComponent(termoLimpo)}`;
    }

    function normalizarProdutoSalvo(produtoAtual) {
        return {
            idCotacao: produtoAtual.idCotacao,
            sku: produtoAtual.sku,
            nome: produtoAtual.nome,
            caixa: produtoAtual.caixa,
            categoria: produtoAtual.categoria,
            imagem: produtoAtual.imagem
        };
    }

    function carregarCotacao() {
        try {
            const produtosSalvos = JSON.parse(localStorage.getItem(CHAVE_COTACAO)) || [];

            if (!Array.isArray(produtosSalvos)) {
                return [];
            }

            const cotacaoValida = [];
            const idsVistos = new Set();

            for (const produtoSalvo of produtosSalvos) {
                const produtoAtual = produtosPorId.get(String(produtoSalvo.idCotacao || ''))
                    || produtosPorSku.get(String(produtoSalvo.sku || ''));

                if (!produtoAtual || idsVistos.has(produtoAtual.idCotacao)) {
                    continue;
                }

                idsVistos.add(produtoAtual.idCotacao);
                cotacaoValida.push(normalizarProdutoSalvo(produtoAtual));

                if (cotacaoValida.length === LIMITE_COTACAO) {
                    break;
                }
            }

            return cotacaoValida;
        } catch (erro) {
            return [];
        }
    }

    function salvarCotacao(produtos) {
        try {
            localStorage.setItem(CHAVE_COTACAO, JSON.stringify(produtos.slice(0, LIMITE_COTACAO)));
        } catch (erro) {
            mostrarNotificacao('Não foi possível salvar sua cotação neste navegador.', 'erro');
        }
    }

    function produtoEstaNaCotacao(produtoId) {
        return carregarCotacao().some(produto => produto.idCotacao === produtoId);
    }

    function mostrarNotificacao(mensagem, tipo) {
        let notificacao = document.querySelector('.site-notification');

        if (!notificacao) {
            notificacao = document.createElement('div');
            notificacao.className = 'site-notification';
            notificacao.setAttribute('role', 'status');
            notificacao.setAttribute('aria-live', 'polite');
            document.body.appendChild(notificacao);
        }

        const icone = tipo === 'erro' ? 'fa-circle-exclamation' : 'fa-circle-check';
        notificacao.className = `site-notification site-notification-${tipo || 'sucesso'}`;
        notificacao.innerHTML = `<i class="fa-solid ${icone}" aria-hidden="true"></i><span>${escaparHtml(mensagem)}</span>`;

        window.clearTimeout(temporizadorNotificacao);
        window.requestAnimationFrame(() => notificacao.classList.add('is-visible'));
        temporizadorNotificacao = window.setTimeout(() => {
            notificacao.classList.remove('is-visible');
        }, 3200);
    }

    function atualizarContadorCotacao() {
        const quantidade = carregarCotacao().length;
        const percentual = Math.min((quantidade / LIMITE_COTACAO) * 100, 100);

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

            if (!titulo || !subtitulo || !normalizarTexto(titulo.textContent).includes('cotacao')) {
                return;
            }

            acao.classList.add('quote-action');
            subtitulo.textContent = `${quantidade} de ${LIMITE_COTACAO} produtos`;
        });

        document.querySelectorAll('[data-quote-count]').forEach(elemento => {
            elemento.textContent = quantidade;
        });

        document.querySelectorAll('[data-quote-limit]').forEach(elemento => {
            elemento.textContent = LIMITE_COTACAO;
        });

        document.querySelectorAll('[data-quote-progress]').forEach(elemento => {
            elemento.style.width = `${percentual}%`;
        });

        document.querySelectorAll('.quote-meter').forEach(medidor => {
            medidor.classList.toggle('is-full', quantidade >= LIMITE_COTACAO);
        });
    }

    function obterConteudoBotaoCotacao(selecionado, limiteAtingido) {
        if (selecionado) {
            return '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Selecionado</span>';
        }

        if (limiteAtingido) {
            return '<i class="fa-solid fa-lock" aria-hidden="true"></i><span>Limite atingido</span>';
        }

        return '<i class="fa-solid fa-plus" aria-hidden="true"></i><span>Adicionar à cotação</span>';
    }

    function atualizarBotoesCotacao() {
        const cotacao = carregarCotacao();
        const idsSelecionados = new Set(cotacao.map(produto => produto.idCotacao));
        const limiteAtingido = cotacao.length >= LIMITE_COTACAO;

        document.querySelectorAll('.btn-cotar-produto').forEach(botao => {
            const selecionado = idsSelecionados.has(botao.dataset.produtoId);
            const bloqueadoPeloLimite = limiteAtingido && !selecionado;

            botao.classList.toggle('is-selected', selecionado);
            botao.classList.toggle('is-limit-reached', bloqueadoPeloLimite);
            botao.disabled = selecionado;
            botao.setAttribute('aria-pressed', selecionado ? 'true' : 'false');
            botao.setAttribute('aria-disabled', selecionado || bloqueadoPeloLimite ? 'true' : 'false');
            botao.title = bloqueadoPeloLimite ? 'Remova um produto da cotação para adicionar outro.' : '';
            botao.innerHTML = obterConteudoBotaoCotacao(selecionado, bloqueadoPeloLimite);
        });
    }

    function adicionarProdutoNaCotacao(produtoId) {
        const produtoSelecionado = produtosPorId.get(produtoId);
        const cotacao = carregarCotacao();

        if (!produtoSelecionado || cotacao.some(produto => produto.idCotacao === produtoSelecionado.idCotacao)) {
            return;
        }

        if (cotacao.length >= LIMITE_COTACAO) {
            mostrarNotificacao('Sua cotação já possui o limite de 10 produtos.', 'erro');
            return;
        }

        cotacao.push(normalizarProdutoSalvo(produtoSelecionado));
        salvarCotacao(cotacao);
        atualizarContadorCotacao();
        atualizarBotoesCotacao();
        mostrarNotificacao('Produto adicionado à cotação.', 'sucesso');
    }

    function removerProdutoDaCotacao(produtoId) {
        const cotacaoAtualizada = carregarCotacao()
            .filter(produto => produto.idCotacao !== produtoId);

        salvarCotacao(cotacaoAtualizada);
        atualizarContadorCotacao();
        atualizarBotoesCotacao();
        renderizarCotacao();
        mostrarNotificacao('Produto removido da cotação.', 'sucesso');
    }

    function montarImagemProduto(produto) {
        if (produto.imagem) {
            return `<img src="${escaparHtml(produto.imagem)}" alt="${escaparHtml(produto.nome)}" loading="lazy">`;
        }

        return '<div class="product-image-placeholder" aria-hidden="true"><i class="fa-regular fa-image"></i></div>';
    }

    function montarCardProduto(produto, idsSelecionados, limiteAtingido) {
        const produtoSelecionado = idsSelecionados.has(produto.idCotacao);
        const bloqueadoPeloLimite = limiteAtingido && !produtoSelecionado;
        const classesBotao = [
            'btn-cotar-produto',
            produtoSelecionado ? 'is-selected' : '',
            bloqueadoPeloLimite ? 'is-limit-reached' : ''
        ].filter(Boolean).join(' ');

        return `
            <article class="product-card">
                <div class="product-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="product-info">
                    <div class="product-topline">
                        <span class="product-category">${escaparHtml(obterNomeCategoria(produto.categoria))}</span>
                        <span class="product-sku">Cód. ${escaparHtml(produto.sku)}</span>
                    </div>
                    <h3 class="product-title">${escaparHtml(produto.nome)}</h3>
                    <p class="product-box"><i class="fa-solid fa-box-open" aria-hidden="true"></i>${escaparHtml(produto.caixa)}</p>
                    <button type="button" class="${classesBotao}" data-produto-id="${escaparHtml(produto.idCotacao)}" aria-pressed="${produtoSelecionado ? 'true' : 'false'}" aria-disabled="${produtoSelecionado || bloqueadoPeloLimite ? 'true' : 'false'}" ${produtoSelecionado ? 'disabled' : ''}>
                        ${obterConteudoBotaoCotacao(produtoSelecionado, bloqueadoPeloLimite)}
                    </button>
                </div>
            </article>
        `;
    }

    function filtrarProdutos(produtos, termoBusca) {
        const termoNormalizado = normalizarTexto(termoBusca);

        if (!termoNormalizado) {
            return produtos;
        }

        return produtos.filter(produto => {
            const textoProduto = normalizarTexto(`${produto.sku} ${produto.nome} ${produto.categoria} ${obterNomeCategoria(produto.categoria)}`);
            return textoProduto.includes(termoNormalizado);
        });
    }

    function prepararBarraCatalogo(vitrine) {
        if (vitrine.parentElement.querySelector('.catalog-toolbar')) {
            return;
        }

        const barra = document.createElement('div');
        barra.className = 'catalog-toolbar';
        barra.innerHTML = `
            <div class="catalog-results" aria-live="polite">
                <strong data-results-count>0</strong>
                <span data-results-label>produtos encontrados</span>
            </div>
            <a href="cotacao.html" class="quote-meter" aria-label="Abrir minha cotação">
                <span class="quote-meter-icon"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i></span>
                <span class="quote-meter-copy">
                    <small>Minha cotação</small>
                    <strong><span data-quote-count>0</span> de <span data-quote-limit>${LIMITE_COTACAO}</span> produtos</strong>
                </span>
                <span class="quote-meter-track" aria-hidden="true"><span data-quote-progress></span></span>
                <i class="fa-solid fa-chevron-right quote-meter-arrow" aria-hidden="true"></i>
            </a>
        `;
        vitrine.parentElement.insertBefore(barra, vitrine);
    }

    function atualizarContagemResultados(quantidade, termoBusca) {
        const total = document.querySelector('[data-results-count]');
        const rotulo = document.querySelector('[data-results-label]');

        if (total) {
            total.textContent = quantidade;
        }
        if (rotulo) {
            rotulo.textContent = termoBusca
                ? `resultado${quantidade === 1 ? '' : 's'} para sua busca`
                : `produto${quantidade === 1 ? '' : 's'} disponível${quantidade === 1 ? '' : 'is'}`;
        }
    }

    function renderizarVitrine(vitrine, produtos, termoBusca) {
        const produtosFiltrados = filtrarProdutos(produtos, termoBusca);
        const cotacao = carregarCotacao();
        const idsSelecionados = new Set(cotacao.map(produto => produto.idCotacao));
        const limiteAtingido = cotacao.length >= LIMITE_COTACAO;

        atualizarContagemResultados(produtosFiltrados.length, termoBusca);

        if (produtosFiltrados.length === 0) {
            const mensagem = normalizarTexto(termoBusca)
                ? 'Nenhum produto encontrado para esta busca.'
                : 'Nenhum produto cadastrado nesta categoria.';

            vitrine.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open" aria-hidden="true"></i><strong>${mensagem}</strong><span>Tente outro termo ou explore uma categoria diferente.</span></div>`;
            return;
        }

        vitrine.innerHTML = produtosFiltrados
            .map(produto => montarCardProduto(produto, idsSelecionados, limiteAtingido))
            .join('');
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

        document.body.classList.add('store-page');
        prepararBarraCatalogo(vitrine);

        const categoriaSolicitada = obterCategoriaAtual();
        const categoriaAtual = categoriasMenu.some(item => item.categoria === categoriaSolicitada)
            ? categoriaSolicitada
            : '';
        const produtosDaCategoria = categoriaAtual
            ? produtosCatalogo.filter(produto => produto.categoria === categoriaAtual)
            : produtosCatalogo;
        const campoBusca = document.querySelector('.search-box input');
        const termoInicial = campoBusca ? campoBusca.value : obterTermoBuscaDaUrl();

        atualizarCabecalhoCategoria(categoriaAtual);
        atualizarCabecalhoBusca(termoInicial);
        renderizarVitrine(vitrine, produtosDaCategoria, termoInicial);
        atualizarContadorCotacao();

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

    function montarItemCotacao(produto, indice) {
        return `
            <article class="quote-item">
                <span class="quote-item-number">${String(indice + 1).padStart(2, '0')}</span>
                <div class="quote-item-image">
                    ${montarImagemProduto(produto)}
                </div>
                <div class="quote-item-info">
                    <div class="product-topline">
                        <span class="product-category">${escaparHtml(obterNomeCategoria(produto.categoria))}</span>
                        <span class="product-sku">Cód. ${escaparHtml(produto.sku)}</span>
                    </div>
                    <h3>${escaparHtml(produto.nome)}</h3>
                    <p><i class="fa-solid fa-box-open" aria-hidden="true"></i>${escaparHtml(produto.caixa)}</p>
                </div>
                <button type="button" class="btn-remover-cotacao" data-produto-id="${escaparHtml(produto.idCotacao)}" aria-label="Remover ${escaparHtml(produto.nome)} da cotação">
                    <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                    <span>Remover</span>
                </button>
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
            listaCotacao.innerHTML = `
                <div class="empty-state quote-empty-state">
                    <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i>
                    <strong>Sua cotação está vazia</strong>
                    <span>Escolha os produtos no catálogo para montar sua solicitação.</span>
                    <a href="catalogo.html" class="btn-primary">Explorar catálogo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
                </div>
            `;
            if (botaoEnviar) {
                botaoEnviar.disabled = true;
            }
            atualizarContadorCotacao();
            return;
        }

        listaCotacao.innerHTML = cotacao.map(montarItemCotacao).join('');

        if (botaoEnviar) {
            botaoEnviar.disabled = false;
        }

        atualizarContadorCotacao();
    }

    function montarMensagemCotacao() {
        const cotacao = carregarCotacao();
        const linhasProdutos = cotacao.map((produto, indice) => {
            return [
                `${indice + 1}. Cód: ${produto.sku}`,
                `Produto: ${produto.nome}`,
                `Categoria: ${obterNomeCategoria(produto.categoria)}`,
                `Caixa: ${produto.caixa}`
            ].join('\n');
        }).join('\n\n');

        return `Olá! Gostaria de fazer uma cotação de ${cotacao.length} produto${cotacao.length === 1 ? '' : 's'}:\n\n${linhasProdutos}`;
    }

    function abrirWhatsappComMensagem(mensagem) {
        const numeroSorteado = vendedores[Math.floor(Math.random() * vendedores.length)];
        const url = `https://wa.me/${numeroSorteado}?text=${encodeURIComponent(mensagem)}`;
        const novaJanela = window.open(url, '_blank', 'noopener,noreferrer');

        if (novaJanela) {
            novaJanela.opener = null;
        }
    }

    function configurarCotacao() {
        const listaCotacao = document.getElementById('lista-cotacao');
        const botaoEnviar = document.getElementById('btn-enviar-whatsapp');

        if (!listaCotacao) {
            return;
        }

        document.body.classList.add('quote-page-view');
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
                if (carregarCotacao().length === 0) {
                    return;
                }

                abrirWhatsappComMensagem(montarMensagemCotacao());
            });
        }
    }

    function configurarWhatsappRotativo() {
        const botoesWhatsapp = document.querySelectorAll('.btn-whatsapp-rotativo');
        const mensagem = 'Olá! Gostaria de conhecer o catálogo e as condições de fornecimento no atacado.';

        botoesWhatsapp.forEach(botao => {
            botao.addEventListener('click', function(event) {
                event.preventDefault();
                abrirWhatsappComMensagem(mensagem);
            });
        });
    }

    function configurarSlider() {
        const slides = document.querySelectorAll('.slide');
        let slideAtual = 0;

        if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        window.setInterval(function() {
            slides[slideAtual].classList.remove('active');
            slideAtual = (slideAtual + 1) % slides.length;
            slides[slideAtual].classList.add('active');
        }, 5000);
    }

    function montarItemMenu(categoria) {
        const categoriaAtual = obterCategoriaAtual();
        const paginaAtual = obterPaginaAtual();
        const itemTodasCategorias = categoria.destaque && paginaAtual === 'catalogo.html' && !categoriaAtual;
        const itemCategoriaAtual = categoria.categoria && categoria.categoria === categoriaAtual;
        const itemAtivo = itemTodasCategorias || itemCategoriaAtual;
        const classeItem = [
            categoria.destaque ? 'menu-header' : '',
            itemAtivo ? 'is-active' : ''
        ].filter(Boolean).join(' ');
        const atributoClasse = classeItem ? ` class="${classeItem}"` : '';
        const icone = categoria.icone ? `<i class="${categoria.icone}" aria-hidden="true"></i>` : '';
        const ariaAtual = itemAtivo ? ' aria-current="page"' : '';

        return `<li${atributoClasse}><a href="${categoria.href}"${ariaAtual}>${icone}<span>${categoria.nome}</span></a></li>`;
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
        botaoMenu.innerHTML = '<span><i class="fa-solid fa-bars" aria-hidden="true"></i> Categorias</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';

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

    function configurarRodape() {
        if (document.querySelector('.site-footer')) {
            return;
        }

        const rodape = document.createElement('footer');
        rodape.className = 'site-footer';
        rodape.innerHTML = `
            <div class="container site-footer-main">
                <a href="index.html" class="site-footer-brand" aria-label="Página inicial da Wei Import"><img src="imagens/1.png" alt="Wei Import"></a>
                <p>Importados no atacado, com estoque no Brasil e atendimento próximo.</p>
                <nav class="site-footer-links" aria-label="Links do rodapé">
                    <a href="catalogo.html">Catálogo</a>
                    <a href="cotacao.html">Minha cotação</a>
                    <a href="#" class="btn-whatsapp-rotativo">Atendimento</a>
                </nav>
            </div>
            <div class="container site-footer-bottom">© ${new Date().getFullYear()} Wei Import. Todos os direitos reservados.</div>
        `;
        document.body.appendChild(rodape);
    }

    prepararCabecalhoPagina();
    salvarCotacao(carregarCotacao());
    configurarMenuCategorias();
    configurarMenuMobile();
    configurarRodape();
    configurarWhatsappRotativo();
    configurarSlider();
    configurarBuscaGlobal();
    configurarVitrine();
    configurarCotacao();
    atualizarContadorCotacao();
    atualizarBotoesCotacao();
});
