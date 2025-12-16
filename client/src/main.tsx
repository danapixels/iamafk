import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { datadogRum } from '@datadog/browser-rum' ;
import { reactPlugin } from '@datadog/browser-rum-react';

try {
  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'us5.datadoghq.com',
    service: 'dana',
    env: 'prod',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 30,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin({ router: false })],
    trackUserInteractions: true,
    trackLongTasks: true,
    trackResources: true,
  });
  
  console.log('✅ Datadog RUM initialized successfully');
  console.log('Datadog config:', datadogRum.getInitConfiguration());
  
  // testing datadog rum is working
  setTimeout(() => {
    datadogRum.addAction('datadog_test', { initialized: true });
    console.log('✅ Test event sent to Datadog');
  }, 1000);
} catch (error) {
  console.error('❌ Datadog RUM initialization failed:', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
