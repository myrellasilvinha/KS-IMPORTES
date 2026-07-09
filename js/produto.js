const produtoPage = document.getElementById("produtoPage");
const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function pegarIdDaUrl() {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("id"));
}

function renderizarProduto() {
    const id = pegarIdDaUrl();
    const produto = produtos.find(p => p.id === id);
    if (!produto) {

        produtoPage.innerHTML = `
            <div class="sem-produtos">
                <i class="bi bi-box-seam"></i>
                <h2>Produto não encontrado.</h2>
            </div>
        `;
        return;
    }

    const desconto = Math.round(
        ((produto.precoAntigo - produto.preco) /
            produto.precoAntigo) * 100
    );

    produtoPage.innerHTML = `
        <div class="produto-imagem">
            <span class="desconto">
                ${desconto}% OFF
            </span>
            <img src="${produto.imagem}" alt="${produto.nome}">
        </div>
        <div class="produto-info">
            <h1>${produto.nome}</h1>
            <div class="precos-produto">
                <span class="novo">
                    ${formatarPreco(produto.preco)}
                </span>
                <span class="antigo">
                    ${formatarPreco(produto.precoAntigo)}
                </span>
            </div>
            <button class="botao-comprar" id="comprar">
                Comprar
            </button>

        </div>
    `;

    document
        .getElementById("comprar")
        .addEventListener("click", () => {

            alert(`Compra iniciada de "${produto.nome}"`);

        });

}

renderizarProduto();