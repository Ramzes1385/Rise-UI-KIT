/** Стили плеера собираются отдельным `dist/media.css`: эти папки — единственный источник списка и для сборки, и для проверки `scripts/check-css-split.mjs`. */

/** Папки со стилями, которые нужны только входу `./media` (проверяет плагин: в других входах эти стили встречаться не должны) */
export const MEDIA_STYLE_DIRS = ['src/components/BaseMediaPlayer/styles/', 'src/components/BasePresentationPlayer/styles/']

/** Вход пакета `./media` (общий для сборки JS и сборки media.css) */
export const MEDIA_ENTRY_FILE = 'src/components/BaseMediaPlayer/index.ts'
