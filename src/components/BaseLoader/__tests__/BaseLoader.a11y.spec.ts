import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import BaseLoader from '../ui/BaseLoader.vue'
import { render, screen } from '@testing-library/vue'
import { LOADER_ANNOUNCE_DELAY } from '../model/useLoaderAnnounce'

const Host = defineComponent({
	props: {
		isMounted: { type: Boolean, default: true },
		isOverlay: { type: Boolean, default: true },
	},
	setup(props) {
		return () =>
			h('div', { 'data-testid': 'host' }, [
				h('p', { 'data-testid': 'content' }, 'Содержимое'),
				h('button', { 'data-testid': 'busy', 'aria-busy': 'false' }, 'Кнопка'),
				h('div', { 'data-testid': 'other-overlay', class: 'base-loader--overlay' }),
				props.isMounted ? h(BaseLoader, { isOverlay: props.isOverlay }) : null,
			])
	},
})

describe('BaseLoader доступность', () => {
	describe('озвучивание появления (LDR-1)', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it('должен рендерить live-регион пустым и заполнять его текстом после монтирования', async () => {
			const { container } = render(BaseLoader)
			const announce = container.querySelector('.base-loader__announce')

			expect(screen.getByRole('status')).toContainElement(announce as HTMLElement)
			expect(announce).toHaveTextContent('')

			await vi.advanceTimersByTimeAsync(LOADER_ANNOUNCE_DELAY)

			expect(announce).toHaveTextContent('Загрузка')
		})

		it('должен озвучивать label без завершающего многоточия', async () => {
			const { container } = render(BaseLoader, { props: { label: 'Сохранение...' } })

			await vi.advanceTimersByTimeAsync(LOADER_ANNOUNCE_DELAY)

			expect(container.querySelector('.base-loader__announce')?.textContent).toBe('Сохранение')
		})

		it('должен скрывать видимую подпись от скринридера, чтобы текст не читался дважды', () => {
			const { container } = render(BaseLoader, { props: { hasLabel: true } })

			expect(container.querySelector('.base-loader__label')).toHaveAttribute('aria-hidden', 'true')
		})

		it('не должен заполнять регион, если лоадер снят до задержки', async () => {
			const { container, unmount } = render(BaseLoader)
			const announce = container.querySelector('.base-loader__announce')

			unmount()
			await vi.advanceTimersByTimeAsync(LOADER_ANNOUNCE_DELAY)

			expect(announce?.textContent ?? '').toBe('')
		})
	})

	describe('оверлей блокирует содержимое (LDR-3)', () => {
		it('должен делать соседние элементы inert и aria-busy', () => {
			render(Host)

			expect(screen.getByTestId('content')).toHaveAttribute('inert')
			expect(screen.getByTestId('content')).toHaveAttribute('aria-busy', 'true')
			expect(screen.getByTestId('busy')).toHaveAttribute('aria-busy', 'true')
		})

		it('не должен делать inert сам лоадер и другой оверлей', () => {
			render(Host)

			expect(screen.getByRole('status', { hidden: true })).not.toHaveAttribute('inert')
			expect(screen.getByTestId('other-overlay')).not.toHaveAttribute('inert')
		})

		it('должен возвращать атрибуты, когда оверлей выключен', async () => {
			const { rerender } = render(Host)

			await rerender({ isOverlay: false })

			expect(screen.getByTestId('content')).not.toHaveAttribute('inert')
			expect(screen.getByTestId('content')).not.toHaveAttribute('aria-busy')
			expect(screen.getByTestId('busy')).toHaveAttribute('aria-busy', 'false')
		})

		it('должен возвращать атрибуты при снятии лоадера', async () => {
			const { rerender } = render(Host)

			await rerender({ isMounted: false })

			expect(screen.getByTestId('content')).not.toHaveAttribute('inert')
			expect(screen.getByTestId('content')).not.toHaveAttribute('aria-busy')
		})

		it('не должен снимать inert, выставленный не лоадером', async () => {
			const { rerender } = render(Host, { props: { isOverlay: false } })
			screen.getByTestId('content').setAttribute('inert', '')

			await rerender({ isOverlay: true })
			await rerender({ isOverlay: false })

			expect(screen.getByTestId('content')).toHaveAttribute('inert')
			expect(screen.getByTestId('content')).not.toHaveAttribute('aria-busy')
		})

		it('не должен трогать соседей без isOverlay', () => {
			render(Host, { props: { isOverlay: false } })

			expect(screen.getByTestId('content')).not.toHaveAttribute('inert')
		})
	})
})
