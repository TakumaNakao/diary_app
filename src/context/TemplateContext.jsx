import { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';

const TemplateContext = createContext();

export const useTemplates = () => {
    const context = useContext(TemplateContext);
    if (!context) {
        throw new Error('useTemplates must be used within a TemplateProvider');
    }
    return context;
};

export const TemplateProvider = ({ children }) => {
    const [templates, setTemplates] = useState({});

    useEffect(() => {
        // Load initial data
        const data = StorageService.getTemplates();
        setTemplates(data);
    }, []);

    const saveTemplate = (templateData) => {
        const savedTemplate = StorageService.saveTemplate(templateData);
        setTemplates(prev => ({
            ...prev,
            [savedTemplate.id]: savedTemplate
        }));
        return savedTemplate;
    };

    const deleteTemplate = (id) => {
        StorageService.deleteTemplate(id);
        setTemplates(prev => {
            const newTemplates = { ...prev };
            delete newTemplates[id];
            return newTemplates;
        });
    };

    return (
        <TemplateContext.Provider value={{
            templates,
            saveTemplate,
            deleteTemplate
        }}>
            {children}
        </TemplateContext.Provider>
    );
};
