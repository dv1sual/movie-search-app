import { useState } from "react";
import "./App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMovies = async (searchTerm) => {
    if (!searchTerm) return;

    setHasSearched(true);
    setLoading(true);
    try {
      const response = await fetch(
        `http://www.omdbapi.com/?s=${searchTerm}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`,
      );
      const data = await response.json();

      if (data.Search) {
        // Filter out games, keep only movies and series
        const filteredMovies = data.Search.filter(
          (movie) => movie.Type === "movie" || movie.Type === "series",
        );
        setMovies(filteredMovies);
        getMovieDetails(filteredMovies);
      } else {
        setMovies([]);
        setMovieDetails({});
      }
    } catch (error) {
      console.error("Search failed:", error);
      setMovies([]);
      setMovieDetails({});
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (movieList) => {
    const details = {};

    // Get detailed info for first 5 movies to avoid too many API calls
    const moviesToDetail = movieList.slice(0, 5);
    console.log("Getting details for", moviesToDetail.length, "movies...");

    for (const movie of moviesToDetail) {
      try {
        console.log("Fetching details for:", movie.Title);
        const response = await fetch(
          `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${import.meta.env.VITE_OMDB_API_KEY}&plot=full`,
        );
        const detailData = await response.json();
        if (detailData.Response === "True") {
          details[movie.imdbID] = detailData;
          console.log("Got details for:", movie.Title);
        }
      } catch {
        console.error("Failed to get details for:", movie.Title);
      }
    }

    setMovieDetails(details);
    console.log("All details loaded:", details);
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && searchMovies(searchTerm)}
          />
        </div>
        <button
          onClick={() => searchMovies(searchTerm)}
          className="search-button"
          disabled={loading}
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
          movies.map((movie) => {
            const details = movieDetails[movie.imdbID];

            return (
              <div key={movie.imdbID} className="movie-card">
                <img
                  src={
                    movie.Poster !== "N/A"
                      ? movie.Poster
                      : "https://via.placeholder.com/150x220?text=No+Image"
                  }
                  alt={movie.Title}
                  className="movie-poster"
                />
                <div className="movie-details">
                  <h3 className="movie-title">{movie.Title}</h3>

                  <div className="movie-info">
                    <p className="info-item">
                      <span className="info-label">Year:</span> {movie.Year}
                    </p>
                    <p className="info-item">
                      <span className="info-label">Type:</span> {movie.Type}
                    </p>

                    {details ? (
                      <>
                        <p className="info-item">
                          <span className="info-label">Director:</span>{" "}
                          {details.Director}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Actors:</span>{" "}
                          {details.Actors}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Genre:</span>{" "}
                          {details.Genre}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Runtime:</span>{" "}
                          {details.Runtime}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Rated:</span>{" "}
                          {details.Rated}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Released:</span>{" "}
                          {details.Released}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Language:</span>{" "}
                          {details.Language}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Country:</span>{" "}
                          {details.Country}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Awards:</span>{" "}
                          {details.Awards}
                        </p>
                        <p className="info-item">
                          <span className="info-label">Box Office:</span>{" "}
                          {details.BoxOffice || "N/A"}
                        </p>
                      </>
                    ) : (
                      <p className="info-item">Loading details...</p>
                    )}
                  </div>

                  {details && details.Ratings && details.Ratings.length > 0 && (
                    <div className="ratings-section">
                      {details.Ratings.map((rating, index) => (
                        <span key={index} className="rating-item">
                          {rating.Source}: {rating.Value}
                        </span>
                      ))}
                    </div>
                  )}

                  {details && details.Plot && details.Plot !== "N/A" && (
                    <p className="movie-plot">"{details.Plot}"</p>
                  )}
                </div>
              </div>
            );
          })}
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
