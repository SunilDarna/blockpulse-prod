import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './store';
import config from './config';
import { Amplify } from 'aws-amplify';

// Configure Amplify
Amplify.configure({
  Auth: {
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
        custom_header: async () => {
          return { 'Content-Type': 'application/json' };
        }
      },
      {
        name: 'communityApi',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
        custom_header: async () => {
          return { 'Content-Type': 'application/json' };
        }
      }
    ]
  }
});

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent the browser from showing the default error dialog
  event.preventDefault();
  
  // You could report to a monitoring service here
  if (event.error && event.error.message && 
      event.error.message.includes("Cannot read properties of undefined (reading 'main')")) {
    console.warn('Theme-related error intercepted');
  }
  
  return true;
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could report to a monitoring service here
});

// Define a global default theme as a fallback
window.defaultTheme = {
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' }
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
