import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Rocket.module.css';

const RocketDetails = () => {
  const { id } = useParams();
  const [rocket, setRocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRocket = async () => {
      try {
        const response = await axios.get(`https://api.spacexdata.com/v4/rockets/${id}`);
        setRocket(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching rocket:', err);
        setError('Failed to fetch rocket details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRocket();
  }, [id]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading rocket details...</div>;
  }

  if (error || !rocket) {
    return <div className={styles.errorContainer}>{error || "Rocket not found"}</div>;
  }

  return (
    <div className={styles.rocketDetails}>
      <Link to="/rockets/page/1" className={styles.backButton}>
        &larr; Back to Rockets
      </Link>
      <h1 className={styles.rocketTitle}>{rocket.name}</h1>

      {rocket.flickr_images?.length > 0 && (
        <img
          src={rocket.flickr_images[0]}
          alt={rocket.name}
          className={styles.rocketImage}
        />
      )}

      <div className={styles.infoSection}>
        <h2 className={styles.rocketSubtitle}>Rocket Information</h2>
        <div className={styles.detailsList}>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Status:</span>
            <span className={`${styles.statusBadge} ${rocket.active ? styles.success : styles.failure}`}>
              {rocket.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>First Flight:</span>
            <span className={styles.detailsValue}>
              {new Date(rocket.first_flight).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Success Rate:</span>
            <span className={styles.detailsValue}>{rocket.success_rate_pct}%</span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Cost per Launch:</span>
            <span className={styles.detailsValue}>
              ${rocket.cost_per_launch.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h2 className={styles.rocketSubtitle}>Specifications</h2>
        <div className={styles.detailsList}>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Height:</span>
            <span className={styles.detailsValue}>
              {rocket.height.meters}m / {rocket.height.feet}ft
            </span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Diameter:</span>
            <span className={styles.detailsValue}>
              {rocket.diameter.meters}m / {rocket.diameter.feet}ft
            </span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Mass:</span>
            <span className={styles.detailsValue}>
              {rocket.mass.kg.toLocaleString()}kg / {rocket.mass.lb.toLocaleString()}lb
            </span>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h2 className={styles.rocketSubtitle}>Description</h2>
        <p className={styles.rocketDescription}>{rocket.description}</p>
      </div>

      
    </div>
  );
};

export default RocketDetails;