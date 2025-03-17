import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Ship.module.css';

const ShipList = () => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchShips = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spacexdata.com/v4/ships');
        const allShips = response.data;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedShips = allShips.slice(startIndex, endIndex);

        if (paginatedShips.length === 0 && currentPage !== 1) {
          navigate('/404');
          return;
        }

        setShips(paginatedShips);
        setError(null);
      } catch (err) {
        console.error('Error fetching ships:', err);
        setError('Failed to fetch ships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchShips();
  }, [currentPage, navigate]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading ships...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.shipListContainer}>
      <h1 className={styles.shipTitle}>SpaceX Ships</h1>
      
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.shipGrid}>
        {ships.map((ship) => (
          <div key={ship.id} className={styles.shipCard}>
            {ship.image && (
              <img 
                src={ship.image} 
                alt={ship.name}
                className={styles.shipImage}
              />
            )}
            <h2 className={styles.shipSubtitle}>{ship.name}</h2>
            <p className={styles.shipDescription}>
              Type: {ship.type || 'Unknown'}
            </p>
            <div className={`${styles.statusBadge} ${ship.active ? styles.success : styles.failure}`}>
              {ship.active ? 'Active' : 'Inactive'}
            </div>
            <div className={styles.shipInfo}>
              <p>Home Port: {ship.home_port || 'Unknown'}</p>
              {ship.year_built && (
                <p>Built: {ship.year_built}</p>
              )}
            </div>
            <Link to={`/ships/${ship.id}`} className={styles.relatedLink}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        {currentPage > 1 && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/ships/page/${currentPage - 1}`)}
          >
            Previous Page
          </button>
        )}
        {ships.length === itemsPerPage && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/ships/page/${currentPage + 1}`)}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default ShipList;