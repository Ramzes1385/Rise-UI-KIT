import '@testing-library/jest-dom/vitest'
import BaseQrCode from '../ui/BaseQrCode.vue'
import { render, screen } from '@testing-library/vue'

const URL = 'https://rise-ui.dev'

describe('BaseQrCode unit', () => {
	it('картинка с именем «QR-код: <текст>» и SVG без собственной роли', () => {
		const { container } = render(BaseQrCode, { props: { value: URL } })
		expect(screen.getByRole('img', { name: `QR-код: ${URL}` })).toBeInTheDocument()
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 33 33')
		expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M4 4h7v1h-7z/)
	})

	it('label заменяет имя для скринридера', () => {
		render(BaseQrCode, { props: { value: URL, label: 'Ссылка на документацию' } })
		expect(screen.getByRole('img', { name: 'Ссылка на документацию' })).toBeInTheDocument()
	})

	it('margin — поле в модулях: округляется, отрицательное становится нулём', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: URL, margin: 0 } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 25 25')
		expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M0 0h7v1h-7z/)
		await rerender({ value: URL, margin: -3 })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 25 25')
		await rerender({ value: URL, margin: 1.6 })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 29 29')
	})

	it('цвета по умолчанию — чёрный на белом, свои — moduleColor и backgroundColor', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: URL } })
		expect(container.querySelector('rect')).toHaveAttribute('fill', '#ffffff')
		expect(container.querySelector('path')).toHaveAttribute('fill', '#000000')
		await rerender({ value: URL, moduleColor: '#1e3a8a', backgroundColor: '#eff6ff' })
		expect(container.querySelector('rect')).toHaveAttribute('fill', '#eff6ff')
		expect(container.querySelector('path')).toHaveAttribute('fill', '#1e3a8a')
		expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--qr-background')).toBe('#eff6ff')
	})

	it('уровень коррекции меняет плотность кода: M — версия 2, H — версия 3', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, errorCorrection: 'H', margin: 0 } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 29 29')
	})

	it('слишком длинный текст: сообщение вместо кода и то же имя для скринридера', () => {
		const { container } = render(BaseQrCode, { props: { value: 'a'.repeat(300) } })
		expect(screen.getByRole('img', { name: 'Текст слишком длинный для QR-кода' })).toHaveClass('base-qr-code--overflow')
		expect(container.querySelector('svg')).toBeNull()
		expect(container.querySelector('.base-qr-code__message')).toHaveTextContent('Текст слишком длинный для QR-кода')
	})

	it('размер — ширина в пикселях через --qr-size, масштаб — через --size-scale', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, size: 96, sizeScale: 125 } })
		const root = container.firstElementChild as HTMLElement
		expect(root.style.getPropertyValue('--qr-size')).toBe('96px')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('вариант outline и customClass', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, variant: 'outline', customClass: { root: 'my-root' } } })
		expect(container.firstElementChild).toHaveClass('base-qr-code--outline', 'my-root')
	})

	it('getSvg через ref: самостоятельная разметка SVG; без кода — пустая строка', async () => {
		const { mount } = await import('@vue/test-utils')
		const wrapper = mount(BaseQrCode, { props: { value: URL, moduleColor: '#111111' } })
		const svg = wrapper.vm.getSvg()
		expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 33 33" shape-rendering="crispEdges">/)
		expect(svg).toContain('<rect width="33" height="33" fill="#ffffff"/>')
		expect(svg).toContain(`<path d="${wrapper.find('path').attributes('d')}" fill="#111111"/>`)
		await wrapper.setProps({ value: 'a'.repeat(300) })
		expect(wrapper.vm.getSvg()).toBe('')
		wrapper.unmount()
	})
})
