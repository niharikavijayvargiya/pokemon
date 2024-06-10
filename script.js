// script.js
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchButton = document.getElementById('searchButton');
    const typeSelector = document.getElementById('typeSelector');
    const filterButton = document.getElementById('filterButton');
    const resetButton = document.getElementById('resetButton');
    const pokemonContainer = document.getElementById('pokemonContainer');

    let allPokemon = [];

    // Fetch Pokémon types and data on load
    fetch('https://pokeapi.co/api/v2/type/')
        .then(response => response.json())
        .then(data => {
            populateTypeSelector(data.results);
            fetchAllPokemon(data.results);
        });

    // Populate type selector
    function populateTypeSelector(types) {
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeSelector.appendChild(option);
        });
    }

    // Fetch all Pokémon data
// Fetch all Pokémon data
function fetchAllPokemon(types) {
    const promises = types.map(type => fetch(type.url).then(response => response.json()));
    Promise.all(promises)
        .then(results => {
            const uniquePokemon = new Map();
            results.forEach(result => {
                result.pokemon.forEach(p => uniquePokemon.set(p.pokemon.name, p.pokemon));
            });
            allPokemon = Array.from(uniquePokemon.values());
            // Sort Pokémon by hash IDs
            allPokemon.sort((a, b) => parseInt(a.url.split('/').slice(-2)[0]) - parseInt(b.url.split('/').slice(-2)[0]));
            displayPokemon(allPokemon);
        })
        .catch(error => console.error('Error fetching Pokémon data:', error));
}

    // Display Pokémon cards
    function displayPokemon(pokemonList) {
        pokemonContainer.innerHTML = '';
        pokemonList.forEach(pokemon => {
            fetch(pokemon.url)
                .then(response => response.json())
                .then(data => {
                    const card = createPokemonCard(data);
                    pokemonContainer.appendChild(card);
                });
        });
    }

    // Create Pokémon card
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = `pokemon-card flip-card type-${pokemon.types[0].type.name}`;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'flip-card-inner';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'flip-card-front';
        cardFront.innerHTML = `
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-image">
        `;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'flip-card-back';
        cardBack.innerHTML = `
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <p>Height: ${pokemon.height}</p>
            <p>Weight: ${pokemon.weight}</p>
            <p>Abilities: ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
        `;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        return card;
    }

    // Search Pokémon
    searchButton.addEventListener('click', () => {
        const query = searchBar.value.toLowerCase();
        const filteredPokemon = allPokemon.filter(pokemon => pokemon.name.includes(query));
        if (filteredPokemon.length) {
            displayPokemon(filteredPokemon);
        } else {
            pokemonContainer.innerHTML = '<p>No Pokémon found.</p>';
        }
    });

    // Filter Pokémon by type
    filterButton.addEventListener('click', () => {
        const selectedType = typeSelector.value;
        if (selectedType === 'all') {
            displayPokemon(allPokemon);
        } else {
            fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
                .then(response => response.json())
                .then(data => {
                    const filteredPokemon = data.pokemon.map(p => p.pokemon);
                    displayPokemon(filteredPokemon);
                });
        }
    });

    // Reset Pokémon list
    resetButton.addEventListener('click', () => {
        searchBar.value = '';
        typeSelector.value = 'all';
        displayPokemon(allPokemon);
    });
});
