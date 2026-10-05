import '@testing-library/jest-dom/vitest'
import BaseQrCode from '../ui/BaseQrCode.vue'
import { render, screen } from '@testing-library/vue'

const URL = 'https://rise-ui.dev'

describe('BaseQrCode unit', () => {
	it('картинка с именем «QR-код: ссылка на <хост>» и SVG без собственной роли', () => {
		const { container } = render(BaseQrCode, { props: { value: URL } })
		expect(screen.getByRole('img', { name: 'QR-код: ссылка на rise-ui.dev' })).toBeInTheDocument()
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 33 33')
		expect(container.querySelector('.base-qr-code__finder')?.getAttribute('d')).toMatch(
			/^M4 4h7v7h-7v-7zM5 5h5v5h-5v-5zM6 6h3v3h-3v-3z/,
		)
		expect(container.querySelector('.base-qr-code__modules')).toHaveAttribute('shape-rendering', 'crispEdges')
		expect(container.querySelector('image')).toBeNull()
	})

	it('label заменяет имя для скринридера', () => {
		render(BaseQrCode, { props: { value: URL, label: 'Ссылка на документацию' } })
		expect(screen.getByRole('img', { name: 'Ссылка на документацию' })).toBeInTheDocument()
	})

	it('margin — поле в модулях: округляется, отрицательное становится нулём', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: URL, margin: 0 } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 25 25')
		expect(container.querySelector('.base-qr-code__finder')?.getAttribute('d')).toMatch(/^M0 0h7v7h-7v-7z/)
		await rerender({ value: URL, margin: -3 })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 25 25')
		await rerender({ value: URL, margin: 1.6 })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 29 29')
	})

	it('цвета по умолчанию — чёрный на белом, свои — moduleColor и backgroundColor', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: URL } })
		expect(container.querySelector('rect')).toHaveAttribute('fill', '#ffffff')
		expect(container.querySelector('.base-qr-code__modules')).toHaveAttribute('fill', '#000000')
		expect(container.querySelector('.base-qr-code__finder')).toHaveAttribute('fill', '#000000')
		await rerender({ value: URL, moduleColor: '#1e3a8a', backgroundColor: '#eff6ff' })
		expect(container.querySelector('rect')).toHaveAttribute('fill', '#eff6ff')
		expect(container.querySelector('.base-qr-code__modules')).toHaveAttribute('fill', '#1e3a8a')
		expect(container.querySelector('.base-qr-code__finder')).toHaveAttribute('fill', '#1e3a8a')
		await rerender({ value: URL, moduleColor: '#1e3a8a', finderColor: '#0f766e' })
		expect(container.querySelector('.base-qr-code__finder')).toHaveAttribute('fill', '#0f766e')
		expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--qr-background')).toBe('#eff6ff')
	})

	it('уровень коррекции меняет плотность кода: M — версия 2, H — версия 3', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, errorCorrection: 'H', margin: 0 } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 29 29')
	})

	it('слишком длинный текст: сообщение вместо кода и то же имя для скринридера', () => {
		const { container } = render(BaseQrCode, { props: { value: 'a'.repeat(300) } })
		expect(screen.getByRole('img', { name: 'Текст слишком длинный для QR-кода' })).toHaveClass('base-qr-code__box')
		expect(container.firstElementChild).toHaveClass('base-qr-code--overflow')
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
		expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 33 33">/)
		expect(svg).toContain('<rect width="33" height="33" fill="#ffffff" shape-rendering="crispEdges"/>')
		expect(svg).toContain(
			`<path d="${wrapper.find('.base-qr-code__modules').attributes('d')}" fill="#111111" shape-rendering="crispEdges"/>`,
		)
		expect(svg).toContain(
			`<path d="${wrapper.find('.base-qr-code__finder').attributes('d')}" fill="#111111" fill-rule="evenodd" shape-rendering="crispEdges"/>`,
		)
		expect(svg).not.toContain('<image')
		await wrapper.setProps({ value: 'a'.repeat(300) })
		expect(wrapper.vm.getSvg()).toBe('')
		wrapper.unmount()
	})

	it('формы модулей и «глазков»: точки и кольца — дугами и без crispEdges', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, moduleShape: 'dots', finderShape: 'circle' } })
		const modules = container.querySelector('.base-qr-code__modules')
		expect(modules?.getAttribute('d')).toMatch(/^M[\d.]+ [\d.]+a0\.45 0\.45 0 1 0 0\.9 0/)
		expect(modules).not.toHaveAttribute('shape-rendering')
		expect(container.querySelector('.base-qr-code__finder')?.getAttribute('d')).toMatch(/^M4 7\.5a3\.5 3\.5 0 1 0 7 0/)
		expect(container.querySelector('.base-qr-code__finder')).toHaveAttribute('fill-rule', 'evenodd')
	})

	it('логотип: картинка в центре выреза, уровень по умолчанию — H, версия растёт до 5', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, logo: '/logo.svg' } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 45 45')
		const image = container.querySelector('image')
		expect(image).toHaveAttribute('href', '/logo.svg')
		expect([image?.getAttribute('x'), image?.getAttribute('y'), image?.getAttribute('width')]).toEqual(['18.43', '18.43', '8.14'])
		expect(image).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet')
		expect(screen.getByRole('img', { name: 'QR-код: ссылка на rise-ui.dev' })).toBeInTheDocument()
	})

	it('логотип: errorCorrection — нижняя граница уровня, logoSize ограничен 0.1–0.3', async () => {
		const { container, rerender } = render(BaseQrCode, { props: { value: URL, logo: '/logo.svg', errorCorrection: 'L' } })
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 45 45')
		await rerender({ value: URL, logo: '/logo.svg', logoSize: 0.9 })
		expect(Number(container.querySelector('image')?.getAttribute('width'))).toBeCloseTo(
			(Number(container.querySelector('svg')?.getAttribute('viewBox')?.split(' ')[2]) - 8) * 0.3,
			2,
		)
	})

	it('getSvg с логотипом: картинка с экранированным адресом поверх кода', async () => {
		const { mount } = await import('@vue/test-utils')
		const wrapper = mount(BaseQrCode, {
			props: { value: URL, logo: '/logo.svg?v=1&theme="dark"', moduleShape: 'rounded', finderShape: 'rounded' },
		})
		const svg = wrapper.vm.getSvg()
		expect(svg).toContain(
			'<image href="/logo.svg?v=1&amp;theme=&quot;dark&quot;" x="18.43" y="18.43" width="8.14" height="8.14" preserveAspectRatio="xMidYMid meet"/>',
		)
		expect(svg).toMatch(/<path d="[^"]+" fill="#000000"\/><path d="[^"]+" fill="#000000" fill-rule="evenodd"\/><image/)
		wrapper.unmount()
	})
})
