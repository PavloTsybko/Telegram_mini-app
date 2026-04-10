import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TonConnectProvider } from '@tonconnect/ui-react'
import WebApp from '@twa-dev/sdk'
import './index.css'

// Initialize Telegram WebApp
WebApp.ready();

const manifestUrl = 'https://bmnumbers.space/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectProvider>
  </React.StrictMode>,
)
