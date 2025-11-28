import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'diary_app_data';

const INITIAL_DATA = {
    entries: {}, // Keyed by UUID
    tags: {}     // Keyed by ID
};

export const StorageService = {
    getData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return INITIAL_DATA;

        const parsed = JSON.parse(data);

        // Simple migration check: if entries are keyed by date (simple check if key looks like date)
        // This is a basic heuristic.
        const keys = Object.keys(parsed.entries);
        if (keys.length > 0 && keys[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.log("Migrating data to new format...");
            const newEntries = {};
            keys.forEach(date => {
                const oldEntry = parsed.entries[date];
                const id = oldEntry.id || uuidv4();
                newEntries[id] = {
                    ...oldEntry,
                    id,
                    date // Ensure date is preserved
                };
            });
            parsed.entries = newEntries;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }

        return parsed;
    },

    saveData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    // Entries
    getEntries: () => {
        return StorageService.getData().entries;
    },

    getEntryById: (id) => {
        const entries = StorageService.getEntries();
        return entries[id] || null;
    },

    getEntriesByDate: (date) => {
        const entries = StorageService.getEntries();
        return Object.values(entries).filter(entry => entry.date === date);
    },

    saveEntry: (entryData) => {
        const data = StorageService.getData();
        const id = entryData.id || uuidv4();

        const entry = {
            ...entryData,
            id,
            updatedAt: new Date().toISOString()
        };

        data.entries[id] = entry;
        StorageService.saveData(data);
        return entry;
    },

    deleteEntry: (id) => {
        const data = StorageService.getData();
        delete data.entries[id];
        StorageService.saveData(data);
    },

    // Tags
    getTags: () => {
        return StorageService.getData().tags;
    },

    saveTag: (tag) => {
        const data = StorageService.getData();
        const id = tag.id || uuidv4();

        data.tags[id] = {
            ...tag,
            id,
            color: tag.color || '#6B7280' // Default gray color
        };

        StorageService.saveData(data);
        return data.tags[id];
    },

    deleteTag: (id) => {
        const data = StorageService.getData();
        delete data.tags[id];
        StorageService.saveData(data);
    }
};
