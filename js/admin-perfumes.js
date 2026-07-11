// ================================
// ADMIN-PERFUMES.JS
// Conexão + Variáveis + Listagem (aba Perfumes)
// Mesma lógica de admin.js, apontando para a tabela "perfumes"
// ================================

// formatarPreco e converterParaNumero já existem em admin.js
// (carregado antes deste arquivo), então são reaproveitados aqui.

const tabelaPerfumes = document.getElementById("listaPerfumes");

const idPerfume = document.getElementById("idPerfume");
const nomePerfume = document.getElementById("nomePerfume");
const grupoPerfume = document.getElementById("grupoPerfume");
const listaGruposPerfume = document.getElementById("listaGruposPerfume");
const descricaoPerfume = document.getElementById("descricaoPerfume");
const promocaoAtivaPerfume = document.getElementById("promocaoAtivaPerfume");
const labelPrecoPerfume = document.getElementById("labelPrecoPerfume");
const wrapperPrecoAntigoPerfume = document.getElementById("wrapperPrecoAntigoPerfume");
const precoPerfume = document.getElementById("precoPerfume");
const precoAntigoPerfume = document.getElementById("precoAntigoPerfume");
const imagemPerfume = document.getElementById("imagemPerfume");

const botaoSalvarPerfume = document.getElementById("salvarPerfume");

botaoSalvarPerfume.addEventListener("click", salvarPerfume);

let perfumes = [];

// ================================
// GRUPOS PADRÃO (sugestões iniciais)
// ================================

const GRUPOS_PADRAO_PERFUME = [
    "Masculino",
    "Feminino",
    "Unissex",
    "Importado",
    "Outros"
];

// ================================
// TOGGLE DE PROMOÇÃO
// ================================

function atualizarVisualPromocaoPerfume() {

    if (promocaoAtivaPerfume.checked) {

        wrapperPrecoAntigoPerfume.classList.remove("escondido");
        precoAntigoPerfume.required = true;
        labelPrecoPerfume.textContent = "Preço Atual (por)";

    } else {

        wrapperPrecoAntigoPerfume.classList.add("escondido");
        precoAntigoPerfume.required = false;
        precoAntigoPerfume.value = "";
        labelPrecoPerfume.textContent = "Preço";

    }

}

promocaoAtivaPerfume.addEventListener("change", atualizarVisualPromocaoPerfume);

atualizarVisualPromocaoPerfume();

// ================================
// PREENCHER SUGESTÕES DE GRUPO
// ================================

function atualizarListaGruposPerfume() {

    const gruposExistentes = perfumes
        .map(p => p.grupo)
        .filter(Boolean);

    const todosGrupos = Array.from(
        new Set([...GRUPOS_PADRAO_PERFUME, ...gruposExistentes])
    );

    listaGruposPerfume.innerHTML = todosGrupos
        .map(g => `<option value="${g}"></option>`)
        .join("");

}

// ================================
// CARREGAR PERFUMES
// ================================

async function carregarPerfumes() {

    const { data, error } = await supabaseClient
        .from("perfumes")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        alert("Erro ao carregar perfumes.");
        return;
    }

    perfumes = data;

    atualizarListaGruposPerfume();

    mostrarPerfumes();

}

// Só carrega os perfumes depois do login (ver js/auth.js)
document.addEventListener("admin-autenticado", carregarPerfumes);

// ================================
// MOSTRAR PERFUMES
// ================================

function mostrarPerfumes() {

    tabelaPerfumes.innerHTML = "";

    if (perfumes.length === 0) {

        tabelaPerfumes.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="sem-produtos">
                        <i class="bi bi-droplet"></i>
                        <h2>Nenhum perfume cadastrado.</h2>
                    </div>
                </td>
            </tr>
        `;

        return;

    }

    perfumes.forEach(perfume => {

        const emPromocao = !!perfume.emPromocao;

        const selo = emPromocao
            ? (() => {
                const desconto = Math.round(
                    ((perfume.precoAntigo - perfume.preco) / perfume.precoAntigo) * 100
                );
                return `<span class="selo-promocao">${isNaN(desconto) ? 0 : desconto}% OFF</span>`;
            })()
            : `<span class="selo-sem-promocao">Sem promoção</span>`;

        tabelaPerfumes.innerHTML += `
            <tr>
                <td>
                    <img src="${perfume.image}" width="70">
                </td>
                <td>
                    ${perfume.nome}
                </td>
                <td>
                    <span class="grupo-badge">${perfume.grupo ? perfume.grupo : "Sem grupo"}</span>
                </td>
                <td>
                    R$ ${formatarPreco(perfume.preco)}
                </td>
                <td>
                    ${selo}
                </td>
                <td>
                    <button class="editar-perfume" data-id="${perfume.id}">Editar</button>
                    <button class="excluir-perfume" data-id="${perfume.id}">Excluir</button>
                </td>
            </tr>
        `;

    });

}

// ================================
// SALVAR PERFUME
// ================================

async function salvarPerfume() {

    if (
        nomePerfume.value.trim() === "" ||
        precoPerfume.value.trim() === "" ||
        grupoPerfume.value.trim() === "" ||
        (promocaoAtivaPerfume.checked && precoAntigoPerfume.value.trim() === "")
    ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const idEditando = idPerfume.value;

    // Se escolheu uma imagem nova
    if (imagemPerfume.files.length > 0) {

        const leitor = new FileReader();

        leitor.onload = function (e) {

            gravarPerfume(
                idEditando,
                e.target.result
            );

        };

        leitor.readAsDataURL(imagemPerfume.files[0]);

    } else {

        // Mantém a imagem antiga ao editar

        let imagemAtual = "";

        if (idEditando) {

            const existente =
                perfumes.find(
                    p => p.id == idEditando
                );

            if (existente) {

                imagemAtual = existente.image;

            }

        } else {
            alert("Selecione uma imagem para o perfume.");
            return;
        }

        gravarPerfume(
            idEditando,
            imagemAtual
        );

    }

}

// =====================================
// CADASTRAR OU ATUALIZAR NO SUPABASE
// =====================================

async function gravarPerfume(idEditando, imagemBase64) {

    const emPromocao = promocaoAtivaPerfume.checked;

    const precoConvertido = converterParaNumero(precoPerfume.value);

    if (isNaN(precoConvertido)) {
        alert("Preço inválido. Use o formato: 250,00");
        return;
    }

    let precoAntigoConvertido = null;

    if (emPromocao) {

        precoAntigoConvertido = converterParaNumero(precoAntigoPerfume.value);

        if (isNaN(precoAntigoConvertido)) {
            alert("Preço antigo inválido. Use o formato: 400,00");
            return;
        }

    }

    const perfume = {

        nome: nomePerfume.value.trim(),

        grupo: grupoPerfume.value.trim(),

        descricao: descricaoPerfume.value.trim(),

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
                .from("perfumes")
                .update(perfume)
                .eq("id", Number(idEditando));

        error = resposta.error;

    }

    // ======================
    // CADASTRAR
    // ======================

    else {

        const resposta =
            await supabaseClient
                .from("perfumes")
                .insert(perfume);

        error = resposta.error;

    }

    if (error) {

        console.error(error);

        alert("Erro ao salvar perfume: " + (error.message || "erro desconhecido"));

        return;

    }

    alert("Perfume salvo com sucesso!");

    limparFormularioPerfume();

    carregarPerfumes();

}

// =====================================
// EVENTOS DOS BOTÕES DA TABELA
// =====================================

tabelaPerfumes.addEventListener("click", async function (e) {

    const id = e.target.dataset.id;

    if (!id) return;

    // ======================
    // EXCLUIR PERFUME
    // ======================

    if (e.target.classList.contains("excluir-perfume")) {

        const confirmar = confirm(
            "Deseja realmente excluir este perfume?"
        );

        if (!confirmar) return;

        const { error } = await supabaseClient
            .from("perfumes")
            .delete()
            .eq("id", Number(id));

        if (error) {

            console.error(error);

            alert("Erro ao excluir perfume.");

            return;

        }

        alert("Perfume excluído com sucesso!");

        carregarPerfumes();

    }

    // ======================
    // EDITAR PERFUME
    // ======================

    if (e.target.classList.contains("editar-perfume")) {

        const perfume =
            perfumes.find(
                p => p.id == id
            );

        if (!perfume) return;

        idPerfume.value = perfume.id;

        nomePerfume.value = perfume.nome;

        grupoPerfume.value = perfume.grupo || "";

        descricaoPerfume.value = perfume.descricao || "";

        precoPerfume.value = perfume.preco;

        const temPromocao = !!perfume.emPromocao;

        promocaoAtivaPerfume.checked = temPromocao;

        atualizarVisualPromocaoPerfume();

        precoAntigoPerfume.value = temPromocao && perfume.precoAntigo != null
            ? perfume.precoAntigo
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

function limparFormularioPerfume() {

    idPerfume.value = "";

    nomePerfume.value = "";

    grupoPerfume.value = "";

    descricaoPerfume.value = "";

    precoPerfume.value = "";

    precoAntigoPerfume.value = "";

    imagemPerfume.value = "";

    promocaoAtivaPerfume.checked = false;

    atualizarVisualPromocaoPerfume();

}

// =====================================
// RECARREGAR AO VOLTAR PARA A PÁGINA
// =====================================

window.addEventListener(
    "focus",
    () => {

        const painel = document.getElementById("painelAdmin");

        if (painel && !painel.classList.contains("escondido")) {
            carregarPerfumes();
        }

    }
);
