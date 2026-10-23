import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { defineComponent, h, nextTick, ref } from 'vue'

interface StyleLog {
	heights: string[]
	transitions: string[]
}

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function emulateLayout(textarea: HTMLTextAreaElement, getContentHeight: () => number): StyleLog {
	const log: StyleLog = { heights: [], transitions: [] }
	const proto = Object.getPrototypeOf(textarea.style) as object
	const height = Object.getOwnPropertyDescriptor(proto, 'height')!
	const transition = Object.getOwnPropertyDescriptor(proto, 'transition')!
	Object.defineProperty(textarea.style, 'height', {
		configurable: true,
		get: () => height.get!.call(textarea.style) as string,
		set: (value: string) => {
			log.heights.push(value)
			height.set!.call(textarea.style, value)
		},
	})
	Object.defineProperty(textarea.style, 'transition', {
		configurable: true,
		get: () => transition.get!.call(textarea.style) as string,
		set: (value: string) => {
			log.transitions.push(value)
			transition.set!.call(textarea.style, value)
		},
	})
	Object.defineProperty(textarea, 'scrollHeight', { configurable: true, get: getContentHeight })
	Object.defineProperty(textarea, 'offsetHeight', {
		configurable: true,
		get: () => Number.parseFloat(textarea.style.height) || 0,
	})
	return log
}

async function grow(): Promise<{ textarea: HTMLTextAreaElement; log: StyleLog }> {
	const { container, rerender } = render(BaseTextarea, { props: { modelValue: 'Строка', isAutosize: true } })
	const textarea = container.querySelector('textarea')!
	await nextTick()
	textarea.style.height = '30px'
	const log = emulateLayout(textarea, () => 90)
	await rerender({ modelValue: 'Строка\nСтрока\nСтрока' })
	await nextTick()
	return { textarea, log }
}

describe('BaseTextarea: движение автороста', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('обычный режим: высота идёт от прежней к новой, переход на время замера выключен', async () => {
		stubReducedMotion(false)
		const { textarea, log } = await grow()

		expect(log.heights).toEqual(['auto', '30px', '90px'])
		expect(log.transitions).toEqual(['none', ''])
		expect(textarea.style.height).toBe('90px')
	})

	it('prefers-reduced-motion: сразу конечная высота, без промежуточной', async () => {
		stubReducedMotion(true)
		const { textarea, log } = await grow()

		expect(log.heights).toEqual(['auto', '90px'])
		expect(log.transitions).toEqual([])
		expect(textarea.style.height).toBe('90px')
	})

	it('пресет none: сразу конечная высота', async () => {
		stubReducedMotion(false)
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { log } = await grow()

		expect(log.heights).toEqual(['auto', '90px'])
	})

	it('ввод с v-model подгоняет высоту один раз за такт', async () => {
		stubReducedMotion(false)
		const Host = defineComponent({
			setup() {
				const text = ref('')
				return () =>
					h(BaseTextarea, {
						modelValue: text.value,
						isAutosize: true,
						'onUpdate:modelValue': (value: string) => (text.value = value),
					})
			},
		})
		const { container } = render(Host)
		const textarea = container.querySelector('textarea')!
		await nextTick()
		textarea.style.height = '30px'
		const log = emulateLayout(textarea, () => 60)

		textarea.value = 'а'
		textarea.dispatchEvent(new Event('input'))
		await nextTick()
		await nextTick()

		expect(log.heights).toEqual(['auto', '30px', '60px'])
	})
})
