import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './DailyLog.css';

const DailyLog = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const { entries, tags } = useDiary();

    const dailyEntries = Object.values(entries).filter(entry => entry.date === date);

    const handleCreateNew = () => {
        navigate(`/entry/new?date=${date}`);
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
                            <div className="entry-preview">
                                {entry.content.slice(0, 150) || <span className="italic-text">No content</span>}
                            </div>
                            <div className="entry-tags">
                                {entry.tags && entry.tags.map(tId => {
                                    const t = tags[tId];
                                    if (!t) return null;
                                    return (
                                        <span key={tId} className="entry-tag-pill">
                                            {t.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default DailyLog;
