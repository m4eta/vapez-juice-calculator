const flavorSuggestions = [
    "Lime Tahity (FA)",
    "Strawberry (CAP)",
    "Vanilla Custard (TPA)",
    "WS-23",
    "WS-5",
    // Add more popular flavors here
];

let flavorCount = 0;
let recipes = [];

window.onload = function() {
    addFlavor(); // Add one default flavor on page load
    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((obj, flavor) => {
            obj[flavor] = null;
            return obj;
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
        <button type="button" class="btn waves-effect waves-light red" onclick="removeFlavor(${flavorCount})">Remove Flavor</button>
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
    console.log('Total Nicotine Needed:', totalNicotineNeeded);

    // Calculate total flavor amount and deduct from PG
    let totalFlavorAmount = 0;
    let flavorText = '';
    for (let i = 1; i <= flavorCount; i++) {
        const flavorPercentInput = document.getElementById(`flavor_percent_${i}`);
        if (flavorPercentInput) { // Ensure the element exists
            const flavorPercent = parseFloat(flavorPercentInput.value);
            if (isNaN(flavorPercent) || flavorPercent < 0) {
                continue; // Skip invalid flavor percentages
            }
            const flavorAmount = (flavorPercent / 100) * bottleSize;
            totalFlavorAmount += flavorAmount;

            const flavorName = document.getElementById(`flavor_name_${i}`).value || 'Unnamed Flavor';
            flavorText += `<strong>${flavorName}:</strong> ${flavorAmount.toFixed(2)} ml<br>`;
        }
    }
    console.log('Total Flavor Amount:', totalFlavorAmount);

    const pgAmount = (100 - vgRatio) / 100 * bottleSize - (totalNicotineNeeded + totalFlavorAmount);
    const vgAmount = (vgRatio / 100) * bottleSize;
    console.log('PG Amount:', pgAmount);
    console.log('VG Amount:', vgAmount);

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
        <button type="button" class="btn waves-effect waves-light red" onclick="removeFlavor(${flavorCount})">Remove Flavor</button>
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
    flavorCount--;
    // Recalculate results after removing a flavor
    calculateResults();
}

function saveRecipe() {
    const recipe = {
        vg_ratio: document.getElementById('vg_ratio').value,
        nic_strength: document.getElementById('nic_strength').value,
        nic_base: document.getElementById('nic_base').value,
        bottle_size: document.getElementById('bottle_size').value,
        flavors: []
    };

    for (let i = 1; i <= flavorCount; i++) {
        recipe.flavors.push({
            name: document.getElementById(`flavor_name_${i}`).value,
            percent: document.getElementById(`flavor_percent_${i}`).value
        });
    }

    recipes.push(recipe);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    alert('Recipe saved!');
}

function loadRecipe() {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    if (savedRecipes.length === 0) {
        alert('No recipes found.');
        return;
    }

    const recipe = savedRecipes[savedRecipes.length - 1]; // Load the most recent recipe
    document.getElementById('vg_ratio').value = recipe.vg_ratio;
    document.getElementById('nic_strength').value = recipe.nic_strength;
    document.getElementById('nic_base').value = recipe.nic_base;
    document.getElementById('bottle_size').value = recipe.bottle_size;

    const container = document.getElementById('flavorsContainer');
    container.innerHTML = ''; // Clear existing flavors

    recipe.flavors.forEach((flavor, index) => {
        flavorCount++;
        const flavorDiv = document.createElement('div');
        flavorDiv.classList.add('row');
        flavorDiv.innerHTML = `
            <div class="input-field col s12 m6">
                <input id="flavor_name_${flavorCount}" type="text" class="autocomplete" value="${flavor.name}">
                <label for="flavor_name_${flavorCount}" class="active">Flavor Name</label>
            </div>
            <div class="input-field col s12 m6">
                <input id="flavor_percent_${flavorCount}" type="number" class="validate" value="${flavor.percent}">
                <label for="flavor_percent_${flavorCount}" class="active">Flavor Percentage (%)</label>
            </div>
            <button type="button" class="btn waves-effect waves-light red" onclick="removeFlavor(${flavorCount})">Remove Flavor</button>
        `;
        container.appendChild(flavorDiv);
    });

    M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
        data: flavorSuggestions.reduce((obj, flavor) => {
            obj[flavor] = null;
            return obj;
        }, {})
    });

    alert('Recipe loaded!');
}
