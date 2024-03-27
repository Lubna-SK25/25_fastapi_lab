// src/frontend/FormField.js
import React from 'react';

function FormField({ name, type, label, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      />
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default FormField;
