import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { layer: 'layer', active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" v-model:active="active" />
	</div>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выбор объектов в 3D. Мышью: наведение подсвечивает объект и показывает карточку у него (у верхнего края — под объектом), щелчок выбирает (после перетаскивания камеры больше 4 px — нет); касание — то же, что щелчок. Метки `point` — поверх сцены.',
					'Клавиатурой — одна точка Tab на всю область: стрелки — к соседнему объекту в эту сторону экрана, Home и End — первый и последний, Enter или Space — открыть, Escape — снять, PageUp и PageDown — этаж выше и ниже. Объект и этаж объявляет `aria-live`; Shift со стрелками по-прежнему вращают камеру. Для скринридера основной путь — список объектов (`hasDirectory`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string', active: 'string | null' },
			}),
		},
	},
	args: { layer: 'floor-1', active: 'f1-info' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const region = canvas.getByRole('group', { name: 'Этаж 1' })
		await tabTo(region, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const live = region.querySelector('[aria-live="polite"]') as HTMLElement
		await waitFor(() => expect(live).toHaveTextContent('Справочная, Этаж 1'))
		await userEvent.keyboard('{Enter}')
		const dialog = await within(document.body).findByRole('dialog', { name: 'Справочная' })
		await expect(dialog).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(region).toHaveFocus())
		await userEvent.keyboard('{PageUp}')
		await waitFor(() => expect(canvas.getByRole('radio', { name: '2' })).toBeChecked())
		await waitFor(() => expect(live).toHaveTextContent('Показан этаж: Этаж 2'))
	},
}
