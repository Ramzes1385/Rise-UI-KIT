import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { TableColumn } from '../../types/BaseTable.types'
import { useTableStickyOffsets } from '../../model/useTableStickyOffsets'

describe('useTableStickyOffsets', () => {
	it('без заголовка таблицы закреплённые колонки получают нулевые смещения и наблюдать нечего', async () => {
		const columns = ref<TableColumn[]>([
			{ key: 'a', label: 'A', isSticky: 'left' },
			{ key: 'b', label: 'B', isSticky: 'right' },
		])
		let api!: ReturnType<typeof useTableStickyOffsets>
		const Host = defineComponent({
			setup() {
				api = useTableStickyOffsets({ wrapperRef: ref(null), visibleColumns: columns, serviceKeys: ref([]) })
				return () => h('div')
			},
		})
		const wrapper = mount(Host)
		await nextTick()
		expect(api.hasStickyService.value).toBe(true)
		expect(api.getStickyStyle(columns.value[0])).toEqual({ insetInlineStart: '0px' })
		expect(api.getStickyStyle(columns.value[1])).toEqual({ insetInlineEnd: '0px' })
		expect(api.getStickyStyle({ key: 'c', label: 'C' })).toEqual({})
		wrapper.unmount()
	})
})
