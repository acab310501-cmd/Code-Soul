import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Code-Soul/',  // Обязательно со слэшем в конце!
  plugins: [react()],
})
