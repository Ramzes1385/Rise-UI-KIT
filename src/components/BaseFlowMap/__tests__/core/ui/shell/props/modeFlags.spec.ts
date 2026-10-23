import { reactive } from 'vue'
import { runInHost } from '../../flowUi'
import { useBaseFlowMap } from '../../../../../model/useBaseFlowMap'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../../../../../types/BaseFlowMap.types'

function modelOf(mode: BaseFlowMapProps['mode']) {
	const props = reactive({ mode, data: { version: 1, nodes: [], edges: [] } }) as unknown as BaseFlowMapProps
	const { value } = runInHost(() => useBaseFlowMap(props, vi.fn() as unknown as BaseFlowMapEmits))
	const edit = () => value.editing.value?.context.env.state
	return { props, map: value, edit }
}

const LOAD = { timeout: 15000 }
const idle = () => new Promise(resolve => setTimeout(resolve, 30))

describe('useBaseFlowMap: признаки режима', () => {
	it('режим «Правка» грузит только правку: до загрузки она не включена, после — включена целиком', async () => {
		const { map, edit } = modelOf('edit')
		expect(map.isEditLoaded.value).toBe(false)
		expect(edit()).toBeUndefined()
		await vi.waitFor(() => expect(map.isEditLoaded.value).toBe(true), LOAD)
		expect(edit()?.isEditing.value).toBe(true)
		expect(edit()?.isActive.value).toBe(true)
		expect(map.review.value).toBeNull()
		expect(map.isReviewLoaded.value).toBe(false)
	})

	it('режим «Ревью» грузит ревью и модель правки для жестов, но интерфейс правки не включает', async () => {
		const { map } = modelOf('review')
		expect(map.isReviewLoaded.value).toBe(false)
		await vi.waitFor(() => expect(map.isReviewLoaded.value).toBe(true), LOAD)
		expect(map.review.value?.isActive.value).toBe(true)
		await vi.waitFor(() => expect(map.isEditLoaded.value).toBe(true), LOAD)
		expect(map.editing.value).not.toBeNull()
		expect(map.isEditing.value).toBe(false)
	})

	it('в режиме просмотра ничего не грузится, а при смене режима части подгружаются и признаки следуют за ним', async () => {
		const { map, props, edit } = modelOf('view')
		await idle()
		expect(map.editing.value).toBeNull()
		expect(map.review.value).toBeNull()
		props.mode = 'edit'
		await vi.waitFor(() => expect(map.isEditLoaded.value).toBe(true), LOAD)
		expect(edit()?.isEditing.value).toBe(true)
		expect(map.review.value).toBeNull()
		props.mode = 'review'
		await vi.waitFor(() => expect(map.isReviewLoaded.value).toBe(true), LOAD)
		expect(edit()?.isEditing.value).toBe(false)
		expect(edit()?.isActive.value).toBe(true)
		expect(map.review.value?.isActive.value).toBe(true)
	})
})
