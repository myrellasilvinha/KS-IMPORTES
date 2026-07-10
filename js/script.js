// ================================
// SCRIPT.JS
// Página principal - KS IMPORTES
// Produtos vindos do Supabase
// ================================


const cards = document.getElementById("cards");


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
// BUSCAR PRODUTOS DO SUPABASE
// ================================

async function carregarProdutos() {


    if (!cards) return;



    const { data, error } = await supabase

        .from("produtos")

        .select("*")

        .order("id", {
            ascending: false
        });



    if (error) {


        console.error(
            "Erro ao buscar produtos:",
            error
        );


        cards.innerHTML = `

        <div class="sem-produtos">

            <i class="bi bi-exclamation-triangle"></i>

            <h2>
                Erro ao carregar produtos.
            </h2>

        </div>

        `;


        return;

    }



    cards.innerHTML = "";



    if (!data || data.length === 0) {


        cards.innerHTML = `

        <div class="sem-produtos">

            <i class="bi bi-box-seam"></i>

            <h2>
                Nenhum produto cadastrado.
            </h2>

        </div>

        `;


        return;

    }




    data.forEach(produto => {



        const desconto = Math.round(

            ((produto.precoAntigo - produto.preco)

                /

                produto.precoAntigo)

            *

            100

        );



        cards.innerHTML += `


        <div 
            class="card-produto"
            data-id="${produto.id}"
        >


            <span class="desconto">

                ${desconto}% OFF

            </span>



            <img 

                src="${produto.imagem}"

                alt="${produto.nome}"

            >



            <h3>

                ${produto.nome}

            </h3>




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



    adicionarCliqueProdutos();



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
                    const id =
                        card.dataset.id;
                    window.location.href =
                        `produto.html?id=${id}`;
                }
            );
        });
}



// ================================
// INICIAR
// ================================

carregarProdutos();