import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Prompt } from '../../types';
import logo from '../../../assets/logo-full.png';

const Library: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const navigate = useNavigate();

  const loadPrompts = async () => {
    const data = await window.electronAPI.getPrompts();
    setPrompts(data);
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <img src={logo} alt="Promptly Logo" style={{ height: '80px' }} />
        <button 
          className="btn btn-primary no-drag" 
          onClick={() => navigate('/editor')}
        >
          <i className="fas fa-plus-circle me-1"></i>
          Create
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h3 className="text-muted">No prompts found</h3>
            <p className="lead text-muted">Click the button above to create your first prompt.</p>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="col">
              <div 
                className="card h-100 shadow-sm hover-shadow transition cursor-pointer no-drag"
                onClick={() => navigate(`/viewer/${prompt.id}`)}
              >
                <div className="card-body">
                  <h5 className="card-title text-primary">{prompt.title}</h5>
                  <p className="card-text text-muted text-truncate-2">{prompt.description}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0 text-muted small d-flex justify-content-between">
                  <span>
                    <i className="fas fa-calendar-alt me-1"></i>
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    <i className="fas fa-layer-group me-1"></i>
                    {prompt.parts?.length || 0} parts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
