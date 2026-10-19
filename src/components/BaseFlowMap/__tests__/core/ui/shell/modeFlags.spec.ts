import { reactive } from 'vue'
import { runInHost } from '../flowUi'
import { useBaseFlowMap } from '../../../../model/useBaseFlowMap'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../../../../types/BaseFlowMap.types'

function modelOf(mode: BaseFlowMapProps['mode']) {
	const props = reactive({ mode, data: { version: 1, nodes: [], edges: [] } }) as unknown as BaseFlowMapProps
	const { value } = runInHost(() => useBaseFlowMap(props, vi.fn() as unknown as BaseFlowMapEmits))
	return { props, map: value }
}

describe('useBaseFlowMap: признаки режима', () => {
	it('режим «Правка» включает только признак правки', () => {
		const { map } = modelOf('edit')
		expect(map.editing.isActive.value).toBe(true)
		expect(map.review.isActive.value).toBe(false)
	})

	it('режим «Ревью» включает только признак ревью', () => {
		const { map } = modelOf('review')
		expect(map.editing.isActive.value).toBe(false)
		expect(map.review.isActive.value).toBe(true)
	})

	it('в режиме просмотра оба признака выключены, а при смене режима признаки следуют за ним', () => {
		const { map, props } = modelOf('view')
		expect(map.editing.isActive.value).toBe(false)
		expect(map.review.isActive.value).toBe(false)
		props.mode = 'edit'
		expect(map.editing.isActive.value).toBe(true)
		props.mode = 'review'
		expect(map.editing.isActive.value).toBe(false)
		expect(map.review.isActive.value).toBe(true)
	})
})
