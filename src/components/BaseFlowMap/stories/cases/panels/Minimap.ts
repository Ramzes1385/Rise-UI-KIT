import { isCompact } from '../../scenarioShared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'minimap']" />
`

const viewportOf = (minimap: HTMLElement): SVGRectElement => minimap.querySelector('.base-flow-map__minimap-viewport') as SVGRectElement

const widthOf = (minimap: HTMLElement): number => Number(viewportOf(minimap).getAttribute('width'))

const position = (minimap: HTMLElement): string => `${viewportOf(minimap).getAttribute('x')}:${viewportOf(minimap).getAttribute('y')}`

export const Minimap: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Мини-карта (мокап Main): контур всей карты с рамкой видимой области. Щелчок или перетаскивание по мини-карте переносит вид в эту точку, на клавиатуре стрелки сдвигают вид, `Home` вписывает карту целиком.',
					'Цвет прямоугольников узлов повторяет статус (Payments с задержками отмечен), цвет подложки — цвет дорожки. Фокус на мини-карте виден кольцом; подсказка про клавиши читается скринридером (`aria-describedby`). На узком экране мини-карты нет.',
					'Панель включается пропом `panels` (`minimap`); по умолчанию она включена.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: MAIN_MAP, height: '520px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			await expect(canvas.queryByRole('group', { name: 'Мини-карта' })).toBeNull()
			await expect(canvas.getByRole('button', { name: 'Увеличить' })).toBeVisible()
			return
		}
		const minimap = canvas.getByRole('group', { name: 'Мини-карта' })
		await expect(minimap).toHaveAccessibleDescription('Стрелки сдвигают вид, Home вписывает всё содержимое')
		await waitFor(() => expect(widthOf(minimap)).toBeGreaterThan(0))
		const fitWidth = widthOf(minimap)
		await userEvent.click(canvas.getByRole('button', { name: 'Увеличить' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Увеличить' }))
		await waitFor(() => expect(widthOf(minimap)).toBeLessThan(fitWidth))
		const zoomedWidth = widthOf(minimap)
		const box = minimap.getBoundingClientRect()
		const start = position(minimap)
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: minimap, coords: { clientX: box.left + 12, clientY: box.top + 12 } },
			{ keys: '[/MouseLeft]' },
		])
		await waitFor(() => expect(position(minimap)).not.toBe(start))
		const clicked = position(minimap)
		minimap.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(position(minimap)).not.toBe(clicked))
		const shifted = position(minimap)
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(position(minimap)).not.toBe(shifted))
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(widthOf(minimap)).toBeGreaterThan(zoomedWidth))
	},
}
