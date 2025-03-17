import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './LaunchPad.module.css';

const LaunchPadList = () => {
  const [launchPads, setLaunchPads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page = 1 } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLaunchPads = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spacexdata.com/v4/launchpads');
        setLaunchPads(response.data);
        setError(null);
      } catch (err) {
        console.log(err);
        setError('Failed to fetch launch pads');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchPads();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading launch pads...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLaunchPads = launchPads.slice(startIndex, endIndex);
  const totalPages = Math.ceil(launchPads.length / itemsPerPage);

  if (currentPage < 1 || (currentPage > totalPages && launchPads.length > 0)) {
    return <div className={styles.errorMessage}>404 - Page Not Found</div>;
  }

  return (
    <div className={styles.launchPadContainer}>
      <h1>SpaceX Launch Pads</h1>
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.launchPadGrid}>
        {currentLaunchPads.map((launchPad) => (
          <Link 
            to={`/launchpads/${launchPad.id}`} 
            key={launchPad.id}
            className={styles.launchPadCard}
          >
            <div className={styles.imageContainer}>
              {launchPad.images?.large[0] ? (
                <img 
                  src={launchPad.images.large[0]} 
                  alt={launchPad.name}
                  className={styles.launchPadImage}
                />
              ) : (
                <div className={styles.noImage}>No Image Available</div>
              )}
            </div>
            <div className={styles.launchPadInfo}>
              <h2>{launchPad.name}</h2>
              <p className={styles.location}>{launchPad.locality}, {launchPad.region}</p>
              <span className={`${styles.status} ${styles[launchPad.status]}`}>
                {launchPad.status.replace('_', ' ')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.pagination}>
        {currentPage > 1 && (
          <button 
            onClick={() => navigate(`/launchpads/page/${currentPage - 1}`)}
            className={styles.pageButton}
          >
            Previous Page
          </button>
        )}
        <span className={styles.pageIndicator}>
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <button 
            onClick={() => navigate(`/launchpads/page/${currentPage + 1}`)}
            className={styles.pageButton}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default LaunchPadList;