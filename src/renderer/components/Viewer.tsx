import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prompt, PromptPart } from '../../types';

const Viewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      if (id) {
        const data = await window.electronAPI.getPrompt(id);
        setPrompt(data);
        
        // Initialize values
        const initialValues: Record<string, string> = {};
        data.parts.forEach((part: PromptPart) => {
          if (part.type === 'custom') {
            initialValues[part.id] = part.defaultText || '';
          } else {
            initialValues[part.id] = '';
          }
        });
        setValues(initialValues);
      }
    };
    loadPrompt();
  }, [id]);

  const handleUpdateValue = (partId: string, value: string) => {
    setValues(prev => ({ ...prev, [partId]: value }));
  };

  const getFullPrompt = () => {
    if (!prompt) return '';
    return prompt.parts.map(part => {
      switch (part.type) {
        case 'fixed': return part.text;
        case 'custom': return values[part.id] || '';
        case 'quote': return values[part.id] ? `> ${values[part.id]}` : '';
        case 'code': return values[part.id] ? `\`\`\`${part.language || ''}\n${values[part.id]}\n\`\`\`` : '';
        case 'hr': return '---';
        default: return '';
      }
    }).filter(text => text !== '').join('\n\n');
  };

  const handleCopy = () => {
    const text = getFullPrompt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2 no-drag" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left me-1"></i> Back to Library
          </button>
          <h2 className="text-primary mb-0">{prompt.title}</h2>
          <p className="text-muted mb-0">{prompt.description}</p>
        </div>
      </div>

      <div className="viewer-parts mt-4">
        {prompt.parts.map((part) => (
          <div key={part.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-light text-secondary text-uppercase border">{part.type}</span>
              {part.type === 'code' && part.language && (
                <span className="badge bg-info text-dark">{part.language}</span>
              )}
            </div>

            {part.type === 'fixed' && (
              <div className="card bg-light border-0">
                <div className="card-body py-3 px-4 white-space-pre-wrap">
                  {part.text}
                </div>
              </div>
            )}

            {part.type === 'custom' && (
              <textarea
                className="form-control no-drag border-primary border-start border-4"
                rows={3}
                placeholder={part.placeholder || "Enter text..."}
                value={values[part.id]}
                onChange={(e) => handleUpdateValue(part.id, e.target.value)}
              />
            )}

            {part.type === 'quote' && (
              <div className="d-flex border-start border-4 border-info">
                <textarea
                  className="form-control no-drag border-0 bg-light"
                  rows={2}
                  placeholder="Enter quote text..."
                  value={values[part.id]}
                  onChange={(e) => handleUpdateValue(part.id, e.target.value)}
                  style={{ fontStyle: 'italic' }}
                />
              </div>
            )}

            {part.type === 'code' && (
              <textarea
                className="form-control no-drag font-monospace bg-dark text-light border-0"
                rows={5}
                placeholder={`Enter ${part.language || 'code'} here...`}
                value={values[part.id]}
                onChange={(e) => handleUpdateValue(part.id, e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
            )}

            {part.type === 'hr' && <hr className="my-4" />}
          </div>
        ))}

        <div className="mt-5 pt-3 border-top text-center">
          <button className={`btn ${copied ? 'btn-success' : 'btn-primary'} no-drag shadow-sm px-4`} onClick={handleCopy}>
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} me-2`}></i>
            {copied ? 'Copied to Clipboard!' : 'Copy Completed Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
