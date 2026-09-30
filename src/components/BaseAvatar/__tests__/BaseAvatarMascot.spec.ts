import '@testing-library/jest-dom/vitest'
import BaseAvatar from '../ui/BaseAvatar.vue'
import { render, screen } from '@testing-library/vue'
import { AVATAR_MASCOT_PUPIL_RANGE } from '../types/BaseAvatar.types'

const RECT = { left: 0, top: 0, width: 40, height: 40, right: 40, bottom: 40, x: 0, y: 0, toJSON: () => ({}) } as DOMRect

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches })),
	)
}

function stubFrames(): Array<() => void> {
	const frames: Array<() => void> = []
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: () => void) => frames.push(callback)),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	return frames
}

function movePointer(clientX: number, clientY: number): void {
	document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }))
}

function pupils(container: Element): Element | null {
	return container.querySelector('.base-avatar__mascot-pupils')
}

describe('BaseAvatar: обводка и персонаж', () => {
	beforeEach(() => {
		vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('ставит класс обводки только для gradient и shimmer', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { name: 'Анна' } })
		expect(container.querySelector('.base-avatar')?.className).not.toContain('ring')

		await rerender({ ring: 'gradient' })
		expect(container.querySelector('.base-avatar--ring-gradient')).toBeInTheDocument()

		await rerender({ ring: 'shimmer' })
		expect(container.querySelector('.base-avatar--ring-shimmer')).toBeInTheDocument()
	})

	it('показывает персонажа вместо изображения и подписывает его alt', () => {
		render(BaseAvatar, { props: { mascot: 'sprout', src: '/a.jpg', alt: 'Росток' } })

		const mascot = screen.getByRole('img', { name: 'Росток' })
		expect(mascot.tagName.toLowerCase()).toBe('svg')
		expect(document.querySelector('.base-avatar__img')).not.toBeInTheDocument()
	})

	it('без alt персонаж декоративный', () => {
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout' } })

		expect(container.querySelector('.base-avatar__mascot')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-avatar__mascot')).not.toHaveAttribute('role')
	})

	it('закрывает глаза по isEyesClosed', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { mascot: 'sprout', isEyesClosed: true } })
		expect(container.querySelector('.base-avatar__mascot-lids')).toBeInTheDocument()
		expect(pupils(container)).not.toBeInTheDocument()

		await rerender({ isEyesClosed: false })
		expect(pupils(container)).toBeInTheDocument()
	})

	it('зрачки следят за курсором, не дальше края глаза, одним кадром на серию движений', async () => {
		stubReducedMotion(false)
		const frames = stubFrames()
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout' } })

		movePointer(1000, 20)
		movePointer(1020, 20)
		expect(frames).toHaveLength(1)
		frames.shift()?.()
		await Promise.resolve()
		expect(pupils(container)).toHaveAttribute('transform', `translate(${AVATAR_MASCOT_PUPIL_RANGE} 0)`)

		movePointer(20, 100)
		frames.shift()?.()
		await Promise.resolve()
		expect(pupils(container)).toHaveAttribute('transform', 'translate(0 1.5)')

		movePointer(20, 20)
		frames.shift()?.()
		await Promise.resolve()
		expect(pupils(container)).toHaveAttribute('transform', 'translate(0 0)')
	})

	it('при prefers-reduced-motion смотрит прямо', async () => {
		stubReducedMotion(true)
		const frames = stubFrames()
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout' } })

		movePointer(1000, 20)
		await Promise.resolve()
		expect(frames).toHaveLength(0)
		expect(pupils(container)).toHaveAttribute('transform', 'translate(0 0)')
	})

	it('кадр после размонтирования ничего не меняет, слушатель снимается', () => {
		stubReducedMotion(false)
		const frames = stubFrames()
		const { unmount } = render(BaseAvatar, { props: { mascot: 'sprout' } })

		movePointer(1000, 20)
		unmount()
		expect(cancelAnimationFrame).toHaveBeenCalled()
		expect(() => frames.shift()?.()).not.toThrow()

		movePointer(10, 10)
		expect(frames).toHaveLength(0)
	})
})
