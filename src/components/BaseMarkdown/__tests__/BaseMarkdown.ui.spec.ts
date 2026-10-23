import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseMarkdown from '../ui/BaseMarkdown.vue'
import { MARKDOWN_PARTS } from '../types/BaseMarkdown.types'

const SOURCE = [
	'# Заголовок',
	'',
	'Текст со [ссылкой](https://example.com), `кодом` и ![картинкой](pic.png).',
	'',
	'> Цитата',
	'',
	'- [x] Готово',
	'- Пункт',
	'',
	'---',
	'',
	'| A | B |',
	'|---|---|',
	'| 1 | 2 |',
	'',
	'```ts',
	'const a = 1',
	'```',
].join('\n')

function renderMarkdown(props: Record<string, unknown>, plugins: unknown[] = []) {
	const { container } = render(BaseMarkdown, { props: { source: SOURCE, ...props }, global: { plugins } as never })
	return container.querySelector('.base-markdown')!
}

describe('BaseMarkdown: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const root = renderMarkdown({})

		expect(root).toHaveAttribute('class', 'base-markdown')
		for (const part of ['heading', 'paragraph', 'quote', 'rule', 'table-wrap', 'table', 'image', 'link', 'code', 'code-lang', 'pre']) {
			const expected = part === 'link' ? 'base-link base-markdown__link' : `base-markdown__${part}`
			expect(root.querySelector(`.base-markdown__${part}`)).toHaveAttribute('class', expected)
		}
		expect(root.querySelector('.base-markdown__token')!.className).toMatch(/^base-markdown__token base-markdown__token--/)
	})

	it('классы каждой части добавляются к классам кита, модификаторы сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...MARKDOWN_PARTS.map(part => [part, `u-${part}`])])
		const root = renderMarkdown({ ui, isStreaming: true, variant: 'soft', customClass: 'own-root' })

		expect(root).toHaveClass('base-markdown', 'u-root', 'base-markdown--soft', 'own-root', 'base-markdown--streaming')
		for (const part of MARKDOWN_PARTS) {
			if (part === 'caret') continue
			expect(root.querySelector(`.base-markdown__${part}`)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-markdown__item--task')).toHaveClass('u-item')
		expect(root.querySelector('.base-markdown__check--done')).toHaveClass('u-check')
		expect(root.querySelector('.base-markdown__token')).toHaveClass('u-token')
	})

	it('курсор потока получает класс и в тексте, и в незакрытом блоке кода', () => {
		const inText = renderMarkdown({ source: 'Печатает', isStreaming: true, ui: { caret: 'u-caret' } })
		expect(inText.querySelector('.base-markdown__caret')).toHaveClass('u-caret')

		const inCode = renderMarkdown({ source: '```js\nlet a', isStreaming: true, ui: { caret: 'u-caret' } })
		expect(inCode.querySelector('.base-markdown__pre .base-markdown__caret')).toHaveClass('u-caret')
	})

	it('классы из defaults.BaseMarkdown.ui плагина склеиваются с классами экземпляра', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseMarkdown: { ui: { root: 'app-root', link: 'app-link' } } } })
		const root = renderMarkdown({ ui: { link: 'own-link' } }, [plugin])

		expect(root).toHaveClass('app-root')
		expect(root.querySelector('.base-markdown__link')).toHaveAttribute('class', 'base-link base-markdown__link app-link own-link')
	})
})
