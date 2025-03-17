import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function LaunchDetails() {
  const { id } = useParams();
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaunch() {
      try {
        const { data } = await axios.get(`https://api.spacexdata.com/v4/launches/${id}`);
        setLaunch(data);
      } catch (e) {
        setLaunch(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLaunch();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!launch) return <p>404 - Launch not found.</p>;

  return (
    <div>
      <h1>{launch.name}</h1>
      <img src={launch.links.patch.small} alt={launch.name} />
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${launch.links.youtube_id}`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <ul>
        {launch.payloads.map(payloadId => (
          <li key={payloadId}>
            <Link to={`/payloads/${payloadId}`}>{payloadId}</Link>
          </li>
        ))}
      </ul>
      {/* Repeat similar logic for other IDs like rocket, ships, cores, launchpads */}
    </div>
  );
}

export default LaunchDetails;
