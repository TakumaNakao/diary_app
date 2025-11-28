import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Book, Tag, Settings } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const { tags } = useDiary();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const getRootTags = () => Object.values(tags).filter(tag => !tag.parentId);

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>Diary</h1>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/" className={`nav-item ${isActive('/')}`}>
                        <CalendarIcon size={20} />
                        <span>Calendar</span>
                    </Link>
                    <Link to="/tags" className={`nav-item ${isActive('/tags')}`}>
                        <Settings size={20} />
                        <span>Manage Tags</span>
                    </Link>

                    <div className="nav-section">
                        <span className="nav-section-title">Tags</span>
                        {getRootTags().map(tag => (
                            <Link key={tag.id} to={`/tag/${tag.id}`} className={`nav-item ${isActive(`/tag/${tag.id}`)}`}>
                                <Tag size={16} />
                                <span>{tag.name}</span>
                            </Link>
                        ))}
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
