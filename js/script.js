const cards = document.getElementById("cards");

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarProdutos() {

    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    cards.innerHTML = "";

    if (produtos.length === 0) {
        cards.innerHTML = `
            <div class="sem-produtos">
                <i class="bi bi-box-seam"></i>
                <h2>Nenhum produto cadastrado.</h2>
            </div>
        `;
        return;
    }

    produtos.forEach(produto => {

        const desconto = Math.round(
            ((produto.precoAntigo - produto.preco) /
            produto.precoAntigo) * 100
        );

        cards.innerHTML += `
            <div class="card-produto" data-id="${produto.id}">
                <span class="desconto">${desconto}% OFF</span>

                <img src="${produto.imagem}">

                <h3>${produto.nome}</h3>

                <div class="precos">
                    <span class="novo">
                        ${formatarPreco(produto.preco)}
                    </span>

                    <span class="antigo">
                        ${formatarPreco(produto.precoAntigo)}
                    </span>
                </div>
            </div>
        `;
    });

    document.querySelectorAll(".card-produto").forEach(card => {

        card.addEventListener("click", () => {

            window.location.href =
                `produto.html?id=${card.dataset.id}`;

        });

    });

}

carregarProdutos();