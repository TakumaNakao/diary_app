import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Calendar, Tag as TagIcon, X } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getContrastTextColor } from '../../utils/colorUtils';
import './Search.css';

const Search = () => {
    const { tags, searchEntries } = useDiary();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    const handleSearch = () => {
        const results = searchEntries({
            query: searchQuery,
            tagIds: selectedTags,
            startDate: startDate || null,
            endDate: endDate || null
        });
        setSearchResults(results);
    };

    const handleTagToggle = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTags([]);
        setStartDate('');
        setEndDate('');
        setSearchResults(null);
    };

    const handleEntryClick = (entry) => {
        // Navigate to the entry detail page
        navigate(`/entry/${entry.id}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTagName = (tagId) => {
        return tags[tagId]?.name || '';
    };

    const getTagColor = (tagId) => {
        return tags[tagId]?.color || '#6B7280';
    };

    return (
        <div className="search-container">
            <div className="search-header">
                <h1>検索</h1>
            </div>

            <div className="search-form">
                <div className="search-input-group">
                    <SearchIcon size={20} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="タイトルまたは本文を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="filter-section">
                    <div className="filter-group">
                        <label className="filter-label">
                            <TagIcon size={16} />
                            タグで絞り込み
                        </label>
                        <div className="tag-filter">
                            {Object.values(tags).map(tag => (
                                <button
                                    key={tag.id}
                                    className={`tag-filter-btn ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                                    style={{
                                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                                        borderColor: tag.color,
                                        color: selectedTags.includes(tag.id) ? '#fff' : 'var(--color-text-primary)'
                                    }}
                                    onClick={() => handleTagToggle(tag.id)}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <Calendar size={16} />
                            期間で絞り込み
                        </label>
                        <div className="date-range">
                            <input
                                type="date"
                                className="date-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="date-separator">〜</span>
                            <input
                                type="date"
                                className="date-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="search-actions">
                    <button className="btn btn-primary" onClick={handleSearch}>
                        <SearchIcon size={16} />
                        検索
                    </button>
                    <button className="btn btn-ghost" onClick={clearFilters}>
                        <X size={16} />
                        クリア
                    </button>
                </div>
            </div>

            {searchResults !== null && (
                <div className="search-results">
                    <div className="results-header">
                        <h2>検索結果</h2>
                        <span className="results-count">{searchResults.length}件</span>
                    </div>

                    {searchResults.length === 0 ? (
                        <div className="no-results">
                            <SearchIcon size={48} className="no-results-icon" />
                            <p>検索結果が見つかりませんでした</p>
                            <p className="no-results-hint">キーワードや条件を変更してもう一度お試しください</p>
                        </div>
                    ) : (
                        <div className="results-list">
                            {searchResults.map(entry => (
                                <div
                                    key={entry.id}
                                    className="result-item"
                                    onClick={() => handleEntryClick(entry)}
                                >
                                    <div className="result-date">{formatDate(entry.date)}</div>
                                    {entry.title && <h3 className="result-title">{entry.title}</h3>}
                                    <p className="result-content">
                                        {entry.content?.substring(0, 200)}
                                        {entry.content?.length > 200 && '...'}
                                    </p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="result-tags">
                                            {entry.tags.map(tagId => {
                                                const bgColor = getTagColor(tagId);
                                                return (
                                                    <span
                                                        key={tagId}
                                                        className="result-tag"
                                                        style={{
                                                            backgroundColor: bgColor,
                                                            color: getContrastTextColor(bgColor)
                                                        }}
                                                    >
                                                        {getTagName(tagId)}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
