import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Edit2, ArrowLeft, Tag } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './Editor.css';

const Editor = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const { entries, saveEntry: saveEntryContext, tags } = useDiary();

    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
    const [isSaving, setIsSaving] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);

    useEffect(() => {
        if (entries[date]) {
            setContent(entries[date].content);
            setSelectedTags(entries[date].tags || []);
        } else {
            setContent('');
            setSelectedTags([]);
        }
    }, [date, entries]);

    const handleSave = () => {
        setIsSaving(true);
        saveEntryContext(date, content, selectedTags);
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleBlur = () => {
        handleSave();
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <div className="editor-header-left">
                    <button onClick={() => navigate('/')} className="btn btn-ghost" aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'full' })}</h2>
                </div>
                <div className="editor-actions">
                    <div className="tag-selector-container" style={{ position: 'relative' }}>
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
                                            {tag.name}
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mode-toggle">
                        <button
                            className={`btn ${mode === 'edit' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setMode('edit')}
                        >
                            <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
                        </button>
                        <button
                            className={`btn ${mode === 'preview' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setMode('preview')}
                        >
                            <Eye size={16} style={{ marginRight: 8 }} /> Preview
                        </button>
                    </div>
                    <button onClick={handleSave} className="btn btn-ghost" disabled={isSaving}>
                        <Save size={20} />
                        {isSaving ? ' Saving...' : ''}
                    </button>
                </div>
            </div>

            <div className="editor-content">
                {mode === 'edit' ? (
                    <textarea
                        className="editor-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Write your diary entry here... (Markdown supported)"
                        autoFocus
                    />
                ) : (
                    <div className="editor-preview markdown-body">
                        <ReactMarkdown>{content}</ReactMarkdown>
                        {content.trim() === '' && <p className="empty-preview">Nothing written yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Editor;
