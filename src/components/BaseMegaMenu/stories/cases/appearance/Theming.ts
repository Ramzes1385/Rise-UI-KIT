import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { SLOT_KEYS, VARIANT_ITEMS } from '../../shared'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const items = VARIANT_ITEMS

const ui = { root: 'story-themed-mega-menu', bar: 'story-themed-bar', trigger: 'story-themed-trigger' }

const template = `
	<div class="story-stack">
		<BaseMegaMenu v-bind="args" :items="items" aria-label="По умолчанию" />
		<div style="--rise-mega-menu-bg: var(--rise-bg-elevated); --rise-mega-menu-border: var(--rise-primary-border); --rise-mega-menu-radius: var(--rise-radius-full); --rise-mega-menu-trigger-text: var(--rise-primary-text); --rise-mega-menu-trigger-font-weight: var(--rise-font-weight-semibold);">
			<BaseMegaMenu v-bind="args" :items="items" aria-label="Токены на контейнере" />
		</div>
		<BaseMegaMenu v-bind="args" :items="items" aria-label="Классы через ui" :ui="ui" />
	</div>
`

const omit = [...SLOT_KEYS, 'items', 'openKey']

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'trigger'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-mega-menu-*` кит только читает: строка — `bg`, `border`, `radius`, `padding-y`,',
					'`padding-x`; раздел — `trigger-text`, `trigger-text-hover` (и у открытого и текущего раздела), `trigger-bg-hover`',
					'(и у открытого), `trigger-font-weight`; панель — `panel-padding`, `panel-radius`; ссылка панели — `link-bg-hover`',
					'(и у раскрытого пункта с вложенным уровнем). Задайте их на `:root`, в теме или на контейнере, как здесь. Список —',
					'docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `bar`, `trigger`, `panel`, `link`… — см.',
					'`MEGA_MENU_PARTS`); глобально — `defaults.BaseMegaMenu.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMegaMenu'],
				script: [`const items = ${literal(items)}`, `const ui = ${literal(ui)}`].join('\n\n'),
				omit,
			}),
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: useStorySetup(args, { data: { items, ui }, slots: omit }),
		template,
	}),
	play: async ({ canvas }) => {
		const part = (name: string, selector: string) => canvas.getByRole('navigation', { name }).querySelector<HTMLElement>(selector)!
		const style = (name: string, selector: string) => getComputedStyle(part(name, selector))
		const plain = 'По умолчанию'
		const themed = 'Токены на контейнере'
		const trigger = '.base-mega-menu__trigger'

		await expect(style(themed, '.base-mega-menu__bar').backgroundColor).not.toBe(style(plain, '.base-mega-menu__bar').backgroundColor)
		await expect(style(themed, trigger).color).not.toBe(style(plain, trigger).color)
		await expect(canvas.getByRole('navigation', { name: 'Классы через ui' })).toHaveClass('base-mega-menu', 'story-themed-mega-menu')
		await expect(part('Классы через ui', '.base-mega-menu__bar')).toHaveClass('story-themed-bar')
		await expect(part('Классы через ui', trigger)).toHaveClass('story-themed-trigger')
		if (!isStoryBranded()) {
			await expect(style(themed, '.base-mega-menu__bar').borderTopLeftRadius).toBe('9999px')
			await expect(style(themed, trigger).fontWeight).toBe('600')
			await expect(style(plain, trigger).fontWeight).toBe('500')
		}
	},
}
