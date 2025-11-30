import Dexie from 'dexie';

export const db = new Dexie('DiaryDatabase');

db.version(1).stores({
    entries: 'id, date, title, content, isPinned, *tags', // Primary key and indexed props
    tags: 'id, name, color',
    templates: 'id, title, content'
});
