import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, style }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInternalChange = useRef(false);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            quillRef.current.on('text-change', (_delta, _oldDelta, source) => {
                if (source === 'user' && quillRef.current) {
                    isInternalChange.current = true;
                    onChange(quillRef.current.root.innerHTML);
                    // Reset internal change flag after a short delay or immediately?
                    // Actually, we just mark it so the prop update knows it's us.
                    // But prop update happens asynchronously.
                    // A simple flag might not be enough if prop update is slow.
                    // But for simple cases, checking value difference is usually enough.
                    setTimeout(() => { isInternalChange.current = false; }, 0);
                }
            });

            // Set initial value
            if (value) {
                quillRef.current.root.innerHTML = value;
            }
        }
    }, []);

    useEffect(() => {
        if (quillRef.current && !isInternalChange.current) {
            const currentContent = quillRef.current.root.innerHTML;
            if (value !== currentContent) {
                // Try to preserve selection if possible, but hard with full replacement
                // For now, just replace.
                const range = quillRef.current.getSelection();
                quillRef.current.root.innerHTML = value;
                if (range) {
                    quillRef.current.setSelection(range);
                }
            }
        }
    }, [value]);

    return <div ref={editorRef} style={style} />;
}

export default RichTextEditor;
