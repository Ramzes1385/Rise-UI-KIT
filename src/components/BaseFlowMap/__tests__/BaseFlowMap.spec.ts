import '@testing-library/jest-dom/vitest'
import BaseFlowMap from '../ui/BaseFlowMap.vue'
import { render, screen } from '@testing-library/vue'
import type { FlowMapData } from '../types/data/flowData.types'

const data: FlowMapData = { version: 1, title: 'Заказы', nodes: [], edges: [] }

describe('BaseFlowMap unit', () => {
	it('рендерит область с именем из заголовка данных', () => {
		render(BaseFlowMap, { props: { data } })
		expect(screen.getByRole('region', { name: 'Заказы' })).toBeInTheDocument()
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseFlowMap, { props: { data, sizeScale: 125 } })
		expect((container.querySelector('.base-flow-map') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseFlowMap, { props: { data, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-flow-map')).toHaveClass('my-root')
	})
})
