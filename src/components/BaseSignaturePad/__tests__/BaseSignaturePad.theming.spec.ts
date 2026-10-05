import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSignaturePad from '../ui/BaseSignaturePad.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import { SIGNATURE_PAD_PARTS } from '../types/BaseSignaturePad.types'

const STROKE = [
	{ x: 10, y: 20 },
	{ x: 50, y: 60 },
]

const HINT = 'Распишитесь мышью, пальцем или пером'

describe('BaseSignaturePad: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...SIGNATURE_PAD_PARTS.map(part => [part, `u-${part}`])])
		const { container, rerender } = render(BaseSignaturePad, {
			props: {
				label: 'Подпись клиента',
				error: 'Нужна подпись',
				variant: 'soft',
				customClass: { root: 'own-root', surface: 'own-surface' },
				ui,
			},
		})
		const root = container.querySelector('.base-signature-pad')!

		expect(root).toHaveClass('u-root', 'base-signature-pad--soft', 'own-root')
		expect(root.querySelector('.base-signature-pad__hint')).toHaveClass('u-hint')
		await rerender({ modelValue: [STROKE] })
		for (const part of SIGNATURE_PAD_PARTS.filter(part => part !== 'hint')) {
			expect(root.querySelector(`.base-signature-pad__${part}`)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-signature-pad__surface')).toHaveClass('own-surface')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseSignaturePad, {
			props: { ui: { toolbar: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSignaturePad: { ui: { toolbar: 'app', root: 'app-root' } } } })] },
		})
		const root = container.querySelector('.base-signature-pad')!

		expect(root).toHaveClass('base-signature-pad', 'app-root')
		expect(root.querySelector('.base-signature-pad__surface')).toHaveAttribute('class', 'base-signature-pad__surface')
		expect(root.querySelector('.base-signature-pad__toolbar')).toHaveAttribute('class', 'base-signature-pad__toolbar app own')
	})
})

describe('BaseSignaturePad: движение подсказки', () => {
	it('подсказка появляется и уходит переходом base-signature-pad-fade; в пресете none — сразу конечное состояние', async () => {
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		const { rerender } = render(BaseSignaturePad, { container: host, global: { stubs: { transition: false } } })

		expect(screen.getByText(HINT)).toBeInTheDocument()
		await rerender({ modelValue: [STROKE] })
		await waitFor(() => expect(screen.queryByText(HINT)).not.toBeInTheDocument())
		await rerender({ modelValue: [] })
		await waitFor(() => expect(screen.getByText(HINT)).not.toHaveClass('base-signature-pad-fade-enter-active'))
		host.remove()
	})
})
