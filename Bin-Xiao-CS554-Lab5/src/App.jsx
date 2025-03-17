import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LaunchList from './components/Launch/LaunchList';
import LaunchDetails from './components/Launch/LaunchDetails';
import PayloadList from './components/PayLoad/PayloadList';
import PayloadDetails from './components/PayLoad/PayloadDetails';
import CoreList from './components/Core/CoreList';
import CoreDetails from './components/Core/CoreDetails';
import RocketList from './components/Rocket/RocketList';
import RocketDetails from './components/Rocket/RocketDetails';
import ShipList from './components/Ship/ShipList';
import ShipDetails from './components/Ship/ShipDetails';
import LaunchPadList from './components/LaunchPad/LaunchPadList';
import LaunchPadDetails from './components/LaunchPad/LaunchPadDetails';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/launches/page/:page" element={<LaunchList />} />
        <Route path="/launches/:id" element={<LaunchDetails />} />
        <Route path="/payloads/page/:page" element={<PayloadList />} />
        <Route path="/payloads/:id" element={<PayloadDetails />} />
        <Route path="/cores/page/:page" element={<CoreList />} />
        <Route path="/cores/:id" element={<CoreDetails />} />
        <Route path="/rockets/page/:page" element={<RocketList />} />
        <Route path="/rockets/:id" element={<RocketDetails />} />
        <Route path="/ships/page/:page" element={<ShipList />} />
        <Route path="/ships/:id" element={<ShipDetails />} />
        <Route path="/launchpads/page/:page" element={<LaunchPadList />} />
        <Route path="/launchpads/:id" element={<LaunchPadDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
