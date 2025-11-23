import React from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import TrustOrFade from './pages/TrustOrFade';
import LaunchYourTrust from './pages/LaunchYourTrust';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <HashRouter>
      <UserProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trust-fade" element={<TrustOrFade />} />
            <Route path="/launch-your-trust" element={<LaunchYourTrust />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
          </Routes>
        </Layout>
      </UserProvider>
    </HashRouter>
  );
};

export default App;