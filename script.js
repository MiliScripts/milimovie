// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM elements
const searchInput = document.getElementById('searchInput');
const moviesGrid = document.getElementById('moviesGrid');
const loader = document.getElementById('loader');
const noResults = document.getElementById('noResults');

// API endpoint
const API_BASE_URL = 'https://holy-darkness-9735.milaadfarzian.workers.dev/?q=';

// Search movies function
async function searchMovies(query) {
    if (!query.trim()) {
        moviesGrid.innerHTML = '';
        noResults.style.display = 'none';
        return;
    }

    try {
        loader.style.display = 'block';
        const response = await fetch(`${API_BASE_URL}${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.d || data.d.length === 0) {
            moviesGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        renderMovies(data.d);
        noResults.style.display = 'none';
    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesGrid.innerHTML = '<div class="error">Error fetching movies. Please try again.</div>';
    } finally {
        loader.style.display = 'none';
    }
}

// Render movies function
function renderMovies(movies) {
    moviesGrid.innerHTML = movies.map(movie => {
        const imdbId = movie.id || '';
        const imdbShort = imdbId.replace('tt', '');
        const year = movie.y || '';
        
        return `
        <div class="movie-card" data-imdb="${imdbShort}" data-year="${year}">
            ${movie.i ? `
                <img class="movie-poster" 
                     src="${movie.i.imageUrl}" 
                     alt="${movie.l}" 
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
            ` : `
                <img class="movie-poster" 
                     src="https://via.placeholder.com/300x450?text=No+Poster" 
                     alt="No poster available">
            `}
            <div class="movie-info">
                <h3 class="movie-title">${movie.l}</h3>
                ${movie.s ? `<p class="movie-cast">${movie.s}</p>` : ''}
                ${movie.y ? `<p class="movie-year">${movie.y}</p>` : ''}
            </div>
            <div class="download-links" style="display: none;">
                <a href="https://berlin.saymyname.website/Movies/${year}/${imdbShort}" class="download-link" rel="nofollow">دانلود فیلم (لینک اصلی)</a>
                <a href="https://tokyo.saymyname.website/Movies/${year}/${imdbShort}" class="download-link" rel="nofollow">دانلود فیلم (لینک کمکی)</a>
                <a href="https://nairobi.saymyname.website/Movies/${year}/${imdbShort}" class="download-link" rel="nofollow">دانلود فیلم (لینک کمکی)</a>
                <button class="add-to-watchlist">افزودن به واچ لیست</button>
            </div>
        </div>
    `}).join('');

    // Add click handlers to movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', function() {
            const imdbId = this.dataset.imdb;
            const year = this.dataset.year;
            window.location.href = `movie-details.html?id=${imdbId}&year=${year}`;
        });
    });
}


// Add event listener with debouncing
searchInput.addEventListener('input', debounce((e) => {
    searchMovies(e.target.value);
}, 500));