import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import AppShell from './app/AppShell';
import AuthGate from './AuthGate';
import './styles.css';

Amplify.configure(outputs as any);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>{({user,logout}) => <AppShell user={user} logout={logout}/>}</AuthGate>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(console.warn));
}
