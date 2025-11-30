import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

export const StorageService = {
    // Entries
    getEntries: async () => {
        const entriesArray = await db.entries.toArray();
        // Convert array back to object keyed by ID to match previous API structure expected by Context
        // or we can refactor Context to work with arrays. 
        // For now, let's keep the return format as object to minimize Context changes, 
        // but it might be better to switch to arrays in Context eventually.
        // Actually, the Context uses an object state: const [entries, setEntries] = useState({});
        // So let's return an object.
        const entriesObj = {};
        entriesArray.forEach(entry => {
            entriesObj[entry.id] = entry;
        });
        return entriesObj;
    },

    getEntryById: async (id) => {
        return await db.entries.get(id);
    },

    getEntriesByDate: async (date) => {
        return await db.entries.where('date').equals(date).toArray();
    },

    saveEntry: async (entryData) => {
        const id = entryData.id || uuidv4();
        const entry = {
            ...entryData,
            id,
            updatedAt: new Date().toISOString()
        };
        await db.entries.put(entry);
        return entry;
    },

    deleteEntry: async (id) => {
        await db.entries.delete(id);
    },

    // Tags
    getTags: async () => {
        const tagsArray = await db.tags.toArray();
        const tagsObj = {};
        tagsArray.forEach(tag => {
            tagsObj[tag.id] = tag;
        });
        return tagsObj;
    },

    saveTag: async (tag) => {
        const id = tag.id || uuidv4();
        const newTag = {
            ...tag,
            id,
            color: tag.color || '#6B7280'
        };
        await db.tags.put(newTag);
        return newTag;
    },

    deleteTag: async (id) => {
        await db.tags.delete(id);
    },

    // Templates
    getTemplates: async () => {
        const templatesArray = await db.templates.toArray();
        const templatesObj = {};
        templatesArray.forEach(template => {
            templatesObj[template.id] = template;
        });
        return templatesObj;
    },

    saveTemplate: async (template) => {
        const id = template.id || uuidv4();
        const newTemplate = {
            ...template,
            id,
            updatedAt: new Date().toISOString()
        };
        await db.templates.put(newTemplate);
        return newTemplate;
    },

    deleteTemplate: async (id) => {
        await db.templates.delete(id);
    },

    // Helper to get all data (for initial load if needed, though we should load separately)
    getData: async () => {
        const [entries, tags, templates] = await Promise.all([
            StorageService.getEntries(),
            StorageService.getTags(),
            StorageService.getTemplates()
        ]);
        return { entries, tags, templates };
    }
};
