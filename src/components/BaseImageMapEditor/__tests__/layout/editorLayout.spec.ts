import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { effectScope, nextTick, ref } from 'vue'
import { useEditorNarrow } from '../../model/layout/useEditorNarrow'
import { useEditorSections } from '../../model/layout/useEditorSections'

function makeRoot(width: number, padding = 0): HTMLElement {
	const root = document.createElement('div')
	Object.defineProperty(root, 'clientWidth', { configurable: true, value: width })
	root.style.paddingLeft = `${padding}px`
	root.style.paddingRight = `${padding}px`
	document.body.append(root)
	return root
}

let resizeCallback: (() => void) | undefined
const disconnect = vi.fn()

beforeEach(() => {
	resizeCallback = undefined
	disconnect.mockReset()
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: () => void) {
				resizeCallback = callback
			}
			observe() {}
			unobserve() {}
			disconnect = disconnect
		},
	)
})

afterEach(() => {
	vi.unstubAllGlobals()
	document.body.innerHTML = ''
})

function mountNarrow(root: HTMLElement | null) {
	let result!: ReturnType<typeof useEditorNarrow>
	const wrapper = mount(
		defineComponent({
			setup() {
				result = useEditorNarrow(ref(root))
				return () => h('div')
			},
		}),
	)
	return { wrapper, result }
}

describe('useEditorNarrow', () => {
	it('ширина содержимого корня ниже 760 px — узкая раскладка; padding корня вычитается', async () => {
		const narrow = mountNarrow(makeRoot(770, 8))
		expect(narrow.result.isNarrow.value).toBe(true)
		const wide = mountNarrow(makeRoot(780, 8))
		expect(wide.result.isNarrow.value).toBe(false)
		await nextTick()
		expect(wide.result.isReady.value).toBe(true)
	})

	it('нулевая ширина (корень скрыт или нет layout) — не узкая; корня нет — не узкая', () => {
		expect(mountNarrow(makeRoot(0)).result.isNarrow.value).toBe(false)
		expect(mountNarrow(null).result.isNarrow.value).toBe(false)
	})

	it('пересчитывается при изменении размера и отключает наблюдатель при размонтировании', () => {
		const root = makeRoot(1000)
		const { wrapper, result } = mountNarrow(root)
		expect(result.isNarrow.value).toBe(false)
		Object.defineProperty(root, 'clientWidth', { configurable: true, value: 500 })
		resizeCallback?.()
		expect(result.isNarrow.value).toBe(true)
		wrapper.unmount()
		expect(disconnect).toHaveBeenCalled()
	})

	it('без ResizeObserver замер один раз при монтировании', () => {
		vi.stubGlobal('ResizeObserver', undefined)
		expect(mountNarrow(makeRoot(500)).result.isNarrow.value).toBe(true)
	})
})

describe('useEditorSections', () => {
	function make(options: { isNarrow: boolean; hasLayer?: boolean; hasSelection?: boolean }) {
		const isNarrow = ref(options.isNarrow)
		const state = { hasLayer: options.hasLayer ?? true, hasSelection: options.hasSelection ?? false }
		const scope = effectScope()
		const sections = scope.run(() =>
			useEditorSections({ isNarrow, isReady: ref(true) }, { hasLayer: () => state.hasLayer, hasSelection: () => state.hasSelection }),
		)!
		return { sections, isNarrow, state }
	}

	it('на широкой раскладке все разделы раскрыты', () => {
		const { sections } = make({ isNarrow: false })
		expect(sections.isOpen('filters')).toBe(true)
		expect(sections.isOpen('groups')).toBe(true)
	})

	it('на узкой по умолчанию раскрыт только первый раздел: «Объекты слоя», а без этажа — «Этажи»', () => {
		const withLayer = make({ isNarrow: true })
		expect(
			['objects', 'properties', 'layers', 'scene3d', 'filters', 'styles', 'groups'].filter(id =>
				withLayer.sections.isOpen(id as 'objects'),
			),
		).toEqual(['objects'])
		const noLayer = make({ isNarrow: true, hasLayer: false })
		expect(noLayer.sections.isOpen('layers')).toBe(true)
		expect(noLayer.sections.isOpen('objects')).toBe(false)
	})

	it('выделенный объект раскрывает его свойства по умолчанию', () => {
		const { sections, state } = make({ isNarrow: true, hasSelection: true })
		expect(sections.isOpen('properties')).toBe(true)
		state.hasSelection = false
		expect(sections.isOpen('properties')).toBe(false)
	})

	it('выбор пользователя сильнее умолчания и переживает смену ширины', () => {
		const { sections, isNarrow } = make({ isNarrow: true })
		sections.toggle('objects')
		sections.toggle('filters')
		expect(sections.isOpen('objects')).toBe(false)
		expect(sections.isOpen('filters')).toBe(true)
		isNarrow.value = false
		expect(sections.isOpen('objects')).toBe(true)
		isNarrow.value = true
		expect(sections.isOpen('objects')).toBe(false)
		sections.toggle('objects')
		expect(sections.isOpen('objects')).toBe(true)
	})
})
