import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ExpertProfile from './pages/ExpertProfile';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import SearchExperts from './pages/SearchExperts';
import VideoCall from './pages/VideoCall';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Routes>
        {/* Video call is full-screen — no Navbar/Footer */}
        <Route path="/call/:channelName" element={<VideoCall />} />

        {/* All other routes share the standard layout */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/expert/:id" element={<ExpertProfile />} />
                  <Route path="/search" element={<SearchExperts />} />
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
