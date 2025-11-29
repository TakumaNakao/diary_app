import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplates } from '../../context/TemplateContext';
import { useDiary } from '../../context/DiaryContext';
import { Save, ArrowLeft, Tag } from 'lucide-react';
import './TemplateEditor.css';

const TemplateEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { templates, saveTemplate } = useTemplates();
    const { tags } = useDiary();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagSelector, setShowTagSelector] = useState(false);

    useEffect(() => {
        if (id && templates[id]) {
            const template = templates[id];
            setTitle(template.title);
            setContent(template.content);
            setSelectedTags(template.tags || []);
        }
    }, [id, templates]);

    const tagSelectorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target)) {
                setShowTagSelector(false);
            }
        };

        if (showTagSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTagSelector]);

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a template title');
            return;
        }

        saveTemplate({
            id: id,
            title,
            content,
            tags: selectedTags
        });

        navigate('/templates');
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <div className="template-editor-container">
            <div className="template-editor-header">
                <div className="header-left">
                    <button onClick={() => navigate('/templates')} className="btn btn-ghost">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>{id ? 'Edit Template' : 'New Template'}</h2>
                </div>
                <div className="header-actions">
                    <div className="tag-selector-container" style={{ position: 'relative' }} ref={tagSelectorRef}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowTagSelector(!showTagSelector)}
                        >
                            <Tag size={16} style={{ marginRight: 8 }} />
                            {selectedTags.length > 0 ? `${selectedTags.length} Tags` : 'Add Tags'}
                        </button>
                        {showTagSelector && (
                            <div className="tag-dropdown">
                                {Object.values(tags).length === 0 ? (
                                    <div className="tag-dropdown-empty">No tags available</div>
                                ) : (
                                    Object.values(tags).map(tag => (
                                        <label key={tag.id} className="tag-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedTags.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            <span className="tag-color" style={{ backgroundColor: tag.color }}></span>
                                            {tag.name}
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={handleSave} className="btn btn-primary">
                        <Save size={20} style={{ marginRight: 8 }} />
                        Save Template
                    </button>
                </div>
            </div>

            <div className="template-editor-form">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Template Name (e.g., Daily Reflection)"
                        className="form-input"
                    />
                </div>

                <div className="form-group full-height">
                    <label>Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Template content..."
                        className="form-textarea"
                    />
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
