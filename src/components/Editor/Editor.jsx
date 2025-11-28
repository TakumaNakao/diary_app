import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Edit2, ArrowLeft, Tag } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './Editor.css';

const Editor = () => {
    const { id } = useParams(); // 'new' or uuid
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const navigate = useNavigate();
    const { entries, saveEntry: saveEntryContext, tags } = useDiary();

    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [entryDate, setEntryDate] = useState(dateParam || new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
    const [isSaving, setIsSaving] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);

    // Load existing entry or reset for new
    useEffect(() => {
        if (id === 'new') {
            setContent('');
            setSelectedTags([]);
            setEntryDate(dateParam || new Date().toISOString().split('T')[0]);
            setMode('edit');
        } else if (id) {
            const entry = entries[id];
            if (entry) {
                setContent(entry.content);
                setSelectedTags(entry.tags || []);
                setEntryDate(entry.date);
            }
        }
    }, [id, entries, dateParam]);

    const handleSave = () => {
        setIsSaving(true);
        const entryData = {
            id: id === 'new' ? undefined : id,
            date: entryDate,
            content,
            tags: selectedTags
        };

        const savedEntry = saveEntryContext(entryData);

        // If it was new, navigate to the created ID to avoid creating duplicates on subsequent saves
        if (id === 'new') {
            navigate(`/entry/${savedEntry.id}`, { replace: true });
        }

        setTimeout(() => setIsSaving(false), 500);
    };

    const handleBlur = () => {
        // Optional: Auto-save logic. 
        // For multiple entries, auto-save on new might be tricky if it creates many entries.
        // Let's keep it simple: Auto-save only if we have an ID or content is not empty.
        if (id !== 'new' || content.trim().length > 0) {
            handleSave();
        }
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
                    <button onClick={() => navigate(`/day/${entryDate}`)} className="btn btn-ghost" aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>{new Date(entryDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</h2>
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
