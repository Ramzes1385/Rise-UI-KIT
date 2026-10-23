import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import BaseSideBar from '../../ui/BaseSideBar.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { BASE_SIDEBAR_STUBS, preventLinkNavigation } from '../BaseSideBar.test-utils'

preventLinkNavigation()

const OPTIONS = { global: { stubs: BASE_SIDEBAR_STUBS } }

describe('BaseSideBar: управляемое и внутреннее состояние (SB-9)', () => {
	it('без isCollapsed нажатие меняет внутреннее состояние', async () => {
		const { container } = render(BaseSideBar, { props: { title: 'Навигация' }, ...OPTIONS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		await waitFor(() => expect(container.querySelector('.base-side-bar')).toHaveClass('base-side-bar--collapsed'))
	})

	it('родитель начал передавать isCollapsed после монтирования — панель следует за ним', async () => {
		const { container, rerender } = render(BaseSideBar, { props: { title: 'Навигация' }, ...OPTIONS })

		await rerender({ title: 'Навигация', isCollapsed: true })
		await waitFor(() => expect(container.querySelector('.base-side-bar')).toHaveClass('base-side-bar--collapsed'))

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть' }))
		await waitFor(() => expect(container.querySelector('.base-side-bar')).toHaveClass('base-side-bar--collapsed'))

		await rerender({ title: 'Навигация', isCollapsed: false })
		await waitFor(() => expect(container.querySelector('.base-side-bar')).not.toHaveClass('base-side-bar--collapsed'))
	})

	it('родитель перестал передавать isCollapsed — остаётся последнее состояние и управление переходит внутрь', async () => {
		const { container, rerender } = render(BaseSideBar, { props: { title: 'Навигация', isCollapsed: true }, ...OPTIONS })

		await rerender({ title: 'Навигация', isCollapsed: undefined })
		await waitFor(() => expect(container.querySelector('.base-side-bar')).toHaveClass('base-side-bar--collapsed'))

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть' }))
		await waitFor(() => expect(container.querySelector('.base-side-bar')).not.toHaveClass('base-side-bar--collapsed'))
	})
})
