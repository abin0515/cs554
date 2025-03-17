import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Core.module.css";

function CoreDetails() {
  const { id } = useParams();
  const [core, setCore] = useState(null);
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoreDetails = async () => {
      try {
        const { data: coreData } = await axios.get(
          `https://api.spacexdata.com/v4/cores/${id}`
        );
        setCore(coreData);

        if (coreData.launches.length > 0) {
          const launchPromises = coreData.launches.map((launchId) =>
            axios.get(`https://api.spacexdata.com/v4/launches/${launchId}`)
          );
          const launchResponses = await Promise.all(launchPromises);
          setLaunches(launchResponses.map((response) => response.data));
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching core details:", err);
        setError("Core not found");
      } finally {
        setLoading(false);
      }
    };

    fetchCoreDetails();
  }, [id]);

  if (loading) {
    return <div className={styles.loadingSpinner}>Loading core details...</div>;
  }

  if (error || !core) {
    return (
      <div className={styles.errorContainer}>{error || "Core not found"}</div>
    );
  }

  return (
    <div className={styles.coreDetails}>
      <Link to="/cores/page/1" className={styles.backButton}>
        &larr; Back to Cores
      </Link>
      {launches.length > 0 && (
        <div className={styles.launchesSection}>
          <h2>Associated Launches</h2>
          {launches.map((launch) => (
            <div key={launch.id} className={styles.launchItem}>
              {launch.links?.patch?.small && (
                <img
                  src={launch.links.patch.small}
                  alt={`${launch.name} patch`}
                  className={styles.launchPatch}
                />
              )}
              <div className={styles.launchInfo}>
                <h3>{launch.name}</h3>
                <p>{new Date(launch.date_utc).toLocaleDateString()}</p>
              </div>
              {launch.links?.youtube_id && (
                <div className={styles.videoContainer}>
                  <iframe
                    src={`https://www.youtube.com/embed/${launch.links.youtube_id}`}
                    title={`${launch.name} video`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      

      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h3>Reuse Count</h3>
            <p>{core.reuse_count}</p>
          </div>
          <div className={styles.statItem}>
            <h3>RTLS Landings</h3>
            <p>{core.rtls_landings}</p>
          </div>
          <div className={styles.statItem}>
            <h3>ASDS Landings</h3>
            <p>{core.asds_landings}</p>
          </div>
        </div>
      </div>

      {core.last_update && (
        <div className={styles.updateSection}>
          <h2>Last Update</h2>
          <p>{core.last_update}</p>
        </div>
      )}
    </div>
  );
}

export default CoreDetails;
