import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';
import 'katex/dist/katex.min.css';

const EnhancedMarkdown = ({ children, components = {}, images = [] }) => {
    const { theme } = useTheme();
    const syntaxTheme = theme === 'dark' ? vscDarkPlus : oneLight;

    const defaultComponents = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';

            return !inline ? (
                <SyntaxHighlighter
                    style={syntaxTheme}
                    language={language}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        img({ node, src, alt, ...props }) {
            if (src && src.startsWith('diary-image:')) {
                const imageId = src.split(':')[1];
                const image = images.find(img => img.id === imageId);
                if (image) {
                    return <img src={image.url} alt={alt} {...props} />;
                }
                return <span className="image-placeholder" style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>[{alt || 'Image'}]</span>;
            }
            return <img src={src} alt={alt} {...props} />;
        }
    }), [syntaxTheme, images]);

    const combinedComponents = useMemo(() => ({ ...defaultComponents, ...components }), [defaultComponents, components]);

    const urlTransform = useMemo(() => (url) => {
        if (url.startsWith('diary-image:')) return url;
        // Default safe protocols
        if (/^(https?|mailto|tel):/.test(url)) return url;
        // Allow relative paths
        if (!/^[a-z]+:/i.test(url)) return url;
        return url;
    }, []);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={combinedComponents}
            urlTransform={urlTransform}
        >
            {children}
        </ReactMarkdown>
    );
};

export default EnhancedMarkdown;
