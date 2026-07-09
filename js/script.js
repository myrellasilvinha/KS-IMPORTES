const cards = document.getElementById("cards");

if (cards) {

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    function formatarPreco(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function carregarProdutos() {
        cards.innerHTML = "";
        if (produtos.length == 0) {
            cards.innerHTML = `
        <div class="sem-produtos">
            <i class="bi bi-box-seam"></i>
            <h2>Nenhum produto cadastrado.</h2>
        </div>
        `;
            return;
        }
        produtos.forEach(produto => {
            let desconto = Math.round(
                ((produto.precoAntigo - produto.preco) /
                    produto.precoAntigo) * 100
            );
            cards.innerHTML += `
        <div class="card-produto" data-id="${produto.id}">
            <span class="desconto">
                ${desconto}% OFF
            </span>
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

        // Clique no card leva para a página de detalhes do produto
        document.querySelectorAll(".card-produto").forEach(card => {
            card.addEventListener("click", () => {
                window.location.href = `produto.html?id=${card.getAttribute("data-id")}`;
            });
        });
    }

    carregarProdutos();
    window.addEventListener("storage", () => {
        produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        carregarProdutos();
    });

}