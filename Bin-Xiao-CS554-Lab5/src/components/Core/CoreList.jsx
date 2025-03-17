import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './Core.module.css';

const CoreList = () => {
  const [cores, setCores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();

    const fetchCores = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spacexdata.com/v4/cores', {
          signal: controller.signal
        });
        const allCores = response.data;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedCores = allCores.slice(startIndex, endIndex);

        if (paginatedCores.length === 0 && currentPage !== 1) {
          navigate('/404');
          return;
        }

        setCores(paginatedCores);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching cores:', err);
          setError('Failed to fetch cores. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCores();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [currentPage, navigate]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading cores...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.coreListContainer}>
      <h1 className={styles.coreTitle}>SpaceX Cores</h1>
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.coreGrid}>
        {cores.map((core) => (
          <div key={core.id} className={styles.coreCard}>
            <h2 className={styles.coreSubtitle}>{core.serial}</h2>
            <p className={styles.coreDescription}>
              Reuse Count: {core.reuse_count}
            </p>
            <div className={`${styles.statusBadge} ${styles[core.status]}`}>
              {core.status.replace(/_/g, ' ')}
            </div>
            <div className={styles.coreDescription}>
              <p>Launches: {core.launches.length}</p>
              {core.last_update && (
                <p>Last Update: {core.last_update}</p>
              )}
            </div>
            <Link to={`/cores/${core.id}`} className={styles.relatedLink}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        {currentPage > 1 && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/cores/page/${currentPage - 1}`)}
          >
            Previous Page
          </button>
        )}
        {cores.length === itemsPerPage && (
          <button 
            className={styles.pageButton}
            onClick={() => navigate(`/cores/page/${currentPage + 1}`)}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default CoreList;