import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uk from './i18n/uk.json';
import en from './i18n/en.json';

i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: "uk",
  fallbackLng: "uk"
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);