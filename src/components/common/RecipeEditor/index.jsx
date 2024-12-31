// src/components/RecipeEditor.jsx
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
    <div className="prose max-w-none">
      <ReactQuill
        theme="snow"
        value={editorContent}
        onChange={(content) => {
          setEditorContent(content);
          onChange(content);
        }}
        modules={modules}
        formats={formats}
        className="bg-white rounded-lg transition-all duration-200 hover:shadow-soft
          [&_.ql-toolbar]:border-sage-200 [&_.ql-toolbar]:rounded-t-lg 
          [&_.ql-container]:border-sage-200 [&_.ql-container]:rounded-b-lg
          [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:prose
          [&_.ql-editor_h1]:text-sage-900 [&_.ql-editor_h1]:text-2xl
          [&_.ql-editor_h2]:text-sage-900 [&_.ql-editor_h2]:text-xl
          [&_.ql-editor_p]:text-sage-700 
          [&_.ql-editor_a]:text-earth-600 [&_.ql-editor_a:hover]:text-earth-700
          [&_.ql-snow.ql-toolbar_button:hover]:text-earth-600
          [&_.ql-snow.ql-toolbar_button.ql-active]:text-earth-600"
      />
      <style jsx global>{`
        .ql-snow.ql-toolbar {
          border-color: rgb(var(--sage-200));
          background-color: rgb(var(--sage-50));
        }
        .ql-container.ql-snow {
          border-color: rgb(var(--sage-200));
        }
        .ql-toolbar.ql-snow .ql-picker-label {
          color: rgb(var(--sage-700));
        }
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: rgb(var(--sage-600));
        }
        .ql-toolbar.ql-snow .ql-fill {
          fill: rgb(var(--sage-600));
        }
        .ql-toolbar.ql-snow button:hover .ql-stroke,
        .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke {
          stroke: rgb(var(--earth-600));
        }
        .ql-toolbar.ql-snow button:hover .ql-fill,
        .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill {
          fill: rgb(var(--earth-600));
        }
        .ql-toolbar.ql-snow button.ql-active .ql-stroke,
        .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-stroke {
          stroke: rgb(var(--earth-600));
        }
        .ql-toolbar.ql-snow button.ql-active .ql-fill,
        .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-fill {
          fill: rgb(var(--earth-600));
        }
      `}</style>
    </div>
  );
};

export default RecipeEditor;