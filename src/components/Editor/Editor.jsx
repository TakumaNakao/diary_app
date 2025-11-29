import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedMarkdown from '../EnhancedMarkdown/EnhancedMarkdown';
import { Eye, Edit2, ArrowLeft, Tag, Link as LinkIcon, FileText, X } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { useTemplates } from '../../context/TemplateContext';
import LinkInserter from './LinkInserter';
import './Editor.css';

const Editor = () => {
    const { id } = useParams(); // 'new' or uuid
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const navigate = useNavigate();
    const { entries, saveEntry: saveEntryContext, tags } = useDiary();
    const { templates } = useTemplates();

    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [entryDate, setEntryDate] = useState(dateParam || new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showLinkInserter, setShowLinkInserter] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

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

    const lastIdRef = useRef(null);

    // Manage mode transitions
    useEffect(() => {
        // If it's a new entry, always start in edit mode
        if (id === 'new') {
            setMode('edit');
        }
        // If we're navigating to an existing entry
        else if (id) {
            // If we just came from 'new' (created a new entry), keep the current mode (likely 'edit')
            if (lastIdRef.current === 'new') {
                // Do nothing, preserve mode
            }
            // If we navigated from another existing entry or fresh load, default to preview
            else if (lastIdRef.current !== id) {
                setMode('preview');
            }
        }
        lastIdRef.current = id;
    }, [id]);

    // Load existing entry or reset for new
    useEffect(() => {
        if (id === 'new') {
            setContent('');
            setSelectedTags([]);
            setEntryDate(dateParam || new Date().toISOString().split('T')[0]);
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

    const handleInsertLink = (linkText) => {
        const textarea = document.querySelector('.editor-textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + linkText + content.substring(end);
            setContent(newContent);

            // Restore focus and cursor position (after inserted text)
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + linkText.length, start + linkText.length);
            }, 0);
        } else {
            setContent(prev => prev + linkText);
        }
        setShowLinkInserter(false);
    };

    const handleLoadTemplate = (template) => {
        if (content.trim() && !window.confirm('Loading a template will replace current content. Continue?')) {
            return;
        }
        setContent(template.content);

        // Merge tags
        if (template.tags && template.tags.length > 0) {
            const newTags = [...new Set([...selectedTags, ...template.tags])];
            setSelectedTags(newTags);
        }

        setShowTemplateSelector(false);
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

                    <button
                        className={`btn ${showLinkInserter ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setShowLinkInserter(true)}
                        title="Insert Link"
                    >
                        <LinkIcon size={16} style={{ marginRight: 8 }} /> Link
                    </button>

                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowTemplateSelector(true)}
                        title="Load Template"
                    >
                        <FileText size={16} style={{ marginRight: 8 }} /> Template
                    </button>

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
                        <EnhancedMarkdown
                            components={{
                                a: ({ node, ...props }) => {
                                    const isInternal = props.href && (
                                        props.href.startsWith('/day/') ||
                                        props.href.startsWith('/entry/') ||
                                        props.href.startsWith('/tag/')
                                    );

                                    if (isInternal) {
                                        return (
                                            <a
                                                {...props}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(props.href);
                                                }}
                                                style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
                                            />
                                        );
                                    }
                                    return <a {...props} target="_blank" rel="noopener noreferrer" />;
                                }
                            }}
                        >
                            {content}
                        </EnhancedMarkdown>
                        {content.trim() === '' && <p className="empty-preview">Nothing written yet.</p>}
                    </div>
                )}
            </div>
            {showLinkInserter && (
                <LinkInserter
                    onClose={() => setShowLinkInserter(false)}
                    onInsert={handleInsertLink}
                />
            )}

            {showTemplateSelector && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Select Template</h3>
                            <button onClick={() => setShowTemplateSelector(false)} className="btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="template-selector-list">
                            {Object.values(templates).length === 0 ? (
                                <p className="empty-text">No templates available.</p>
                            ) : (
                                Object.values(templates).map(template => (
                                    <button
                                        key={template.id}
                                        className="template-selector-item"
                                        onClick={() => handleLoadTemplate(template)}
                                    >
                                        <span className="template-title">{template.title}</span>
                                        <span className="template-preview-text">
                                            {template.content.substring(0, 50)}...
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;
