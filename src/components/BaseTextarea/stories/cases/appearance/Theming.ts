import { expect } from 'storybook/test'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextarea from '../../../ui/BaseTextarea.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { field: 'story-themed-field', counter: 'story-themed-counter' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseTextarea v-bind="args" v-model="plain" label="По умолчанию" placeholder="Введите текст" />
		<div style="--rise-textarea-bg: var(--rise-bg-muted); --rise-textarea-border: var(--rise-primary-border); --rise-textarea-border-focus: var(--rise-success); --rise-textarea-radius: 16px; --rise-textarea-padding-x: 16px;">
			<BaseTextarea v-bind="args" v-model="themed" label="Токены на контейнере" placeholder="Введите текст" />
		</div>
		<BaseTextarea v-bind="args" v-model="classed" label="Классы через ui" placeholder="Введите текст" :maxlength="200" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-textarea-*` (фон, текст, рамка, рамка в фокусе, радиус, отступы, цвет счётчика) кит',
					'только читает: задайте их на `:root`, в теме или на контейнере. Без них поле берёт общие токены полей `--rise-input-*`',
					'(рамка, фон, радиус), затем семантику. Проп `ui` добавляет классы к частям (`root`, `field`, `label`, `counter`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTextarea'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const plain = canvas.getByRole('textbox', { name: 'По умолчанию' })
		const themed = canvas.getByRole('textbox', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('textbox', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(themed).paddingInlineStart).toBe('16px')
		await userEvent.click(themed)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-textarea__field', 'story-themed-field')
		await expect(canvasElement.querySelector('.base-textarea__counter')).toHaveClass('story-themed-counter')
	},
}
