const hamburger = document.getElementById("hamburger");
const navList = document.getElementById("nav_list");

if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
        navList.classList.toggle("aberto");
        const icone = hamburger.querySelector("i");
        const aberto = navList.classList.contains("aberto");
        icone.classList.toggle("bi-list", !aberto);
        icone.classList.toggle("bi-x-lg", aberto);
    });

    // Fecha o menu ao clicar em algum link
    navList.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navList.classList.remove("aberto");
            hamburger.querySelector("i").classList.remove("bi-x-lg");
            hamburger.querySelector("i").classList.add("bi-list");
        });
    });
}
