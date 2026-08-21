import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import JayFitTimerSafe from './app/JayFitTimerSafe';
import AuthGate from './AuthGate';
import './styles.css';
import './additions.css';

Amplify.configure(outputs as any);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>{({user,logout}) => <JayFitTimerSafe user={user} logout={logout}/>}</AuthGate>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(console.warn));
}
