// ================================
// ADMIN-ABAS.JS
// Alterna entre as abas "Produtos" e "Perfumes" do painel
// ================================

document.querySelectorAll(".aba-botao").forEach(function (botao) {

    botao.addEventListener("click", function () {

        document.querySelectorAll(".aba-botao").forEach(function (b) {
            b.classList.remove("ativa");
        });

        document.querySelectorAll(".aba-conteudo").forEach(function (c) {
            c.classList.remove("ativa");
        });

        botao.classList.add("ativa");

        const painel = document.getElementById("painel" + botao.dataset.aba);

        if (painel) {
            painel.classList.add("ativa");
        }

    });

});
