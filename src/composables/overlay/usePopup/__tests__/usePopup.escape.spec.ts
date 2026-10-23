import '@testing-library/jest-dom/vitest'
import { usePopup } from '../usePopup'
import { render } from '@testing-library/vue'
import { defineComponent, h, shallowRef } from 'vue'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'

function pressEscape(): void {
	document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

const LowerLayer = defineComponent({
	props: { onEscape: { type: Function, required: true } },
	setup(props) {
		useEscapeKey({ isActive: () => true, callback: () => props.onEscape() })
		return () => h('div')
	},
})

function createPopup(options: { closeOnEscape: () => boolean; onClose: () => void; withScope?: boolean }) {
	return defineComponent({
		setup() {
			const panelRef = shallowRef<HTMLElement | null>(null)
			usePopup({
				isOpen: () => true,
				closeOnOverlay: () => true,
				closeOnEscape: options.closeOnEscape,
				onClose: options.onClose,
				lockScroll: () => false,
				escapeScope: options.withScope ? () => panelRef.value : undefined,
			})
			return () => h('div', { ref: panelRef, 'data-testid': 'panel' }, [h('button', { type: 'button' }, 'Внутри')])
		},
	})
}

describe('usePopup: Escape и слои', () => {
	it('closeOnEscape=false: окно поглощает Escape, слой ниже не закрывается', () => {
		const lower = vi.fn()
		const onClose = vi.fn()
		render(LowerLayer, { props: { onEscape: lower } })
		render(createPopup({ closeOnEscape: () => false, onClose }))

		pressEscape()

		expect(onClose).not.toHaveBeenCalled()
		expect(lower).not.toHaveBeenCalled()
	})

	it('closeOnEscape=true: Escape закрывает верхнее окно, слой ниже не трогает', () => {
		const lower = vi.fn()
		const onClose = vi.fn()
		render(LowerLayer, { props: { onEscape: lower } })
		render(createPopup({ closeOnEscape: () => true, onClose }))

		pressEscape()

		expect(onClose).toHaveBeenCalledOnce()
		expect(lower).not.toHaveBeenCalled()
	})

	it('escapeScope: фокус вне окна — Escape получает слой ниже, окно открыто', () => {
		const lower = vi.fn()
		const onClose = vi.fn()
		render(LowerLayer, { props: { onEscape: lower } })
		render(createPopup({ closeOnEscape: () => true, onClose, withScope: true }))

		pressEscape()

		expect(onClose).not.toHaveBeenCalled()
		expect(lower).toHaveBeenCalledOnce()
	})

	it('escapeScope: фокус внутри окна — Escape закрывает окно', () => {
		const onClose = vi.fn()
		const { getByRole } = render(createPopup({ closeOnEscape: () => true, onClose, withScope: true }))
		getByRole('button', { name: 'Внутри' }).focus()

		pressEscape()

		expect(onClose).toHaveBeenCalledOnce()
	})

	it('escapeScope вернул null (окно не отрендерено) — Escape окну не достаётся', () => {
		const onClose = vi.fn()
		const Comp = defineComponent({
			setup() {
				usePopup({
					isOpen: () => true,
					closeOnOverlay: () => true,
					closeOnEscape: () => true,
					onClose,
					lockScroll: () => false,
					escapeScope: () => null,
				})
				return () => h('div')
			},
		})
		render(Comp)

		pressEscape()

		expect(onClose).not.toHaveBeenCalled()
	})
})
