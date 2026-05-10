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

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addPart = (type: PromptPartType, parentId?: string) => {
    const newPart: any = {
      id: generateId(),
      type,
    };

    if (type === 'fixed') newPart.text = '';
    if (type === 'heading') {
      newPart.text = '';
      newPart.level = 1;
      newPart.excludeIfNextEmpty = false;
    }
    if (type === 'custom') {
      newPart.defaultText = '';
      newPart.placeholder = '';
      newPart.singleLine = false;
    }
    if (type === 'code') newPart.language = 'typescript';
    if (type === 'repeatable') newPart.templateParts = [];

    if (parentId) {
      setParts(parts.map(p => {
        if (p.id === parentId && p.type === 'repeatable') {
          return { ...p, templateParts: [...p.templateParts, newPart as PromptPart] };
        }
        return p;
      }));
    } else {
      setParts([...parts, newPart as PromptPart]);
    }
  };

  const removePart = (id: string, parentId?: string) => {
    if (parentId) {
      setParts(parts.map(p => {
        if (p.id === parentId && p.type === 'repeatable') {
          return { ...p, templateParts: p.templateParts.filter(tp => tp.id !== id) };
        }
        return p;
      }));
    } else {
      setParts(parts.filter((p) => p.id !== id));
    }
  };

  const updatePart = (id: string, updates: Partial<PromptPart>, parentId?: string) => {
    if (parentId) {
      setParts(parts.map(p => {
        if (p.id === parentId && p.type === 'repeatable') {
          return {
            ...p,
            templateParts: p.templateParts.map(tp => tp.id === id ? { ...tp, ...updates } : tp) as PromptPart[]
          };
        }
        return p;
      }));
    } else {
      setParts(parts.map((p) => (p.id === id ? { ...p, ...updates } : p) as PromptPart));
    }
  };

  const movePart = (index: number, direction: 'up' | 'down', parentId?: string) => {
    if (parentId) {
      setParts(parts.map(p => {
        if (p.id === parentId && p.type === 'repeatable') {
          const newTemplateParts = [...p.templateParts];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= newTemplateParts.length) return p;
          [newTemplateParts[index], newTemplateParts[targetIndex]] = [newTemplateParts[targetIndex], newTemplateParts[index]];
          return { ...p, templateParts: newTemplateParts };
        }
        return p;
      }));
    } else {
      const newParts = [...parts];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newParts.length) return;
      [newParts[index], newParts[targetIndex]] = [newParts[targetIndex], newParts[index]];
      setParts(newParts);
    }
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

  const renderPart = (part: PromptPart, index: number, parentId?: string, listLength?: number) => {
    const isTopLevel = !parentId;
    const currentLength = listLength !== undefined ? listLength : parts.length;

    return (
      <div key={part.id} className={`card shadow-sm mb-3 border-start border-4 ${isTopLevel ? 'border-primary' : 'border-info'}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className={`badge ${isTopLevel ? 'bg-primary' : 'bg-info'} text-uppercase`}>{part.type}</span>
            <div className="btn-group">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={() => movePart(index, 'up', parentId)}
                disabled={index === 0}
              >
                <i className="fas fa-arrow-up"></i>
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={() => movePart(index, 'down', parentId)}
                disabled={index === currentLength - 1}
              >
                <i className="fas fa-arrow-down"></i>
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => removePart(part.id, parentId)}>
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>

          {part.type === 'heading' && (
            <div className="row g-2">
              <div className="col-md-2">
                <select
                  className="form-select no-drag"
                  value={part.level}
                  onChange={(e) => updatePart(part.id, { level: parseInt(e.target.value) as 1|2|3 }, parentId)}
                >
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
              </div>
              <div className="col-md-10">
                <input
                  type="text"
                  className={`form-control no-drag h${part.level} mb-0`}
                  placeholder="Enter heading text..."
                  value={part.text}
                  onChange={(e) => updatePart(part.id, { text: e.target.value }, parentId)}
                />
                <div className="form-check mt-2">
                  <input
                    className="form-check-input no-drag"
                    type="checkbox"
                    id={`exclude-${part.id}`}
                    checked={part.excludeIfNextEmpty || false}
                    onChange={(e) => updatePart(part.id, { excludeIfNextEmpty: e.target.checked }, parentId)}
                  />
                  <label className="form-check-label small text-muted" htmlFor={`exclude-${part.id}`}>
                    Exclude if next part is empty
                  </label>
                </div>
              </div>
            </div>
          )}

          {part.type === 'fixed' && (
            <textarea
              className="form-control no-drag"
              placeholder="Enter fixed text..."
              value={part.text}
              onChange={(e) => updatePart(part.id, { text: e.target.value }, parentId)}
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
                  onChange={(e) => updatePart(part.id, { defaultText: e.target.value }, parentId)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted">Placeholder</label>
                <input
                  type="text"
                  className="form-control no-drag"
                  value={part.placeholder}
                  onChange={(e) => updatePart(part.id, { placeholder: e.target.value }, parentId)}
                />
              </div>
              <div className="col-12 mt-2">
                <div className="form-check">
                  <input
                    className="form-check-input no-drag"
                    type="checkbox"
                    id={`singleline-${part.id}`}
                    checked={part.singleLine || false}
                    onChange={(e) => updatePart(part.id, { singleLine: e.target.checked }, parentId)}
                  />
                  <label className="form-check-label small text-muted" htmlFor={`singleline-${part.id}`}>
                    Single line
                  </label>
                </div>
              </div>
            </div>
          )}

          {part.type === 'code' && (
            <div className="mb-0">
              <label className="form-label small text-muted">Language</label>
              <select
                className="form-select no-drag"
                value={part.language}
                onChange={(e) => updatePart(part.id, { language: e.target.value }, parentId)}
              >
                <option value="">None</option>
                <option value="csharp">C#</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
                <option value="bash">Shell Script</option>
                <option value="powershell">PowerShell</option>
                <option value="html">HTML</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="diff">Diff</option>
              </select>
            </div>
          )}

          {(part.type === 'quote' || part.type === 'hr') && (
            <div className="text-muted italic small">
              {part.type === 'quote' ? 'Quoted block (editable in viewer)' : 'Horizontal separator line'}
            </div>
          )}

          {part.type === 'repeatable' && (
            <div className="mt-2">
              <div className="bg-light p-3 rounded border">
                <h6 className="text-muted mb-3 small fw-bold text-uppercase">Repeatable Template</h6>
                {part.templateParts.map((subPart, subIndex) => renderPart(subPart, subIndex, part.id, part.templateParts.length))}
                
                <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('heading', part.id)}>
                    <i className="fas fa-heading me-1"></i> Heading
                  </button>
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('fixed', part.id)}>
                    <i className="fas fa-font me-1"></i> Fixed
                  </button>
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('custom', part.id)}>
                    <i className="fas fa-keyboard me-1"></i> Custom
                  </button>
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('quote', part.id)}>
                    <i className="fas fa-quote-left me-1"></i> Quote
                  </button>
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('code', part.id)}>
                    <i className="fas fa-code me-1"></i> Code
                  </button>
                  <button className="btn btn-sm btn-outline-info no-drag" onClick={() => addPart('hr', part.id)}>
                    <i className="fas fa-minus me-1"></i> Rule
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
        {parts.map((part, index) => renderPart(part, index))}
      </div>

      <div className="card border-dashed bg-light mt-4">
        <div className="card-body text-center py-4">
          <h5 className="mb-3 text-muted">Add a Part</h5>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('heading')}>
              <i className="fas fa-heading me-1"></i> Heading
            </button>
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
            <button className="btn btn-outline-primary no-drag" onClick={() => addPart('repeatable')}>
              <i className="fas fa-redo me-1"></i> Repeatable Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
