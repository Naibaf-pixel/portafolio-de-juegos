const API_KEY = 'a5b32a37012d491896a8fb318929a947';
const container = document.getElementById('gamesContainer');
const inputBusqueda = document.getElementById('busquedaInput');
const filterButtons = document.querySelectorAll('.console-btn');
const tituloSeccion = document.getElementById('sectionTitle');

const FAVORITE_GAME_IDS = [
    'resident-evil-4-2023',
    'plants-vs-zombies-garden-warfare-2',
    'minecraft',
    'resident-evil-village',
    'cyberpunk-2077',
    'god-of-war-2',
    'god-of-war-ragnarok',
    'cuphead',
    'the-legend-of-zelda-breath-of-the-wild',
    'celeste',
    'it-takes-two-2',
    'uncharted-4-a-thiefs-end',
];

let cachedFavorites = [];

async function initializeApp() {
    tituloSeccion.innerText = "Cargando biblioteca...";
    container.innerHTML = `
        <div class="text-center w-100 py-5">
            <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></div>
        </div>`;

    try {
        const promises = FAVORITE_GAME_IDS.map(id =>
            fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`).then(res => res.json())
        );

        cachedFavorites = await Promise.all(promises);
        renderGames(cachedFavorites, "Tus Juegos Favoritos");

    } catch (error) {
        console.error("API Connection Error:", error);
        tituloSeccion.innerText = "Error: No se pudieron cargar los favoritos.";
        container.innerHTML = '<p class="text-center text-danger fw-bold">Error de conexión.</p>';
    }
}

async function searchAndFilterGames(query = '', platformId = '') {
    container.innerHTML = `
        <div class="text-center w-100 py-5">
            <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></div>
        </div>`;

    if (!query) {
        if (!platformId) {
            renderGames(cachedFavorites, "Tus Juegos Favoritos");
            return;
        }

        const filteredFavorites = cachedFavorites.filter(game => {
            return game.platforms && game.platforms.some(p => String(p.platform.id) === platformId);
        });

        const platformName = document.querySelector(`.console-btn[data-platform="${platformId}"]`).innerText;
        renderGames(filteredFavorites, `Filtrando por: ${platformName}`);
        return;
    }

    tituloSeccion.innerText = `Resultados para: "${query}"`;
    try {
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=12&search=${encodeURIComponent(query)}`;
        if (platformId) {
            url += `&platforms=${platformId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        renderGames(data.results, `Resultados encontrados: ${data.results.length}`);
    } catch (error) {
        console.error("Query Error:", error);
        tituloSeccion.innerText = "Error en la búsqueda.";
        container.innerHTML = '<p class="text-center text-danger fw-bold">Sin resultados.</p>';
    }
}

function renderGames(gamesList, titleText) {
    tituloSeccion.innerText = titleText;
    container.innerHTML = '';

    if (!gamesList || gamesList.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-5 fw-bold">No se encontraron juegos para esta consola.</p>';
        return;
    }

    gamesList.forEach(game => {
        const cardHTML = `
            <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                <div class="game-card h-100">
                    <div class="game-img-wrapper">
                        <img src="${game.background_image || 'https://via.placeholder.com/400x200/eee/333?text=Sin+Imagen'}" class="game-img" alt="${game.name}">
                        <span class="badge-rating">
                            <i class="fas fa-star text-warning me-1"></i>${game.rating || 'N/A'}
                        </span>
                    </div>
                    <div class="p-3 d-flex flex-column h-100">
                        <h5 class="card-title">${game.name}</h5>
                        <p class="small text-muted mb-3 fw-bold">
                            ${game.released ? 'Lanzamiento: ' + game.released.substring(0, 4) : 'Desconocido'}
                        </p>
                        
                        <button class="btn-start w-100 mt-auto" 
                                onclick="fetchGameDetails(${game.id})" 
                                data-bs-toggle="modal" 
                                data-bs-target="#gameDetailModal">
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

async function fetchGameDetails(id) {
    const modalTitle = document.getElementById('modalGameTitle');
    const modalBody = document.getElementById('modalGameBody');

    modalTitle.innerText = "Cargando...";
    modalBody.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></div>
        </div>`;

    try {
        const response = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);
        const game = await response.json();

        modalTitle.innerText = game.name;

        const platformsHTML = game.platforms
            ? game.platforms.map(p => `<span class="badge bg-secondary me-1 mb-1">${p.platform.name}</span>`).join('')
            : '<span class="text-muted">N/A</span>';

        const genresHTML = game.genres
            ? game.genres.map(g => `<span class="badge text-bg-light border me-1 mb-1">${g.name}</span>`).join('')
            : '';

        modalBody.innerHTML = `
            <div class="row g-0">
                <div class="col-lg-5">
                    <img src="${game.background_image}" class="w-100 h-100" style="object-fit: cover;" alt="${game.name}">
                </div>
                <div class="col-lg-7 p-4 bg-white">
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                        <div>
                            <div class="text-muted small fw-bold mb-1">METACRITIC</div>
                            <div class="fs-4 fw-bold" style="color: #2D2D2D;">${game.metacritic || 'N/A'}</div>
                        </div>
                        <div class="text-end">
                            <div class="text-muted small fw-bold mb-1">FECHA DE SALIDA</div>
                            <div class="fw-bold">${game.released || 'TBA'}</div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="text-muted small fw-bold mb-2">CONSOLAS COMPATIBLES</div>
                        <div>${platformsHTML}</div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="text-muted small fw-bold mb-2">GÉNERO</div>
                        <div>${genresHTML}</div>
                    </div>
                    
                    <div>
                        <div class="text-muted small fw-bold mb-2">SINOPSIS</div>
                        <div class="small text-dark" style="max-height: 200px; overflow-y: auto; line-height: 1.6;">
                            ${game.description || 'Sin descripción disponible.'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        modalTitle.innerText = "Error";
        modalBody.innerHTML = `<div class="p-5 text-center text-danger fw-bold">No se pudo cargar la información.</div>`;
    }
}

inputBusqueda.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const activePlatform = document.querySelector('.console-btn.active').dataset.platform;
        searchAndFilterGames(e.target.value.trim(), activePlatform);
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const selectedPlatform = e.target.dataset.platform;
        const currentQuery = inputBusqueda.value.trim();
        searchAndFilterGames(currentQuery, selectedPlatform);
    });
});

initializeApp();