// ================================
// PRODUTO.JS
// Página de detalhes - KS IMPORTES
// Produtos vindos do Supabase
// ================================


const produtoPage =
    document.getElementById("produtoPage");



// ================================
// FORMATAR PREÇO
// ================================

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}



// ================================
// PEGAR ID DA URL
// ================================

function pegarIdDaUrl() {


    const params =
        new URLSearchParams(
            window.location.search
        );


    return Number(
        params.get("id")
    );

}



// ================================
// BUSCAR PRODUTO
// ================================

async function buscarProduto() {


    const id =
        pegarIdDaUrl();



    if (!id) {

        mostrarErro();

        return;

    }




    const { data, error } = await supabase

        .from("produtos")

        .select("*")

        .eq("id", id)

        .single();





    if (error || !data) {


        console.error(error);


        mostrarErro();


        return;

    }



    renderizarProduto(data);



}



// ================================
// MOSTRAR ERRO
// ================================

function mostrarErro() {

    produtoPage.innerHTML = `

    <div class="sem-produtos">

        <i class="bi bi-box-seam"></i>

        <h2>
            Nenhum produto cadastrado.
        </h2>

        <p>
            No momento não temos produtos disponíveis.
        </p>

    </div>

    `;

}



// ================================
// RENDERIZAR PRODUTO
// ================================

function renderizarProduto(produto) {



    const desconto = Math.round(

        ((produto.precoAntigo - produto.preco)

            /

            produto.precoAntigo)

        *

        100

    );





    produtoPage.innerHTML = `



    <div class="produto-imagem">


        <span class="desconto">


            ${desconto}% OFF


        </span>



        <img 

            src="${produto.imagem}"

            alt="${produto.nome}"

        >



    </div>





    <div class="produto-info">



        <h1>

            ${produto.nome}

        </h1>




        <div class="precos-produto">


            <span class="novo">


                ${formatarPreco(produto.preco)}


            </span>



            <span class="antigo">


                ${formatarPreco(produto.precoAntigo)}


            </span>



        </div>





        <button 

            class="botao-comprar"

            id="comprar"

        >

            Comprar


        </button>




    </div>



    `;



    ativarBotaoComprar(produto);



}




// ================================
// BOTÃO COMPRAR
// ================================

function ativarBotaoComprar(produto) {


    const botao =
        document.getElementById("comprar");



    botao.addEventListener(
        "click",
        () => {


            alert(

                `Compra iniciada: ${produto.nome}`

            );


        }
    );


}




// ================================
// INICIAR
// ================================

buscarProduto();