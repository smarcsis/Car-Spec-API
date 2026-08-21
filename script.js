console.log("JavaScript connected");

const input = document.getElementById("carInput");
const button = document.getElementById("searchButton");
const result = document.getElementById("result");

let cars = [];

const searchAliases = {
    awd: "all wheel drive",
    fwd: "front wheel drive",
    rwd: "rear wheel drive",
    gtr: "gt r",
    "gt-r": "gt r",
    "ft r": "gt r",
    mercedes: "mercedes benz",
    amg: "amg",
};

fetch("cars.json")
    .then(response => response.json())
    .then(data => {
        cars = data;
        console.log("Car data loaded", cars);
    })
    .catch(error => {
        console.error("Error loading car data:", error);
        result.innerHTML = "Could not load cars.json";
    });

function normalizeText(text) {
    return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function formatPrice(price) {
    return `$${price.toLocaleString()}`;
}

function searchCars() {
    let carName = normalizeText(input.value);
    let compactCarName = compactText(input.value);
    let usedAlias = false;

if (carName ==="") {
    result.innerHTML = "Car not found.";
    return;
}

    if (searchAliases[carName]) {
        carName = (searchAliases[carName]);
        compactCarName = compactText(searchAliases[carName]);
        usedAlias = true;
    }

    console.log("Searching for", carName);
    console.log("Cars array:", cars);

    const searchTerms = carName.split(" ").filter(term => term !== "");

    const rankedMatches = cars
        .map(car => {
            const aliasText = (car.aliases || []).join(" ");

            const modelText = normalizeText(`${car.make} ${car.model}`);
            const searchText = normalizeText(
                `${car.make} ${car.model} ${car.engine} ${car.drivetrain} ${aliasText}`
            );
        
            const compactModelText = compactText(`${car.make} ${car.model}`);
            const compactSearchText = compactText(
                `${car.make} ${car.model} ${car.engine} ${car.drivetrain} ${aliasText}`
            );

            let score = 0;

            if (usedAlias) {
                if (searchText.includes(carName)) score += 80;
                if(compactSearchText.includes(compactCarName)) score += 80;
            } else {
                if (modelText ===(carName)) score += 120;
                if (compactModelText === (compactCarName)) score += 120;

                if (searchText.includes(carName)) score += 90;
                if (compactModelText.includes(compactCarName)) score += 90;

                if (searchText.includes(carName)) score += 60;
                if (compactSearchText.includes(compactCarName)) score += 60;

                if (searchTerms.every(term => modelText.includes(term))) score += 40;
                if (searchTerms.every(term => searchText.includes(term))) score += 20;
            }

            return { car, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    const matches = rankedMatches.map(item => item.car);

    if (matches.length > 0) {
        result.innerHTML = "";

        matches.forEach(car => {
            result.innerHTML += `
                <div class="car-card">
                    <h2>${car.make} ${car.model}</h2>
                    <p><strong>Horsepower:</strong> ${car.horsepower}</p>
                    <p><strong>Engine:</strong> ${car.engine}</p>
                    <p><strong>Drivetrain:</strong> ${car.drivetrain}</p>
                    <p><strong>0-60 mph:</strong> ${car.zeroToSixty}</p>
                    <p><strong>Price:</strong> ${formatPrice(car.price)}</p>
                </div>
            `;
        });
    } else {
        result.innerHTML = "Car not found.";
    }
}

button.addEventListener("click", searchCars);

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchCars();
    }
});