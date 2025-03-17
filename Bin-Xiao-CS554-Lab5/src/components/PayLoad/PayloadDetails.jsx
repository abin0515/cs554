import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Payload.module.css";

function PayloadDetails() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayloadDetails = async () => {
      try {
        const { data: payloadData } = await axios.get(
          `https://api.spacexdata.com/v4/payloads/${id}`
        );
        setPayload(payloadData);

        if (payloadData.launch) {
          const { data: launchData } = await axios.get(
            `https://api.spacexdata.com/v4/launches/${payloadData.launch}`
          );
          setLaunch(launchData);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching payload details:", err);
        setError("Payload not found");
      } finally {
        setLoading(false);
      }
    };

    fetchPayloadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>Loading payload details...</div>
    );
  }

  if (error || !payload) {
    return (
      <div className={styles.errorContainer}>
        {error || "Payload not found"}
      </div>
    );
  }

  return (
    <div className={styles.payloadDetails}>
      <Link to="/payloads/page/1" className={styles.backButton}>
        &larr; Back to Payloads
      </Link>

      <h1 className={styles.payloadTitle}>{payload.name}</h1>

      
      <img
        src={launch.links.patch.large}
        alt="Payload Patch"
        className={styles.launchPatch}
      />
      {launch && launch.links?.youtube_id && (
        <div className={styles.infoSection}>
          <h2 className={styles.payloadSubtitle}>Launch Video</h2>
          <div className={styles.videoContainer}>
            <iframe
              src={`https://www.youtube.com/embed/${launch.links.youtube_id}`}
              title="Launch Video"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div className={styles.infoSection}>
        <h2 className={styles.payloadSubtitle}>Payload Details</h2>
        <ul className={styles.detailsList}>
          <li className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Type:</span>
            <span className={styles.detailsValue}>{payload.type}</span>
          </li>
          <li className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Orbit:</span>
            <span className={styles.detailsValue}>
              {payload.orbit || "Unknown"}
            </span>
          </li>
          <li className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Mass:</span>
            <span className={styles.detailsValue}>
              {payload.mass_kg ? `${payload.mass_kg}kg` : "Unknown"}
            </span>
          </li>
          <li className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Customers:</span>
            <span className={styles.detailsValue}>
              {payload.customers?.join(", ") || "Unknown"}
            </span>
          </li>
        </ul>
      </div>

      {launch && (
        <div className={styles.infoSection}>
          <h2 className={styles.payloadSubtitle}>Associated Launch</h2>
          <ul className={styles.detailsList}>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Mission:</span>
              <span className={styles.detailsValue}>{launch.name}</span>
            </li>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Date:</span>
              <span className={styles.detailsValue}>
                {new Date(launch.date_utc).toLocaleDateString()}
              </span>
            </li>
            <li className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Success:</span>
              <span className={styles.detailsValue}>
                {launch.success ? "Successful" : "Failed"}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PayloadDetails;
