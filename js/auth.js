// ================================
// AUTH.JS
// Login administrativo (Supabase Auth)
// Protege o acesso ao admin.html
// ================================

const telaLogin = document.getElementById("telaLogin");
const painelAdmin = document.getElementById("painelAdmin");

const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");
const botaoLogin = document.getElementById("botaoLogin");
const loginErro = document.getElementById("loginErro");
const botaoLogout = document.getElementById("botaoLogout");

// ================================
// MOSTRAR / ESCONDER TELAS
// ================================

function mostrarPainelAdmin() {

    telaLogin.classList.add("escondido");
    painelAdmin.classList.remove("escondido");

    // Avisa o resto do sistema (admin.js / admin-perfumes.js)
    // que já pode carregar os dados.
    document.dispatchEvent(new Event("admin-autenticado"));

}

function mostrarTelaLogin() {

    painelAdmin.classList.add("escondido");
    telaLogin.classList.remove("escondido");

}

// ================================
// VERIFICAR SE JÁ EXISTE SESSÃO
// ================================

async function verificarSessao() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
    }

    if (data && data.session) {
        mostrarPainelAdmin();
    } else {
        mostrarTelaLogin();
    }

}

// ================================
// FAZER LOGIN
// ================================

async function fazerLogin() {

    loginErro.classList.add("escondido");

    const email = loginEmail.value.trim();
    const senha = loginSenha.value;

    if (!email || !senha) {

        loginErro.textContent = "Preencha e-mail e senha.";
        loginErro.classList.remove("escondido");

        return;

    }

    botaoLogin.disabled = true;

    const textoOriginal = botaoLogin.innerHTML;
    botaoLogin.innerHTML = "Entrando...";

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    botaoLogin.disabled = false;
    botaoLogin.innerHTML = textoOriginal;

    if (error) {

        console.error(error);

        loginErro.textContent = "E-mail ou senha inválidos.";
        loginErro.classList.remove("escondido");

        return;

    }

    loginSenha.value = "";

    mostrarPainelAdmin();

}

// ================================
// FAZER LOGOUT
// ================================

async function fazerLogout() {

    await supabaseClient.auth.signOut();

    mostrarTelaLogin();

}

// ================================
// EVENTOS
// ================================

botaoLogin.addEventListener("click", fazerLogin);

loginSenha.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        fazerLogin();
    }

});

loginEmail.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        loginSenha.focus();
    }

});

if (botaoLogout) {
    botaoLogout.addEventListener("click", fazerLogout);
}

// Reage a login/logout feitos em outra aba, expiração de sessão, etc.
supabaseClient.auth.onAuthStateChange(function (_evento, sessao) {

    if (sessao) {
        mostrarPainelAdmin();
    } else {
        mostrarTelaLogin();
    }

});

// ================================
// INICIAR
// ================================

verificarSessao();
