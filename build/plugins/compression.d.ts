/**
 * Сжатие ассетов: Brotli (приоритет) + Gzip (фолбэк).
 */
import type { PluginOption } from 'vite';
/** Создаёт плагин сжатия (Brotli + Gzip) */
export declare function createCompressionPlugins(): PluginOption[];
