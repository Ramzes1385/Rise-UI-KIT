import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseImageMapEditor from '../../../ui/BaseImageMapEditor.vue'

const models = { map: 'modelValue' }

const template = `
	<div style="max-width: 375px;">
		<BaseImageMapEditor v-bind="args" v-model="map" />
	</div>
`

export const Narrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Узкая колонка (область редактора уже 760 px, здесь — 375 px): инструменты — только иконки, у каждой есть имя и подсказка;',
					'кнопки файлов — иконки с подсказкой; разделы панели сворачиваются — заголовок это кнопка с `aria-expanded`,',
					'по умолчанию раскрыт «Объекты слоя» (и «Свойства объекта», пока объект выделен). На широкой раскладке вид прежний.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseImageMapEditor', 'type ImageMapData'], models, types: { map: 'ImageMapData' } }),
		},
	},
	render: args => ({
		components: { BaseImageMapEditor },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const objects = canvas.getByRole('button', { name: 'Объекты слоя' })
		await waitFor(() => expect(objects).toHaveAttribute('aria-expanded', 'true'))
		const filters = canvas.getByRole('button', { name: 'Фильтры' })
		await expect(filters).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('button', { name: 'Добавить фильтр' })).not.toBeInTheDocument()

		const tools = canvasElement.querySelector('.base-image-map-editor__tools') as HTMLElement
		await expect(tools.querySelectorAll('.base-segmented__icon')).toHaveLength(5)
		await expect(canvas.getByRole('radio', { name: 'Эллипс' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Импорт JSON' })).toBeVisible()

		await userEvent.click(filters)
		await expect(filters).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('button', { name: 'Добавить фильтр' })).toBeVisible()
		await userEvent.click(filters)
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Добавить фильтр' })).not.toBeInTheDocument())
		await expect(filters).toHaveFocus()

		await userEvent.click(objects)
		await expect(objects).toHaveAttribute('aria-expanded', 'false')
		await expect(canvasElement.querySelector('.base-image-map-editor')!.scrollWidth).toBeLessThanOrEqual(
			canvasElement.querySelector('.base-image-map-editor')!.clientWidth,
		)
	},
}
