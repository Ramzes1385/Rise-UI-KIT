import '@testing-library/jest-dom/vitest'
import BaseToolCall from '../ui/BaseToolCall.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseToolCall — индикатор статуса из кита', () => {
	it('status="running" — индикатор это BaseLoader spinner внутри aria-hidden обёртки статуса', () => {
		const { container } = render(BaseToolCall, { props: { name: 'run', status: 'running' } })
		const spinner = container.querySelector('.base-tool-call__spinner')

		expect(spinner).toHaveClass('base-loader', 'base-loader--spinner')
		expect(spinner?.closest('.base-tool-call__status')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-tool-call__status .base-icon')).toBeNull()
	})

	it('доступное имя кнопки прежнее и не включает индикатор', () => {
		render(BaseToolCall, { props: { name: 'run', title: 'Запуск', status: 'running' } })

		expect(screen.getByRole('button', { name: 'Запуск run Выполняется' })).toBeInTheDocument()
		expect(screen.queryByRole('status')).toBeNull()
	})

	it.each(['pending', 'success', 'error'] as const)('status="%s" — индикатора нет, вместо него значок', status => {
		const { container } = render(BaseToolCall, { props: { name: 'run', status } })

		expect(container.querySelector('.base-tool-call__spinner')).toBeNull()
		expect(container.querySelector('.base-loader')).toBeNull()
		expect(container.querySelector('.base-tool-call__status .base-icon')).toBeInTheDocument()
	})

	it('размер индикатора следует sizeScale: 44% от масштаба компонента', async () => {
		const { container, rerender } = render(BaseToolCall, { props: { name: 'run', status: 'running' } })
		const loader = () => container.querySelector('.base-tool-call__spinner') as HTMLElement

		expect(loader().style.getPropertyValue('--size-scale')).toBe('0.44')
		await rerender({ sizeScale: 200 })
		expect(loader().style.getPropertyValue('--size-scale')).toBe('0.88')
		expect(container.querySelector('.base-tool-call')).toHaveStyle({ '--size-scale': '2' })
	})
})
