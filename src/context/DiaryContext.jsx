import { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import Fuse from 'fuse.js';

const DiaryContext = createContext();

export const useDiary = () => {
    const context = useContext(DiaryContext);
    if (!context) {
        throw new Error('useDiary must be used within a DiaryProvider');
    }
    return context;
};

export const DiaryProvider = ({ children }) => {
    const [entries, setEntries] = useState({});
    const [tags, setTags] = useState({});

    useEffect(() => {
        // Load initial data
        const data = StorageService.getData();
        setEntries(data.entries);
        setTags(data.tags);
    }, []);

    const saveEntry = (entryData) => {
        const savedEntry = StorageService.saveEntry(entryData);
        setEntries(prev => ({
            ...prev,
            [savedEntry.id]: savedEntry
        }));
        return savedEntry;
    };

    const deleteEntry = (id) => {
        StorageService.deleteEntry(id);
        setEntries(prev => {
            const newEntries = { ...prev };
            delete newEntries[id];
            return newEntries;
        });
    };

    const saveTag = (tag) => {
        const savedTag = StorageService.saveTag(tag);
        setTags(prev => ({
            ...prev,
            [savedTag.id]: savedTag
        }));
    };

    const deleteTag = (id) => {
        StorageService.deleteTag(id);

        // Remove this tag from all entries that have it
        const updatedEntries = { ...entries };
        let hasChanges = false;

        Object.values(updatedEntries).forEach(entry => {
            if (entry.tags && entry.tags.includes(id)) {
                const newTags = entry.tags.filter(tagId => tagId !== id);
                const updatedEntry = { ...entry, tags: newTags };
                updatedEntries[entry.id] = updatedEntry;
                StorageService.saveEntry(updatedEntry); // Save updated entry to storage
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setEntries(updatedEntries);
        }

        setTags(prev => {
            const newTags = { ...prev };
            delete newTags[id];
            return newTags;
        });
    };



    const togglePin = (id) => {
        const entry = entries[id];
        if (entry) {
            const updatedEntry = { ...entry, isPinned: !entry.isPinned };
            saveEntry(updatedEntry);
        }
    };

    const searchEntries = ({ query = '', tagIds = [], startDate = null, endDate = null }) => {
        let filteredEntries = Object.values(entries);

        // 1. Filter by Tags (Strict)
        if (tagIds.length > 0) {
            filteredEntries = filteredEntries.filter(entry => {
                const entryTags = entry.tags || [];
                return tagIds.every(tagId => entryTags.includes(tagId));
            });
        }

        // 2. Filter by Date (Strict)
        if (startDate || endDate) {
            filteredEntries = filteredEntries.filter(entry => {
                const entryDate = new Date(entry.date);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (entryDate < start) return false;
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (entryDate > end) return false;
                }

                return true;
            });
        }

        // 3. Fuzzy Search (if query exists)
        if (query.trim()) {
            const fuse = new Fuse(filteredEntries, {
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'content', weight: 0.3 }
                ],
                threshold: 0.4,
                includeScore: true
            });

            const results = fuse.search(query.trim());
            return results.map(result => result.item);
        }

        // 4. Default Sort (Date Descending) if no query
        return filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    };


    return (
        <DiaryContext.Provider value={{
            entries,
            tags,
            saveEntry,
            deleteEntry,
            saveTag,
            saveTag,
            deleteTag,
            togglePin,
            searchEntries
        }}>
            {children}
        </DiaryContext.Provider>
    );
};
