// ================================
// TOPO.JS
// Botão flutuante "voltar ao topo"
// ================================

(function () {

    const botao = document.createElement("button");

    botao.id = "botaoTopo";
    botao.className = "botao-topo";
    botao.setAttribute("aria-label", "Voltar ao topo");
    botao.innerHTML = '<i class="bi bi-arrow-up"></i>';

    document.body.appendChild(botao);

    function verificarScroll() {

        if (window.scrollY > 400) {
            botao.classList.add("visivel");
        } else {
            botao.classList.remove("visivel");
        }

    }

    window.addEventListener("scroll", verificarScroll);

    botao.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    verificarScroll();

})();
