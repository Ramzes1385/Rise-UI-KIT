import '@testing-library/jest-dom/vitest'
import BaseDrawer from '../ui/BaseDrawer.vue'
import { fireEvent, render } from '@testing-library/vue'

vi.mock('@composables/overlay/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

function setup() {
	const result = render(BaseDrawer, { props: { isOpen: true, closeOnOverlay: true }, slots: { default: '<input aria-label="Поле" />' } })
	const overlay = document.querySelector('.base-drawer') as HTMLElement
	const panel = document.querySelector('.base-drawer__panel') as HTMLElement
	return { ...result, overlay, panel }
}

describe('BaseDrawer: закрытие по подложке', () => {
	it('не закрывается, если нажатие началось на панели, а click пришёл на подложку', async () => {
		const { emitted, overlay, panel } = setup()

		await fireEvent.pointerDown(panel)
		await fireEvent.click(overlay)

		expect(emitted()).not.toHaveProperty('close')
	})

	it('закрывается, если pointerdown и click были на подложке', async () => {
		const { emitted, overlay } = setup()

		await fireEvent.pointerDown(overlay)
		await fireEvent.click(overlay)

		expect(emitted()).toHaveProperty('close')
	})

	it('после отменённого нажатия следующее нажатие на подложку закрывает окно', async () => {
		const { emitted, overlay, panel } = setup()

		await fireEvent.pointerDown(panel)
		await fireEvent.click(overlay)
		await fireEvent.pointerDown(overlay)
		await fireEvent.click(overlay)

		expect(emitted()).toHaveProperty('close')
	})
})
