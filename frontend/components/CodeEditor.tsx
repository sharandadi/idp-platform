'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: 'vs-dark' | 'light';
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = 'javascript', theme = 'vs-dark' }) => {
    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-gray-800 bg-[#1e1e1e]">
            <Editor
                height="100%"
                width="100%"
                language={language}
                value={code}
                theme={theme}
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 }
                }}
            />
        </div>
    );
};

export default CodeEditor;