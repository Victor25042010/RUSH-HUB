function toggleMenu() {

    const menu = document.getElementById("menu");

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

}


function filterRaces(category) {

    const races = document.querySelectorAll(".race-item");
    const buttons = document.querySelectorAll(".category-btn");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    event.target.classList.add("active");


    races.forEach(race => {

        if (category === "all") {
            race.style.display = "flex";
        }

        else if (race.classList.contains(category)) {
            race.style.display = "flex";
        }

        else {
            race.style.display = "none";
        }

    });

}
