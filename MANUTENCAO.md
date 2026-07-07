# Manutencao do site Wei Import

## Categorias

As categorias do menu sao centralizadas em `script.js`, no array `categoriasMenu`.

Ao criar uma nova categoria:

1. Adicione a entrada no array `categoriasMenu`.
2. Crie a pagina HTML da categoria, se necessario.
3. Use o mesmo valor de `categoria` no `data-categoria` da vitrine e nos produtos em `produtos.js`.

Exemplo:

```html
<div id="vitrine-produtos" class="product-grid" data-categoria="audio"></div>
```

```js
{
    sku: "WEI-0001",
    nome: "Produto exemplo",
    categoria: "audio",
    caixa: "50/unid. na caixa",
    imagem: ""
}
```

## Produtos

Os produtos ficam em `produtos.js`.

Evite cadastrar o mesmo produto varias vezes com o mesmo `sku`, `nome`, `categoria`, `caixa` e `imagem`. O site filtra duplicatas exatas na vitrine, mas manter o arquivo limpo facilita futuras alteracoes.

Se dois produtos tiverem o mesmo SKU por necessidade, mantenha nomes ou categorias claros. A cotacao usa um identificador interno para nao confundir produtos repetidos.

## WhatsApp

Os numeros dos vendedores ficam em `script.js`, no array `vendedores`.

Use o formato com DDI e DDD, sem espacos:

```js
"5511999999999"
```

## Publicacao

O site esta conectado ao GitHub Pages. Depois de alterar e testar, suba as mudancas para o repositorio remoto para conferir no celular:

```bash
git add .
git commit -m "descricao curta da alteracao"
git push
```
