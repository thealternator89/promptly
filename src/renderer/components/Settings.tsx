import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [disallowedDomains, setDisallowedDomains] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electronAPI.getSettings();
      setDisallowedDomains(settings.disallowedDomains || '');
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await window.electronAPI.saveSettings({ disallowedDomains });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2 no-drag" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left me-1"></i> Back to Library
          </button>
          <h2 className="text-primary mb-0">Settings</h2>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">URL Sanitization</h5>
          <p className="text-muted small">
            Enter domains to disallow in generated prompts (e.g., <code>mysecret.domain</code>). 
            Any links matching these domains will have their URL stripped but keep the display text.
            Enter one domain per line.
          </p>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Disallowed Domains</label>
            <textarea 
              className="form-control font-monospace no-drag" 
              rows={10} 
              placeholder="example.com&#10;internal.site"
              value={disallowedDomains}
              onChange={(e) => setDisallowedDomains(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-3">
            <button 
              className={`btn ${saved ? 'btn-success' : 'btn-primary'} no-drag px-4`} 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : saved ? (
                <>
                  <i className="fas fa-check me-2"></i>
                  Saved!
                </>
              ) : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
