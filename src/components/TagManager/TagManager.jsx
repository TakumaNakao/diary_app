import { useState } from 'react';
import { Plus, Trash2, Edit2, Folder, FolderOpen, Tag } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './TagManager.css';

const TagManager = () => {
    const { tags, saveTag, deleteTag } = useDiary();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tagName, setTagName] = useState('');
    const [parentId, setParentId] = useState(null);

    const getRootTags = () => Object.values(tags).filter(tag => !tag.parentId);
    const getChildTags = (pid) => Object.values(tags).filter(tag => tag.parentId === pid);

    const handleSave = () => {
        if (!tagName.trim()) return;

        const tag = {
            id: editingId, // If null, saveTag generates new ID
            name: tagName,
            parentId: parentId
        };

        saveTag(tag);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            deleteTag(id);
        }
    };

    const startEdit = (tag) => {
        setEditingId(tag.id);
        setTagName(tag.name);
        setParentId(tag.parentId);
        setIsAdding(true);
    };

    const startAdd = (pid = null) => {
        setEditingId(null);
        setTagName('');
        setParentId(pid);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setTagName('');
        setParentId(null);
    };

    const renderTagTree = (tagList, level = 0) => {
        return tagList.map(tag => (
            <div key={tag.id} className="tag-item-container" style={{ marginLeft: level * 20 }}>
                <div className="tag-item">
                    <div className="tag-info">
                        <Tag size={16} className="tag-icon" />
                        <span className="tag-name">{tag.name}</span>
                    </div>
                    <div className="tag-actions">
                        <button onClick={() => startAdd(tag.id)} className="btn-icon" title="Add Child">
                            <Plus size={14} />
                        </button>
                        <button onClick={() => startEdit(tag)} className="btn-icon" title="Edit">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(tag.id)} className="btn-icon danger" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                {renderTagTree(getChildTags(tag.id), level + 1)}
            </div>
        ));
    };

    return (
        <div className="tag-manager">
            <div className="tag-manager-header">
                <h2>Manage Tags</h2>
                <button onClick={() => startAdd(null)} className="btn btn-primary">
                    <Plus size={16} style={{ marginRight: 8 }} /> New Root Tag
                </button>
            </div>

            {isAdding && (
                <div className="tag-form">
                    <h3>{editingId ? 'Edit Tag' : 'New Tag'}</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder="Tag Name"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Parent Tag</label>
                        <select value={parentId || ''} onChange={(e) => setParentId(e.target.value || null)}>
                            <option value="">(None)</option>
                            {Object.values(tags)
                                .filter(t => t.id !== editingId) // Prevent self-parenting
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button onClick={handleSave} className="btn btn-primary">Save</button>
                        <button onClick={resetForm} className="btn btn-ghost">Cancel</button>
                    </div>
                </div>
            )}

            <div className="tag-list">
                {renderTagTree(getRootTags())}
                {getRootTags().length === 0 && <p className="empty-state">No tags created yet.</p>}
            </div>
        </div>
    );
};

export default TagManager;
