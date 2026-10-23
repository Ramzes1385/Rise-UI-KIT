import '@testing-library/jest-dom/vitest'
import { h, nextTick, ref } from 'vue'
import BaseAvatar from '../ui/BaseAvatar.vue'
import { render, screen } from '@testing-library/vue'
import type { BaseAvatarExpose } from '../types/BaseAvatar.types'
import { MASCOT_MOODS, toFaceVector, toMouthPath } from '../model/mascotShapes'
import { AVATAR_MASCOT_BLINK_HOLD, AVATAR_MASCOT_PUPIL_RANGE, AVATAR_MASCOTS } from '../types/BaseAvatar.types'

const RECT = { left: 0, top: 0, width: 40, height: 40, right: 40, bottom: 40, x: 0, y: 0, toJSON: () => ({}) } as DOMRect

let frames: Array<() => void> = []
let clock = 0

function stubReducedMotion(matches: boolean): (event: { matches: boolean }) => void {
	let notify: (event: { matches: boolean }) => void = () => undefined
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({
			matches,
			addEventListener: (_type: string, listener: typeof notify) => (notify = listener),
			removeEventListener: vi.fn(),
		})),
	)
	return event => notify(event)
}

async function flushFrames(limit = 400): Promise<number> {
	let count = 0
	while (frames.length && count < limit) {
		clock += 16
		frames.shift()?.()
		count++
	}
	await Promise.resolve()
	return count
}

function movePointer(clientX: number, clientY: number): void {
	document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY }))
}

const pupil = (container: Element): Element | null => container.querySelector('.base-avatar__mascot-pupil')
const eyes = (container: Element): Element | null => container.querySelector('.base-avatar__mascot-eyes')
const mouth = (container: Element): string | null | undefined => container.querySelector('.base-avatar__mascot-mouth')?.getAttribute('d')

describe('BaseAvatar: обводка и персонаж', () => {
	beforeEach(() => {
		frames = []
		clock = 0
		vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
		vi.spyOn(performance, 'now').mockImplementation(() => clock)
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: () => void) => frames.push(callback)),
		)
		vi.stubGlobal('cancelAnimationFrame', vi.fn())
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
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

	it.each(AVATAR_MASCOTS.filter(mascot => mascot !== 'none'))('рисует персонажа %s с общим лицом', mascot => {
		const { container } = render(BaseAvatar, { props: { mascot, isBlinking: false } })

		expect(container.querySelector(`.base-avatar__mascot--${mascot} .base-avatar__mascot-body`)).toBeInTheDocument()
		expect(container.querySelectorAll('.base-avatar__mascot-eye')).toHaveLength(2)
		expect(mouth(container)).toBe(toMouthPath(toFaceVector(MASCOT_MOODS.idle)))
	})

	it('зрачки и голова плавно идут за курсором и останавливаются ровно у цели', async () => {
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout', isBlinking: false } })
		await flushFrames()

		movePointer(1000, 20)
		movePointer(1020, 20)
		expect(frames).toHaveLength(1)
		clock += 16
		frames.shift()?.()
		await Promise.resolve()
		const firstX = Number(
			pupil(container)
				?.getAttribute('transform')
				?.match(/translate\(([^ ]+)/)?.[1],
		)
		expect(firstX).toBeGreaterThan(0)
		expect(firstX).toBeLessThan(AVATAR_MASCOT_PUPIL_RANGE)

		expect(await flushFrames()).toBeLessThan(400)
		expect(pupil(container)).toHaveAttribute('transform', `translate(${AVATAR_MASCOT_PUPIL_RANGE} 0)`)
		expect(container.querySelector('.base-avatar__mascot > g')).toHaveAttribute('transform', 'rotate(4 32 52)')
	})

	it('isEyesClosed плавно сжимает глаза и проявляет веки', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { mascot: 'sprout', isBlinking: false } })
		expect(container.querySelector('.base-avatar__mascot-lid')).toHaveAttribute('opacity', '0')

		await rerender({ isEyesClosed: true })
		expect(container.querySelector('.base-avatar__mascot--closed')).toBeInTheDocument()
		await flushFrames()
		expect(eyes(container)).toHaveAttribute('transform', 'scale(1 0.08)')
		expect(eyes(container)).toHaveAttribute('opacity', '0')
		expect(container.querySelector('.base-avatar__mascot-lid')).toHaveAttribute('opacity', '1')
	})

	it('mood перетекает в путь рта нового настроения, во взгляд и брови', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { mascot: 'cloud', isBlinking: false } })

		await rerender({ mood: 'thinking' })
		clock += 16
		frames.shift()?.()
		await Promise.resolve()
		expect(mouth(container)).not.toBe(toMouthPath(toFaceVector(MASCOT_MOODS.idle)))
		expect(mouth(container)).not.toBe(toMouthPath(toFaceVector(MASCOT_MOODS.thinking)))

		await flushFrames()
		expect(mouth(container)).toBe(toMouthPath(toFaceVector(MASCOT_MOODS.thinking)))
		expect(pupil(container)).toHaveAttribute('transform', 'translate(2 -2)')
		expect(container.querySelector('.base-avatar__mascot-brows')).toHaveAttribute('opacity', '1')
		expect(container.querySelector('.base-avatar__mascot--mood-thinking')).toBeInTheDocument()
	})

	it('react(mood, ms) ненадолго меняет настроение и возвращает mood из пропсов', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const avatar = ref<BaseAvatarExpose>()
		const { container } = render({ render: () => h(BaseAvatar, { ref: avatar, mascot: 'spark', isBlinking: false }) })

		avatar.value?.react('happy', 500)
		avatar.value?.react('surprised', 500)
		await Promise.resolve()
		expect(container.querySelector('.base-avatar__mascot--mood-surprised')).toBeInTheDocument()

		vi.advanceTimersByTime(500)
		await Promise.resolve()
		expect(container.querySelector('.base-avatar__mascot--mood-idle')).toBeInTheDocument()

		avatar.value?.react('sad')
		await Promise.resolve()
		vi.advanceTimersByTime(1199)
		await Promise.resolve()
		expect(container.querySelector('.base-avatar__mascot--mood-sad')).toBeInTheDocument()
	})

	it('моргает через 2,5–6 с, иногда дважды, и снова ждёт', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const random = vi.spyOn(Math, 'random').mockReturnValue(0)
		const { container, unmount } = render(BaseAvatar, { props: { mascot: 'pebble' } })
		const closedEye = async (): Promise<string | null | undefined> => {
			await nextTick()
			await flushFrames()
			return eyes(container)?.getAttribute('transform')
		}

		vi.advanceTimersByTime(2499)
		expect(await closedEye()).toBe('scale(1 1)')
		vi.advanceTimersByTime(1)
		expect(await closedEye()).toBe('scale(1 0.08)')
		vi.advanceTimersByTime(AVATAR_MASCOT_BLINK_HOLD)
		expect(await closedEye()).toBe('scale(1 1)')
		vi.advanceTimersByTime(AVATAR_MASCOT_BLINK_HOLD)
		expect(await closedEye()).toBe('scale(1 0.08)')

		random.mockReturnValue(0.99)
		vi.advanceTimersByTime(AVATAR_MASCOT_BLINK_HOLD)
		expect(await closedEye()).toBe('scale(1 1)')
		vi.advanceTimersByTime(5964)
		expect(await closedEye()).toBe('scale(1 1)')
		vi.advanceTimersByTime(1)
		expect(await closedEye()).toBe('scale(1 0.08)')
		vi.advanceTimersByTime(AVATAR_MASCOT_BLINK_HOLD)
		expect(await closedEye()).toBe('scale(1 1)')
		unmount()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('isBlinking: false — не моргает, и включение на лету запускает моргание', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		vi.spyOn(Math, 'random').mockReturnValue(0)
		const { rerender } = render(BaseAvatar, { props: { mascot: 'droplet', isBlinking: false } })

		expect(vi.getTimerCount()).toBe(0)
		await rerender({ isBlinking: true })
		expect(vi.getTimerCount()).toBe(1)
		await rerender({ isBlinking: false })
		expect(vi.getTimerCount()).toBe(0)
	})

	it('при prefers-reduced-motion: зрачки в центре, без наклона и моргания, настроение — сразу', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		stubReducedMotion(true)
		const { container, rerender } = render(BaseAvatar, { props: { mascot: 'sprout', mood: 'thinking' } })
		await flushFrames()

		movePointer(1000, 20)
		expect(await flushFrames()).toBe(1)
		expect(pupil(container)).toHaveAttribute('transform', 'translate(0 0)')
		expect(container.querySelector('.base-avatar__mascot > g')).toHaveAttribute('transform', 'rotate(0 32 52)')
		expect(vi.getTimerCount()).toBe(0)

		await rerender({ mood: 'sad' })
		expect(await flushFrames()).toBe(1)
		expect(mouth(container)).toBe(toMouthPath(toFaceVector(MASCOT_MOODS.sad)))
	})

	it('внутри data-rise-motion="none" персонаж неподвижен, как при уменьшении движения', async () => {
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout' }, container: host })

		movePointer(1000, 20)
		await flushFrames()
		expect(pupil(container)).toHaveAttribute('transform', 'translate(0 0)')
		host.remove()
	})

	it('включение уменьшения движения на лету возвращает взгляд в центр', async () => {
		const notify = stubReducedMotion(false)
		const { container } = render(BaseAvatar, { props: { mascot: 'sprout', isBlinking: false } })
		movePointer(1000, 20)
		await flushFrames()
		expect(pupil(container)).toHaveAttribute('transform', `translate(${AVATAR_MASCOT_PUPIL_RANGE} 0)`)

		notify({ matches: true })
		await Promise.resolve()
		await flushFrames()
		expect(pupil(container)).toHaveAttribute('transform', 'translate(0 0)')
	})

	it('после размонтирования слушатель снят и кадры не заводятся', async () => {
		const { unmount } = render(BaseAvatar, { props: { mascot: 'sprout', isBlinking: false } })
		await flushFrames()
		unmount()

		movePointer(10, 10)
		expect(frames).toHaveLength(0)
	})
})
