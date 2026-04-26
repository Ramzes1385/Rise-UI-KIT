/**
 * Главный конфигурационный файл Vite.
 * Принцип: тонкий файл-делегатор.
 * Вся логика в build/ — здесь только композиция.
 */
import { defineConfig } from 'vite';
import { createBuildConfig } from './build/config/build';
import { createCssConfig } from './build/config/css';
import { createResolveConfig } from './build/config/resolve';
import { createPreviewConfig, createServerConfig } from './build/config/server';
import { createPlugins } from './build/plugins';
export default defineConfig(({ mode }) => ({
    resolve: createResolveConfig(),
    css: createCssConfig(mode),
    server: createServerConfig(),
    preview: createPreviewConfig(),
    plugins: createPlugins(mode),
    build: createBuildConfig(),
}));
