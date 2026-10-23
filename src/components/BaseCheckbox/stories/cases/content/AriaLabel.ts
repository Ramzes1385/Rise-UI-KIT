import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { selected: { 1042: false, 1043: true } as Record<number, boolean> }

const types = { selected: 'Record<number, boolean>' }

const omit = ['label', 'modelValue', 'onUpdate:modelValue']

const template = `
	<div class="story-stack story-narrow">
		<div v-for="order in [1042, 1043]" :key="order" style="display: flex; gap: 12px; align-items: center;">
			<BaseCheckbox v-bind="args" v-model="selected[order]" :aria-label="\`Выбрать заказ №\${order}\`" :input-attrs="{ name: 'orders', value: order }" />
			<span aria-hidden="true">Заказ №{{ order }}</span>
		</div>
	</div>
`

export const AriaLabel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Флажок без видимой подписи (строка таблицы, карточка) называется пропсом `ariaLabel`, атрибуты нативного',
					'`<input>` — `name`, `value`, `data-*` — передаются в `inputAttrs`. Скрытая подпись через `customClass` больше не нужна.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCheckbox'], state, types, omit }),
		},
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, slots: omit }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('checkbox', { name: 'Выбрать заказ №1042' })
		await expect(first).toHaveAttribute('name', 'orders')
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать заказ №1043' })).toBeChecked()
		first.focus()
		await userEvent.keyboard(' ')
		await expect(first).toBeChecked()
	},
}
