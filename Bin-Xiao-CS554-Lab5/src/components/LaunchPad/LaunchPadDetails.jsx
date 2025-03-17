import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './LaunchPad.module.css';

const LaunchPadDetails = () => {
  const [launchPad, setLaunchPad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchLaunchPad = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.spacexdata.com/v4/launchpads/${id}`);
        setLaunchPad(response.data);
      } catch (err) {
        console.log(err);
        setError('Launch pad not found');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchPad();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading launch pad details...</p>
      </div>
    );
  }

  if (error || !launchPad) {
    return <div className={styles.errorMessage}>404 - {error || 'Launch pad not found'}</div>;
  }

  return (
    <div className={styles.detailsContainer}>
      <Link to="/launchpads/page/1" className={styles.backButton}>
        &larr; Back to Launch Pads
      </Link>

      

      <div className={styles.imageGallery}>
        {launchPad.images?.large?.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${launchPad.name} view ${index + 1}`}
            className={styles.galleryImage}
          />
        ))}
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.infoCard}>
          <h2>Location Details</h2>
          <ul>
            <li><strong>Region:</strong> {launchPad.region}</li>
            <li><strong>Locality:</strong> {launchPad.locality}</li>
            <li><strong>Latitude:</strong> {launchPad.latitude}°</li>
            <li><strong>Longitude:</strong> {launchPad.longitude}°</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h2>Launch Statistics</h2>
          <ul>
            <li><strong>Total Launches:</strong> {launchPad.launch_attempts}</li>
            <li><strong>Successful Launches:</strong> {launchPad.launch_successes}</li>
            <li>
              <strong>Success Rate:</strong> {
                launchPad.launch_attempts > 0
                  ? `${((launchPad.launch_successes / launchPad.launch_attempts) * 100).toFixed(1)}%`
                  : 'N/A'
              }
            </li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h2>Status Details</h2>
          <p>{launchPad.status_details}</p>
        </div>

        <div className={styles.infoCard}>
          <h2>Description</h2>
          <p>{launchPad.details}</p>
        </div>
      </div>
    </div>
  );
};

export default LaunchPadDetails;