import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import './TagManager.css';

const TagManager = () => {
    const { tags, saveTag, deleteTag } = useDiary();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tagName, setTagName] = useState('');
    const [parentId, setParentId] = useState(null);
    const [tagColor, setTagColor] = useState('#6B7280');
    const [errorMessage, setErrorMessage] = useState('');

    const PRESET_COLORS = [
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#10B981', // Green
        '#3B82F6', // Blue
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6B7280', // Gray
        '#14B8A6', // Teal
    ];

    const getRootTags = () => Object.values(tags).filter(tag => !tag.parentId);
    const getChildTags = (pid) => Object.values(tags).filter(tag => tag.parentId === pid);

    const handleSave = () => {
        if (!tagName.trim()) {
            setErrorMessage('Tag name cannot be empty.');
            return;
        }

        // Normalize parentId: treat empty string as null
        const normalizedParentId = parentId || null;

        // Check for duplicate names at the same level (same parentId)
        const siblingsWithSameName = Object.values(tags).filter(tag => {
            // Normalize the tag's parentId for comparison
            const tagParentId = tag.parentId || null;

            return (
                tag.id !== editingId && // Exclude the current tag if editing
                tagParentId === normalizedParentId &&
                tag.name.toLowerCase() === tagName.trim().toLowerCase()
            );
        });

        if (siblingsWithSameName.length > 0) {
            setErrorMessage(`A tag named "${tagName}" already exists at this level.`);
            return;
        }

        const tag = {
            id: editingId, // If null, saveTag generates new ID
            name: tagName.trim(),
            parentId: normalizedParentId,
            color: tagColor
        };

        saveTag(tag);
        resetForm();
    };

    const handleDelete = (id) => {
        // Delete directly without confirmation
        deleteTag(id);
    };

    const startEdit = (tag) => {
        setEditingId(tag.id);
        setTagName(tag.name);
        setParentId(tag.parentId || null);
        setTagColor(tag.color || '#6B7280');
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
        setTagColor('#6B7280');
        setErrorMessage('');
    };

    const renderTagTree = (tagList, level = 0) => {
        return tagList.map(tag => (
            <div key={tag.id} className="tag-item-container" style={{ marginLeft: level * 20 }}>
                <div className="tag-item">
                    <div className="tag-info">
                        <div className="tag-color-indicator" style={{ backgroundColor: tag.color || '#6B7280' }}></div>
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
                    {errorMessage && (
                        <div className="error-message" style={{
                            padding: 'var(--spacing-2) var(--spacing-3)',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-3)',
                            fontSize: '0.875rem'
                        }}>
                            {errorMessage}
                        </div>
                    )}
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
                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option ${tagColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setTagColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
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
