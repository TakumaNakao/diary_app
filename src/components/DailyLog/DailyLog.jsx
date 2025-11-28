import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Plus, Calendar as CalendarIcon, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './DailyLog.css';

const DailyLog = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const { entries, tags, deleteEntry } = useDiary();
    const [deletingId, setDeletingId] = useState(null);

    const dailyEntries = Object.values(entries).filter(entry => entry.date === date);

    const handleCreateNew = () => {
        navigate(`/entry/new?date=${date}`);
    };

    const handleDeleteClick = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingId(id);
    };

    const confirmDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        deleteEntry(id);
        setDeletingId(null);
    };

    const cancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingId(null);
    };

    return (
        <div className="daily-log-container">
            <div className="daily-log-header">
                <div className="header-left">
                    <button onClick={() => navigate('/')} className="btn btn-ghost" aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'full' })}</h2>
                </div>
                <button onClick={handleCreateNew} className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: 8 }} /> New Entry
                </button>
            </div>

            <div className="daily-entries-list">
                {dailyEntries.length === 0 ? (
                    <div className="empty-state">
                        <p>No entries for this day.</p>
                        <button onClick={handleCreateNew} className="btn btn-ghost">Create one now</button>
                    </div>
                ) : (
                    dailyEntries.map(entry => (
                        <Link key={entry.id} to={`/entry/${entry.id}`} className="entry-card">
                            <div className="entry-content-wrapper">
                                <div className="entry-preview markdown-body">
                                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                                    {entry.content.length === 0 && <span className="italic-text">No content</span>}
                                </div>
                                <div className="entry-tags">
                                    {entry.tags && entry.tags.map(tId => {
                                        const t = tags[tId];
                                        if (!t) return null;
                                        return (
                                            <span
                                                key={tId}
                                                className="entry-tag-pill"
                                                style={{
                                                    backgroundColor: t.color || '#6B7280',
                                                    color: 'white'
                                                }}
                                            >
                                                {t.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="entry-actions">
                                {deletingId === entry.id ? (
                                    <div className="delete-confirmation" onClick={(e) => e.preventDefault()}>
                                        <span className="delete-confirm-text">Delete?</span>
                                        <button
                                            onClick={(e) => confirmDelete(e, entry.id)}
                                            className="btn-icon danger"
                                            title="Confirm Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={cancelDelete}
                                            className="btn-icon"
                                            title="Cancel"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => handleDeleteClick(e, entry.id)}
                                        className="btn-icon delete-btn"
                                        title="Delete Entry"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default DailyLog;
