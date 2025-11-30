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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await StorageService.getData();
                setEntries(data.entries || {});
                setTags(data.tags || {});
            } catch (error) {
                console.error("Failed to load data from storage:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const saveEntry = async (entryData) => {
        try {
            const savedEntry = await StorageService.saveEntry(entryData);
            setEntries(prev => ({
                ...prev,
                [savedEntry.id]: savedEntry
            }));
            return savedEntry;
        } catch (error) {
            console.error("Failed to save entry:", error);
            throw error;
        }
    };

    const deleteEntry = async (id) => {
        try {
            await StorageService.deleteEntry(id);
            setEntries(prev => {
                const newEntries = { ...prev };
                delete newEntries[id];
                return newEntries;
            });
        } catch (error) {
            console.error("Failed to delete entry:", error);
        }
    };

    const saveTag = async (tag) => {
        try {
            const savedTag = await StorageService.saveTag(tag);
            setTags(prev => ({
                ...prev,
                [savedTag.id]: savedTag
            }));
            return savedTag;
        } catch (error) {
            console.error("Failed to save tag:", error);
        }
    };

    const deleteTag = async (id) => {
        try {
            await StorageService.deleteTag(id);

            // Remove this tag from all entries that have it
            // Note: This might be expensive if there are many entries. 
            // In a real app, we might want to handle this in the DB or backend.
            // For now, we'll iterate through local state which mirrors DB.

            const updatedEntries = { ...entries };
            let hasChanges = false;
            const updates = [];

            Object.values(updatedEntries).forEach(entry => {
                if (entry.tags && entry.tags.includes(id)) {
                    const newTags = entry.tags.filter(tagId => tagId !== id);
                    const updatedEntry = { ...entry, tags: newTags };
                    updatedEntries[entry.id] = updatedEntry;
                    updates.push(StorageService.saveEntry(updatedEntry)); // Async save
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                await Promise.all(updates);
                setEntries(updatedEntries);
            }

            setTags(prev => {
                const newTags = { ...prev };
                delete newTags[id];
                return newTags;
            });
        } catch (error) {
            console.error("Failed to delete tag:", error);
        }
    };

    const togglePin = async (id) => {
        const entry = entries[id];
        if (entry) {
            const updatedEntry = { ...entry, isPinned: !entry.isPinned };
            await saveEntry(updatedEntry);
        }
    };

    const searchEntries = ({ query = '', tagIds = [], startDate = null, endDate = null, onlyPinned = false }) => {
        let filteredEntries = Object.values(entries);

        // 0. Filter by Pinned (Strict)
        if (onlyPinned) {
            filteredEntries = filteredEntries.filter(entry => entry.isPinned);
        }

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
            isLoading,
            saveEntry,
            deleteEntry,
            saveTag,
            deleteTag,
            togglePin,
            searchEntries
        }}>
            {children}
        </DiaryContext.Provider>
    );
};
