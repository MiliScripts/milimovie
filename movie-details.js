// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        imdbId: params.get('id'),
        year: params.get('year')
    };
}

// DOM elements
const moviePoster = document.getElementById('moviePoster');
const movieTitle = document.getElementById('movieTitle');
const movieYear = document.getElementById('movieYear');
const movieCast = document.getElementById('movieCast');
const downloadLink1 = document.getElementById('downloadLink1');
const downloadLink2 = document.getElementById('downloadLink2');
const downloadLink3 = document.getElementById('downloadLink3');
const addToWatchlist = document.getElementById('addToWatchlist');

// API endpoint
const API_BASE_URL = 'https://holy-darkness-9735.milaadfarzian.workers.dev/?q=';

// Load movie details
async function loadMovieDetails() {
    const { imdbId, year } = getUrlParams();
    if (!imdbId || !year) {
        console.error('Missing movie ID or year');
        return;
    }

    try {
        // Fetch movie details from API
        const response = await fetch(`${API_BASE_URL}tt${imdbId}`);
        const data = await response.json();
        const movie = data.d[0];

        if (!movie) {
            console.error('Movie not found');
            return;
        }

        // Update UI with movie details
        document.title = `${movie.l} (${year}) - Movie Details`;
        movieTitle.textContent = movie.l;
        movieYear.textContent = year;
        movieCast.textContent = movie.s || '';

        if (movie.i && movie.i.imageUrl) {
            moviePoster.src = movie.i.imageUrl;
            document.querySelector('.movie-backdrop').style.backgroundImage = `url(${movie.i.imageUrl})`;
        }

        // Update download links based on content type
        if (movie.qid === 'tvSeries') {
            const seriesName = movie.l;
            const firstLetter = seriesName.charAt(0).toUpperCase();
            const seriesUrl = `https://nairobi.saymyname.website/?dir=Series/${firstLetter}/${seriesName}`;
            downloadLink1.href = seriesUrl;
            downloadLink2.style.display = 'none';
            downloadLink3.style.display = 'none';
        } else {
            downloadLink1.href = `https://tokyo.saymyname.website/Movies/${year}/${imdbId}`;
            downloadLink2.href = `https://berlin.saymyname.website/Movies/${year}/${imdbId}`;
            downloadLink3.href = `https://nairobi.saymyname.website/Movies/${year}/${imdbId}`;
        }

    } catch (error) {
        console.error('Error loading movie details:', error);
    }
}

// Add to watchlist functionality
addToWatchlist.addEventListener('click', function() {
    const { imdbId, year } = getUrlParams();
    const movieData = {
        id: imdbId,
        year: year,
        title: movieTitle.textContent,
        poster: moviePoster.src
    };

    let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const exists = watchlist.some(movie => movie.id === imdbId);

    if (!exists) {
        watchlist.push(movieData);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        this.textContent = '✓ Added to Watchlist';
        this.style.backgroundColor = '#218838';
    } else {
        watchlist = watchlist.filter(movie => movie.id !== imdbId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        this.textContent = '+ Add to Watchlist';
        this.style.backgroundColor = '#28a745';
    }
});

// Load movie details when page loads
loadMovieDetails();