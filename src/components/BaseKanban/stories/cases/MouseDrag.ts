import { ref } from 'vue'
import { CARDS } from '../shared'
import type meta from '../BaseKanban.stories'
import BaseKanban from '../../ui/BaseKanban.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

const pointer = (type: string, x: number, y: number) =>
	new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse' })

export const MouseDrag: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Перетаскивание мышью: соседние карточки плавно расступаются, копия под курсором при отпускании долетает до места; Escape отменяет.',
			},
		},
	},
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: ref([...CARDS]) }),
		template: '<BaseKanban v-bind="props" v-model:cards="cards" />',
	}),
	play: async ({ canvas, canvasElement, args }) => {
		const card = canvas.getByRole('button', { name: 'Экспорт таблицы в CSV' })
		const from = card.getBoundingClientRect()
		const done = (canvasElement.querySelector('[data-column-id="done"]') as HTMLElement).getBoundingClientRect()
		card.dispatchEvent(pointer('pointerdown', from.left + 20, from.top + 10))
		window.dispatchEvent(pointer('pointermove', from.left + 40, from.top + 30))
		const ghost = () => canvasElement.ownerDocument.querySelector('.base-kanban__ghost')
		await waitFor(() => expect(ghost()).not.toBeNull())
		window.dispatchEvent(pointer('pointermove', done.left + 40, done.top + 60))
		window.dispatchEvent(pointer('pointerup', done.left + 40, done.top + 60))
		await waitFor(() => expect(canvas.getByRole('list', { name: /^Готово/ })).toHaveTextContent('Экспорт таблицы в CSV'))
		await expect(args.onMove).toHaveBeenCalledWith(expect.objectContaining({ to: { columnId: 'done', index: 0 } }))
		await waitFor(() => expect(ghost()).toBeNull())
	},
}
