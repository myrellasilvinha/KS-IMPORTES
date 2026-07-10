// ================================
// SCRIPT.JS
// Listagem de produtos - KS IMPORTES
// Produtos vindos do Supabase
// ================================

const cards = document.getElementById("cards");

// Elementos do filtro (só existem em produtos.html)
const inputBusca = document.getElementById("busca");
const selectOrdenar = document.getElementById("ordenar");
const inputPrecoDe = document.getElementById("precoDe");
const inputPrecoAte = document.getElementById("precoAte");
const botaoAplicarFiltros = document.getElementById("aplicarFiltros");
const botaoFiltrosMobile = document.getElementById("botaoFiltrosMobile");
const painelFiltros = document.getElementById("filtros");

const paginaComFiltros = !!(cards && painelFiltros);

let todosProdutos = [];

// ================================
// FORMATAR PREÇO
// ================================

function formatarPreco(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ================================
// CONVERTER TEXTO BR PARA NUMERO (filtro de preço)
// ================================

function converterParaNumero(valorTexto) {

    if (!valorTexto) return NaN;

    const limpo = valorTexto
        .trim()
        .replace(/\./g, "")
        .replace(",", ".");

    return Number(limpo);

}

// ================================
// TRUNCAR TEXTO (descrição no card)
// ================================

function truncarTexto(texto, tamanho) {

    if (!texto) return "";

    if (texto.length <= tamanho) return texto;

    return texto.slice(0, tamanho).trim() + "...";

}

// ================================
// MONTAR HTML DE UM CARD
// ================================

function montarCard(produto) {

    const emPromocao = !!produto.emPromocao;

    const seloDesconto = emPromocao
        ? (() => {
            const desconto = Math.round(
                ((produto.precoAntigo - produto.preco) / produto.precoAntigo) * 100
            );
            return `<span class="desconto">${isNaN(desconto) ? 0 : desconto}% OFF</span>`;
        })()
        : "";

    const precoAntigoHtml = emPromocao
        ? `<span class="antigo">${formatarPreco(produto.precoAntigo)}</span>`
        : "";

    const descricaoHtml = produto.descricao
        ? `<p class="descricao-card">${truncarTexto(produto.descricao, 80)}</p>`
        : "";

    const grupoHtml = produto.grupo
        ? `<span class="grupo-tag-card">${produto.grupo}</span>`
        : "";

    return `
    <div class="card-produto" data-id="${produto.id}">
        ${seloDesconto}
        <img src="${produto.image}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        ${descricaoHtml}
        ${grupoHtml}
        <div class="precos">
            <span class="novo">${formatarPreco(produto.preco)}</span>
            ${precoAntigoHtml}
        </div>
    </div>
    `;

}

// ================================
// RENDERIZAR: DIVIDIDO EM SEÇÕES POR GRUPO
// Usado no index.html (sem filtro) e produtos.html (com filtro)
// ================================

function renderizarAgrupado(lista) {

    cards.innerHTML = "";

    if (!lista || lista.length === 0) {

        cards.innerHTML = `
        <div class="sem-produtos">
            <i class="bi bi-box-seam"></i>
            <h2>Nenhum produto encontrado.</h2>
            ${paginaComFiltros ? "<p>Tente ajustar sua busca ou filtros.</p>" : ""}
        </div>
        `;

        return;

    }

    // Agrupa mantendo a ordem já definida pela ordenação/busca escolhida
    const grupos = new Map();

    lista.forEach(produto => {

        const nomeGrupo = produto.grupo && produto.grupo.trim() !== ""
            ? produto.grupo.trim()
            : "Outros";

        if (!grupos.has(nomeGrupo)) {
            grupos.set(nomeGrupo, []);
        }

        grupos.get(nomeGrupo).push(produto);

    });

    let html = "";

    grupos.forEach((produtosDoGrupo, nomeGrupo) => {

        html += `
        <div class="grupo-secao">
            <h2>${nomeGrupo}</h2>
            <div class="cards-grid">
                ${produtosDoGrupo.map(montarCard).join("")}
            </div>
        </div>
        `;

    });

    cards.innerHTML = html;

    adicionarCliqueProdutos();

}

// ================================
// APLICAR BUSCA, PREÇO E ORDENAÇÃO
// ================================

function aplicarFiltrosEOrdenacao() {

    let lista = [...todosProdutos];

    // ------- BUSCA -------

    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : "";

    if (termo !== "") {
        lista = lista.filter(p =>
            p.nome && p.nome.toLowerCase().includes(termo)
        );
    }

    // ------- PREÇO DE / ATÉ -------

    const de = inputPrecoDe ? converterParaNumero(inputPrecoDe.value) : NaN;
    const ate = inputPrecoAte ? converterParaNumero(inputPrecoAte.value) : NaN;

    if (!isNaN(de)) {
        lista = lista.filter(p => Number(p.preco) >= de);
    }

    if (!isNaN(ate)) {
        lista = lista.filter(p => Number(p.preco) <= ate);
    }

    // ------- ORDENAR -------

    const ordenacao = selectOrdenar ? selectOrdenar.value : "relevancia";

    switch (ordenacao) {

        case "preco-asc":
            lista.sort((a, b) => Number(a.preco) - Number(b.preco));
            break;

        case "preco-desc":
            lista.sort((a, b) => Number(b.preco) - Number(a.preco));
            break;

        case "az":
            lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
            break;

        case "za":
            lista.sort((a, b) => (b.nome || "").localeCompare(a.nome || ""));
            break;

        case "novo":
            lista.sort((a, b) => (b.id || 0) - (a.id || 0));
            break;

        case "antigo":
            lista.sort((a, b) => (a.id || 0) - (b.id || 0));
            break;

        case "vendidos":
            lista.sort((a, b) => (Number(b.vendas) || 0) - (Number(a.vendas) || 0));
            break;

        default:
            // relevância = ordem já vinda do banco (mais recentes primeiro)
            break;

    }

    renderizarAgrupado(lista);

}

// ================================
// BUSCAR PRODUTOS DO SUPABASE
// ================================

async function carregarProdutos() {

    if (!cards) return;

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error("Erro ao buscar produtos:", error);

        cards.innerHTML = `
        <div class="sem-produtos">
            <i class="bi bi-exclamation-triangle"></i>
            <h2>Erro ao carregar produtos.</h2>
        </div>
        `;

        return;

    }

    todosProdutos = data || [];

    if (paginaComFiltros) {
        aplicarFiltrosEOrdenacao();
    } else {
        renderizarAgrupado(todosProdutos);
    }

}

// ================================
// ABRIR PÁGINA DO PRODUTO
// ================================

function adicionarCliqueProdutos() {

    document
        .querySelectorAll(".card-produto")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {
                    const id = card.dataset.id;
                    window.location.href = `produto.html?id=${id}`;
                }
            );

        });

}

// ================================
// EVENTOS DO FILTRO (produtos.html)
// ================================

if (paginaComFiltros) {

    if (inputBusca) {
        inputBusca.addEventListener("input", aplicarFiltrosEOrdenacao);
    }

    if (selectOrdenar) {
        selectOrdenar.addEventListener("change", aplicarFiltrosEOrdenacao);
    }

    if (botaoAplicarFiltros) {
        botaoAplicarFiltros.addEventListener("click", () => {
            aplicarFiltrosEOrdenacao();
            painelFiltros.classList.remove("aberto");
        });
    }

    if (botaoFiltrosMobile) {
        botaoFiltrosMobile.addEventListener("click", () => {
            painelFiltros.classList.toggle("aberto");
        });
    }

}

// ================================
// INICIAR
// ================================

carregarProdutos();
