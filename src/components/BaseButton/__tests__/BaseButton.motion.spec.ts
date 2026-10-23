import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

describe('BaseButton: анимации загрузки', () => {
	it('спиннер появляется через Transition base-button__loader', async () => {
		const { rerender } = render(BaseButton, { props: { isLoading: false }, slots: { default: 'Сохранить' }, ...REAL_TRANSITION })
		await rerender({ isLoading: true })

		const loader = screen.getByRole('button').querySelector('.base-button__loader')
		expect(loader).toHaveClass('base-button__loader-enter-from', 'base-button__loader-enter-active')
		expect(screen.getByRole('button')).toHaveClass('base-button--loading')
	})

	it('без длительности перехода (reduce, пресет none) спиннер уходит сразу, без ожидания transitionend', async () => {
		const { rerender } = render(BaseButton, { props: { isLoading: true }, slots: { default: 'Сохранить' }, ...REAL_TRANSITION })
		await rerender({ isLoading: false })
		await nextTick()

		expect(screen.getByRole('button')).not.toHaveClass('base-button--loading')
		await waitFor(() => expect(screen.getByRole('button').querySelector('.base-button__loader')).toBeNull())
	})
})
