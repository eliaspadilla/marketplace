import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

const lastCommitDate = execSync('git log -1 --format=%cd --date=format:%d/%m/%Y')
  .toString()
  .trim();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    __LAST_COMMIT_DATE__: JSON.stringify(lastCommitDate),
  },
});
