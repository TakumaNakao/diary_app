import { useState } from 'react';
import { Calendar as CalendarIcon, Tag, Link as LinkIcon, X, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './LinkInserter.css';

const LinkInserter = ({ onClose, onInsert }) => {
    const { entries, tags } = useDiary();
    const [activeTab, setActiveTab] = useState('date'); // 'date' | 'tag'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expandedTags, setExpandedTags] = useState({});

    // Date Tab Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        // Find entries for this date
        const dayEntries = Object.values(entries).filter(e => e.date === dateStr);

        if (dayEntries.length === 0) {
            // Link to the daily log even if empty
            onInsert(`[${dateStr}](/day/${dateStr})`);
        } else if (dayEntries.length === 1) {
            // Link to the specific entry
            const entry = dayEntries[0];
            const title = entry.content.split('\n')[0].substring(0, 20) || 'Entry';
            onInsert(`[${dateStr}: ${title}...](/entry/${entry.id})`);
        } else {
            // Link to the daily log if multiple entries
            onInsert(`[${dateStr} (${dayEntries.length} entries)](/day/${dateStr})`);
        }
        onClose();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(selectedDate);
        const firstDay = getFirstDayOfMonth(selectedDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="mini-calendar-day empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(i).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayStr}`;
            const hasEntry = Object.values(entries).some(e => e.date === dateStr);

            days.push(
                <button
                    key={i}
                    className={`mini-calendar-day ${hasEntry ? 'has-entry' : ''}`}
                    onClick={() => handleDateClick(i)}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    // Tag Tab Logic
    const toggleTag = (tagId) => {
        setExpandedTags(prev => ({ ...prev, [tagId]: !prev[tagId] }));
    };

    const handleTagClick = (tag) => {
        onInsert(`[#${tag.name}](/tag/${tag.id})`);
        onClose();
    };

    const handleEntryClick = (entry) => {
        const title = entry.content.split('\n')[0].substring(0, 30).replace(/[\[\]]/g, '') || 'Entry';
        const date = new Date(entry.date).toLocaleDateString();
        onInsert(`[${date}: ${title}...](/entry/${entry.id})`);
        onClose();
    };

    const renderTagTree = (parentId = null, level = 0) => {
        const childTags = Object.values(tags).filter(t => t.parentId === parentId);

        if (childTags.length === 0 && parentId === null) {
            return <div className="empty-message">No tags found.</div>;
        }

        return childTags.map(tag => {
            const hasChildren = Object.values(tags).some(t => t.parentId === tag.id);
            const isExpanded = expandedTags[tag.id];

            // Find entries with this tag
            const tagEntries = Object.values(entries).filter(e => e.tags && e.tags.includes(tag.id));

            return (
                <div key={tag.id} className="tag-tree-item" style={{ marginLeft: level * 12 }}>
                    <div className="tag-row">
                        <button
                            className="tag-expand-btn"
                            onClick={() => toggleTag(tag.id)}
                            style={{ visibility: (hasChildren || tagEntries.length > 0) ? 'visible' : 'hidden' }}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <button className="tag-select-btn" onClick={() => handleTagClick(tag)}>
                            <div className="tag-color-dot" style={{ backgroundColor: tag.color || '#6B7280' }}></div>
                            <span className="tag-name">{tag.name}</span>
                            <span className="tag-count">({tagEntries.length})</span>
                        </button>
                    </div>

                    {isExpanded && (
                        <div className="tag-children">
                            {/* Render entries for this tag */}
                            {tagEntries.map(entry => (
                                <button
                                    key={entry.id}
                                    className="tag-entry-item"
                                    style={{ marginLeft: (level + 1) * 12 + 20 }}
                                    onClick={() => handleEntryClick(entry)}
                                >
                                    <FileText size={12} />
                                    <span className="entry-date">{new Date(entry.date).toLocaleDateString()}</span>
                                    <span className="entry-preview">
                                        {entry.content.split('\n')[0].substring(0, 20) || 'No content'}
                                    </span>
                                </button>
                            ))}
                            {/* Render child tags */}
                            {renderTagTree(tag.id, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="link-inserter-overlay" onClick={onClose}>
            <div className="link-inserter-modal" onClick={e => e.stopPropagation()}>
                <div className="link-inserter-header">
                    <h3>Insert Link</h3>
                    <button onClick={onClose} className="btn-icon"><X size={18} /></button>
                </div>

                <div className="link-tabs">
                    <button
                        className={`link-tab ${activeTab === 'date' ? 'active' : ''}`}
                        onClick={() => setActiveTab('date')}
                    >
                        <CalendarIcon size={16} /> By Date
                    </button>
                    <button
                        className={`link-tab ${activeTab === 'tag' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tag')}
                    >
                        <Tag size={16} /> By Tag
                    </button>
                </div>

                <div className="link-content">
                    {activeTab === 'date' ? (
                        <div className="date-selector">
                            <div className="mini-calendar-header">
                                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>&lt;</button>
                                <span>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>&gt;</button>
                            </div>
                            <div className="mini-calendar-grid">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="mini-weekday">{d}</div>)}
                                {renderCalendar()}
                            </div>
                        </div>
                    ) : (
                        <div className="tag-selector">
                            {renderTagTree()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkInserter;
