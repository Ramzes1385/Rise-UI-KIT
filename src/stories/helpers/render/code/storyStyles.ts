/**
 * Классы-помощники шаблонов историй — те же, что в build/storybook/preview.scss. «Show code» добавляет
 * их правила в `<style scoped>`, чтобы скопированный пример выглядел как превью и без стилей Storybook.
 * Значение — тело блока из preview.scss с вложенными правилами (`> * { … }`, `&__part { … }`), пробелы
 * сжаты до одного; тест source.spec сверяет его с preview.scss по балансу скобок.
 */
export const STORY_STYLES: Readonly<Record<string, string>> = {
	'story-row': 'display: flex; flex-wrap: wrap; align-items: center; gap: 12px;',
	'story-col': 'display: flex; flex-direction: column; align-items: flex-start; gap: 12px; > * { max-width: 100%; }',
	'story-stack': 'display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; width: 100%;',
	'story-grid': 'display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--story-grid-min, 220px), 1fr)); gap: 16px;',
	'story-label': 'min-width: 88px; font-size: 12px; line-height: 16px; color: var(--rise-text-muted);',
	'story-narrow': 'box-sizing: border-box; width: 100%; max-width: 360px;',
	'story-medium': 'box-sizing: border-box; width: 100%; max-width: 560px;',
	'story-frame':
		'position: relative; box-sizing: border-box; padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px;',
	'story-stage': 'position: relative;',
	'story-window':
		'position: absolute; inset-block-start: 24px; inset-inline-start: 24px; z-index: var(--rise-z-overlay); background: var(--rise-bg);',
	'story-map-elevated': 'outline: 4px solid var(--rise-primary-soft); box-shadow: var(--rise-shadow-lg);',
	'story-map-striped': 'background: repeating-linear-gradient(45deg, transparent 0 8px, var(--rise-border-muted) 8px 9px);',
	'story-hint': 'margin: 0; font-size: 12px; line-height: 16px; color: var(--rise-text-muted);',
	'story-json-ld':
		'margin: 0; padding: 12px 16px; overflow: auto; max-height: 360px; border: 1px dashed var(--rise-border-accented); border-radius: 8px; color: var(--rise-text-toned); font-family: var(--rise-font-mono); font-size: 12px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere;',
	'story-motion':
		'display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: 100%; &__presets { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--story-motion-min, 240px)), 1fr)); gap: 12px; width: 100%; } &__preset { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; box-sizing: border-box; min-width: 0; padding: 12px; border: 1px dashed var(--rise-border); border-radius: var(--rise-radius-lg); > * { max-width: 100%; } }',
}

/** Индекс скобки `}`, закрывающей блок, который открыт скобкой `{` на месте `open` */
export function closingBrace(text: string, open: number): number {
	let depth = 0
	for (let index = open; index < text.length; index++) {
		if (text[index] === '{') depth++
		if (text[index] === '}' && --depth === 0) return index
	}
	return -1
}

/** Тело блока → свойства верхнего уровня и вложенные правила (селектор и их тело) */
function parseBlock(body: string) {
	const block = { declarations: [] as string[], nested: [] as { selector: string; body: string }[] }
	let start = 0
	for (let index = 0; index < body.length; index++) {
		if (body[index] === ';') {
			block.declarations.push(body.slice(start, index).trim())
			start = index + 1
		} else if (body[index] === '{') {
			const end = closingBrace(body, index)
			block.nested.push({ selector: body.slice(start, index).trim(), body: body.slice(index + 1, end) })
			index = end
			start = end + 1
		}
	}
	return block
}

/** Селектор вложенного правила: `&__part` → `.parent__part`, `> *` → `.parent > *` */
const nestedSelector = (parent: string, selector: string): string =>
	selector.includes('&') ? selector.replaceAll('&', parent) : `${parent} ${selector}`

function cssRules(selector: string, body: string): string[] {
	const { declarations, nested } = parseBlock(body)
	const own = declarations.length ? [`${selector} {\n${declarations.map(rule => `\t${rule};`).join('\n')}\n}`] : []
	return [...own, ...nested.flatMap(rule => cssRules(nestedSelector(selector, rule.selector), rule.body))]
}

/** Правила класса-помощника обычным CSS — вложенные правила SCSS развёрнуты в отдельные блоки */
export const storyStyleRules = (name: string): string[] => cssRules(`.${name}`, STORY_STYLES[name])
