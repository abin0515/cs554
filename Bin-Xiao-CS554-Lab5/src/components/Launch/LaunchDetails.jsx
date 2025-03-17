import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Launch.module.css";

const LaunchDetail = () => {
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  
  useEffect(() => {
    const fetchLaunchDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.spacexdata.com/v4/launches/${id}`
        );
        setLaunch(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching launch details:", err);
        setError("Failed to fetch launch details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>Loading launch details...</div>
    );
  }

  if (error || !launch) {
    return (
      <div className={styles.errorContainer}>{error || "Launch not found"}</div>
    );
  }

  return (
    <div className={styles.launchDetails}>
      <Link to="/launchpads/page/1" className={styles.backButton}>
        &larr; Back to Launch Pads
      </Link>
      <h1 className={styles.launchTitle}>{launch.name}</h1>

      {launch.links?.patch?.large && (
        <img
          src={launch.links.patch.large}
          alt={launch.name}
          className={styles.launchPatch}
        />
      )}

      
      {launch.links.youtube_id && (
        <div className={styles.videoContainer}>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${launch.links.youtube_id}`}
          allowFullScreen
        ></iframe>
        </div>
      )}

      <div className={styles.infoSection}>
        <h2 className={styles.launchSubtitle}>Launch Details</h2>
        <div className={styles.infoGrid}>
          <ul className={styles.detailsList}>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Flight Number:</span>
              <span className={styles.detailsValue}>
                {launch.flight_number}
              </span>
            </li>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Date:</span>
              <span className={styles.detailsValue}>
                {new Date(launch.date_utc).toLocaleDateString()}
              </span>
            </li>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Status:</span>
              <span
                className={`${styles.statusBadge} ${
                  launch.success ? styles.success : styles.failure
                }`}
              >
                {launch.success ? "Success" : "Failure"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h2 className={styles.launchSubtitle}>Related Information</h2>
        <div className={styles.relatedLinks}>
          {launch.rocket && (
            <Link
              to={`/rockets/${launch.rocket}`}
              className={styles.relatedLink}
            >
              View Rocket Details
            </Link>
          )}
          {launch.launchpad && (
            <Link
              to={`/launchpads/${launch.launchpad}`}
              className={styles.relatedLink}
            >
              View Launchpad Details
            </Link>
          )}
          {launch.payloads?.map((payloadId) => (
            <Link
              key={payloadId}
              to={`/payloads/${payloadId}`}
              className={styles.relatedLink}
            >
              View Payload Details
            </Link>
          ))}
          {launch.ships?.map((shipId) => (
            <Link
              key={shipId}
              to={`/ships/${shipId}`}
              className={styles.relatedLink}
            >
              View Ship Details
            </Link>
          ))}
        </div>
      </div>

      {launch.details && (
        <div className={styles.infoSection}>
          <h2 className={styles.launchSubtitle}>Mission Details</h2>
          <p className={styles.launchDescription}>{launch.details}</p>
        </div>
      )}
    </div>
  );
};

export default LaunchDetail;
