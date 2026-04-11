import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import GlobalContext from './context/GlobalContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <GlobalContext>
      <Router>
        <div className="min-h-screen flex flex-col bg-[var(--ngo-bg)] text-[var(--ngo-text)]">
          <Navbar />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </GlobalContext>
  );
}

export default App;
