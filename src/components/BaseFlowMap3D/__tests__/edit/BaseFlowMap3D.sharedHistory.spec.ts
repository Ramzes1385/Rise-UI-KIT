import { waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const viewport = (container: Element) => container.querySelector('.base-flow-map-3d__pane .base-flow-map__viewport') as HTMLElement

const press = (target: Element, key: string, mods: KeyboardEventInit = {}) =>
	target.dispatchEvent(
		new KeyboardEvent('keydown', {
			key,
			code: key === 'Delete' ? 'Delete' : `Key${key.toUpperCase()}`,
			bubbles: true,
			cancelable: true,
			...mods,
		}),
	)

const ids = (api: () => { getData: () => { nodes: Array<{ id: string }> } }) =>
	api()
		.getData()
		.nodes.map(node => node.id)

describe('BaseFlowMap3D: общая история правок 2D и 3D', () => {
	it('удаление в 2D отменяется в 3D', async () => {
		const { container, api } = await env.renderMap({ view: '2d', mode: 'edit' })
		await waitFor(() => expect(container.querySelector('.base-flow-map__edit-status')).not.toBeNull(), { timeout: 15000 })
		api().select(['cache'])
		press(viewport(container), 'Delete')
		await waitFor(() => expect(ids(api)).not.toContain('cache'))
		api().setView('3d')
		await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull())
		await api().undo()
		expect(ids(api)).toContain('cache')
	})

	it('добавление в 3D отменяется в 2D', async () => {
		const { container, api } = await env.renderMap({ view: '3d', mode: 'edit' })
		await api().addNode({ id: 'extra', label: 'Новый', kind: 'service' })
		expect(ids(api)).toContain('extra')
		api().setView('2d')
		await waitFor(() => expect(container.querySelector('.base-flow-map__edit-status')).not.toBeNull(), { timeout: 15000 })
		press(viewport(container), 'z', { ctrlKey: true })
		await waitFor(() => expect(ids(api)).not.toContain('extra'))
	})
})
