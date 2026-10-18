import '@testing-library/jest-dom/vitest'
import { mapData } from '../flowUi'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'

const plugin = (value: Record<string, unknown>) => createUiKitPlugin({ defaults: { BaseFlowMap: value } as never })

describe('BaseFlowMap defaults приложения', () => {
	it('высота и классы частей берутся из defaults.BaseFlowMap', () => {
		const { container } = render(BaseFlowMap, {
			props: { data: mapData() },
			global: { plugins: [plugin({ height: '300px', ui: { header: 'app-header' } })] },
		})
		expect((container.firstElementChild as HTMLElement).style.height).toBe('300px')
		expect(container.querySelector('.base-flow-map__header')).toHaveClass('app-header')
	})

	it('свойства экземпляра важнее defaults', () => {
		const { container } = render(BaseFlowMap, {
			props: { data: mapData(), height: '200px', ui: { header: 'own-header' } },
			global: { plugins: [plugin({ height: '300px', ui: { header: 'app-header' } })] },
		})
		expect((container.firstElementChild as HTMLElement).style.height).toBe('200px')
		expect(container.querySelector('.base-flow-map__header')).toHaveClass('app-header', 'own-header')
	})

	it('режим колеса, пределы масштаба и панели по умолчанию можно переопределить для всего приложения', async () => {
		const { container } = render(BaseFlowMap, {
			props: { data: mapData() },
			global: { plugins: [plugin({ wheelZoom: 'none', panels: ['legend'], maxZoom: 1.2 })] },
		})
		expect(container.querySelector('.base-flow-map__toolbar')).not.toBeInTheDocument()
		const board = container.querySelector('.base-flow-map__viewport') as HTMLElement
		const event = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true })
		board.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('нотации из defaults доступны всем картам приложения', () => {
		const kind = { label: () => 'Своё', render: 'html' as const, shape: { shape: 'rect' as const }, size: { width: 100, height: 40 } }
		const notation = { id: 'app', label: () => 'Приложение', nodeKinds: { thing: kind }, edgeKinds: {}, defaultNodeKind: 'thing' }
		const { getByRole } = render(BaseFlowMap, {
			props: { data: mapData({ notation: 'app', nodes: [{ id: 't', kind: 'thing', label: 'Вещь' }], edges: [] }) },
			global: { plugins: [plugin({ notations: [notation] })] },
		})
		expect(getByRole('graphics-object', { name: /^Вещь, Своё/ })).toBeInTheDocument()
	})

	it('ui.root из defaults и из экземпляра попадает на корень', () => {
		const { container } = render(BaseFlowMap, {
			props: { data: mapData(), ui: { root: 'own-root' } },
			global: { plugins: [plugin({ ui: { root: 'app-root' } })] },
		})
		expect(container.firstElementChild).toHaveClass('base-flow-map', 'app-root', 'own-root')
	})
})
