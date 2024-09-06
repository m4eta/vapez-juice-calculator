const flavorSuggestions = [
    // Cooling
    "WS-23",
    "WS-5",
    "Koolada",

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

    // Initialize event listener for remove buttons
    document.getElementById('flavorsContainer').addEventListener('click', function (event) {
        if (event.target && event.target.matches('.remove-flavor')) {
            const flavorId = event.target.getAttribute('data-id');
            removeFlavor(flavorId);
        }
    });

    // Initialize event listener for save button
    document.getElementById('saveRecipeButton').addEventListener('click', saveRecipe);

    // Initialize event listener for delete recipe button
    document.getElementById('results').addEventListener('click', function (event) {
        if (event.target && event.target.matches('#deleteRecipeButton')) {
            deleteRecipe();
        }
    });

    // Initialize event listener for apply recipe button
    document.getElementById('applyRecipeButton').addEventListener('click', applyRecipe);

    // Initialize flavor suggestions for autocomplete
    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((acc, flavor) => {
            acc[flavor] = null;
            return acc;
        }, {})
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
        <button type="button" class="btn remove-flavor red" data-id="${flavorCount}">Remove Flavor</button>
    `;
    container.appendChild(flavorDiv);

    // Reinitialize autocomplete for new flavor inputs
    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((acc, flavor) => {
            acc[flavor] = null;
            return acc;
        }, {})
    });
}

function removeFlavor(flavorId) {
    const flavorDiv = document.getElementById(`flavor_name_${flavorId}`).closest('.row');
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
    let flavorsDetail = '';

    for (let i = 1; i <= flavorCount; i++) {
        const flavorPercentInput = document.getElementById(`flavor_percent_${i}`);
        const flavorNameInput = document.getElementById(`flavor_name_${i}`);

        if (flavorPercentInput && flavorNameInput) {
            const flavorPercent = parseFloat(flavorPercentInput.value);
            const flavorAmount = (flavorPercent / 100) * bottleSize;
            totalFlavorAmount += flavorAmount;

            const flavorName = flavorNameInput.value || 'Unnamed Flavor';
            flavorsDetail += `<strong>${flavorName}:</strong> ${flavorAmount.toFixed(2)} ml<br>`;
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
        ${flavorsDetail}
        <strong>PG Amount:</strong> ${pgAmount.toFixed(2)} ml<br>
        <strong>VG Amount:</strong> ${vgAmount.toFixed(2)} ml
    `;
    document.getElementById('resultText').innerHTML = resultText;
}

function saveRecipe() {
    const recipeName = prompt('Enter recipe name:') || '';

    // If user cancels or provides an empty name, do not save the recipe
    if (!recipeName.trim()) {
        alert('Recipe name is required.');
        return;
    }

    const vgRatio = parseFloat(document.getElementById('vg_ratio').value);
    const nicStrength = parseFloat(document.getElementById('nic_strength').value);
    const nicBase = parseFloat(document.getElementById('nic_base').value);
    const bottleSize = parseFloat(document.getElementById('bottle_size').value);

    const flavors = [];
    for (let i = 1; i <= flavorCount; i++) {
        const flavorName = document.getElementById(`flavor_name_${i}`).value || 'Unnamed Flavor';
        const flavorPercent = parseFloat(document.getElementById(`flavor_percent_${i}`).value);
        flavors.push({ name: flavorName, percent: flavorPercent });
    }

    const recipe = {
        name: recipeName,
        vg_ratio: vgRatio,
        nic_strength: nicStrength,
        nic_base: nicBase,
        bottle_size: bottleSize,
        flavors: flavors
    };

    recipes.push(recipe);
    updateRecipeList(recipes);

    // Set the newly saved recipe as selected
    const newIndex = recipes.length - 1;
    document.getElementById('savedRecipes').value = newIndex;
    M.FormSelect.init(document.querySelectorAll('select')); // Reinitialize Materialize select element

    alert('Recipe saved!');
}

function updateRecipeList(savedRecipes) {
    const recipeSelect = document.getElementById('savedRecipes');
    recipeSelect.innerHTML = '<option value="" disabled selected>Choose your recipe</option>';

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
            try {
                const jsonData = JSON.parse(e.target.result);
                recipes = jsonData; // Set recipes with the data from the file

                // Update the recipe list with imported recipes
                updateRecipeList(recipes);

                // Select the first recipe from the imported list
                if (recipes.length > 0) {
                    const recipeSelect = document.getElementById('savedRecipes');
                    recipeSelect.value = 0; // Select the first recipe
                    M.FormSelect.init(recipeSelect); // Reinitialize Materialize select element
                }

                alert('Recipes imported!');
            } catch (err) {
                console.error('Error parsing JSON:', err);
                alert('Failed to import recipes. Please check the file format.');
            }
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

function exportRecipes() {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function applyRecipe() {
    const selectedRecipeIndex = document.getElementById('savedRecipes').value;
    if (selectedRecipeIndex === '') return;

    const recipe = recipes[selectedRecipeIndex];

    document.getElementById('vg_ratio').value = recipe.vg_ratio;
    document.getElementById('nic_strength').value = recipe.nic_strength;
    document.getElementById('nic_base').value = recipe.nic_base;
    document.getElementById('bottle_size').value = recipe.bottle_size;

    recipe.flavors.forEach((flavor, index) => {
        if (index < flavorCount) {
            document.getElementById(`flavor_name_${index + 1}`).value = flavor.name;
            document.getElementById(`flavor_percent_${index + 1}`).value = flavor.percent;
        } else {
            addFlavor();
            document.getElementById(`flavor_name_${index + 1}`).value = flavor.name;
            document.getElementById(`flavor_percent_${index + 1}`).value = flavor.percent;
        }
    });

    alert('Recipe applied!');
}

function deleteRecipe() {
    const selectedRecipeIndex = document.getElementById('savedRecipes').value;
    if (selectedRecipeIndex === '') return;

    recipes.splice(selectedRecipeIndex, 1);
    updateRecipeList(recipes);

    // Clear the inputs if the recipe is deleted
    document.getElementById('vg_ratio').value = '';
    document.getElementById('nic_strength').value = '';
    document.getElementById('nic_base').value = '';
    document.getElementById('bottle_size').value = '';
    document.getElementById('resultText').innerHTML = '';

    // Remove all flavor inputs
    const container = document.getElementById('flavorsContainer');
    container.innerHTML = '';
    flavorCount = 0;

    alert('Recipe deleted!');
}
function deleteRecipe() {
    const selectedIndex = document.getElementById('savedRecipes').value;

    if (selectedIndex < 0 || selectedIndex >= recipes.length) {
        alert('Invalid selection');
        return;
    }

    recipes.splice(selectedIndex, 1);

    alert('Recipe deleted!');

    updateRecipeList(recipes);
}
