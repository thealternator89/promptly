import React from 'react';

const App: React.FC = () => {
  return (
    <>
      <div className="titlebar shadow-sm">
        <span className="titlebar-content">
          <i className="fa-solid fa-message me-2 text-primary"></i>
          Promptly
        </span>
      </div>

      <div className="main-content">
        <div className="container mt-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="card-title text-primary mb-4">
                <i className="fas fa-rocket me-2"></i>
                💖 Hello from React!
              </h1>
              <p className="card-text lead">
                Welcome to your Electron application with React, TypeScript, 
                <strong> Bootstrap 5</strong>, and <strong>FontAwesome 6</strong>.
              </p>
              <button className="btn btn-success mt-3 no-drag">
                <i className="fas fa-check-circle me-1"></i>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
