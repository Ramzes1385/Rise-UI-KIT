import { ref } from 'vue'
import { useFlowMap3DEditLoader } from '../../model/edit/useFlowMap3DEditLoader'

describe('useFlowMap3DEditLoader', () => {
	it('до загрузки «Правки» отдаёт пустой набор: клики проходят, клавиши не обрабатываются', () => {
		const loader = useFlowMap3DEditLoader({
			parts: { core: { model: { mode: ref('view') } }, props: { modes: ['view'] } },
			preload: vi.fn(),
		} as never)
		const handler = vi.fn()
		expect(loader.isLoaded.value).toBe(false)
		expect(loader.edit.value.guardClick(handler)).toBe(handler)
		expect(loader.edit.value.onKeydown({} as KeyboardEvent)).toBe(false)
		expect(loader.edit.value.palette.keyOf({} as never)).toBe('')
		expect(loader.edit.value.palette.titleOf({} as never)).toBe('')
		expect(loader.panels.value).toEqual({})
	})
})
