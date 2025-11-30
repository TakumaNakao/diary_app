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
        const loadData = async () => {
            try {
                const data = await StorageService.getTemplates();
                setTemplates(data || {});
            } catch (error) {
                console.error("Failed to load templates:", error);
            }
        };
        loadData();
    }, []);

    const saveTemplate = async (templateData) => {
        try {
            const savedTemplate = await StorageService.saveTemplate(templateData);
            setTemplates(prev => ({
                ...prev,
                [savedTemplate.id]: savedTemplate
            }));
            return savedTemplate;
        } catch (error) {
            console.error("Failed to save template:", error);
            throw error;
        }
    };

    const deleteTemplate = async (id) => {
        try {
            await StorageService.deleteTemplate(id);
            setTemplates(prev => {
                const newTemplates = { ...prev };
                delete newTemplates[id];
                return newTemplates;
            });
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
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
