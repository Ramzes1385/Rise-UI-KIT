import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import BaseQrCode from '../ui/BaseQrCode.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

const SECRET = 'otpauth://totp/Rise:anna@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Rise'
const TOKEN_LINK = 'https://example.com/login/confirm?token=s3cr3t-t0ken'

describe('BaseQrCode: имя без данных кода', () => {
	it('текст и otpauth:// — «QR-код», секрет не попадает ни в имя, ни в текст DOM', () => {
		const { container } = render(BaseQrCode, { props: { value: SECRET } })
		const image = screen.getByRole('img', { name: 'QR-код' })
		expect(image.getAttribute('aria-label')).toBe('QR-код')
		expect(container.innerHTML).not.toContain('JBSWY3DPEHPK3PXP')
	})

	it('ссылка https — хост без пути и query; http и порт — тоже', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: TOKEN_LINK } })
		expect(screen.getByRole('img', { name: 'QR-код: ссылка на example.com' })).toBeInTheDocument()
		expect(container.innerHTML).not.toContain('s3cr3t')
		await rerender({ value: '  HTTP://localhost:8080/a ' })
		expect(screen.getByRole('img', { name: 'QR-код: ссылка на localhost:8080' })).toBeInTheDocument()
	})

	it('неразборчивая ссылка и ftp — «QR-код»; свой label — как есть', async () => {
		const { rerender } = render(BaseQrCode, { props: { value: 'https://' } })
		expect(screen.getByRole('img', { name: 'QR-код' })).toBeInTheDocument()
		await rerender({ value: 'ftp://example.com/file' })
		expect(screen.getByRole('img', { name: 'QR-код' })).toBeInTheDocument()
		await rerender({ value: SECRET, label: 'Ключ для приложения-аутентификатора' })
		expect(screen.getByRole('img', { name: 'Ключ для приложения-аутентификатора' })).toBeInTheDocument()
	})
})

describe('BaseQrCode: isConcealed', () => {
	afterEach(() => vi.useRealTimers())

	it('скрытый код: заглушка не из данных, кнопка «Показать QR-код», нет картинки', () => {
		const { container } = render(BaseQrCode, { props: { value: SECRET, isConcealed: true } })
		const reference = mount(BaseQrCode, { props: { value: SECRET } })
		expect(screen.queryByRole('img')).toBeNull()
		expect(container.firstElementChild).toHaveClass('base-qr-code--concealed')
		expect(screen.getByRole('button', { name: 'Показать QR-код' })).toBeInTheDocument()
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 33 33')
		expect(container.querySelector('.base-qr-code__modules')?.getAttribute('d')).not.toBe(
			reference.find('.base-qr-code__modules').attributes('d'),
		)
		reference.unmount()
	})

	it('заглушка одна и та же для любых данных', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: SECRET, isConcealed: true } })
		const first = container.querySelector('.base-qr-code__modules')?.getAttribute('d')
		await rerender({ value: 'другой секрет', isConcealed: true })
		expect(container.querySelector('.base-qr-code__modules')?.getAttribute('d')).toBe(first)
	})

	it('кнопка показывает код, ставит фокус на картинку и шлёт reveal', async () => {
		const user = userEvent.setup()
		const { emitted, container } = render(BaseQrCode, { props: { value: SECRET, isConcealed: true } })
		await user.click(screen.getByRole('button', { name: 'Показать QR-код' }))
		const image = screen.getByRole('img', { name: 'QR-код' })
		expect(image).toHaveFocus()
		expect(image).toHaveAttribute('tabindex', '-1')
		expect(screen.queryByRole('button')).toBeNull()
		expect(container.firstElementChild).not.toHaveClass('base-qr-code--concealed')
		expect(emitted('reveal')).toHaveLength(1)
	})

	it('revealTimeout скрывает снова и шлёт conceal; повторный показ перезапускает таймер', async () => {
		vi.useFakeTimers()
		const wrapper = mount(BaseQrCode, { props: { value: SECRET, isConcealed: true, revealTimeout: 1000 } })
		wrapper.vm.reveal()
		await vi.advanceTimersByTimeAsync(600)
		wrapper.vm.reveal()
		await vi.advanceTimersByTimeAsync(600)
		expect(wrapper.find('[role="img"]').exists()).toBe(true)
		await vi.advanceTimersByTimeAsync(400)
		expect(wrapper.find('[role="img"]').exists()).toBe(false)
		expect(wrapper.emitted('reveal')).toHaveLength(1)
		expect(wrapper.emitted('conceal')).toHaveLength(1)
		wrapper.unmount()
	})

	it('conceal() отменяет таймер; размонтирование — тоже', async () => {
		vi.useFakeTimers()
		const wrapper = mount(BaseQrCode, { props: { value: SECRET, isConcealed: true, revealTimeout: 1000 } })
		wrapper.vm.reveal()
		wrapper.vm.conceal()
		wrapper.vm.conceal()
		await vi.advanceTimersByTimeAsync(2000)
		expect(wrapper.emitted('conceal')).toHaveLength(1)
		wrapper.vm.reveal()
		wrapper.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('без isConcealed revealTimeout не действует; conceal() и reveal() работают и тут', async () => {
		vi.useFakeTimers()
		const wrapper = mount(BaseQrCode, { props: { value: SECRET, revealTimeout: 500 } })
		wrapper.vm.reveal()
		await vi.advanceTimersByTimeAsync(1000)
		expect(wrapper.find('[role="img"]').exists()).toBe(true)
		expect(wrapper.emitted('reveal')).toBeUndefined()
		wrapper.vm.conceal()
		await wrapper.vm.$nextTick()
		expect(wrapper.find('.base-qr-code__reveal').exists()).toBe(true)
		wrapper.vm.reveal()
		await wrapper.vm.$nextTick()
		expect(wrapper.find('[role="img"]').attributes('tabindex')).toBeUndefined()
		wrapper.unmount()
	})

	it('смена isConcealed снаружи прячет и показывает код без событий', async () => {
		const wrapper = mount(BaseQrCode, { props: { value: SECRET } })
		await wrapper.setProps({ isConcealed: true })
		expect(wrapper.find('[role="img"]').exists()).toBe(false)
		await wrapper.setProps({ isConcealed: false })
		expect(wrapper.find('[role="img"]').exists()).toBe(true)
		expect(wrapper.emitted('conceal')).toBeUndefined()
		wrapper.unmount()
	})

	it('getSvg() отдаёт настоящий код и в скрытом состоянии', () => {
		const shown = mount(BaseQrCode, { props: { value: SECRET } })
		const hidden = mount(BaseQrCode, { props: { value: SECRET, isConcealed: true } })
		expect(hidden.vm.getSvg()).toBe(shown.vm.getSvg())
		expect(hidden.vm.getSvg()).not.toBe('')
		shown.unmount()
		hidden.unmount()
	})

	it('слишком длинный секрет: после показа — сообщение', async () => {
		const wrapper = mount(BaseQrCode, { props: { value: 'a'.repeat(4000), isConcealed: true } })
		expect(wrapper.find('svg').exists()).toBe(true)
		wrapper.vm.reveal()
		await wrapper.vm.$nextTick()
		expect(wrapper.find('svg').exists()).toBe(false)
		expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Текст слишком длинный для QR-кода')
		wrapper.unmount()
	})
})

describe('BaseQrCode: showValue', () => {
	it('true — весь текст под кодом, имя картинки остаётся коротким', () => {
		render(BaseQrCode, { props: { value: TOKEN_LINK, showValue: true } })
		expect(screen.getByText(TOKEN_LINK)).toHaveClass('base-qr-code__caption')
		expect(screen.getByRole('img', { name: 'QR-код: ссылка на example.com' })).toBeInTheDocument()
	})

	it("'host' — хост ссылки; для не-ссылки подписи нет", async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: TOKEN_LINK, showValue: 'host' } })
		expect(container.querySelector('.base-qr-code__caption')).toHaveTextContent(/^example\.com$/)
		await rerender({ value: 'просто текст', showValue: 'host' })
		expect(container.querySelector('.base-qr-code__caption')).toBeNull()
	})

	it('у скрытого кода подписи нет, после показа — есть; false — нет', async () => {
		const wrapper = mount(BaseQrCode, { props: { value: TOKEN_LINK, showValue: 'host', isConcealed: true } })
		expect(wrapper.find('.base-qr-code__caption').exists()).toBe(false)
		wrapper.vm.reveal()
		await wrapper.vm.$nextTick()
		expect(wrapper.find('.base-qr-code__caption').text()).toBe('example.com')
		await wrapper.setProps({ showValue: false })
		expect(wrapper.find('.base-qr-code__caption').exists()).toBe(false)
		wrapper.unmount()
	})
})

describe('BaseQrCode: умолчания плагина', () => {
	it('createUiKitPlugin({ defaults }) задаёт isConcealed', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseQrCode: { isConcealed: true } } })
		render(BaseQrCode, { props: { value: SECRET }, global: { plugins: [plugin] } })
		expect(screen.getByRole('button', { name: 'Показать QR-код' })).toBeInTheDocument()
	})
})
