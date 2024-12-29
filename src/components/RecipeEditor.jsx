// src/components/RecipeEditor.jsx
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RecipeEditor = ({ value, onChange }) => {
  // Utiliser un état local pour gérer le contenu
  const [editorContent, setEditorContent] = useState('');

  // Synchroniser l'état local avec la valeur externe
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
    ]
  };

  return (
    <ReactQuill
      theme="snow"
      value={editorContent}
      onChange={(content) => {
        setEditorContent(content);
        onChange(content);
      }}
      modules={modules}
      className="h-64 mb-12"
    />
  );
};

export default RecipeEditor;