const COLORS = [
    "red",
    "blue",
    "orange",
    "green",
    "purple"
];

const selectedFactions = {
    left: "red",
    right: "blue"
};

document.querySelectorAll(".color-picker button").forEach(button => {

    button.addEventListener("click", () => {

        playSelectSound();

        const side = button.closest(".color-picker").dataset.side;
        const color = button.dataset.color;

        setFactionColor(side, color);

    });

});

function setFactionColor(side, color) {

    const panel = document.querySelector(`.panel[data-side="${side}"]`);

    panel.classList.remove(...COLORS);
    panel.classList.add(color);

    const display = document.querySelector(`.display[data-side="${side}"]`);

    display.classList.remove(...COLORS);
    display.classList.add(color);

    selectedFactions[side] = color;

}

function playSelectSound() {
    const sound = new Audio("sounds/UI_Click_Confirm.ogg");
    sound.volume = 0.1;
    sound.play();
}