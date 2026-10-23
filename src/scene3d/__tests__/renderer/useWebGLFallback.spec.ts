import { render } from '@testing-library/vue'
import { UI_SCENE_3D } from '@/locales/messages'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { useWebGLFallback } from '../../renderer/useWebGLFallback'
import type { Scene3DFallbackOptions } from '../../types/internal/scene3dInternal.types'

function stubWebGL(isSupported: boolean) {
	const context = { getExtension: () => ({ loseContext: vi.fn() }) }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
		isSupported && type === 'webgl2' ? context : null) as never)
}

function mount(view: '2d' | '3d' = '3d', extra: Partial<Scene3DFallbackOptions> = {}) {
	const state = reactive({ view })
	const onFallback = vi.fn()
	let api!: ReturnType<typeof useWebGLFallback>
	render(
		defineComponent({
			setup() {
				api = useWebGLFallback({ getView: () => state.view, onFallback, ...extra })
				return () => h('div')
			},
		}),
	)
	return { api, onFallback, state }
}

describe('useWebGLFallback', () => {
	it('WebGL есть: причины нет, текст пуст', async () => {
		stubWebGL(true)
		const { api, onFallback } = mount()
		await nextTick()
		expect(api.isSupported.value).toBe(true)
		expect(api.reason.value).toBeNull()
		expect(api.statusText.value).toBe('')
		expect(onFallback).not.toHaveBeenCalled()
	})

	it('WebGL нет: unsupported, текст из словаря, onFallback один раз', async () => {
		stubWebGL(false)
		const { api, onFallback } = mount()
		await nextTick()
		expect(api.reason.value).toBe('unsupported')
		expect(api.statusText.value).toBe(UI_SCENE_3D.FALLBACK_UNSUPPORTED)
		expect(onFallback).toHaveBeenCalledExactlyOnceWith('unsupported')
	})

	it('рендерер не запустился: error; unsupported важнее error', async () => {
		stubWebGL(true)
		const { api, onFallback } = mount()
		await nextTick()
		api.hasRenderError.value = true
		await nextTick()
		expect(api.reason.value).toBe('error')
		expect(api.statusText.value).toBe(UI_SCENE_3D.FALLBACK_ERROR)
		expect(onFallback).toHaveBeenCalledWith('error')
		api.isSupported.value = false
		expect(api.reason.value).toBe('unsupported')
	})

	it('причина пропала (вернули 2D по просьбе): onFallback не зовётся повторно', async () => {
		stubWebGL(false)
		const { api, onFallback, state } = mount()
		await nextTick()
		state.view = '2d'
		await nextTick()
		expect(api.reason.value).toBeNull()
		expect(onFallback).toHaveBeenCalledTimes(1)
	})

	it('2D-вид по просьбе сбоем не считается', async () => {
		stubWebGL(false)
		const { api, onFallback } = mount('2d')
		await nextTick()
		api.hasRenderError.value = true
		expect(api.reason.value).toBeNull()
		expect(onFallback).not.toHaveBeenCalled()
	})

	it('getMessages подменяет тексты и читается при каждом обращении', async () => {
		stubWebGL(false)
		const language = ref('ru')
		const { api } = mount('3d', { getMessages: () => ({ unsupported: `u-${language.value}`, error: `e-${language.value}` }) })
		await nextTick()
		expect(api.statusText.value).toBe('u-ru')
		language.value = 'en'
		expect(api.statusText.value).toBe('u-en')
	})
})
