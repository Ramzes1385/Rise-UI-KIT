import { nextTick, reactive, ref } from 'vue'
import { runInSetup } from '../../fixtures/model.test-utils'
import { useRoadmap3DView } from '../../../model/view/useRoadmap3DView'
import { mockWebGL } from '../../../../BaseImageMap3D/__tests__/imageMap3d.test-utils'
import type { Roadmap3DProps, Roadmap3DView } from '../../../types/BaseRoadmap3D.types'

function mountView(options: { view?: Roadmap3DView; isSupported?: boolean } = {}) {
	mockWebGL(options.isSupported ?? true)
	const props = reactive({ view: options.view ?? '3d', data: { id: 1 } })
	const emit = vi.fn()
	const isReviewing = ref(false)
	const { result: view } = runInSetup(() =>
		useRoadmap3DView({ props: props as unknown as Roadmap3DProps, emit: emit as never, isReviewing }),
	)
	return { view, props, emit, isReviewing }
}

afterEach(() => vi.restoreAllMocks())

describe('useRoadmap3DView', () => {
	it('показывает 3D, пока WebGL есть', async () => {
		const { view } = mountView()
		await nextTick()
		expect(view.shownView.value).toBe('3d')
		expect(view.fallback.isSupported.value).toBe(true)
	})

	it('проп view меняет вид; setView сообщает наружу только при смене', async () => {
		const { view, props, emit } = mountView()
		props.view = '2d'
		await nextTick()
		expect(view.shownView.value).toBe('2d')
		view.setView('2d')
		expect(emit).not.toHaveBeenCalled()
		view.setView('3d')
		expect(emit).toHaveBeenCalledWith('update:view', '3d')
	})

	it('нет WebGL — 2D и событие fallback: unsupported; 2D по просьбе сбоем не считается', async () => {
		const { view, emit } = mountView({ isSupported: false })
		await nextTick()
		expect(view.shownView.value).toBe('2d')
		expect(view.fallback.statusText.value).toContain('не поддерживает 3D')
		expect(emit).toHaveBeenCalledWith('fallback', 'unsupported')
		const asked = mountView({ view: '2d', isSupported: false })
		await nextTick()
		expect(asked.emit).not.toHaveBeenCalled()
	})

	it('ошибка рендерера — 2D и fallback: error; возврат в 3D и смена данных снимают ошибку', async () => {
		const { view, props, emit } = mountView()
		await nextTick()
		view.fallback.hasRenderError.value = true
		await nextTick()
		expect(view.shownView.value).toBe('2d')
		expect(emit).toHaveBeenCalledWith('fallback', 'error')
		props.data = { id: 2 }
		await nextTick()
		expect(view.shownView.value).toBe('3d')
		view.fallback.hasRenderError.value = true
		view.setView('3d')
		expect(view.fallback.hasRenderError.value).toBe(false)
		view.fallback.hasRenderError.value = true
		props.view = '2d'
		await nextTick()
		props.view = '3d'
		await nextTick()
		expect(view.fallback.hasRenderError.value).toBe(false)
	})

	it('режим проверки показывает 2D', async () => {
		const { view, isReviewing } = mountView()
		await nextTick()
		isReviewing.value = true
		expect(view.shownView.value).toBe('2d')
	})
})
