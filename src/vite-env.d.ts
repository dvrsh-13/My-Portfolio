/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_AUTH_HASH?: string;
  readonly VITE_CMS_PASS_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
