import { expect } from 'storybook/test'
import type meta from '../BaseMarkdown.stories'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const source = ['### Заметка', '', 'Текст со [ссылкой](https://example.com) и `кодом`.', '', '> Цитата из отчёта'].join('\n')

const ui = { root: 'story-themed-markdown', link: 'story-themed-link' }

const template = `
	<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">
		<BaseMarkdown v-bind="args" :source="source" />
		<div style="--rise-markdown-link-text: var(--rise-success); --rise-markdown-heading-text: var(--rise-primary); --rise-markdown-code-bg: var(--rise-bg-accented); --rise-markdown-quote-border: var(--rise-warning); --rise-markdown-radius: var(--rise-radius-xl); --rise-markdown-padding-x: 24px;">
			<BaseMarkdown v-bind="args" :source="source" />
		</div>
		<BaseMarkdown v-bind="args" :source="source" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { variant: 'outline' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-markdown-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `text`, `font-size`, `radius`, `padding-x`, `padding-y` (у `soft` и `outline`,',
					'умножаются на плотность `--rise-density`), `heading-text`, `link-text`, `code-bg`, `code-block-bg`, `quote-border`,',
					'`quote-text`, `table-border`. Проп `ui` добавляет классы к частям (`heading`, `paragraph`, `link`, `code`, `code-block`, `pre`,',
					'`quote`, `list`, `item`, `table`… — список в `MARKDOWN_PARTS`); глобально — `defaults.BaseMarkdown.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMarkdown'],
				script: `const source = ${literal(source)}\nconst ui = ${literal(ui)}`,
				omit: ['source'],
			}),
		},
	},
	render: args => ({
		components: { BaseMarkdown },
		setup: useStorySetup(args, { data: { source, ui }, slots: ['source'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-markdown')]
		const part = (root: HTMLElement, name: string) => getComputedStyle(root.querySelector(`.base-markdown__${name}`)!)

		await expect(part(themed, 'link').color).not.toBe(part(plain, 'link').color)
		await expect(part(themed, 'heading').color).not.toBe(part(plain, 'heading').color)
		await expect(part(themed, 'code').backgroundColor).not.toBe(part(plain, 'code').backgroundColor)
		await expect(part(themed, 'quote').borderLeftColor).not.toBe(part(plain, 'quote').borderLeftColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		await expect(getComputedStyle(themed).paddingLeft).toBe('24px')
		await expect(getComputedStyle(plain).paddingLeft).toBe('16px')
		await expect(classed).toHaveClass('base-markdown', 'story-themed-markdown')
		await expect(classed.querySelector('.base-markdown__link')).toHaveClass('story-themed-link')
	},
}
