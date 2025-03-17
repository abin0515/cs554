import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Ship.module.css';

const ShipDetails = () => {
  const { id } = useParams();
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShip = async () => {
      try {
        const response = await axios.get(`https://api.spacexdata.com/v4/ships/${id}`);
        setShip(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching ship:', err);
        setError('Failed to fetch ship details.');
      } finally {
        setLoading(false);
      }
    };

    fetchShip();
  }, [id]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading ship details...</div>;
  }

  if (error || !ship) {
    return <div className={styles.errorContainer}>{error || "Ship not found"}</div>;
  }

  return (
    <div className={styles.shipDetails}>
      <Link to="/ships/page/1" className={styles.backButton}>
        ← Back to Ships
      </Link>
      
      <h1 className={styles.shipTitle}>{ship.name}</h1>

      {ship.image && (
        <div className={styles.imageContainer}>
          <img
            src={ship.image}
            alt={ship.name}
            className={styles.shipDetailImage}
          />
        </div>
      )}

      <div className={styles.infoSection}>
        <h2>Ship Information</h2>
        <div className={styles.detailsList}>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Type</span>
            <span className={styles.detailsValue}>{ship.type || 'Unknown'}</span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Status</span>
            <span className={`${styles.statusBadge} ${ship.active ? styles.success : styles.failure}`}>
              {ship.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Home Port</span>
            <span className={styles.detailsValue}>{ship.home_port || 'Unknown'}</span>
          </div>
          {ship.year_built && (
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Year Built</span>
              <span className={styles.detailsValue}>{ship.year_built}</span>
            </div>
          )}
          {ship.mass_kg && (
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Mass</span>
              <span className={styles.detailsValue}>{ship.mass_kg.toLocaleString()} kg</span>
            </div>
          )}
        </div>
      </div>

      {ship.roles && ship.roles.length > 0 && (
        <div className={styles.rolesSection}>
          <h2>Roles</h2>
          <div className={styles.rolesList}>
            {ship.roles.map((role, index) => (
              <span key={index} className={styles.roleItem}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipDetails;