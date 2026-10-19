import { reactive } from 'vue'
import { runInHost } from '../../flowUi'
import { useBaseFlowMap } from '../../../../../model/useBaseFlowMap'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../../../../../types/BaseFlowMap.types'

describe('useBaseFlowMap без значений по умолчанию компонента', () => {
	it('пределы масштаба, порог компактности и панели берут запасные значения', () => {
		const props = reactive({ data: { version: 1, nodes: [], edges: [] } }) as unknown as BaseFlowMapProps
		const { value } = runInHost(() => useBaseFlowMap(props, vi.fn() as unknown as BaseFlowMapEmits))
		expect(value.hasToolbar.value).toBe(true)
		expect(value.hasSearch.value).toBe(false)
		expect(value.isCompact.value).toBe(false)
		expect(value.label.value).toBeTruthy()
		expect(value.rootStyle.value).toEqual({ height: undefined })
		value.model.controller.setViewport({ x: 0, y: 0, zoom: 9 })
		expect(value.model.controller.getViewport().zoom).toBe(3)
		value.model.controller.setViewport({ x: 0, y: 0, zoom: 0.01 })
		expect(value.model.controller.getViewport().zoom).toBe(0.2)
	})
})
