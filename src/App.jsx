import { useState, useCallback, useMemo } from "react";
import "./App.css";

// Custom hook for debounced search
const useDebounce = (callback, delay) => {
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setDebounceTimer(newTimer);
  }, [callback, delay, debounceTimer]);
  
  return debouncedCallback;
};

// Custom hook for movie search logic
const useMovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const searchMovies = async (term) => {
    if (!term.trim()) return;

    setHasSearched(true);
    setLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API key
      const response = await fetch(
        `https://www.omdbapi.com/?s=${term}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`
      );
      const data = await response.json();

      if (data.Search) {
        const filteredMovies = data.Search.filter(
          (movie) => movie.Type === "movie" || movie.Type === "series"
        );
        setMovies(filteredMovies);
        getMovieDetails(filteredMovies);
      } else {
        setMovies([]);
        setMovieDetails({});
        if (data.Error) {
          setError(data.Error);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search movies. Please try again.");
      setMovies([]);
      setMovieDetails({});
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (movieList) => {
    const details = {};
    const moviesToDetail = movieList.slice(0, 5);

    for (const movie of moviesToDetail) {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${import.meta.env.VITE_OMDB_API_KEY}&plot=full`
        );
        const detailData = await response.json();
        if (detailData.Response === "True") {
          details[movie.imdbID] = detailData;
        }
      } catch (error) {
        console.error("Failed to get details for:", movie.Title);
      }
    }

    setMovieDetails(details);
  };

  return {
    searchTerm,
    setSearchTerm,
    movies,
    movieDetails,
    loading,
    hasSearched,
    error,
    searchMovies
  };
};

// MovieCard Component - matches your existing CSS structure
const MovieCard = ({ movie, details }) => {
  const [showFullPlot, setShowFullPlot] = useState(false);

  const truncatedPlot = details?.Plot && details.Plot.length > 200 
    ? details.Plot.substring(0, 200) + "..."
    : details?.Plot;

  return (
    <div className="movie-card">
      <img
        src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/160x240/333/999?text=No+Image"}
        alt={movie.Title}
        className="movie-poster"
      />
      
      <div className="movie-details">
        <h3 className="movie-title">{movie.Title}</h3>

        {details ? (
          <div className="movie-info">
            {/* Most important info first */}
            <p className="info-item">
              <span className="info-label">Year:</span> {movie.Year}
            </p>
            <p className="info-item">
              <span className="info-label">Type:</span> {movie.Type}
            </p>
            {details.Genre && details.Genre !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Genre:</span> {details.Genre}
              </p>
            )}
            {details.Runtime && details.Runtime !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Runtime:</span> {details.Runtime}
              </p>
            )}
            {details.Rated && details.Rated !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Rated:</span> {details.Rated}
              </p>
            )}
            {details.Released && details.Released !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Released:</span> {details.Released}
              </p>
            )}
            {details.Director && details.Director !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Director:</span> {details.Director}
              </p>
            )}
            {details.Actors && details.Actors !== "N/A" && (
              <p className="info-item" data-long="true">
                <span className="info-label">Actors:</span> {details.Actors}
              </p>
            )}
            {details.Language && details.Language !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Language:</span> {details.Language}
              </p>
            )}
            {details.Country && details.Country !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Country:</span> {details.Country}
              </p>
            )}
            {details.BoxOffice && details.BoxOffice !== "N/A" && (
              <p className="info-item">
                <span className="info-label">Box Office:</span> {details.BoxOffice}
              </p>
            )}
            {details.Awards && details.Awards !== "N/A" && (
              <p className="info-item" data-long="true">
                <span className="info-label">Awards:</span> {details.Awards}
              </p>
            )}
          </div>
        ) : (
          <div className="movie-info">
            <p className="info-item">
              <span className="info-label">Year:</span> {movie.Year}
            </p>
            <p className="info-item">
              <span className="info-label">Type:</span> {movie.Type}
            </p>
            <p className="info-item" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Loading details...
            </p>
          </div>
        )}

        {details && details.Ratings && details.Ratings.length > 0 && (
          <div className="ratings-section">
            {details.Ratings.map((rating, index) => (
              <span key={index} className="rating-item">
                {rating.Source.replace('Internet Movie Database', 'IMDb')}: {rating.Value}
              </span>
            ))}
          </div>
        )}

        {details && details.Plot && details.Plot !== "N/A" && (
          <div className="movie-plot">
            {showFullPlot ? details.Plot : truncatedPlot}
            {details.Plot.length > 200 && (
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  onClick={() => setShowFullPlot(!showFullPlot)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textDecoration: 'underline'
                  }}
                >
                  {showFullPlot ? "Show less" : "Read more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const {
    searchTerm,
    setSearchTerm,
    movies,
    movieDetails,
    loading,
    hasSearched,
    error,
    searchMovies
  } = useMovieSearch();

  const debouncedSearch = useDebounce(searchMovies, 500);

  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      debouncedSearch(term);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🎬 Movie Search</h1>

      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && searchMovies(searchTerm)}
          />
        </div>
        <button
          onClick={() => searchMovies(searchTerm)}
          className="search-button"
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {searchTerm && (
        <p className="search-info">You're searching for: "{searchTerm}"</p>
      )}

      {loading && <p className="loading">🔍 Searching for movies...</p>}

      <div className="movies-grid">
        {movies.length > 0 &&
          movies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              details={movieDetails[movie.imdbID]}
            />
          ))}
      </div>

      {!loading && movies.length === 0 && hasSearched && (
        <p className="no-results">
          No movies found. Try a different search term.
        </p>
      )}
    </div>
  );
}

export default App;
