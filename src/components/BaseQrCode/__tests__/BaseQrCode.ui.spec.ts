import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseQrCode from '../ui/BaseQrCode.vue'
import { render, screen } from '@testing-library/vue'
import { QR_CODE_PARTS } from '../types/BaseQrCode.types'

const URL = 'https://rise-ui.dev'
const LOGO = 'data:image/png;base64,iVBORw0KGgo='
const LONG = 'x'.repeat(3000)

const UI = Object.fromEntries(QR_CODE_PARTS.map(part => [part, `u-${part}`]))

function partsOf(container: Element) {
	return QR_CODE_PARTS.map(part => [part, container.querySelector(`.base-qr-code__${part}`)] as const)
}

describe('BaseQrCode: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseQrCode, { props: { value: URL, logo: LOGO, showValue: true } })
		const concealed = render(BaseQrCode, { props: { value: URL, isConcealed: true } })
		const long = render(BaseQrCode, { props: { value: LONG } })

		expect(container.firstElementChild).toHaveAttribute('class', 'base-qr-code')
		for (const part of ['box', 'svg', 'modules', 'finder', 'logo', 'caption']) {
			expect(container.querySelector(`.base-qr-code__${part}`)).toHaveAttribute('class', `base-qr-code__${part}`)
		}
		expect(concealed.container.querySelector('.base-qr-code__reveal')).toHaveClass('base-qr-code__reveal', 'base-button')
		expect(long.container.querySelector('.base-qr-code__message')).toHaveAttribute('class', 'base-qr-code__message')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseQrCode, {
			props: { value: URL, logo: LOGO, showValue: true, variant: 'outline', customClass: 'own-root', ui: { ...UI, root: 'u-root' } },
		})
		const concealed = render(BaseQrCode, { props: { value: URL, isConcealed: true, ui: UI } })
		const long = render(BaseQrCode, { props: { value: LONG, ui: UI } })

		expect(container.firstElementChild).toHaveClass('base-qr-code', 'u-root', 'base-qr-code--outline', 'own-root')
		for (const [part, element] of partsOf(container)) if (element) expect(element).toHaveClass(`u-${part}`)
		expect(concealed.container.querySelector('.base-qr-code__reveal')).toHaveClass('u-reveal')
		expect(concealed.container.firstElementChild).toHaveClass('base-qr-code--concealed')
		expect(long.container.querySelector('.base-qr-code__message')).toHaveClass('u-message')
		expect(long.container.firstElementChild).toHaveClass('base-qr-code--overflow')
	})

	it('классы из defaults.BaseQrCode.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseQrCode, {
			props: { value: URL, ui: { box: 'own-box' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseQrCode: { ui: { root: 'app-root', box: 'app-box' } } } })] },
		})
		const box = screen.getByRole('img')

		expect(box).toHaveAttribute('class', 'base-qr-code__box app-box own-box')
		expect(box.parentElement).toHaveClass('base-qr-code', 'app-root')
	})
})
