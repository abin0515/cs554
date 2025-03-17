import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Payload.module.css';

const PayloadList = () => {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(page);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spacexdata.com/v4/payloads');
        const allPayloads = response.data;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPayloads = allPayloads.slice(startIndex, endIndex);

        if (paginatedPayloads.length === 0 && currentPage !== 1) {
          navigate('/404');
          return;
        }

        setPayloads(paginatedPayloads);
        setError(null);
      } catch (error) {
        console.log(error);
        setError('Failed to fetch payloads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayloads();
  }, [currentPage, navigate]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading payloads...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.payloadListContainer}>
      <h1 className={styles.payloadTitle}>SpaceX Payloads</h1>
      <Link to="/" className={styles.backButton}>
        &larr; Back to Home
      </Link>
      <div className={styles.payloadGrid}>
        {payloads.map((payload) => (
          <div key={payload.id} className={styles.payloadCard}>
            <h2 className={styles.payloadSubtitle}>{payload.name}</h2>
            <p className={styles.payloadDescription}>
              Type: {payload.type}
            </p>
            <p className={styles.payloadDescription}>
              Mass: {payload.mass_kg ? `${payload.mass_kg} kg` : 'Unknown'}
            </p>
            <p className={styles.payloadDescription}>
              Orbit: {payload.orbit || 'Unknown'}
            </p>
            <Link to={`/payloads/${payload.id}`} className={styles.backButton}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        {currentPage > 1 && (
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/payloads/page/${currentPage - 1}`)}
          >
            Previous Page
          </button>
        )}
        {payloads.length === itemsPerPage && (
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/payloads/page/${currentPage + 1}`)}
          >
            Next Page
          </button>
        )}
      </div>
    </div>
  );
};

export default PayloadList;