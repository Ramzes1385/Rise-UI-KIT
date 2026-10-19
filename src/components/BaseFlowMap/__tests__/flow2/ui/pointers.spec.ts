import '@testing-library/jest-dom/vitest'
import { UI_FLOW_MAP } from '@/locales/messages'
import { fired, mountMap, stubFrame } from '../fixtures/flow2Ui'
import { fireEvent, screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => stubFrame(1000))

afterEach(() => vi.restoreAllMocks())

describe('указатель на группах, узлах и в списке при смысловом зуме', () => {
	it('клик и контекстное меню по развёрнутой группе посылают group-click и group-contextmenu', async () => {
		const view = mountMap()
		view.controllerOf().setLevel(2)
		const frame = await screen.findByLabelText('Шлюз', { selector: '[data-flow-entity="group"]' })
		await fireEvent.click(frame)
		await fireEvent.contextMenu(frame)
		expect(fired(view, 'group-click')).toHaveLength(1)
		expect(fired(view, 'group-contextmenu')).toHaveLength(1)
		expect(view.controllerOf().getSelection()).toEqual(['g1'])
	})

	it('контекстное меню, наведение и уход указателя на узле', async () => {
		const view = mountMap()
		const target = screen.getByLabelText(/Delta/, { selector: '[data-flow-entity="node"]' })
		await fireEvent.contextMenu(target)
		await fireEvent.pointerEnter(target)
		await fireEvent.pointerLeave(target)
		expect(fired(view, 'node-contextmenu')).toHaveLength(1)
	})

	it('список для скринридера: кнопки узлов, связей и групп выбирают элемент', async () => {
		const view = mountMap()
		view.controllerOf().setLevel(2)
		const list = await screen.findByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		const buttons = within(list).getAllByRole('button', { hidden: true })
		for (const button of buttons) await fireEvent.click(button)
		expect(fired(view, 'update:selection').length).toBe(buttons.length)
		expect(fired(view, 'edge-click').length).toBeGreaterThan(0)
		expect(fired(view, 'group-click').length).toBeGreaterThan(0)
	})
})
