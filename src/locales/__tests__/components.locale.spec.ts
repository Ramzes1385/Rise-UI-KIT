/**
 * Компоненты на другом языке: строки интерфейса, календарь, смена языка на лету,
 * язык из BaseApp и из createUiKitPlugin.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { BaseApp } from '@components/BaseApp'
import { BaseCalendar } from '@components/BaseCalendar'
import { BaseConfirm } from '@components/BaseConfirm'
import { BaseModal } from '@components/BaseModal'
import { BasePagination } from '@components/BasePagination'
import { getLocale, setLocale } from '../state'

describe('компоненты на английском', () => {
	it('строки интерфейса и значения props по умолчанию меняются на лету', async () => {
		render(BaseConfirm, { props: { isOpen: true, title: 'Delete project?' } })
		expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument()

		setLocale('en')
		await nextTick()

		expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
	})

	it('календарь: неделя с воскресенья, названия дней и месяца по-английски', () => {
		setLocale('en')
		const { container } = render(BaseCalendar, { props: { initialMonth: 4, initialYear: 2025 } })

		const weekdays = Array.from(container.querySelectorAll('.base-calendar__weekday'), day => day.textContent?.trim())
		expect(weekdays[0]).toBe('Sun')
		expect(container.textContent).toContain('May')
	})

	it('пагинация: имена кнопок по-английски', () => {
		setLocale('en')
		render(BasePagination, { props: { modelValue: 2, total: 50, pageSize: 10 } })

		expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
	})
})

describe('откуда берётся язык', () => {
	it('BaseApp locale меняет язык всего приложения до рендера дочерних компонентов', async () => {
		const { rerender } = render(BaseApp, {
			props: { locale: 'en' },
			slots: { default: () => h(BaseModal, { isOpen: true, title: 'Settings' }) },
		})
		expect(getLocale().code).toBe('en')
		expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()

		await rerender({ locale: 'ru' })
		expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()
		await rerender({ locale: undefined })
		expect(getLocale().code).toBe('ru')
	})

	it('createUiKitPlugin({ locale })', () => {
		const wrapper = mount(
			defineComponent({ render: () => h(BaseModal, { isOpen: true, title: 'Settings' }) }),
			{ global: { plugins: [createUiKitPlugin({ locale: 'en' })] }, attachTo: document.body },
		)

		expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
		wrapper.unmount()
	})
})
