const flavorSuggestions = [
    // Cooling
    "WS-23",
    "WS-5",
    "Koolada",

    // Flavrz Flavor Shots
    "ASAP Grape (FLVZ)",
    "Raspberry BOMB (FLVZ)",
    "Blackberry Pomegranate Cherry ICE (FLVZ)",
    
    // Capella
    "Vanilla Custard (Capella)",
    "Strawberry Ripe (Capella)",
    "Lemon Meringue Pie (Capella)",
    "Cake Batter (Capella)",
    "Sweet Cream (Capella)",
    "Caramel (Capella)",
    "Banana Cream (Capella)",
    "Peach (Capella)",
    "Butter Cream (Capella)",
    "French Vanilla (Capella)",

    // Flavorah
    "Berry Blend (Flavorah)",
    "Frosting (Flavorah)",
    "Coconut (Flavorah)",
    "Custard (Flavorah)",
    "Strawberry (Flavorah)",
    "Gingerbread (Flavorah)",
    "Sweet Dough (Flavorah)",
    "Vanilla Bean (Flavorah)",
    "Mint (Flavorah)",
    "Tropical Citrus (Flavorah)",

    // The Flavor Apprentice (TFA)
    "Ripe Strawberry (TFA)",
    "Vanilla Custard (TFA)",
    "Cake Batter (TFA)",
    "Banana Cream (TFA)",
    "Lemonade (TFA)",
    "Blueberry Extra (TFA)",
    "Graham Cracker (TFA)",
    "Sweetener (TFA)",
    "Chocolate Double (TFA)",
    "Menthol (TFA)",

    // FLAVOUR ART
    "Apple Filling (FLV)",
    "Cream (FLV)",
    "Maple Bar (FLV)",
    "Strawberry (FLV)",
    "Vanilla Cream (FLV)",
    "Cucumber (FLV)",
    "Milk (FLV)",
    "Peach (FLV)",
    "Caramel (FLV)",
    "Chocolate (FLV)"
];


let flavorCount = 0;
let recipes = [];

window.onload = function () {
    addFlavor(); // Add one default flavor on page load
    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((obj, flavor) => {
            obj[flavor] = null;
            return obj;
        }, {})
    });

    // Initialize event listener for remove buttons
    document.getElementById('flavorsContainer').addEventListener('click', function (event) {
        if (event.target && event.target.matches('.remove-flavor')) {
            const flavorId = event.target.getAttribute('data-id');
            removeFlavor(flavorId);
        }
    });

    // Initialize event listener for delete recipe button
    document.getElementById('results').addEventListener('click', function (event) {
        if (event.target && event.target.matches('#deleteRecipeButton')) {
            deleteRecipe();
        }
    });
};

function addFlavor() {
    const container = document.getElementById('flavorsContainer');
    flavorCount++;

    const flavorDiv = document.createElement('div');
    flavorDiv.classList.add('row');
    flavorDiv.innerHTML = `
        <div class="input-field col s12 m6">
            <input id="flavor_name_${flavorCount}" type="text" class="autocomplete" placeholder="e.g., Vanilla, Strawberry, WS-23, WS-5">
            <label for="flavor_name_${flavorCount}" class="active">Flavor Name</label>
        </div>
        <div class="input-field col s12 m6">
            <input id="flavor_percent_${flavorCount}" type="number" class="validate" value="5">
            <label for="flavor_percent_${flavorCount}" class="active">Flavor Percentage (%)</label>
        </div>
        <button type="button" class="btn waves-effect waves-light red remove-flavor" data-id="${flavorCount}">Remove Flavor</button>
    `;
    container.appendChild(flavorDiv);

    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((obj, flavor) => {
            obj[flavor] = null;
            return obj;
        }, {})
    });
}

function removeFlavor(flavorId) {
    const flavorDiv = document.getElementById(`flavor_name_${flavorId}`).parentNode.parentNode;
    flavorDiv.remove();
    // Recalculate results after removing flavor
    calculateResults();
}

function calculateResults() {
    const vgRatio = parseFloat(document.getElementById('vg_ratio').value);
    const nicStrength = parseFloat(document.getElementById('nic_strength').value);
    const nicBase = parseFloat(document.getElementById('nic_base').value);
    const bottleSize = parseFloat(document.getElementById('bottle_size').value);

    if (isNaN(vgRatio) || isNaN(nicStrength) || isNaN(nicBase) || isNaN(bottleSize) || vgRatio < 0 || vgRatio > 100) {
        alert('Please enter valid numbers.');
        return;
    }

    // Nicotine needed (since nic base is PG-based)
    const totalNicotineNeeded = (nicStrength * bottleSize) / nicBase;

    // Calculate total flavor amount and deduct from PG
    let totalFlavorAmount = 0;
    let flavorText = '';
    for (let i = 1; i <= flavorCount; i++) {
        const flavorPercentInput = document.getElementById(`flavor_percent_${i}`);
        const flavorNameInput = document.getElementById(`flavor_name_${i}`);

        if (flavorPercentInput && flavorNameInput) {
            const flavorPercent = parseFloat(flavorPercentInput.value);
            const flavorAmount = (flavorPercent / 100) * bottleSize;
            totalFlavorAmount += flavorAmount;

            const flavorName = flavorNameInput.value || 'Unnamed Flavor';
            flavorText += `<strong>${flavorName}:</strong> ${flavorAmount.toFixed(2)} ml<br>`;
        }
    }

    const pgAmount = (100 - vgRatio) / 100 * bottleSize - (totalNicotineNeeded + totalFlavorAmount);
    const vgAmount = (vgRatio / 100) * bottleSize;

    if (pgAmount < 0 || vgAmount < 0) {
        alert('The calculations result in negative values. Please check your inputs.');
        return;
    }

    const resultText = `
        <strong>Total Nicotine Base Needed:</strong> ${totalNicotineNeeded.toFixed(2)} ml<br>
        ${flavorText}
        <strong>PG Amount:</strong> ${pgAmount.toFixed(2)} ml<br>
        <strong>VG Amount:</strong> ${vgAmount.toFixed(2)} ml
    `;
    document.getElementById('resultText').innerHTML = resultText;
}

function updateRecipeList(savedRecipes) {
    // Clear the previous recipe list
    const recipeSelect = document.getElementById('recipeSelect');
    recipeSelect.innerHTML = '';

    // Populate the dropdown with the updated recipe list
    savedRecipes.forEach((recipe, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = recipe.name;
        recipeSelect.appendChild(option);
    });

    M.FormSelect.init(document.querySelectorAll('select')); // Reinitialize Materialize select element
}

function loadRecipe() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const jsonData = JSON.parse(e.target.result);
            recipes = jsonData; // Set recipes with the data from the file

            alert('Recipes imported!');
            updateRecipeList(recipes); // Update the dropdown with imported recipes
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

function applyRecipe() {
    const selectedIndex = document.getElementById('recipeSelect').value;
    const recipe = recipes[selectedIndex];

    document.getElementById('vg_ratio').value = recipe.vg_ratio;
    document.getElementById('nic_strength').value = recipe.nic_strength;
    document.getElementById('nic_base').value = recipe.nic_base;
    document.getElementById('bottle_size').value = recipe.bottle_size;

    document.getElementById('flavorsContainer').innerHTML = '';
    flavorCount = 0;

    recipe.flavors.forEach(flavor => {
        addFlavor();
        document.getElementById(`flavor_name_${flavorCount}`).value = flavor.name;
        document.getElementById(`flavor_percent_${flavorCount}`).value = flavor.percent;
    });

    calculateResults();
    alert('Recipe applied!');
}

function exportRecipes() {
    if (recipes.length === 0) {
        alert('No recipes to export.');
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "recipes.json");
    document.body.appendChild(downloadAnchor); // Required for Firefox
    downloadAnchor.click();
    downloadAnchor.remove();

    alert('Recipes exported!');
}

function deleteRecipe() {
    const selectedIndex = document.getElementById('recipeSelect').value;

    if (selectedIndex < 0 || selectedIndex >= recipes.length) {
        alert('Invalid selection');
        return;
    }

    recipes.splice(selectedIndex, 1);

    alert('Recipe deleted!');

    updateRecipeList(recipes);
    localStorage.setItem('recipes', JSON.stringify(recipes));
}
