/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other VITE_ variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}