import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Rocket.module.css';

const RocketList = () => {
  const [rockets, setRockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page = 1 } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRockets = async () => {
      try {
        setLoading(true);
        // Use query to get paginated data
        const response = await axios.post('https://api.spacexdata.com/v4/rockets/query', {
          options: {
            page: currentPage,
            limit: itemsPerPage
          }
        });
        setRockets(response.data.docs || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching rockets:', err);
        setError('Failed to fetch rockets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRockets();
  }, [currentPage]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading rockets...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  // If no rockets and not on first page, show 404
  if (rockets.length === 0 && currentPage !== 1) {
    return <div className={styles.errorContainer}>404 - Page Not Found</div>;
  }

  return (
    <div className={styles.rocketListContainer}>
      <h1 className={styles.rocketTitle}>SpaceX Rockets</h1>
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.rocketGrid}>
        {rockets.map((rocket) => (
          <div key={rocket.id} className={styles.rocketCard}>
            {rocket.flickr_images?.[0] && (
              <img 
                src={rocket.flickr_images[0]} 
                alt={rocket.name}
                className={styles.rocketImage}
              />
            )}
            <h2 className={styles.rocketSubtitle}>{rocket.name}</h2>
            <p className={styles.rocketDescription}>
              First Flight: {new Date(rocket.first_flight).toLocaleDateString()}
            </p>
            <div className={`${styles.statusBadge} ${rocket.active ? styles.success : styles.failure}`}>
              {rocket.active ? 'Active' : 'Inactive'}
            </div>
            <Link to={`/rockets/${rocket.id}`} className={styles.relatedLink}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        {currentPage > 1 && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/rockets/page/${currentPage - 1}`)}
          >
            Previous Page
          </button>
        )}
        {rockets.length === itemsPerPage && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/rockets/page/${currentPage + 1}`)}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default RocketList;