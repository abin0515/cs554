import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Launches() {
  const [launches, setLaunches] = useState([]);
  const { page } = useParams();
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    async function fetchLaunches() {
      try {
        const offset = (parseInt(page) - 1) * 10;
        const response = await axios.post('https://api.spacexdata.com/v4/launches/query', {
          query: {},
          options: {
            limit: 10,
            offset,
            sort: { flight_number: "asc" }
          }
        });
        
        if (response.data.docs.length === 0) {
          navigate('/404');
        }
        setLaunches(response.data.docs);
      } catch (error) {
        console.error('Error fetching launches:', error);
      }
    }
    fetchLaunches();
  }, [page]);

  return (
    <div>
      {launches.map(launch => (
        <div key={launch.id}>
          <Link to={`/launches/${launch.id}`}>
            <h3>{launch.name}</h3>
          </Link>
          <p>Flight Number: {launch.flight_number}</p>
          {launch.links.patch.small && <img src={launch.links.patch.small} alt={launch.name} />}
        </div>
      ))}
      <div>
        {page > 1 && <Link to={`/launches/page/${parseInt(page) - 1}`}>Previous</Link>}
        {launches.length === 10 && <Link to={`/launches/page/${parseInt(page) + 1}`}>Next</Link>}
      </div>
    </div>
  );
}

export default Launches;
