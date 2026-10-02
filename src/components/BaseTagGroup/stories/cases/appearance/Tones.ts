import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import type { TagGroupItem } from '../../../types/BaseTagGroup.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const statuses: TagGroupItem[] = [
	{ value: 'new', label: 'Новые', tone: 'info' },
	{ value: 'paid', label: 'Оплачены', tone: 'success' },
	{ value: 'waiting', label: 'Ждут оплаты', tone: 'warning' },
	{ value: 'cancelled', label: 'Отменены', tone: 'error' },
]

const models = { selected: 'modelValue' }

const template = `<BaseTagGroup v-bind="args" v-model="selected" :items="statuses" />`

export const Tones: StoryObj<typeof meta> = {
	args: { modelValue: ['paid'], label: 'Статус заказа' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Свой цвет роли у каждой метки — `items[].tone`; выбранные залиты цветом роли и показывают галочку.' },
			source: storySource({
				template,
				imports: ['BaseTagGroup', 'type TagGroupItem'],
				models,
				script: `const statuses: TagGroupItem[] = ${literal(statuses)}`,
				omit: ['items'],
				types: { selected: 'TagGroupModelValue' },
			}),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, data: { statuses }, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const paid = canvas.getByRole('button', { name: 'Оплачены' })
		await expect(paid).toHaveAttribute('aria-pressed', 'true')
		await expect(paid.closest('.base-tag')).toHaveClass('base-tag--tone-success')
	},
}
