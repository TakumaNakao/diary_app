import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'diary_app_data';

const INITIAL_DATA = {
    entries: {}, // Keyed by date (YYYY-MM-DD) or ID? Plan said YYYY-MM-DD. Let's support multiple entries per day? No, usually one per day for diary. Plan said "entries: { 'YYYY-MM-DD': ... }".
    tags: {}     // Keyed by ID
};

export const StorageService = {
    getData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : INITIAL_DATA;
    },

    saveData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    // Entries
    getEntries: () => {
        return StorageService.getData().entries;
    },

    getEntryByDate: (date) => {
        const entries = StorageService.getEntries();
        return entries[date] || null;
    },

    saveEntry: (date, content, tags = []) => {
        const data = StorageService.getData();
        const existingEntry = data.entries[date];

        const entry = {
            id: existingEntry ? existingEntry.id : uuidv4(),
            date,
            content,
            tags,
            updatedAt: new Date().toISOString()
        };

        data.entries[date] = entry;
        StorageService.saveData(data);
        return entry;
    },

    deleteEntry: (date) => {
        const data = StorageService.getData();
        delete data.entries[date];
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
            id
        };

        StorageService.saveData(data);
        return data.tags[id];
    },

    deleteTag: (id) => {
        const data = StorageService.getData();
        delete data.tags[id];
        // Optional: Remove this tag from all entries?
        // For now, let's keep it simple.
        StorageService.saveData(data);
    }
};
