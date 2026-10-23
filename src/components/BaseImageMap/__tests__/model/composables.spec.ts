import { render } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { useImageMapView } from '../../model/zoom/useImageMapView'
import { useImageMapObjects } from '../../model/useImageMapObjects'
import { useImageMapFocus } from '../../model/interaction/useImageMapFocus'

const STATE = { isTabbable: false, isActive: false, isHovered: false, isPulsing: false }

describe('composables BaseImageMap без слоя', () => {
	it('useImageMapObjects без слоя возвращает пустые списки', () => {
		const objects = useImageMapObjects({ getView: () => undefined, getState: () => STATE })
		expect(objects.points.value).toEqual([])
		expect(objects.shapes.value).toEqual([])
		expect(objects.svgBindings.value).toEqual([])
	})

	it('useImageMapFocus без слоя: нет объекта для Tab, переходы ничего не делают', () => {
		const focus = useImageMapFocus({
			stageRef: ref(null),
			getView: () => undefined,
			getActive: () => null,
			getRenderedSvgIds: () => new Set(),
		})
		expect(focus.tabbableId.value).toBeUndefined()
		focus.moveFocus('a', 'Home')
		focus.moveFocus('a', 'ArrowRight')
		expect(focus.focusId.value).toBeNull()
		expect(focus.isNavigationKey('Enter')).toBe(false)
		expect(focus.isNavigationKey('End')).toBe(true)
	})

	it('useImageMapView без окна карты держит нулевой кадр и масштаб 1', () => {
		let view: ReturnType<typeof useImageMapView> | undefined
		render(
			defineComponent({
				setup() {
					view = useImageMapView({
						viewportRef: ref(null),
						getLayer: () => undefined,
						getMaxZoom: () => 4,
						getInitArea: () => undefined,
					})
					return () => h('div')
				},
			}),
		)
		expect(view?.frame.value).toEqual({ viewportWidth: 0, viewportHeight: 0, stageWidth: 0, stageHeight: 0 })
		view?.zoomIn()
		expect(view?.view.value.scale).toBe(1.5)
		expect(view?.isMinZoom.value).toBe(false)
	})
})
