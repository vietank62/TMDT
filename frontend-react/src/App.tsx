import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ExpertProfile from './pages/ExpertProfile';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import SearchExperts from './pages/SearchExperts';
import CreateSession from './pages/CreateSession';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/expert/:id" element={<ExpertProfile />} />
            <Route path="/search" element={<SearchExperts />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/mentor/create-session" element={<CreateSession />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
