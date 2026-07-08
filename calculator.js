/*------- vars -------*/
let UNITS = {};

const selectedUnits = {
    left: "LightInfantry",
    right: "LightInfantry"
};

const TERRAIN = {
    dirt: 1.1,
    road: 1.0,
    plains: 0.9,
    forest: 0.8,
    mountain: 0.7
};

/*------- execution -------*/
fetch("units.json")
    .then(res => res.json())
    .then(data => {
        UNITS = normalize(data);

        document.querySelectorAll(".unit-buttons").forEach(container => {
            createUnitButtons(
                container,
                container.dataset.side
            );
        });

        update();
    });

// listeners
[
    "leftHealth",
    "leftTerrain",
    "rightHealth",
    "rightTerrain"
].forEach(id => {
    document.getElementById(id).addEventListener("input", update);
});

document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button");

    if (button) {
        button.classList.add("pressed");
    }
});

document.addEventListener("pointerup", (event) => {
    const button = event.target.closest("button");

    if (button) {
        button.classList.remove("pressed");
    }
});

document.addEventListener("pointerleave", (event) => {
    const button = event.target.closest("button");

    if (button) {
        button.classList.remove("pressed");
    }
});

document.addEventListener("pointercancel", (event) => {
    const button = event.target.closest("button");

    if (button) {
        button.classList.remove("pressed");
    }
});

update();

/*------- functions -------*/
// i love json i love json i love jsonilovejosn
// if i rewrite this ONE more time i'm gonna need a war simulator to contain myself
function normalize(data) {
    const result = {};

    for (const unitName in data) {
        const unit = data[unitName];

        result[unitName] = {
            name: unitName,
            unitNumber: unit.unitNumber,
            image: `images/unit_${unitName}.png`,
            unitType: unit.unitType,
            retaliation: unit.retaliation,
            cost: unit.cost,
            damage: {}
        };

        for (const key in unit) {
            if (key.startsWith("DamageVs")) {
                const target = key.replace("DamageVs", "");
                result[unitName].damage[target] = unit[key];
            }
        }
    }

    return result;
}

function calc(att, def) {
    let dmg = UNITS[att.unit].damage[def.unit];

    dmg *= att.health / 10;

    dmg *= TERRAIN[def.terrain];

    return Math.round(dmg);
}

function read(prefix) {
    return {
        unit: selectedUnits[prefix],
        health: Number(document.getElementById(prefix + "Health").value),
        terrain: document.getElementById(prefix + "Terrain").value
    };
}

function update() {
    const left = read("left");
    const right = read("right");
    
    // console.log(UNITS)
    // console.log(left.unit)
    // console.log(UNITS[left.unit])

    document.getElementById("leftIcon").src = UNITS[left.unit].image;
    document.getElementById("leftIcon").alt = UNITS[left.unit].name;
    document.getElementById("leftHP").textContent = left.health + " HP";

    document.getElementById("rightIcon").src = UNITS[right.unit].image;
    document.getElementById("rightIcon").alt = UNITS[right.unit].name;
    document.getElementById("rightHP").textContent = right.health + " HP";

    // STEP 1: left attacks right
    const attackDamage = calc(left, right);

    // convert damage HP loss
    const rightAfterHit = {
        ...right,
        health: Math.max(0, right.health - Math.round(attackDamage / 10))
    };

    // STEP 2: right retaliates AFTER taking damage
    let retaliationDamage = 0;

    if (UNITS[right.unit].retaliation && UNITS[left.unit].retaliation) {
        retaliationDamage = calc(rightAfterHit, left);
    }

    // compute resulting HP after full exchange
    const leftAfterHit = {
        ...left,
        health: Math.max(0, left.health - Math.round(retaliationDamage / 10))
    };


    document.getElementById("attack").textContent = attackDamage + "%";
    document.getElementById("retaliation").textContent = retaliationDamage + "%";

    // faction-colored predicted HP
    document.getElementById("leftHPColor").textContent = "→ " + leftAfterHit.health + " HP";
    document.getElementById("rightHPColor").textContent = "→ " + rightAfterHit.health + " HP";
    
    // console.log("LEFT:", left.unit);
    // console.log("UNITS KEYS:", Object.keys(UNITS));
}

function createUnitButtons(container, side) {

    for (const unitName in UNITS) {
        const unit = UNITS[unitName];

        const button = document.createElement("button");
        button.className = "unit-button";

        const img = document.createElement("img");
        img.src = `images/unit_${unit.name}.png`;
        img.alt = unit.name;
        img.draggable = false;

        button.appendChild(img);

        button.addEventListener("click", () => {
            playBuySound();
            selectedUnits[side] = unit.name;
            update();
        });

        container.appendChild(button);
    }
}

function playBuySound() {
    const sound = new Audio("sounds/UI_BuyUnit.ogg");
    sound.volume = 0.08;
    sound.play();
}