import '@testing-library/jest-dom/vitest'
import { kk } from '../kk'
import { uz } from '../uz'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import { BaseApp } from '@components/BaseApp'
import { BaseModal } from '@components/BaseModal'
import { defineComponent, h, nextTick } from 'vue'
import { BaseConfirm } from '@components/BaseConfirm'
import { render, screen } from '@testing-library/vue'
import { BaseCalendar } from '@components/BaseCalendar'
import { BasePagination } from '@components/BasePagination'
import { getLocale, registerLocale, setLocale } from '../state'

beforeAll(() => {
	registerLocale(kk)
	registerLocale(uz)
})

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
		const wrapper = mount(defineComponent({ render: () => h(BaseModal, { isOpen: true, title: 'Settings' }) }), {
			global: { plugins: [createUiKitPlugin({ locale: 'en' })] },
			attachTo: document.body,
		})

		expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
		wrapper.unmount()
	})
})

describe.each([
	['kk', { confirm: 'Растау', cancel: 'Бас тарту', close: 'Жабу', next: 'Келесі бет', firstWeekday: 'дс', month: 'мамыр' }],
	['uz', { confirm: 'Tasdiqlash', cancel: 'Bekor qilish', close: 'Yopish', next: 'Keyingi sahifa', firstWeekday: 'Dush', month: 'may' }],
] as const)('компоненты на языке %s', (code, expected) => {
	it('строки интерфейса меняются на лету', async () => {
		render(BaseConfirm, { props: { isOpen: true, title: 'Delete project?' } })

		setLocale(code)
		await nextTick()

		expect(screen.getByRole('button', { name: expected.confirm })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: expected.cancel })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: expected.close })).toBeInTheDocument()
	})

	it('календарь: неделя с понедельника, названия дней и месяца по-местному', () => {
		setLocale(code)
		const { container } = render(BaseCalendar, { props: { initialMonth: 4, initialYear: 2025 } })

		const weekdays = Array.from(container.querySelectorAll('.base-calendar__weekday'), day => day.textContent?.trim())
		expect(weekdays[0]).toBe(expected.firstWeekday)
		expect(weekdays).toHaveLength(7)
		expect(container.textContent?.toLowerCase()).toContain(expected.month)
	})

	it('пагинация: имена кнопок и страницы', () => {
		setLocale(code)
		render(BasePagination, { props: { modelValue: 2, total: 50, pageSize: 10 } })

		expect(screen.getByRole('button', { name: expected.next })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: code === 'kk' ? '3-бет' : '3-sahifa' })).toBeInTheDocument()
	})

	it('BaseApp locale и createUiKitPlugin({ locale })', async () => {
		const { rerender } = render(BaseApp, {
			props: { locale: code },
			slots: { default: () => h(BaseModal, { isOpen: true, title: 'Settings' }) },
		})
		expect(getLocale().code).toBe(code)
		expect(screen.getByRole('button', { name: expected.close })).toBeInTheDocument()

		await rerender({ locale: 'ru' })
		expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()
	})
})
