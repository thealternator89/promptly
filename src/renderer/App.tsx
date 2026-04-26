import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Library from './components/Library';
import Editor from './components/Editor';
import Viewer from './components/Viewer';
import Settings from './components/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="titlebar shadow-sm">
        <span className="titlebar-content">
          <i className="fa-solid fa-message me-2 text-primary"></i>
          Promptly
        </span>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/viewer/:id" element={<Viewer />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
