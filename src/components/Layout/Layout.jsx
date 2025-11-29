import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Book, Tag, Settings, ChevronRight, ChevronDown, Search as SearchIcon, Menu, X } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { useState, useEffect } from 'react';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const { tags } = useDiary();
    const [expandedTags, setExpandedTags] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleExpand = (e, tagId) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedTags(prev => ({
            ...prev,
            [tagId]: !prev[tagId]
        }));
    };

    const getRootTags = () => Object.values(tags).filter(tag => !tag.parentId);
    const getChildTags = (parentId) => Object.values(tags).filter(tag => tag.parentId === parentId);

    const renderTagNav = (tagList, level = 0) => {
        if (tagList.length === 0) return null;

        return tagList.map(tag => {
            const children = getChildTags(tag.id);
            const hasChildren = children.length > 0;
            const isExpanded = expandedTags[tag.id];

            return (
                <div key={tag.id} className="nav-tag-container">
                    <div className={`nav-item-wrapper ${isActive(`/tag/${tag.id}`)}`}>
                        <Link
                            to={`/tag/${tag.id}`}
                            className="nav-item-link"
                            style={{ paddingLeft: `calc(var(--spacing-3) + ${level * 12}px)` }}
                        >
                            <div className="tag-color-dot" style={{ backgroundColor: tag.color || '#6B7280' }}></div>
                            <span className="nav-text">{tag.name}</span>
                        </Link>
                        {hasChildren && (
                            <button
                                className="nav-expand-btn"
                                onClick={(e) => toggleExpand(e, tag.id)}
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        )}
                    </div>

                    {hasChildren && isExpanded && (
                        <div className="nav-children">
                            {renderTagNav(children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className="menu-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <h1>Diary</h1>
                <div style={{ width: 24 }}></div> {/* Spacer for centering */}
            </header>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1>Diary</h1>
                    <button
                        className="close-menu-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/" className={`nav-item ${isActive('/')}`}>
                        <CalendarIcon size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link to="/search" className={`nav-item ${isActive('/search')}`}>
                        <SearchIcon size={20} />
                        <span>Search</span>
                    </Link>
                    <Link to="/tags" className={`nav-item ${isActive('/tags')}`}>
                        <Settings size={20} />
                        <span>Manage Tags</span>
                    </Link>

                    <div className="nav-section">
                        <span className="nav-section-title">Tags</span>
                        {renderTagNav(getRootTags())}
                    </div>
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
