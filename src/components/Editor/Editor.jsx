import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Eye, Edit2, ArrowLeft, Tag, Trash2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './Editor.css';

const Editor = () => {
    const { id } = useParams(); // 'new' or uuid
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const navigate = useNavigate();
    const { entries, saveEntry: saveEntryContext, tags, deleteEntry } = useDiary();

    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [entryDate, setEntryDate] = useState(dateParam || new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Track if this is the initial load to avoid auto-saving on mount
    const isInitialLoad = useRef(true);
    const saveTimeoutRef = useRef(null);
    const tagSelectorRef = useRef(null);

    // Close tag selector when clicking outside
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
        // Mark initial load as complete after a short delay
        setTimeout(() => {
            isInitialLoad.current = false;
        }, 100);
    }, [id, entries, dateParam]);

    // Auto-save when content or tags change (with debouncing)
    useEffect(() => {
        // Skip auto-save on initial load or if we're on a 'new' entry with no content
        if (isInitialLoad.current) return;
        if (id === 'new' && content.trim().length === 0 && selectedTags.length === 0) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save (0.3 second debounce)
        saveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 300);

        // Cleanup timeout on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, selectedTags]); // Auto-save when content or tags change

    const handleSave = () => {
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
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (id && id !== 'new') {
            deleteEntry(id);
            navigate(`/day/${entryDate}`);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
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
                    {id && id !== 'new' && (
                        showDeleteConfirm ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Delete entry?</span>
                                <button onClick={confirmDelete} className="btn btn-ghost" style={{ color: 'var(--color-danger)' }}>
                                    <Trash2 size={16} style={{ marginRight: 4 }} /> Delete
                                </button>
                                <button onClick={cancelDelete} className="btn btn-ghost">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleDeleteClick} className="btn btn-ghost" title="Delete Entry">
                                <Trash2 size={20} />
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="editor-content">
                {mode === 'edit' ? (
                    <textarea
                        className="editor-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
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
