/**
 * Классы-помощники шаблонов историй — те же, что в build/storybook/preview.scss. «Show code» добавляет
 * их правила в `<style scoped>`, чтобы скопированный пример выглядел как превью и без стилей Storybook.
 */
export const STORY_STYLES: Readonly<Record<string, string>> = {
	'story-row': 'display: flex; flex-wrap: wrap; align-items: center; gap: 12px;',
	'story-col': 'display: flex; flex-direction: column; align-items: flex-start; gap: 12px;',
	'story-stack': 'display: flex; flex-direction: column; gap: 16px; width: 100%;',
	'story-grid': 'display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--story-grid-min, 220px), 1fr)); gap: 16px;',
	'story-label': 'min-width: 88px; font-size: 12px; line-height: 16px; color: var(--rise-text-muted);',
	'story-narrow': 'width: 100%; max-width: 360px;',
	'story-medium': 'width: 100%; max-width: 560px;',
	'story-frame': 'position: relative; padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px;',
	'story-map-elevated': 'outline: 4px solid var(--rise-primary-soft); box-shadow: var(--rise-shadow-lg);',
	'story-map-striped': 'background: repeating-linear-gradient(45deg, transparent 0 8px, var(--rise-border-muted) 8px 9px);',
}
