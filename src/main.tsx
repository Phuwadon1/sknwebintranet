import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import $ from "jquery";
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

window.$ = $;
window.jQuery = $;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
