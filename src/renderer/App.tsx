import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Library from './components/Library';
import Editor from './components/Editor';
import Viewer from './components/Viewer';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setVersion);
  }, []);

  return (
    <Router>
      <div className="titlebar shadow-sm">
        <span>
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

      <footer className="app-footer">
        <div className="container-fluid d-flex justify-content-end align-items-center py-1 px-3 border-top bg-light">
          <small className="text-muted">v{version}</small>
        </div>
      </footer>
    </Router>
  );
};

export default App;
