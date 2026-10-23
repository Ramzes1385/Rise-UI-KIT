import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

vi.mock('@components/BaseFlowMap/ui/BaseFlowMap.vue', async () => {
	const { defineComponent, h: render } = await import('vue')
	const NAMES = ['node', 'edge-label', 'group-label', 'tooltip', 'details', 'toolbar', 'level', 'legend', 'scenario-step', 'empty']
	const props = { target: { entity: 'edge', id: 'x' }, controller: { getData: () => ({ nodes: [] }) } }
	return {
		__esModule: true,
		default: defineComponent({
			setup:
				(_props, { slots }) =>
				() =>
					render('div', { class: 'stub-map' }, [...NAMES.map(name => slots[name]?.({})), slots['inspector-end']?.(props)]),
		}),
	}
})

const env = useFlowMap3DEnvironment()

describe('BaseFlowMap3D: слоты передаются во вложенную 2D-карту', () => {
	it('каждый пользовательский слот пробрасывается и отрисовывается', async () => {
		const names = [
			'node',
			'edge-label',
			'group-label',
			'tooltip',
			'details',
			'toolbar',
			'level',
			'legend',
			'scenario-step',
			'inspector-end',
		]
		const slots = Object.fromEntries(names.map(name => [name, () => h('i', { 'data-slot': name })]))
		const { container } = await env.renderMap(
			{ data: { version: 1, title: 'Слоты', nodes: [], edges: [] }, view: '2d' },
			slots as never,
			{ isRenderer: false },
		)
		await waitFor(() => expect(container.querySelectorAll('[data-slot]')).toHaveLength(names.length))
	})
})
