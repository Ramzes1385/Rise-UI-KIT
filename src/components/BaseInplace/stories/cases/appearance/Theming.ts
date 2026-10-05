import { expect } from 'storybook/test'
import type meta from '../../BaseInplace.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInplace from '../../../ui/BaseInplace.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-inplace', display: 'story-themed-display' }

const state = { plain: 'По умолчанию', themed: 'Токены на контейнере', classed: 'Классы через ui' }

const OMIT = ['modelValue', 'onUpdate:modelValue']

const template = `
	<div class="story-col">
		<BaseInplace v-bind="args" v-model="plain" />
		<div style="--rise-inplace-display-bg: var(--rise-primary-soft); --rise-inplace-display-radius: var(--rise-radius-md); --rise-inplace-display-padding-x: 8px; --rise-inplace-field-width: 240px;">
			<BaseInplace v-bind="args" v-model="themed" />
		</div>
		<BaseInplace v-bind="args" v-model="classed" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-inplace-*` (отступы, радиус, фон, фон при наведении и цвет текста кнопки',
					'просмотра, ширина поля правки) кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `display`, `field`);',
					'глобально — `defaults.BaseInplace.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseInplace'], state, script: `const ui = ${literal(ui)}`, omit: OMIT }),
		},
	},
	render: args => ({
		components: { BaseInplace },
		setup: useStorySetup(args, { state, data: { ui }, slots: OMIT }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-inplace__display')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).paddingLeft).toBe('8px')
		await expect(getComputedStyle(plain).paddingLeft).toBe('4px')
		await expect(classed.closest('.base-inplace')).toHaveClass('story-themed-inplace')
		await expect(classed).toHaveClass('base-inplace__display', 'story-themed-display')
	},
}
