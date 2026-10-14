import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { layout: 'layout' }

const template = `
	<BaseDashboardGrid v-bind="args" v-model:layout="layout">
		<template #item="{ item, isDragging }">
			<strong>{{ item.label }}</strong>
			<p>{{ isDragging ? 'Переносится' : item.w + ' × ' + item.h }}</p>
		</template>
	</BaseDashboardGrid>
`

export const Editable: StoryObj<typeof meta> = {
	args: { isEditable: true },
	parameters: {
		controls: { include: ['isEditable', 'compactType', 'rowHeight', 'gap', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Режим редактирования: тяните виджет за карточку (касанием — за полосу-ручку над содержимым), размер меняйте за уголок.',
					'На месте виджета виден «призрак» клетки, остальные виджеты расступаются и уплотняются вверх. Итог приходит в `update:layout` и `change`.',
					'Кнопки, ссылки и поля внутри виджета не начинают перенос. Ручка занимает отдельную полосу и не перекрывает содержимое карточки.',
					'У края окна или прокручиваемого предка перенос сам прокручивает область (см. историю «AutoScroll»).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], models }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const widget = canvas.getByRole('group', { name: 'Выручка' })
		await tabTo(widget, userEvent)
		await expect(widget).toHaveAccessibleDescription(/Enter или пробел — взять виджет/)
		await expect(widget.querySelector('[data-handle]')).not.toBeNull()
		await expect(widget.querySelector('[data-resize]')).not.toBeNull()
	},
}
