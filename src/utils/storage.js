import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

export const StorageService = {
    // Entries
    getEntries: async () => {
        const entriesArray = await db.entries.toArray();
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
        await db.transaction('rw', db.entries, db.images, async () => {
            await db.entries.delete(id);
            // Delete associated images
            const images = await db.images.where('entryId').equals(id).toArray();
            const imageIds = images.map(img => img.id);
            if (imageIds.length > 0) {
                await db.images.bulkDelete(imageIds);
            }
        });
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

    // Images
    getImagesByEntryId: async (entryId) => {
        return await db.images.where('entryId').equals(entryId).toArray();
    },

    saveImage: async (image) => {
        const id = image.id || uuidv4();
        const newImage = {
            ...image,
            id,
            createdAt: new Date().toISOString()
        };
        await db.images.put(newImage);
        return newImage;
    },

    deleteImage: async (id) => {
        await db.images.delete(id);
    },

    // Helper to get all data
    getData: async () => {
        const [entries, tags, templates] = await Promise.all([
            StorageService.getEntries(),
            StorageService.getTags(),
            StorageService.getTemplates()
        ]);
        return { entries, tags, templates };
    }
};
