import { reactive } from 'vue'
import { runInHost } from '../../flowUi'
import { useBaseFlowMap } from '../../../../../model/useBaseFlowMap'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../../../../../types/BaseFlowMap.types'

function modelOf(mode: BaseFlowMapProps['mode']) {
	const props = reactive({ mode, data: { version: 1, nodes: [], edges: [] } }) as unknown as BaseFlowMapProps
	const { value } = runInHost(() => useBaseFlowMap(props, vi.fn() as unknown as BaseFlowMapEmits))
	const edit = value.editing.context.env.state
	return { props, map: value, edit }
}

describe('useBaseFlowMap: признаки режима', () => {
	it('режим «Правка» включает правку и не включает ревью', () => {
		const { map, edit } = modelOf('edit')
		expect(edit.isEditing.value).toBe(true)
		expect(edit.isActive.value).toBe(true)
		expect(map.review.isActive.value).toBe(false)
	})

	it('режим «Ревью» включает ревью и общую активность правки, но не саму правку', () => {
		const { map, edit } = modelOf('review')
		expect(edit.isEditing.value).toBe(false)
		expect(edit.isActive.value).toBe(true)
		expect(map.review.isActive.value).toBe(true)
	})

	it('в режиме просмотра все признаки выключены, а при смене режима признаки следуют за ним', () => {
		const { map, props, edit } = modelOf('view')
		expect(edit.isActive.value).toBe(false)
		expect(map.review.isActive.value).toBe(false)
		props.mode = 'edit'
		expect(edit.isEditing.value).toBe(true)
		expect(map.review.isActive.value).toBe(false)
		props.mode = 'review'
		expect(edit.isEditing.value).toBe(false)
		expect(edit.isActive.value).toBe(true)
		expect(map.review.isActive.value).toBe(true)
	})
})
