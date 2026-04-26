/**
 * Vite-плагин для генерации SVG-спрайта из папки src/assets/svg/.
 * На старте сборки и при изменении SVG-файлов пересоздаёт public/icons.svg.
 */
import type { Plugin } from 'vite';
/** Создаёт плагин генерации SVG-спрайта */
export declare function createSpritePlugin(): Plugin;
