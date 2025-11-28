import { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';

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
        setTags(prev => {
            const newTags = { ...prev };
            delete newTags[id];
            return newTags;
        });
    };

    const searchEntries = ({ query = '', tagIds = [], startDate = null, endDate = null }) => {
        const allEntries = Object.values(entries);

        return allEntries.filter(entry => {
            // Text search (title + content)
            if (query.trim()) {
                const searchText = query.toLowerCase();
                const titleMatch = entry.title?.toLowerCase().includes(searchText);
                const contentMatch = entry.content?.toLowerCase().includes(searchText);

                if (!titleMatch && !contentMatch) {
                    return false;
                }
            }

            // Tag filter
            if (tagIds.length > 0) {
                const entryTags = entry.tags || [];
                const hasAllTags = tagIds.every(tagId => entryTags.includes(tagId));

                if (!hasAllTags) {
                    return false;
                }
            }

            // Date range filter
            if (startDate || endDate) {
                const entryDate = new Date(entry.date);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (entryDate < start) {
                        return false;
                    }
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (entryDate > end) {
                        return false;
                    }
                }
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    };


    return (
        <DiaryContext.Provider value={{
            entries,
            tags,
            saveEntry,
            deleteEntry,
            saveTag,
            deleteTag,
            searchEntries
        }}>
            {children}
        </DiaryContext.Provider>
    );
};
