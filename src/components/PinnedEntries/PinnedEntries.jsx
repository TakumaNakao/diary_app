import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedMarkdown from '../EnhancedMarkdown/EnhancedMarkdown';
import { Pin, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getContrastTextColor } from '../../utils/colorUtils';
import './PinnedEntries.css';

const PinnedEntries = () => {
    const { entries, tags, deleteEntry, togglePin } = useDiary();
    const [deletingId, setDeletingId] = useState(null);

    const pinnedEntries = Object.values(entries)
        .filter(entry => entry.isPinned)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleDeleteClick = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingId(id);
    };

    const confirmDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this entry?')) {
            deleteEntry(id);
        }
        setDeletingId(null);
    };

    const cancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingId(null);
    };

    const handleUnpin = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin(id);
    };

    return (
        <div className="pinned-entries-container">
            <div className="pinned-entries-header">
                <div className="header-info">
                    <Pin size={24} className="header-icon" />
                    <h2>Pinned Entries</h2>
                </div>
                <span className="entry-count">{pinnedEntries.length} entries</span>
            </div>

            <div className="entries-grid">
                {pinnedEntries.length === 0 ? (
                    <div className="empty-state">
                        <Pin size={48} className="empty-icon" />
                        <p>No pinned entries yet.</p>
                        <p className="sub-text">Pin important entries to see them here.</p>
                    </div>
                ) : (
                    pinnedEntries.map(entry => (
                        <Link key={entry.id} to={`/entry/${entry.id}`} className="entry-card">
                            <div className="entry-content-wrapper">
                                <div className="entry-card-header">
                                    <div className="entry-date">
                                        <Calendar size={16} />
                                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        className="unpin-btn"
                                        onClick={(e) => handleUnpin(e, entry.id)}
                                        title="Unpin"
                                    >
                                        <Pin size={16} fill="currentColor" />
                                    </button>
                                </div>
                                <div className="entry-preview markdown-body">
                                    <EnhancedMarkdown>{entry.content}</EnhancedMarkdown>
                                    {entry.content.length === 0 && <span className="italic-text">No content</span>}
                                </div>
                                <div className="entry-tags">
                                    {entry.tags && entry.tags.map(tId => {
                                        const t = tags[tId];
                                        if (!t) return null;
                                        const bgColor = t.color || '#6B7280';
                                        return (
                                            <span
                                                key={tId}
                                                className="entry-tag-pill"
                                                style={{
                                                    backgroundColor: bgColor,
                                                    color: getContrastTextColor(bgColor)
                                                }}
                                            >
                                                {t.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="entry-actions">
                                <button
                                    onClick={(e) => confirmDelete(e, entry.id)}
                                    className="btn-icon delete-btn"
                                    title="Delete Entry"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default PinnedEntries;
