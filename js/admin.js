let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

const tabela = document.getElementById("listaProdutos");

const idProduto = document.getElementById("idProduto");
const nome = document.getElementById("nome");
const preco = document.getElementById("preco");
const precoAntigo = document.getElementById("precoAntigo");
const imagem = document.getElementById("imagem");

const botaoSalvar = document.getElementById("salvar");
mostrarProdutos();
botaoSalvar.addEventListener("click", salvarProduto);

function salvarLocal() {
    localStorage.setItem(
        "produtos",
        JSON.stringify(produtos)
    );
    window.dispatchEvent(new Event("storage"));
}

function salvarProduto() {
    // Validação simples dos campos obrigatórios
    if (!nome.value || !preco.value || !precoAntigo.value) {
        alert("Preencha nome, preço e preço antigo.");
        return;
    }

    const idEditando = idProduto.value;

    // Se um arquivo de imagem novo foi escolhido, converte pra base64
    if (imagem.files && imagem.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            gravarProduto(idEditando, e.target.result);
        };
        leitor.readAsDataURL(imagem.files[0]);
    } else {
        // Editando sem trocar imagem: mantém a imagem já existente
        let imagemAtual = "";
        if (idEditando) {
            const existente = produtos.find(p => p.id == idEditando);
            if (existente) imagemAtual = existente.imagem;
        }
        gravarProduto(idEditando, imagemAtual);
    }
}

function gravarProduto(idEditando, imagemBase64) {
    const produto = {
        id: idEditando ? Number(idEditando) : Date.now(),
        nome: nome.value,
        preco: parseFloat(preco.value),
        precoAntigo: parseFloat(precoAntigo.value),
        imagem: imagemBase64
    };

    if (idEditando) {
        const index = produtos.findIndex(p => p.id == idEditando);
        if (index !== -1) produtos[index] = produto;
    } else {
        produtos.push(produto);
    }

    salvarLocal();
    mostrarProdutos();
    limparFormulario();
}

function mostrarProdutos() {
    tabela.innerHTML = "";
    produtos.forEach(produto => {
        let desconto = Math.round(
            ((produto.precoAntigo - produto.preco) /
                produto.precoAntigo) * 100
        );
        tabela.innerHTML += `
<tr>
    <td>
        <img src="${produto.imagem}">
    </td>
    <td>${produto.nome}</td>
    <td>
        R$ ${produto.preco.toFixed(2).replace(".",",")}
    </td>
    <td>
        ${desconto}% OFF
    </td>
    <td>
        <button class="editar" data-id="${produto.id}">Editar</button>
        <button class="excluir" data-id="${produto.id}">Excluir</button>
    </td>
</tr>
`;
    });
}

tabela.addEventListener("click", function(e) {
    const id = e.target.getAttribute("data-id");
    if (!id) return;

    if (e.target.classList.contains("excluir")) {
        produtos = produtos.filter(p => p.id != id);
        salvarLocal();
        mostrarProdutos();
    }

    if (e.target.classList.contains("editar")) {
        const produto = produtos.find(p => p.id == id);
        if (!produto) return;
        idProduto.value = produto.id;
        nome.value = produto.nome;
        preco.value = produto.preco;
        precoAntigo.value = produto.precoAntigo;
    }
});

function limparFormulario() {
    idProduto.value = "";
    nome.value = "";
    preco.value = "";
    precoAntigo.value = "";
    imagem.value = "";
}