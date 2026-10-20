import { flowNode } from '../../shared'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { editArgs, isNarrowMap, expectEditCompact, editModels, editNotices, editTemplate, expectStatus } from './editShared'

const top = (node: HTMLElement): number => node.getBoundingClientRect().top

const gaps = (canvas: Parameters<typeof flowNode>[0], names: string[]): number[] => {
	const rects = names.map(name => flowNode(canvas, name).getBoundingClientRect()).sort((a, b) => a.left - b.left)
	return [rects[1].left - rects[0].right, rects[2].left - rects[1].right]
}

export const EditMultiSelect: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Несколько узлов (мокап FlowEditor): выделение с `Shift` (или `Ctrl`) щелчком, рамкой по пустому месту или `Ctrl+A`. Панель свойств переходит в «Общие свойства» с числом выбранных и тремя действиями.',
					'**Выровнять по верху** ставит верхние края на одну линию; **Распределить** (от трёх узлов) выравнивает промежутки по горизонтали; **В группу** собирает выделенное в новую группу. Каждое действие — один шаг истории: `Ctrl+Z` вернёт всё сразу.',
					'На панели инструментов есть и остальные выравнивания: по левому краю, по центру, по нижнему краю.',
				].join('\n'),
			},
			source: storySource({ template: editTemplate, imports: ['BaseFlowMap'], models: editModels }),
		},
	},
	args: { ...editArgs, data: MAIN_MAP },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: editModels }),
		template: editTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (isNarrowMap(canvasElement)) return expectEditCompact({ canvas, canvasElement, userEvent })
		const names = ['Orders', 'Inventory', 'Payments']
		await userEvent.click(flowNode(canvas, names[0]))
		await userEvent.keyboard('{Shift>}')
		for (const name of names.slice(1)) await userEvent.click(flowNode(canvas, name))
		await userEvent.keyboard('{/Shift}')
		await expectStatus(canvas, 'Выделено: 3')
		const inspector = await canvas.findByRole('region', { name: 'Свойства и хуки' })
		await expect(within(inspector).getByText('Общие свойства')).toBeVisible()
		await expect(within(inspector).getByText('Выбрано элементов: 3')).toBeVisible()
		await expect(Math.abs(gaps(canvas, names)[0] - gaps(canvas, names)[1])).toBeGreaterThan(5)
		await userEvent.click(within(inspector).getByRole('button', { name: 'Выровнять по верху' }))
		await waitFor(() => {
			const tops = names.map(name => top(flowNode(canvas, name)))
			expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1)
		})
		await userEvent.click(within(inspector).getByRole('button', { name: 'Распределить' }))
		await waitFor(() => expect(Math.abs(gaps(canvas, names)[0] - gaps(canvas, names)[1])).toBeLessThan(1))
		await userEvent.click(within(inspector).getByRole('button', { name: 'В группу' }))
		await waitFor(() => expect(canvas.getAllByText('Новая группа').length).toBeGreaterThan(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Отменить, Ctrl+Z' }))
		await waitFor(() => expect(canvas.queryByText('Новая группа')).toBeNull())
		await expect(editNotices(canvas)).toHaveTextContent(/Отменено: Объединение в группу/)
	},
}
