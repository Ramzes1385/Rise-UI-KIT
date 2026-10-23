import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { inlineDelta, inlineKey, tabTo } from '@/stories/helpers'

export const ResizableColumns: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ресайз колонок: с `behavior.resizable` (или `isResizable` у колонки) ширину меняют перетаскиванием ручки у правого',
					'края заголовка. Событие `column-resize` получает ключ и новую ширину в px, `columns-change` — копию колонок.',
					'С клавиатуры: Tab до ручки (`role="separator"`, «Ширина колонки: …»), ← и → меняют ширину на 10px, с Shift — на 50px.',
				].join('\n'),
			},
		},
	},
	args: { behavior: { resizable: true } },
	play: async ({ canvas, userEvent, args }) => {
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		const handle = header.querySelector('.base-table__resizer') as HTMLElement
		const start = handle.getBoundingClientRect()
		const x = start.left + start.width / 2
		const y = start.top + start.height / 2
		const widthBefore = header.getBoundingClientRect().width
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: handle, coords: { clientX: x, clientY: y, pageX: x, pageY: y } },
			{ target: handle, coords: { clientX: x + inlineDelta(60), clientY: y, pageX: x + inlineDelta(60), pageY: y } },
			{ keys: '[/MouseLeft]', target: handle },
		])
		await expect(args['onColumn-resize']).toHaveBeenCalledWith('number', expect.any(Number))
		await expect(header.getBoundingClientRect().width).toBeGreaterThan(widthBefore)

		const keyboardHandle = canvas.getByRole('separator', { name: 'Ширина колонки: Заказ' })
		await tabTo(keyboardHandle, userEvent)
		const widthBeforeKey = header.getBoundingClientRect().width
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(Math.round(header.getBoundingClientRect().width)).toBe(Math.round(widthBeforeKey + 10))
		await expect(keyboardHandle).toHaveAttribute('aria-valuenow', String(Math.round(widthBeforeKey + 10)))
	},
}
