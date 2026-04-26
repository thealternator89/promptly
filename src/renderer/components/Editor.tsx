import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Prompt, PromptPart, PromptPartType } from '../../types';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parts, setParts] = useState<PromptPart[]>([]);
  const [createdAt, setCreatedAt] = useState<number>(Date.now());

  useEffect(() => {
    const loadPrompt = async () => {
      if (id) {
        const prompt = await window.electronAPI.getPrompt(id);
        setTitle(prompt.title);
        setDescription(prompt.description);
        setParts(prompt.parts);
        setCreatedAt(prompt.createdAt);
      }
    };
    loadPrompt();
  }, [id]);

  const addPart = (type: PromptPartType) => {
    const newPart: any = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
    };

    if (type === 'fixed') newPart.text = '';
    if (type === 'custom') {
      newPart.defaultText = '';
      newPart.placeholder = '';
    }
    if (type === 'code') newPart.language = 'typescript';

    setParts([...parts, newPart as PromptPart]);
  };

  const removePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const updatePart = (id: string, updates: Partial<PromptPart>) => {
    setParts(parts.map((p) => (p.id === id ? { ...p, ...updates } : p) as PromptPart));
  };

  const movePart = (index: number, direction: 'up' | 'down') => {
    const newParts = [...parts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newParts.length) return;
    [newParts[index], newParts[targetIndex]] = [newParts[targetIndex], newParts[index]];
    setParts(newParts);
  };

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    const prompt: Prompt = {
      id: id || Date.now().toString(),
      title,
      description,
      createdAt,
      parts,
    };

    await window.electronAPI.createPrompt(prompt);
    navigate(id ? `/viewer/${id}` : '/');
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">
          <i className={`fas ${id ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
          {id ? 'Edit Prompt' : 'Create Prompt'}
        </h2>
        <div>
          <button className="btn btn-outline-secondary me-2 no-drag" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button className="btn btn-success no-drag" onClick={handleSave}>
            <i className="fas fa-save me-1"></i>
            Save Prompt
          </button>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              type="text"
              className="form-control form-control-lg no-drag"
              placeholder="Enter prompt title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-0">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control no-drag"
              rows={2}
              placeholder="What is this prompt for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h4 className="mb-3">Prompt Parts</h4>

      <div className="parts-list">
        {parts.map((part, index) => (
          <div key={part.id} className="card shadow-sm mb-3 border-start border-4 border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge bg-primary text-uppercase">{part.type}</span>
                <div className="btn-group">
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => movePart(index, 'up')}
                    disabled={index === 0}
                  >
                    <i className="fas fa-arrow-up"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => movePart(index, 'down')}
                    disabled={index === parts.length - 1}
                  >
                    <i className="fas fa-arrow-down"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removePart(part.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              {part.type === 'fixed' && (
                <textarea
                  className="form-control no-drag"
                  placeholder="Enter fixed text..."
                  value={part.text}
                  onChange={(e) => updatePart(part.id, { text: e.target.value })}
                />
              )}

              {part.type === 'custom' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Default Text</label>
                    <input
                      type="text"
                      className="form-control no-drag"
                      value={part.defaultText}
                      onChange={(e) => updatePart(part.id, { defaultText: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Placeholder</label>
                    <input
                      type="text"
                      className="form-control no-drag"
                      value={part.placeholder}
                      onChange={(e) => updatePart(part.id, { placeholder: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {part.type === 'code' && (
                <div className="mb-0">
                  <label className="form-label small text-muted">Language</label>
                  <input
                    type="text"
                    className="form-control no-drag"
                    value={part.language}
                    onChange={(e) => updatePart(part.id, { language: e.target.value })}
                    placeholder="e.g. typescript, python, json"
                  />
                </div>
              )}

              {(part.type === 'quote' || part.type === 'hr') && (
                <div className="text-muted italic small">
                  {part.type === 'quote' ? 'Quoted block (editable in viewer)' : 'Horizontal separator line'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card border-dashed bg-light mt-4">
        <div className="card-body text-center py-4">
          <h5 className="mb-3 text-muted">Add a Part</h5>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('fixed')}>
              <i className="fas fa-font me-1"></i> Fixed Text
            </button>
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('custom')}>
              <i className="fas fa-keyboard me-1"></i> Custom Input
            </button>
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('quote')}>
              <i className="fas fa-quote-left me-1"></i> Quote
            </button>
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('code')}>
              <i className="fas fa-code me-1"></i> Code Block
            </button>
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('hr')}>
              <i className="fas fa-minus me-1"></i> Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
