import { useMotion } from '../useMotion'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { UseMotionReturn } from '../types/useMotion.types'

function stubReducedMotion(matches: boolean): void {
	const query = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => query),
	)
}

function mountMotion(target?: () => Element | null): UseMotionReturn {
	let motion!: UseMotionReturn
	const TestComponent = defineComponent({
		setup() {
			motion = useMotion(target)
			return () => h('div')
		},
	})
	render(TestComponent)
	return motion
}

describe('useMotion', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('style')
		document.body.innerHTML = ''
	})

	it('без токенов — длительности пресета standard', () => {
		stubReducedMotion(false)
		const motion = mountMotion()

		expect(motion.isReduced.value).toBe(false)
		expect(motion.duration()).toBe(200)
		expect(motion.duration('fast')).toBe(150)
		expect(motion.duration('slow')).toBe(300)
		expect(motion.duration('xslow')).toBe(500)
	})

	it('читает токены элемента в мс и в с', () => {
		stubReducedMotion(false)
		const element = document.createElement('div')
		element.style.setProperty('--rise-duration', '120ms')
		element.style.setProperty('--rise-duration-xslow', '0.7s')
		document.body.append(element)

		const motion = mountMotion(() => element)

		expect(motion.duration('base')).toBe(120)
		expect(motion.duration('xslow')).toBe(700)
	})

	it('без элемента читает корень документа; длительность меньше 1 мс — 0', () => {
		stubReducedMotion(false)
		document.documentElement.style.setProperty('--rise-duration-slow', '0.01ms')
		document.documentElement.style.setProperty('--rise-duration-fast', 'auto')

		const motion = mountMotion(() => null)

		expect(motion.duration('slow')).toBe(0)
		expect(motion.duration('fast')).toBe(150)
	})

	it('системное «уменьшить движение» — isReduced и нулевые длительности', () => {
		stubReducedMotion(true)
		const motion = mountMotion()

		expect(motion.isReduced.value).toBe(true)
		expect(motion.duration('xslow')).toBe(0)
	})

	it('пресет none у предка выключает движение, другой пресет — нет', async () => {
		stubReducedMotion(false)
		const host = document.createElement('section')
		host.setAttribute('data-rise-motion', 'none')
		const element = document.createElement('div')
		host.append(element)
		document.body.append(host)
		const target = ref<Element | null>(element)

		const motion = mountMotion(() => target.value)
		await nextTick()
		expect(motion.isReduced.value).toBe(true)

		host.setAttribute('data-rise-motion', 'expressive')
		expect(mountMotion(() => target.value).isReduced.value).toBe(false)
	})
})
