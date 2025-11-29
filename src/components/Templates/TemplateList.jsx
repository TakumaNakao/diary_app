import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import './TemplateList.css';

const TemplateList = () => {
    const { templates, deleteTemplate } = useTemplates();
    const navigate = useNavigate();

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            deleteTemplate(id);
        }
    };

    return (
        <div className="template-list-container">
            <div className="template-list-header">
                <h2>Templates</h2>
                <Link to="/templates/new" className="btn btn-primary">
                    <Plus size={20} style={{ marginRight: 8 }} />
                    New Template
                </Link>
            </div>

            <div className="template-grid">
                {Object.values(templates).length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <p>No templates yet. Create one to get started!</p>
                    </div>
                ) : (
                    Object.values(templates).map(template => (
                        <div key={template.id} className="template-card">
                            <div className="template-card-header">
                                <h3>{template.title}</h3>
                                <div className="template-actions">
                                    <button
                                        onClick={() => navigate(`/templates/${template.id}`)}
                                        className="btn-icon"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="btn-icon delete"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="template-preview">
                                {template.content.substring(0, 100)}
                                {template.content.length > 100 ? '...' : ''}
                            </p>
                            <div className="template-meta">
                                <span className="template-tags">
                                    {template.tags && template.tags.length > 0
                                        ? `${template.tags.length} tags`
                                        : 'No tags'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TemplateList;
