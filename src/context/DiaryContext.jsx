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

    return (
        <DiaryContext.Provider value={{
            entries,
            tags,
            saveEntry,
            deleteEntry,
            saveTag,
            deleteTag
        }}>
            {children}
        </DiaryContext.Provider>
    );
};
