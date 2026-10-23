import '@testing-library/jest-dom/vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { fired, mountMap, stubFrame } from '../fixtures/flow2Ui'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => stubFrame(1000))

afterEach(() => vi.restoreAllMocks())

const blockOf = (container: Element): Element | null => container.querySelector('[data-flow-id="g1"]')

async function focusBlock() {
	const view = mountMap()
	const region = screen.getByRole('graphics-document')
	await fireEvent.keyDown(region, { key: 'Ш' })
	await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'g1'))
	return { view, region }
}

describe('блок свёрнутой группы: клавиатура и roving tabindex', () => {
	it('сфокусированный блок получает tabindex=0, остальные узлы — -1', async () => {
		const { view } = await focusBlock()
		expect(blockOf(view.container)).toHaveAttribute('tabindex', '0')
		const others = [...view.container.querySelectorAll('[data-flow-entity="node"][data-flow-id]')].filter(
			item => item.getAttribute('data-flow-id') !== 'g1',
		)
		expect(others.length).toBeGreaterThan(0)
		for (const item of others) expect(item).toHaveAttribute('tabindex', '-1')
	})

	it('без фокуса tabindex=0 у первого узла', () => {
		const view = mountMap()
		const zero = view.container.querySelectorAll('[data-flow-entity="node"][tabindex="0"]')
		expect(zero).toHaveLength(1)
		expect(zero[0]).toHaveAttribute('data-flow-id', 'd')
	})

	it('Enter на блоке входит в группу и шлёт node-click', async () => {
		const { view, region } = await focusBlock()
		expect(view.controllerOf().getCollapsed()).toContain('g1')
		await fireEvent.keyDown(region, { key: 'Enter' })
		await vi.waitFor(() => expect(view.controllerOf().getCollapsed()).not.toContain('g1'))
		const clicks = fired(view, 'node-click')
		expect(clicks).toHaveLength(1)
		expect(clicks[0][0]).toMatchObject({ target: { entity: 'node', id: 'g1' } })
		expect(await screen.findByLabelText(/Alpha/, { selector: '[data-flow-entity="node"]' })).toBeInTheDocument()
	})

	it('Enter на обычном узле только выбирает его и группу не трогает', async () => {
		const view = mountMap()
		const region = screen.getByRole('graphics-document')
		await fireEvent.keyDown(region, { key: 'Home' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'd'))
		const collapsed = view.controllerOf().getCollapsed()
		await fireEvent.keyDown(region, { key: 'Enter' })
		expect(view.controllerOf().getSelection()).toEqual(['d'])
		expect(view.controllerOf().getCollapsed()).toEqual(collapsed)
	})
})
