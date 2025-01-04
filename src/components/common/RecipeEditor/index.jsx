// src/components/common/RecipeEditor/index.jsx
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RecipeEditor = ({ value, onChange }) => {
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    setEditorContent(value || '');
  }, [value]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className="prose w-full">
      <style>{`
        .ql-toolbar {
          background-color: rgb(247, 248, 247);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgb(209, 217, 208) !important;
        }
        
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: rgb(209, 217, 208) !important;
          background-color: white;
          min-height: 200px;
        }

        .ql-toolbar .ql-stroke {
          stroke: rgb(75, 85, 73);
        }

        .ql-toolbar .ql-fill {
          fill: rgb(75, 85, 73);
        }

        .ql-toolbar .ql-picker {
          color: rgb(75, 85, 73);
        }

        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(147, 107, 88);
        }

        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(147, 107, 88);
        }

        .ql-toolbar .ql-picker-label:hover,
        .ql-toolbar .ql-picker-label.ql-active {
          color: rgb(147, 107, 88);
        }

        .ql-toolbar .ql-picker-options {
          background-color: white;
          border-color: rgb(209, 217, 208);
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={editorContent}
        onChange={(content) => {
          setEditorContent(content);
          onChange(content);
        }}
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

export default RecipeEditor;