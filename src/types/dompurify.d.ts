declare module 'dompurify' {
    const DOMPurify: {
        sanitize: (html: string, options?: any) => string;
        // Add other methods if needed
    };
    export default DOMPurify;
}
