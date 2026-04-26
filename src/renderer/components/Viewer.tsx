import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prompt, PromptPart, RepeatablePart } from '../../types';

const Viewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [repeatableInstances, setRepeatableInstances] = useState<Record<string, string[]>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      if (id) {
        const data = await window.electronAPI.getPrompt(id);
        setPrompt(data);
        
        const initialValues: Record<string, string> = {};
        const initialLanguages: Record<string, string> = {};
        const initialRepeatableInstances: Record<string, string[]> = {};

        const initializeParts = (parts: PromptPart[], parentId?: string, instanceId?: string) => {
          parts.forEach((part) => {
            const compositeId = parentId && instanceId ? `${parentId}_${instanceId}_${part.id}` : part.id;
            
            if (part.type === 'custom') {
              initialValues[compositeId] = part.defaultText || '';
            } else if (part.type === 'repeatable') {
              const firstInstanceId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
              initialRepeatableInstances[part.id] = [firstInstanceId];
              initializeParts(part.templateParts, part.id, firstInstanceId);
            } else {
              initialValues[compositeId] = '';
            }
            
            if (part.type === 'code') {
              initialLanguages[compositeId] = part.language || '';
            }
          });
        };

        initializeParts(data.parts);
        setValues(initialValues);
        setLanguages(initialLanguages);
        setRepeatableInstances(initialRepeatableInstances);
      }
    };
    loadPrompt();
  }, [id]);

  const handleUpdateValue = (partId: string, value: string) => {
    setValues(prev => ({ ...prev, [partId]: value }));
  };

  const addInstance = (repeatablePart: RepeatablePart) => {
    const newInstanceId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setRepeatableInstances(prev => ({
      ...prev,
      [repeatablePart.id]: [...(prev[repeatablePart.id] || []), newInstanceId]
    }));

    const newValues: Record<string, string> = {};
    const newLanguages: Record<string, string> = {};
    repeatablePart.templateParts.forEach(part => {
      const compositeId = `${repeatablePart.id}_${newInstanceId}_${part.id}`;
      if (part.type === 'custom') {
        newValues[compositeId] = part.defaultText || '';
      } else {
        newValues[compositeId] = '';
      }
      if (part.type === 'code') {
        newLanguages[compositeId] = part.language || '';
      }
    });
    setValues(prev => ({ ...prev, ...newValues }));
    setLanguages(prev => ({ ...prev, ...newLanguages }));
  };

  const removeInstance = (partId: string, instanceId: string) => {
    setRepeatableInstances(prev => ({
      ...prev,
      [partId]: prev[partId].filter(id => id !== instanceId)
    }));
  };

  const generatePartText = (part: PromptPart, parentId?: string, instanceId?: string): string => {
    const compositeId = parentId && instanceId ? `${parentId}_${instanceId}_${part.id}` : part.id;
    
    switch (part.type) {
      case 'fixed': return part.text;
      case 'custom': return values[compositeId] || '';
      case 'quote': return values[compositeId] ? `> ${values[compositeId]}` : '';
      case 'code': return values[compositeId] ? `\`\`\`${languages[compositeId] || ''}\n${values[compositeId]}\n\`\`\`` : '';
      case 'hr': return '---';
      case 'repeatable': {
        const instances = repeatableInstances[part.id] || [];
        return instances.map(instId => {
          return part.templateParts.map(tp => generatePartText(tp, part.id, instId)).filter(t => t !== '').join('\n\n');
        }).filter(t => t !== '').join('\n\n');
      }
      default: return '';
    }
  };

  const getFullPrompt = () => {
    if (!prompt) return '';
    return prompt.parts.map(part => generatePartText(part)).filter(text => text !== '').join('\n\n');
  };

  const handleCopy = () => {
    const text = getFullPrompt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPart = (part: PromptPart, parentId?: string, instanceId?: string) => {
    const compositeId = parentId && instanceId ? `${parentId}_${instanceId}_${part.id}` : part.id;
    const isNested = !!parentId;

    return (
      <div key={compositeId} className="mb-2">
        {!isNested && (
          <div className="d-flex justify-content-end gap-2 mb-2">
            <span className="badge bg-light text-secondary text-uppercase border" style={{ fontSize: '0.65rem', opacity: 0.8 }}>{part.type}</span>
          </div>
        )}

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
            value={values[compositeId] || ''}
            onChange={(e) => handleUpdateValue(compositeId, e.target.value)}
          />
        )}

        {part.type === 'quote' && (
          <div className="d-flex border-start border-4 border-info">
            <textarea
              className="form-control no-drag border-0 bg-light"
              rows={2}
              placeholder="Enter quote text..."
              value={values[compositeId] || ''}
              onChange={(e) => handleUpdateValue(compositeId, e.target.value)}
              style={{ fontStyle: 'italic' }}
            />
          </div>
        )}

        {part.type === 'code' && (
          <div className="bg-dark rounded overflow-hidden">
            <textarea
              className="form-control no-drag font-monospace bg-dark text-light border-0"
              rows={5}
              placeholder={`Enter ${languages[compositeId] || 'code'} here...`}
              value={values[compositeId] || ''}
              onChange={(e) => handleUpdateValue(compositeId, e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
            <div className="d-flex justify-content-end px-2 pb-2">
              <div className="input-group input-group-sm" style={{ width: '160px' }}>
                <span className="input-group-text bg-secondary border-0 text-white small" style={{ fontSize: '0.7rem' }}>Lang:</span>
                <select
                  className="form-select form-select-sm no-drag bg-secondary bg-opacity-25 border-0 text-white"
                  value={languages[compositeId] || ''}
                  onChange={(e) => setLanguages(prev => ({ ...prev, [compositeId]: e.target.value }))}
                  style={{ fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  <option value="">None</option>
                  <option value="csharp">C#</option>
                  <option value="typescript">TypeScript</option>
                  <option value="yaml">YAML</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {part.type === 'hr' && <hr className="my-4" />}

        {part.type === 'repeatable' && (
          <div className="repeatable-section border rounded p-3 bg-light bg-opacity-50">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-secondary text-uppercase">Repeatable Section</span>
            </div>
            
            {(repeatableInstances[part.id] || []).map((instId, idx) => (
              <div key={instId} className="card mb-3 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-1 px-3">
                  <small className="text-muted fw-bold">Instance #{idx + 1}</small>
                  <button 
                    className="btn btn-sm text-danger no-drag" 
                    onClick={() => removeInstance(part.id, instId)}
                    disabled={(repeatableInstances[part.id] || []).length <= 1}
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                </div>
                <div className="card-body p-3">
                  {part.templateParts.map(tp => renderPart(tp, part.id, instId))}
                </div>
              </div>
            ))}
            
            <div className="text-center mt-2">
              <button className="btn btn-sm btn-outline-secondary no-drag" onClick={() => addInstance(part)}>
                <i className="fas fa-plus-circle me-1"></i>
                Add another instance
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!prompt) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-2 no-drag" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left me-1"></i> Back to Library
          </button>
          <h2 className="text-primary mb-0">{prompt.title}</h2>
          <p className="text-muted mb-0">{prompt.description}</p>
        </div>
        <button 
          className="btn btn-outline-primary no-drag" 
          onClick={() => navigate(`/editor/${prompt.id}`)}
        >
          <i className="fas fa-edit me-1"></i>
          Edit
        </button>
      </div>

      <div className="viewer-parts mt-4">
        {prompt.parts.map((part) => renderPart(part))}

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
