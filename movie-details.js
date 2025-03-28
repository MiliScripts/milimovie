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
const movieSearch = document.getElementById('movieSearch');

// Create search results container
const searchResults = document.createElement('div');
searchResults.className = 'search-results';
searchResults.style.display = 'none';
document.querySelector('.movie-search').appendChild(searchResults);

// Create search skeleton
const searchSkeleton = document.createElement('div');
searchSkeleton.className = 'search-result-skeleton';
searchSkeleton.innerHTML = `
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
`;
searchResults.appendChild(searchSkeleton);

// API endpoints
const SEARCH_API_URL = 'https://holy-darkness-9735.milaadfarzian.workers.dev/?q=';
const IMDB_API_URL = 'https://holy-darkness-9735.milaadfarzian.workers.dev/?getImdbData=';

// Load movie details
async function loadMovieDetails() {
    const { imdbId, year } = getUrlParams();
    if (!imdbId || !year) {
        console.error('Missing movie ID or year');
        return;
    }

    try {
        // Fetch movie details from Search API
        const searchResponse = await fetch(`${SEARCH_API_URL}tt${imdbId}`);
        const searchData = await searchResponse.json();
        const movie = searchData.d[0];

        // Fetch IMDB plot data
        const plotResponse = await fetch(`${IMDB_API_URL}tt${imdbId}`);
        const plotData = await plotResponse.json();

        // Update plot section
        document.querySelector('.plot-skeleton').style.display = 'none';
        document.querySelector('.plot-content').style.display = 'block';
        
        if (plotData.success && plotData.plot && plotData.plot.l) {
            document.getElementById('moviePlot').textContent = plotData.plot.l;
        } else {
            document.getElementById('moviePlot').innerHTML = '<div class="no-plot">No plot available for this movie.</div>';
        }

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
document.addEventListener('DOMContentLoaded', function() {
    const addToWatchlist = document.getElementById('addToWatchlist');
    if (addToWatchlist) {
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
    }
});

// Handle movie search
let searchTimeout;
movieSearch.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Hide results if query is empty
    if (!query) {
        searchResults.style.display = 'none';
        return;
    }
    
    // Show skeleton loader
    searchResults.style.display = 'block';
    searchSkeleton.style.display = 'block';
    
    // Debounce search request
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${SEARCH_API_URL}${query}`);
            const data = await response.json();
            
            // Hide skeleton
            searchSkeleton.style.display = 'none';
            
            // Process and display results
            if (data.d && data.d.length > 0) {
                const resultsHtml = data.d.slice(0, 5).map(movie => {
                    const year = movie.y || '';
                    const id = movie.id.replace('tt', '');
                    return `<div class="search-result-item" onclick="window.location.href='movie-details.html?id=${id}&year=${year}'">
                        <div class="search-result-title">${movie.l}</div>
                        ${year ? `<div class="search-result-year">${year}</div>` : ''}
                    </div>`;
                }).join('');
                searchResults.innerHTML = resultsHtml;
            } else {
                searchResults.innerHTML = '<div class="no-results">No movies found</div>';
            }
        } catch (error) {
            console.error('Error searching movies:', error);
            searchResults.innerHTML = '<div class="search-error">Error searching movies</div>';
        }
    }, 300);
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.movie-search')) {
        searchResults.style.display = 'none';
    }
});

// Load movie details when page loads
loadMovieDetails();