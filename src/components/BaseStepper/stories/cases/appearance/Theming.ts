import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-stepper', indicator: 'story-themed-indicator', label: 'story-themed-label' }

const template = `
	<div class="story-stack">
		<BaseStepper v-bind="args" />
		<div style="--rise-stepper-bg-checked: var(--rise-success); --rise-stepper-text-checked: var(--rise-on-success); --rise-stepper-indicator-radius: var(--rise-radius-xs); --rise-stepper-label-font-weight: var(--rise-font-weight-bold); --rise-stepper-line-bg: var(--rise-border);">
			<BaseStepper v-bind="args" />
		</div>
		<BaseStepper v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['modelValue', 'orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-stepper-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg-checked` и `text-checked` (пройденные шаги, кольцо',
					'текущего и заполнение линии; проп `color` сильнее), `indicator-width` (размер индикатора), `indicator-bg`,',
					'`indicator-text`, `indicator-radius` (индикатор будущего шага и его форма), `line-bg` (дорожка линии), `label-text`,',
					'`label-text-active`, `label-font-size`, `label-font-weight` (заголовок шага), `description-text` (описание).',
					'Проп `ui` добавляет классы к частям `root`, `header`, `items`, `step`, `trigger`, `indicator-wrapper`, `indicator`,',
					'`check`, `content`, `label`, `description`, `line-fill`, `footer`; глобально — `defaults.BaseStepper.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseStepper'],
				script: `const ui = ${literal(ui)}`,
				omit: SLOT_KEYS,
			}),
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { data: { ui }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stepper')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-stepper__${name}`)!
		const style = (root: HTMLElement, name: string) => getComputedStyle(part(root, name))

		await expect(style(themed, 'indicator').backgroundColor).not.toBe(style(plain, 'indicator').backgroundColor)
		await expect(style(themed, 'label').fontWeight).not.toBe(style(plain, 'label').fontWeight)
		await expect(style(themed, 'line-fill').backgroundColor).toBe(style(themed, 'indicator').backgroundColor)
		if (!isStoryBranded()) await expect(style(themed, 'indicator').borderTopLeftRadius).toBe('2px')
		if (!isStoryBranded()) await expect(style(themed, 'label').fontWeight).toBe('700')
		await expect(classed).toHaveClass('base-stepper', 'story-themed-stepper')
		await expect(part(classed, 'indicator')).toHaveClass('story-themed-indicator')
		await expect(part(classed, 'label')).toHaveClass('story-themed-label')
	},
}
