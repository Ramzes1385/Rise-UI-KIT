import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { fireEvent, render } from '@testing-library/vue'
import BaseImageCompare from '../ui/BaseImageCompare.vue'
import { IMAGE_COMPARE_PARTS } from '../types/BaseImageCompare.types'

const PROPS = { before: 'before.png', after: 'after.png', beforeAlt: 'До обработки', afterAlt: 'После обработки' }

describe('BaseImageCompare: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...IMAGE_COMPARE_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseImageCompare, { props: { ...PROPS, ui, customClass: { handle: 'own-handle' } } })
		const root = container.querySelector('.base-image-compare')!
		expect(root).toHaveClass('base-image-compare', 'u-root')
		for (const part of IMAGE_COMPARE_PARTS) {
			for (const element of root.querySelectorAll(`.base-image-compare__${part}`)) expect(element).toHaveClass(`u-${part}`)
		}
		expect(root.querySelectorAll('.u-image')).toHaveLength(2)
		expect(root.querySelector('.u-label.base-image-compare__label--before')).toBeInTheDocument()
		expect(root.querySelector('.base-image-compare__handle')).toHaveClass('own-handle')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseImageCompare, {
			props: { ...PROPS, ui: { handle: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageCompare: { ui: { handle: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-image-compare')).toHaveClass('app-root')
		expect(container.querySelector('.base-image-compare__handle')).toHaveAttribute('class', 'base-image-compare__handle app own')
		expect(container.querySelector('.base-image-compare__divider')).toHaveAttribute('class', 'base-image-compare__divider')
	})
})

describe('BaseImageCompare: движение границы', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('линия и ручка лежат в слое track, позиция — переменная --compare-position на корне', async () => {
		const { container, rerender } = render(BaseImageCompare, { props: { ...PROPS, position: 30 } })
		const root = container.querySelector<HTMLElement>('.base-image-compare')!
		const track = root.querySelector('.base-image-compare__track')!
		expect(track.querySelector('.base-image-compare__divider')).toBeInTheDocument()
		expect(track.querySelector('[role="slider"]')).toBeInTheDocument()
		expect(track).not.toHaveAttribute('aria-hidden')
		await rerender({ position: 75 })
		expect(root.style.getPropertyValue('--compare-position')).toBe('75%')
	})

	it('шаг клавишей и щелчок — плавно (без класса dragging), перетаскивание — без перехода', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect)
		const { container, getByRole } = render(BaseImageCompare, { props: PROPS })
		const root = container.querySelector<HTMLElement>('.base-image-compare')!
		await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowRight' })
		expect(root).not.toHaveClass('base-image-compare--dragging')
		await fireEvent.pointerDown(root, { button: 0, clientX: 20 })
		expect(root).not.toHaveClass('base-image-compare--dragging')
		await fireEvent.pointerMove(window, { clientX: 40 })
		expect(root).toHaveClass('base-image-compare--dragging')
		expect(root.style.getPropertyValue('--compare-position')).toBe('40%')
		await fireEvent.pointerUp(window)
		expect(root).not.toHaveClass('base-image-compare--dragging')
	})
})
