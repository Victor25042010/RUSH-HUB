document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".race-card");

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
            card.style.transition = "opacity .55s ease, transform .55s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, 80 + index * 55);
    });
});
