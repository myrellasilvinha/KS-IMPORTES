// ================================
// ADMIN.JS
// Conexão + Variáveis + Listagem
// ================================

// Os objetos SUPABASE_URL, SUPABASE_KEY e supabase
// vêm do arquivo supabase.js

const tabela = document.getElementById("listaProdutos");

const idProduto = document.getElementById("idProduto");
const nome = document.getElementById("nome");
const grupo = document.getElementById("grupo");
const listaGrupos = document.getElementById("listaGrupos");
const descricao = document.getElementById("descricao");
const promocaoAtiva = document.getElementById("promocaoAtiva");
const labelPreco = document.getElementById("labelPreco");
const wrapperPrecoAntigo = document.getElementById("wrapperPrecoAntigo");
const preco = document.getElementById("preco");
const precoAntigo = document.getElementById("precoAntigo");
const imagem = document.getElementById("imagem");

const botaoSalvar = document.getElementById("salvar");

botaoSalvar.addEventListener("click", salvarProduto);

let produtos = [];

// ================================
// GRUPOS PADRÃO (sugestões iniciais)
// ================================

const GRUPOS_PADRAO = [
    "Tirzepatida",
    "Retatrutide",
    "Semaglutida",
    "Peptídeos",
    "Outros"
];

// ================================
// TOGGLE DE PROMOÇÃO
// ================================

function atualizarVisualPromocao() {

    if (promocaoAtiva.checked) {

        wrapperPrecoAntigo.classList.remove("escondido");
        precoAntigo.required = true;
        labelPreco.textContent = "Preço Atual (por)";

    } else {

        wrapperPrecoAntigo.classList.add("escondido");
        precoAntigo.required = false;
        precoAntigo.value = "";
        labelPreco.textContent = "Preço";

    }

}

promocaoAtiva.addEventListener("change", atualizarVisualPromocao);

atualizarVisualPromocao();

// ================================
// PREENCHER SUGESTÕES DE GRUPO
// ================================

function atualizarListaGrupos() {

    const gruposExistentes = produtos
        .map(p => p.grupo)
        .filter(Boolean);

    const todosGrupos = Array.from(
        new Set([...GRUPOS_PADRAO, ...gruposExistentes])
    );

    listaGrupos.innerHTML = todosGrupos
        .map(g => `<option value="${g}"></option>`)
        .join("");

}

// ================================
// CARREGAR PRODUTOS
// ================================

async function carregarProdutos() {

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        alert("Erro ao carregar produtos.");
        return;
    }

    produtos = data;

    atualizarListaGrupos();

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

    if (produtos.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="sem-produtos">
                        <i class="bi bi-box-seam"></i>
                        <h2>Nenhum produto cadastrado.</h2>
                    </div>
                </td>
            </tr>
        `;

        return;

    }

    produtos.forEach(produto => {

        const emPromocao = !!produto.emPromocao;

        const selo = emPromocao
            ? (() => {
                const desconto = Math.round(
                    ((produto.precoAntigo - produto.preco) / produto.precoAntigo) * 100
                );
                return `<span class="selo-promocao">${isNaN(desconto) ? 0 : desconto}% OFF</span>`;
            })()
            : `<span class="selo-sem-promocao">Sem promoção</span>`;

        tabela.innerHTML += `
            <tr>
                <td>
                    <img src="${produto.image}" width="70">
                </td>
                <td>
                    ${produto.nome}
                </td>
                <td>
                    <span class="grupo-badge">${produto.grupo ? produto.grupo : "Sem grupo"}</span>
                </td>
                <td>
                    R$ ${formatarPreco(produto.preco)}
                </td>
                <td>
                    ${selo}
                </td>
                <td>
                    <button class="editar" data-id="${produto.id}">Editar</button>
                    <button class="excluir" data-id="${produto.id}">Excluir</button>
                </td>
            </tr>
        `;

    });

}

// ================================
// SALVAR PRODUTO
// ================================

async function salvarProduto() {

    if (
        nome.value.trim() === "" ||
        preco.value.trim() === "" ||
        grupo.value.trim() === "" ||
        (promocaoAtiva.checked && precoAntigo.value.trim() === "")
    ) {
        alert("Preencha todos os campos obrigatórios.");
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

                imagemAtual = existente.image;

            }

        } else {
            alert("Selecione uma imagem para o produto.");
            return;
        }

        gravarProduto(
            idEditando,
            imagemAtual
        );

    }

}

// =====================================
// CONVERTER TEXTO BR (790,00 / 1.400,00) PARA NUMERO
// =====================================

function converterParaNumero(valorTexto) {

    if (!valorTexto) return NaN;

    const limpo = valorTexto
        .trim()
        .replace(/\./g, "")   // remove separador de milhar
        .replace(",", ".");    // vírgula vira ponto decimal

    return Number(limpo);

}

// =====================================
// CADASTRAR OU ATUALIZAR NO SUPABASE
// =====================================

async function gravarProduto(idEditando, imagemBase64) {

    const emPromocao = promocaoAtiva.checked;

    const precoConvertido = converterParaNumero(preco.value);

    if (isNaN(precoConvertido)) {
        alert("Preço inválido. Use o formato: 790,00");
        return;
    }

    let precoAntigoConvertido = null;

    if (emPromocao) {

        precoAntigoConvertido = converterParaNumero(precoAntigo.value);

        if (isNaN(precoAntigoConvertido)) {
            alert("Preço antigo inválido. Use o formato: 1.400,00");
            return;
        }

    }

    const produto = {

        nome: nome.value.trim(),

        grupo: grupo.value.trim(),

        descricao: descricao.value.trim(),

        emPromocao: emPromocao,

        preco: precoConvertido,

        precoAntigo: precoAntigoConvertido,

        image: imagemBase64

    };

    let error;

    // ======================
    // EDITAR
    // ======================

    if (idEditando) {

        const resposta =
            await supabaseClient
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
            await supabaseClient
                .from("produtos")
                .insert(produto);

        error = resposta.error;

    }

    if (error) {

        console.error(error);

        alert("Erro ao salvar produto: " + (error.message || "erro desconhecido"));

        return;

    }

    alert("Produto salvo com sucesso!");

    limparFormulario();

    carregarProdutos();

}

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

        const { error } = await supabaseClient
            .from("produtos")
            .delete()
            .eq("id", Number(id));

        if (error) {

            console.error(error);

            alert("Erro ao excluir produto.");

            return;

        }

        alert("Produto excluído com sucesso!");

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

        idProduto.value = produto.id;

        nome.value = produto.nome;

        grupo.value = produto.grupo || "";

        descricao.value = produto.descricao || "";

        preco.value = produto.preco;

        const temPromocao = !!produto.emPromocao;

        promocaoAtiva.checked = temPromocao;

        atualizarVisualPromocao();

        precoAntigo.value = temPromocao && produto.precoAntigo != null
            ? produto.precoAntigo
            : "";

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

    grupo.value = "";

    descricao.value = "";

    preco.value = "";

    precoAntigo.value = "";

    imagem.value = "";

    promocaoAtiva.checked = false;

    atualizarVisualPromocao();

}

// =====================================
// VERIFICAR ELEMENTOS DO PAINEL
// =====================================

if (!tabela) {

    console.error(
        "Elemento listaProdutos não encontrado."
    );

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
