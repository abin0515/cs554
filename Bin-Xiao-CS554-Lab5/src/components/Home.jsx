import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';

function Home() {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigationLinks = [
    {
      title: "Launches",
      description: "Explore SpaceX's historic and upcoming rocket launches",
      path: "/launches/page/1",
      icon: "🚀"
    },
    {
      title: "Payloads",
      description: "Discover the various payloads sent to space",
      path: "/payloads/page/1",
      icon: "📡"
    },
    {
      title: "Cores",
      description: "Track SpaceX's reusable rocket cores",
      path: "/cores/page/1",
      icon: "🎯"
    },
    {
      title: "Rockets",
      description: "Learn about SpaceX's revolutionary rocket fleet",
      path: "/rockets/page/1",
      icon: "🛸"
    },
    {
      title: "Ships",
      description: "Explore SpaceX's fleet of recovery vessels",
      path: "/ships/page/1",
      icon: "🚢"
    },
    {
      title: "Launch Pads",
      description: "Visit SpaceX's launch facilities worldwide",
      path: "/launchpads/page/1",
      icon: "🌎"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companyResponse, historyResponse] = await Promise.all([
          axios.get('https://api.spacexdata.com/v4/company'),
          axios.get('https://api.spacexdata.com/v4/history')
        ]);
        setCompanyInfo(companyResponse.data);
        setHistory(historyResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch SpaceX data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading SpaceX data...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>SpaceX Explorer</h1>
          <p className={styles.heroText}>
            {companyInfo?.summary}
          </p>
        </div>
      </div>

      <div className={styles.companySection}>
        <h2>About SpaceX</h2>
        <div className={styles.companyGrid}>
          <div className={styles.companyCard}>
            <h3>Founded</h3>
            <p>{companyInfo?.founded}</p>
          </div>
          <div className={styles.companyCard}>
            <h3>Founder</h3>
            <p>{companyInfo?.founder}</p>
          </div>
          <div className={styles.companyCard}>
            <h3>Employees</h3>
            <p>{companyInfo?.employees.toLocaleString()}</p>
          </div>
          <div className={styles.companyCard}>
            <h3>Valuation</h3>
            <p>${(companyInfo?.valuation / 1000000000).toFixed(1)}B</p>
          </div>
        </div>
      </div>

      <div className={styles.navigationSection}>
        <h2>Explore SpaceX Data</h2>
        <div className={styles.navigationGrid}>
          {navigationLinks.map((link) => (
            <Link 
              to={link.path} 
              key={link.title} 
              className={styles.navigationCard}
            >
              <span className={styles.navigationIcon}>{link.icon}</span>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.historySection}>
        <h2>SpaceX History</h2>
        <div className={styles.timeline}>
          {history.slice(0, 5).map((event) => (
            <div key={event.id} className={styles.timelineCard}>
              <div className={styles.timelineDate}>
                {new Date(event.event_date_utc).toLocaleDateString()}
              </div>
              <h3>{event.title}</h3>
              <p>{event.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;