import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Tag, Calendar, ChevronRight } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './EntryList.css';

const EntryList = () => {
    const { tagId } = useParams();
    const { entries, tags } = useDiary();

    const currentTag = tags[tagId];

    if (!currentTag) {
        return <div className="entry-list-container">Tag not found</div>;
    }

    // Helper to get all child tag IDs recursively
    const getChildTagIds = (id) => {
        const children = Object.values(tags).filter(t => t.parentId === id);
        let ids = [id];
        children.forEach(child => {
            ids = [...ids, ...getChildTagIds(child.id)];
        });
        return ids;
    };

    const relevantTagIds = getChildTagIds(tagId);

    const filteredEntries = Object.values(entries).filter(entry => {
        if (!entry.tags) return false;
        return entry.tags.some(tId => relevantTagIds.includes(tId));
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc

    return (
        <div className="entry-list-container">
            <div className="entry-list-header">
                <div className="tag-header-info">
                    <Tag size={24} className="tag-icon-large" />
                    <h2>{currentTag.name}</h2>
                </div>
                <span className="entry-count">{filteredEntries.length} entries</span>
            </div>

            <div className="entries-grid">
                {filteredEntries.length === 0 ? (
                    <p className="empty-list">No entries found with this tag.</p>
                ) : (
                    filteredEntries.map(entry => (
                        <Link key={entry.id} to={`/entry/${entry.id}`} className="entry-card">
                            <div className="entry-card-header">
                                <div className="entry-date">
                                    <Calendar size={16} />
                                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                                </div>
                                <ChevronRight size={16} className="entry-arrow" />
                            </div>
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
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default EntryList;
