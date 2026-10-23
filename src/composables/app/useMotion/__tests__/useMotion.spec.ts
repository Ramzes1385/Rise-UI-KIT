import type { Ref } from 'vue'
import { useMotion } from '../useMotion'
import { render } from '@testing-library/vue'
import { createUiKitPlugin } from '../../../../plugin'
import type { UseMotionReturn } from '../types/useMotion.types'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { isMotionReduced, readMotionDuration, readMotionEasing, readMotionPreset } from '../motionTokens'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function mountMotion(target?: Ref<Element | null> | (() => Element | null)): { motion: UseMotionReturn; unmount: () => void } {
	let motion!: UseMotionReturn
	const TestComponent = defineComponent({
		setup() {
			motion = useMotion(target)
			return () => h('div')
		},
	})
	const { unmount } = render(TestComponent)
	return { motion, unmount }
}

function area(preset?: string): HTMLElement {
	const parent = document.createElement('section')
	if (preset) parent.setAttribute('data-rise-motion', preset)
	const child = document.createElement('div')
	parent.append(child)
	document.body.append(parent)
	return child
}

const root = document.documentElement

describe('useMotion', () => {
	beforeEach(() => {
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		root.removeAttribute('data-rise-motion')
		root.removeAttribute('data-rise-reduced-motion')
		root.style.removeProperty('--rise-duration')
		document.body.innerHTML = ''
	})

	describe('пресет', () => {
		it('без атрибута — standard, длительности пресета', () => {
			const { motion } = mountMotion()

			expect(motion.preset.value).toBe('standard')
			expect(motion.isReduced.value).toBe(false)
			expect(motion.duration()).toBe(200)
			expect(motion.duration('fast')).toBe(140)
			expect(motion.duration('slow')).toBe(320)
			expect(motion.duration('xslow')).toBe(500)
		})

		it('пресет ближайшего предка элемента, а не <html>', () => {
			root.setAttribute('data-rise-motion', 'subtle')
			const el = area('expressive')

			const { motion } = mountMotion(ref(el))

			expect(motion.preset.value).toBe('expressive')
			expect(motion.duration('slow')).toBe(420)
		})

		it('неизвестное значение атрибута — standard', () => {
			const { motion } = mountMotion(() => area('turbo'))

			expect(motion.preset.value).toBe('standard')
		})

		it('меняется вместе с атрибутом', async () => {
			const { motion } = mountMotion()

			root.setAttribute('data-rise-motion', 'expressive')
			await vi.waitFor(() => expect(motion.preset.value).toBe('expressive'))

			root.setAttribute('data-rise-motion', 'none')
			await vi.waitFor(() => expect(motion.isReduced.value).toBe(true))
			expect(motion.duration('slow')).toBe(0)
		})

		it('меняется вместе с элементом в ref', async () => {
			const target = ref<Element | null>(area('subtle'))
			const { motion } = mountMotion(target)
			expect(motion.preset.value).toBe('subtle')

			target.value = area('expressive')
			await nextTick()

			expect(motion.preset.value).toBe('expressive')
		})

		it('одно наблюдение за атрибутами на все экземпляры: после размонтирования всех — снимается', async () => {
			const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
			const first = mountMotion()
			const second = mountMotion()

			first.unmount()
			expect(disconnect).not.toHaveBeenCalled()
			root.setAttribute('data-rise-motion', 'subtle')
			await vi.waitFor(() => expect(second.motion.preset.value).toBe('subtle'))

			second.unmount()
			expect(disconnect).toHaveBeenCalledTimes(1)
		})

		it('без MutationObserver — пресет читается при обращении, без подписки', () => {
			vi.stubGlobal('MutationObserver', undefined)

			const { motion, unmount } = mountMotion()

			expect(motion.preset.value).toBe('standard')
			expect(() => unmount()).not.toThrow()
		})
	})

	describe('движение выключено', () => {
		it('системное «уменьшить движение»: isReduced и длительность 0', () => {
			stubReducedMotion(true)

			const { motion } = mountMotion()

			expect(motion.isReduced.value).toBe(true)
			expect(motion.duration('slow')).toBe(0)
		})

		it('reducedMotion: always (атрибут на <html>) главнее пресета области', () => {
			root.setAttribute('data-rise-reduced-motion', 'always')

			const { motion } = mountMotion(() => area('expressive'))

			expect(motion.preset.value).toBe('expressive')
			expect(motion.isReduced.value).toBe(true)
			expect(motion.duration()).toBe(0)
		})

		it('пресет none — isReduced', () => {
			const { motion } = mountMotion(() => area('none'))

			expect(motion.isReduced.value).toBe(true)
		})
	})

	describe('токены из CSS', () => {
		it('длительность берётся из вычисленного стиля: ms и s', () => {
			root.style.setProperty('--rise-duration', '0.25s')
			const { motion } = mountMotion()
			expect(motion.duration()).toBe(250)

			root.style.setProperty('--rise-duration', '120ms')
			expect(motion.duration()).toBe(120)
		})

		it('длительность короче 1 мс (reduce в CSS) — 0', () => {
			root.style.setProperty('--rise-duration', '0.01ms')

			expect(readMotionDuration()).toBe(0)
		})

		it('не длительность — значение пресета', () => {
			root.style.setProperty('--rise-duration', 'auto')

			expect(readMotionDuration()).toBe(200)
		})

		it('кривая — из токена', () => {
			const { motion } = mountMotion()
			expect(motion.easing().replace(/\s/g, '')).toBe('cubic-bezier(0.2,0.8,0.2,1)')
			expect(motion.easing('spring').replace(/\s/g, '')).toBe('cubic-bezier(0.2,0,0,1)')

			root.style.setProperty('--rise-ease-spring', 'linear(0, 1)')
			expect(motion.easing('spring')).toBe('linear(0, 1)')
			root.style.removeProperty('--rise-ease-spring')
		})

		it('без getComputedStyle — значения пресета', () => {
			vi.stubGlobal('getComputedStyle', undefined)

			expect(readMotionDuration(area('expressive'), 'fast')).toBe(180)
			expect(readMotionEasing(null, 'out')).toBe('cubic-bezier(0.16, 1, 0.3, 1)')
			expect(readMotionEasing(area('expressive'), 'in')).toBe('cubic-bezier(0.7, 0, 0.84, 0)')
			expect(readMotionEasing()).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)')
		})
	})

	describe('функции для кода вне setup', () => {
		it('readMotionPreset и isMotionReduced — по элементу и по <html>', () => {
			root.setAttribute('data-rise-motion', 'subtle')

			expect(readMotionPreset()).toBe('subtle')
			expect(readMotionPreset(area('none'))).toBe('none')
			expect(isMotionReduced(area('none'))).toBe(true)
			expect(isMotionReduced()).toBe(false)
			expect(readMotionDuration(undefined, 'xslow')).toBe(300)
		})

		it('без matchMedia — системной настройки нет', () => {
			vi.stubGlobal('matchMedia', undefined)

			expect(isMotionReduced()).toBe(false)
		})

		it('без document (SSR) — standard и значения пресета', () => {
			vi.stubGlobal('document', undefined)
			vi.stubGlobal('window', undefined)

			expect(readMotionPreset()).toBe('standard')
			expect(isMotionReduced()).toBe(false)
			expect(readMotionDuration(null, 'slow')).toBe(320)
		})
	})

	describe('плагин', () => {
		it('motion ставит атрибут на <html>, reducedMotion: always — свой атрибут', () => {
			createApp({ render: () => null }).use(createUiKitPlugin({ motion: 'expressive', reducedMotion: 'always' }))

			expect(root.getAttribute('data-rise-motion')).toBe('expressive')
			expect(root.getAttribute('data-rise-reduced-motion')).toBe('always')
		})

		it('атрибут, уже поставленный приложением, не перезаписывается; reducedMotion: user ничего не ставит', () => {
			root.setAttribute('data-rise-motion', 'subtle')

			createApp({ render: () => null }).use(createUiKitPlugin({ motion: 'expressive', reducedMotion: 'user' }))

			expect(root.getAttribute('data-rise-motion')).toBe('subtle')
			expect(root.hasAttribute('data-rise-reduced-motion')).toBe(false)
		})

		it('без опций движения атрибутов нет', () => {
			createApp({ render: () => null }).use(createUiKitPlugin())

			expect(root.hasAttribute('data-rise-motion')).toBe(false)
		})
	})
})
