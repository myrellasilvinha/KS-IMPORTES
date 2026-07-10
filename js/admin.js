// ================================
// ADMIN.JS - PARTE 1
// Conexão + Variáveis + Listagem
// ================================

// Os objetos SUPABASE_URL, SUPABASE_KEY e supabase
// vêm do arquivo supabase.js

const tabela = document.getElementById("listaProdutos");

const idProduto = document.getElementById("idProduto");
const nome = document.getElementById("nome");
const preco = document.getElementById("preco");
const precoAntigo = document.getElementById("precoAntigo");
const imagem = document.getElementById("imagem");

const botaoSalvar = document.getElementById("salvar");

botaoSalvar.addEventListener("click", salvarProduto);

let produtos = [];

// ================================
// CARREGAR PRODUTOS
// ================================

async function carregarProdutos() {

    const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        alert("Erro ao carregar produtos.");
        return;
    }

    produtos = data;

    mostrarProdutos();

}

carregarProdutos();

// ================================
// FORMATAR PREÇO
// ================================

function formatarPreco(valor) {

    return Number(valor)
        .toFixed(2)
        .replace(".", ",");

}

// ================================
// MOSTRAR PRODUTOS
// ================================

function mostrarProdutos() {

    tabela.innerHTML = "";

    produtos.forEach(produto => {

        const desconto = Math.round(

            ((produto.precoAntigo - produto.preco)
                / produto.precoAntigo) * 100

        );

        tabela.innerHTML += `

<tr>

    <td>

        <img
            src="${produto.imagem}"
            width="70"
        >

    </td>

    <td>

        ${produto.nome}

    </td>

    <td>

        R$ ${formatarPreco(produto.preco)}

    </td>

    <td>

        ${desconto}% OFF

    </td>

    <td>

        <button
            class="editar"
            data-id="${produto.id}"
        >

            Editar

        </button>

        <button
            class="excluir"
            data-id="${produto.id}"
        >

            Excluir

        </button>

    </td>

</tr>

`;

    });

}

// ================================
// ADMIN.JS - PARTE 2
// Salvar / Atualizar Produto
// ================================

async function salvarProduto() {

    if (
        nome.value.trim() === "" ||
        preco.value.trim() === "" ||
        precoAntigo.value.trim() === ""
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    const idEditando = idProduto.value;

    // Se escolheu uma imagem nova
    if (imagem.files.length > 0) {

        const leitor = new FileReader();

        leitor.onload = function (e) {

            gravarProduto(
                idEditando,
                e.target.result
            );

        };

        leitor.readAsDataURL(imagem.files[0]);

    } else {

        // Mantém a imagem antiga ao editar

        let imagemAtual = "";

        if (idEditando) {

            const existente =
                produtos.find(
                    p => p.id == idEditando
                );

            if (existente) {

                imagemAtual = existente.imagem;

            }

        }

        gravarProduto(
            idEditando,
            imagemAtual
        );

    }

}

// =====================================
// CADASTRAR OU ATUALIZAR NO SUPABASE
// =====================================

async function gravarProduto(idEditando, imagemBase64) {

    const produto = {

        nome: nome.value.trim(),

        preco: Number(preco.value),

        precoAntigo: Number(precoAntigo.value),

        imagem: imagemBase64

    };

    let error;

    // ======================
    // EDITAR
    // ======================

    if (idEditando) {

        const resposta =
            await supabase

                .from("produtos")

                .update(produto)

                .eq("id", Number(idEditando));

        error = resposta.error;

    }

    // ======================
    // CADASTRAR
    // ======================

    else {

        const resposta =
            await supabase

                .from("produtos")

                .insert(produto);

        error = resposta.error;

    }

    if (error) {

        console.error(error);

        alert("Erro ao salvar produto.");

        return;

    }

    alert("Produto salvo com sucesso!");

    limparFormulario();

    carregarProdutos();

}

// ================================
// ADMIN.JS - PARTE 3
// Editar / Excluir / Limpar
// ================================


// =====================================
// EVENTOS DOS BOTÕES DA TABELA
// =====================================

tabela.addEventListener("click", async function (e) {

    const id = e.target.dataset.id;

    if (!id) return;


    // ======================
    // EXCLUIR PRODUTO
    // ======================

    if (e.target.classList.contains("excluir")) {


        const confirmar = confirm(
            "Deseja realmente excluir este produto?"
        );


        if (!confirmar) return;


        const { error } = await supabase

            .from("produtos")

            .delete()

            .eq("id", Number(id));


        if (error) {

            console.error(error);

            alert(
                "Erro ao excluir produto."
            );

            return;

        }


        alert(
            "Produto excluído com sucesso!"
        );


        carregarProdutos();


    }



    // ======================
    // EDITAR PRODUTO
    // ======================

    if (e.target.classList.contains("editar")) {


        const produto =
            produtos.find(
                p => p.id == id
            );


        if (!produto) return;



        idProduto.value =
            produto.id;


        nome.value =
            produto.nome;


        preco.value =
            produto.preco;


        precoAntigo.value =
            produto.precoAntigo;



        // O input file não pode
        // ser preenchido pelo JS
        // por segurança do navegador


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    }


});



// =====================================
// LIMPAR FORMULÁRIO
// =====================================

function limparFormulario() {


    idProduto.value = "";


    nome.value = "";


    preco.value = "";


    precoAntigo.value = "";


    imagem.value = "";


}

// ================================
// ADMIN.JS - PARTE 4
// Ajustes finais e segurança
// ================================


// =====================================
// VERIFICAR ELEMENTOS DO PAINEL
// =====================================

if (!tabela) {

    console.error(
        "Elemento listaProdutos não encontrado."
    );

}


// =====================================
// CASO NÃO TENHA PRODUTOS
// =====================================

function mostrarProdutos() {

    tabela.innerHTML = "";


    if (produtos.length === 0) {

        tabela.innerHTML = `

        <tr>

            <td colspan="5">

                <div class="sem-produtos">

                    <i class="bi bi-box-seam"></i>

                    <h2>
                        Nenhum produto cadastrado.
                    </h2>

                </div>

            </td>

        </tr>

        `;

        return;

    }



    produtos.forEach(produto => {


        const desconto = Math.round(

            ((produto.precoAntigo - produto.preco)
                /
                produto.precoAntigo) * 100

        );


        tabela.innerHTML += `

        <tr>

            <td>

                <img 
                    src="${produto.imagem}"
                    width="70"
                >

            </td>


            <td>

                ${produto.nome}

            </td>


            <td>

                R$ ${formatarPreco(produto.preco)}

            </td>


            <td>

                ${desconto}% OFF

            </td>


            <td>


                <button 
                    class="editar"
                    data-id="${produto.id}"
                >

                    Editar

                </button>


                <button 
                    class="excluir"
                    data-id="${produto.id}"
                >

                    Excluir

                </button>


            </td>


        </tr>

        `;


    });


}


// =====================================
// RECARREGAR AO VOLTAR PARA A PÁGINA
// =====================================

window.addEventListener(
    "focus",
    () => {

        carregarProdutos();

    }
);