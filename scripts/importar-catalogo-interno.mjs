import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const raizSite = dirname(dirname(fileURLToPath(import.meta.url)));
const raizOneDrive = resolve(raizSite, "..", "..");
const raizInterno = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(raizOneDrive, "Documentos", "Site_interno_wei", "sistema-interno-wei");

const categoriasPublicas = new Map([
    ["Audio e Wearables", "audio"],
    ["Automotivo", "automotivo"],
    ["Bebe e Infantil", "bebe-infantil"],
    ["Beleza e Cuidados Pessoais", "beleza"],
    ["Camping e Aventura", "camping"],
    ["Casa e Cozinha", "cozinha"],
    ["Eletronicos", "eletronicos"],
    ["Eletroportateis", "eletroportateis"],
    ["Ferramentas e Construcao", "ferramentas"],
    ["Fitness e Saude", "fitness"],
    ["Games e Consoles", "games"],
    ["Informatica e Acessorios", "informatica"],
    ["Intimidade e Bem-Estar", "intimidade"],
    ["Pet Shop", "pet-shop"],
    ["Utilidades Domesticas", "utilidades"]
]);

const arquivoCatalogo = resolve(raizInterno, "lib", "catalogo-produtos.json");
const raizPublicaInterna = resolve(raizInterno, "public");
const destinoImagens = resolve(raizSite, "imagens", "produtos");
const arquivoProdutos = resolve(raizSite, "produtos.js");
const catalogoInterno = JSON.parse(await readFile(arquivoCatalogo, "utf8"));

if (!Array.isArray(catalogoInterno) || catalogoInterno.length === 0) {
    throw new Error("O catalogo interno esta vazio ou possui formato invalido.");
}

const skus = new Set();
const produtosPublicos = [];

for (const [indice, produto] of catalogoInterno.entries()) {
    const skuEsperado = String(indice + 1).padStart(2, "0");
    const categoria = categoriasPublicas.get(produto.categoria);

    if (produto.sku !== skuEsperado) {
        throw new Error(`Sequencia de SKU invalida: esperado ${skuEsperado}, recebido ${produto.sku}.`);
    }

    if (skus.has(produto.sku)) {
        throw new Error(`SKU duplicado: ${produto.sku}.`);
    }

    if (!categoria) {
        throw new Error(`Categoria sem correspondencia publica: ${produto.categoria}.`);
    }

    if (!Number.isInteger(produto.unidadesPorCaixa) || produto.unidadesPorCaixa < 1) {
        throw new Error(`Quantidade por caixa invalida no SKU ${produto.sku}.`);
    }

    const caminhoRelativoImagem = String(produto.imagem || "").replace(/^[/\\]+/, "");
    const origemImagem = resolve(raizPublicaInterna, caminhoRelativoImagem);
    const caminhoDentroDaRaiz = relative(raizPublicaInterna, origemImagem);

    if (!caminhoRelativoImagem || caminhoDentroDaRaiz.startsWith("..") || isAbsolute(caminhoDentroDaRaiz)) {
        throw new Error(`Caminho de imagem invalido no SKU ${produto.sku}.`);
    }

    const nomeImagem = basename(origemImagem);

    skus.add(produto.sku);
    produtosPublicos.push({
        sku: produto.sku,
        nome: produto.nome,
        categoria,
        caixa: `${produto.unidadesPorCaixa} unid. por caixa`,
        imagem: `imagens/produtos/${nomeImagem}`
    });
}

if (dirname(destinoImagens) !== resolve(raizSite, "imagens")) {
    throw new Error(`Destino inesperado para as imagens: ${destinoImagens}`);
}

await rm(destinoImagens, { recursive: true, force: true });
await mkdir(destinoImagens, { recursive: true });

for (const produto of catalogoInterno) {
    const origemImagem = resolve(raizPublicaInterna, String(produto.imagem).replace(/^[/\\]+/, ""));
    const destinoImagem = resolve(destinoImagens, basename(origemImagem));
    await copyFile(origemImagem, destinoImagem);
}

const conteudoProdutos = `// Gerado por scripts/importar-catalogo-interno.mjs. Nao edite manualmente.\nwindow.produtosCatalogo = ${JSON.stringify(produtosPublicos, null, 4)};\n`;
await writeFile(arquivoProdutos, conteudoProdutos, "utf8");

console.log(`${produtosPublicos.length} produtos importados sem valores.`);
console.log(`Imagens copiadas para: ${destinoImagens.split(sep).join("/")}`);
