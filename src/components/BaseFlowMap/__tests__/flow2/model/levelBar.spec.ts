import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useFlowLevelBar } from '../../../model/chrome/useFlowLevelBar'
import type { FlowLevelState } from '../../../types/api/flowController.types'
import type { FlowLevelBarParts } from '../../../types/internal/core/flowRenderInternal.types'

function parts(level: Partial<FlowLevelState>, title?: string): FlowLevelBarParts {
	const state: FlowLevelState = { index: 0, count: 0, label: '', labels: [], path: [], ...level }
	return {
		level: computed(() => state),
		data: computed(() => ({ version: 1, title, nodes: [], edges: [] })),
		graph: computed(() => ({ groups: new Map([['known', { id: 'known', kind: 'zone', label: 'Известная' }]]) })),
		controller: { leaveGroup: vi.fn(), setLevel: vi.fn() },
	} as unknown as FlowLevelBarParts
}

describe('useFlowLevelBar', () => {
	it('крошка неизвестной группы называется её id', () => {
		const bar = useFlowLevelBar(parts({ path: ['known', 'ghost'] }, 'Корень'), () => false)
		expect(bar.crumbs.value.map(item => item.label)).toEqual(['Корень', 'Известная', 'ghost'])
		expect(bar.crumbs.value.at(-1)?.isCurrent).toBe(true)
	})

	it('панель есть при уровнях или пути и пропадает без них', () => {
		expect(useFlowLevelBar(parts({}), () => false).hasLevelBar.value).toBe(false)
		expect(useFlowLevelBar(parts({ count: 2 }), () => false).hasLevelBar.value).toBe(true)
		expect(useFlowLevelBar(parts({ path: ['known'] }), () => false).hasLevelBar.value).toBe(true)
	})

	it('goCrumb и goLevel передают команды контроллеру', () => {
		const source = parts({ count: 2, labels: ['А', 'Б'] })
		const bar = useFlowLevelBar(source, () => false)
		bar.goCrumb(1)
		bar.goLevel(1)
		expect(source.controller.leaveGroup).toHaveBeenCalledWith(1)
		expect(source.controller.setLevel).toHaveBeenCalledWith(1)
		expect(bar.levels.value.map(item => item.isActive)).toEqual([true, false])
	})
})
