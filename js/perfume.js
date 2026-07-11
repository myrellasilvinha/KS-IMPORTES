// ================================
// PERFUME.JS
// Página de detalhes - KS IMPORTES
// Perfumes vindos do Supabase (tabela "perfumes")
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




    const { data, error } = await supabaseClient

        .from("perfumes")

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

    const grupoHtml = produto.grupo
        ? `<span class="grupo-tag">${produto.grupo}</span>`
        : "";

    const descricaoHtml = produto.descricao
        ? `
        <div class="produto-descricao">
            <h2>Descrição</h2>
            <p>${produto.descricao}</p>
            ${grupoHtml}
        </div>
        `
        : (grupoHtml ? `<div class="produto-descricao">${grupoHtml}</div>` : "");

    produtoPage.innerHTML = `

    <div class="produto-imagem">

        ${seloDesconto}

        <img 
            src="${produto.image}"
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

            ${precoAntigoHtml}

        </div>

        <button 
            class="botao-comprar"
            id="comprar"
        >
            Comprar
        </button>

        ${descricaoHtml}

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
