import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Launch.module.css';

const LaunchList = () => {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spacexdata.com/v4/launches');
        const allLaunches = response.data;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedLaunches = allLaunches.slice(startIndex, endIndex);

        if (paginatedLaunches.length === 0 && currentPage !== 1) {
          navigate('/404');
          return;
        }

        setLaunches(paginatedLaunches);
        setError(null);
      } catch (err) {
        console.error('Error fetching launches:', err);
        setError('Failed to fetch launches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, [currentPage, navigate]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading launches...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.launchListContainer}>
      <h1 className={styles.launchTitle}>SpaceX Launches</h1>
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.launchGrid}>
        {launches.map((launch) => (
          <div key={launch.id} className={styles.launchCard}>
            {launch.links?.patch?.small && (
              <img 
                src={launch.links.patch.small} 
                alt={launch.name}
                className={styles.launchPatch}
              />
            )}
            <h2 className={styles.launchSubtitle}>{launch.name}</h2>
            <p className={styles.launchDescription}>
              Flight Number: {launch.flight_number}
            </p>
            <div className={styles.statusBadge + ' ' + (launch.success ? styles.success : styles.failure)}>
              {launch.success ? 'Success' : 'Failure'}
            </div>
            <Link to={`/launches/${launch.id}`} className={styles.relatedLink}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        {currentPage > 1 && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/launches/page/${currentPage - 1}`)}
          >
            Previous Page
          </button>
        )}
        {launches.length === itemsPerPage && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/launches/page/${currentPage + 1}`)}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default LaunchList;