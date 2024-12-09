import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tafu from './components/Tafu';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tafu />} />
        <Route path="/dashboard/:propertyId" element={<Dashboard />} />

      </Routes>
    </Router>
  );
};

export default App;
