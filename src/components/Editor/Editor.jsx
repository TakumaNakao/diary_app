import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedMarkdown from '../EnhancedMarkdown/EnhancedMarkdown';
import { Eye, Edit2, ArrowLeft, Tag, Link as LinkIcon, FileText, X, Pin, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { useTemplates } from '../../context/TemplateContext';
import { StorageService } from '../../utils/storage';
import LinkInserter from './LinkInserter';
import { v4 as uuidv4 } from 'uuid';
import './Editor.css';

const Editor = () => {
    const { id } = useParams(); // 'new' or uuid
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    const navigate = useNavigate();
    const { entries, saveEntry: saveEntryContext, tags, togglePin } = useDiary();
    const { templates } = useTemplates();

    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [entryDate, setEntryDate] = useState(dateParam || new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showLinkInserter, setShowLinkInserter] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Image state
    const [images, setImages] = useState([]); // Array of { id, blob, url, isPending }
    const fileInputRef = useRef(null);

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
        if (id === 'new') {
            setMode('edit');
        } else if (id) {
            if (lastIdRef.current === 'new') {
                // Preserve mode
            } else if (lastIdRef.current !== id) {
                setMode('preview');
            }
        }
        lastIdRef.current = id;
    }, [id]);

    // Load existing entry or reset for new
    useEffect(() => {
        const loadEntry = async () => {
            if (id === 'new') {
                setContent('');
                setSelectedTags([]);
                setEntryDate(dateParam || new Date().toISOString().split('T')[0]);
                setImages([]);
            } else if (id) {
                const entry = entries[id];
                if (entry) {
                    setContent(entry.content);
                    setSelectedTags(entry.tags || []);
                    setEntryDate(entry.date);

                    // Load images
                    try {
                        const loadedImages = await StorageService.getImagesByEntryId(id);
                        // Create object URLs for preview
                        const imagesWithUrls = loadedImages.map(img => ({
                            ...img,
                            url: URL.createObjectURL(img.blob)
                        }));
                        setImages(imagesWithUrls);
                    } catch (error) {
                        console.error("Failed to load images:", error);
                    }
                }
            }
            // Mark initial load as complete after a short delay
            setTimeout(() => {
                isInitialLoad.current = false;
            }, 100);
        };
        loadEntry();

        // Cleanup URLs on unmount or id change
        return () => {
            images.forEach(img => {
                if (img.url) URL.revokeObjectURL(img.url);
            });
        };
    }, [id, entries, dateParam]);

    // Auto-save when content or tags change (with debouncing)
    useEffect(() => {
        if (isInitialLoad.current) return;
        if (id === 'new' && content.trim().length === 0 && selectedTags.length === 0 && images.length === 0) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 300);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [content, selectedTags, images]); // Added images to dependency

    const handleSave = async () => {
        const entryData = {
            id: id === 'new' ? undefined : id,
            date: entryDate,
            content,
            tags: selectedTags
        };

        try {
            const savedEntry = await saveEntryContext(entryData);
            const entryId = savedEntry.id;

            // Save pending images
            const pendingImages = images.filter(img => img.isPending);
            if (pendingImages.length > 0) {
                await Promise.all(pendingImages.map(async (img) => {
                    await StorageService.saveImage({
                        entryId: entryId,
                        blob: img.blob,
                        mimeType: img.blob.type
                    });
                }));

                // Reload images to get real IDs and remove pending status
                // Or just update local state if we want to be faster, but reloading ensures consistency
                const loadedImages = await StorageService.getImagesByEntryId(entryId);
                const imagesWithUrls = loadedImages.map(img => ({
                    ...img,
                    url: URL.createObjectURL(img.blob)
                }));
                setImages(imagesWithUrls);
            }

            if (id === 'new') {
                navigate(`/entry/${savedEntry.id}`, { replace: true });
            }
        } catch (error) {
            console.error("Failed to save entry:", error);
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

        if (template.tags && template.tags.length > 0) {
            const newTags = [...new Set([...selectedTags, ...template.tags])];
            setSelectedTags(newTags);
        }

        setShowTemplateSelector(false);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: uuidv4(), // Temporary ID for key
            blob: file,
            url: URL.createObjectURL(file),
            isPending: true
        }));

        setImages(prev => [...prev, ...newImages]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (imageId, isPending) => {
        if (!window.confirm('Delete this image?')) return;

        if (isPending) {
            setImages(prev => prev.filter(img => img.id !== imageId));
        } else {
            try {
                await StorageService.deleteImage(imageId);
                setImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
        }
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
                                            <span className="tag-color" style={{ backgroundColor: tag.color }}></span>
                                            {tag.name}
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className={`btn ${entries[id]?.isPinned ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => id !== 'new' && togglePin(id)}
                        disabled={id === 'new'}
                        title={id === 'new' ? "Save entry to pin" : "Pin Entry"}
                    >
                        <Pin size={16} style={{ marginRight: 8 }} /> {entries[id]?.isPinned ? 'Pinned' : 'Pin'}
                    </button>

                    <button
                        className="btn btn-ghost"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach Image"
                    >
                        <ImageIcon size={16} style={{ marginRight: 8 }} /> Image
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                    />

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

            {/* Image Gallery */}
            {images.length > 0 && (
                <div className="editor-images">
                    <h3>Attached Images</h3>
                    <div className="image-grid">
                        {images.map(img => (
                            <div key={img.id} className="image-item">
                                <img src={img.url} alt="Attachment" />
                                <button
                                    className="delete-image-btn"
                                    onClick={() => handleDeleteImage(img.id, img.isPending)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
