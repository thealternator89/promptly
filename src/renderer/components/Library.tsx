import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Prompt } from '../../types';
import logo from '../../../assets/logo-full.png';

interface SortablePromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

const SortablePromptCard: React.FC<SortablePromptCardProps> = ({ prompt, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 0,
    position: 'relative' as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="col"
    >
      <div 
        className={`card h-100 shadow-sm hover-shadow transition cursor-pointer no-drag ${isDragging ? 'border-primary shadow-lg' : ''}`}
        onClick={onClick}
        style={{ opacity: isDragging ? 0.5 : 1 }}
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
  );
};

const Library: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadPrompts = async () => {
    const data = await window.electronAPI.getPrompts();
    setPrompts(data);
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPrompts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Persist the new order
        window.electronAPI.savePromptsOrder(newArray.map(p => p.id));
        
        return newArray;
      });
    }
  };

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
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={prompts.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {prompts.map((prompt) => (
                <SortablePromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={() => navigate(`/viewer/${prompt.id}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default Library;
