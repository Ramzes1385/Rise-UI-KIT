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

	it('без масштаба --size-scale не пишется', () => {
		const { container } = render(BaseFlowMap, { props: { data } })
		expect((container.querySelector('.base-flow-map') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseFlowMap, { props: { data, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-flow-map')).toHaveClass('my-root')
	})

	it('вариант оформления даёт класс корня', () => {
		const { container } = render(BaseFlowMap, { props: { data, variant: 'outline' } })
		expect(container.querySelector('.base-flow-map')).toHaveClass('base-flow-map--outline')
	})

	it('отключённая карта помечена классом и aria-disabled', () => {
		const { container } = render(BaseFlowMap, { props: { data, isDisabled: true } })
		expect(container.querySelector('.base-flow-map')).toHaveClass('base-flow-map--disabled')
		expect(container.querySelector('.base-flow-map')).toHaveAttribute('aria-disabled', 'true')
	})

	it('без пропса isDisabled и isLoading атрибутов состояния нет', () => {
		const { container } = render(BaseFlowMap, { props: { data } })
		const root = container.querySelector('.base-flow-map')
		expect(root).not.toHaveAttribute('aria-disabled')
		expect(root).not.toHaveAttribute('aria-busy')
	})
})
