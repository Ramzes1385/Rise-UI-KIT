import { ref } from 'vue'
import { useFlowPick } from '../../../../model/context/useFlowPick'
import type { FlowMapContext } from '../../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../../types/internal/core/flowRenderInternal.types'

function setup(isDisabled = false) {
	const emit = vi.fn()
	const select = vi.fn()
	const openDetails = vi.fn()
	const announce = vi.fn()
	const model = {
		graph: {
			value: {
				nodes: new Map([['n', { label: 'Узел' }]]),
				edges: new Map([['e', { label: 'Связь' }]]),
				groups: new Map([['g', { label: 'Группа' }]]),
			},
		},
		events: { emit },
		controller: { select },
	} as unknown as FlowModelInternal
	const hovered = ref<string | null>(null)
	const pick = useFlowPick(model, { openDetails, announce } as unknown as FlowMapContext, { hovered, isDisabled: () => isDisabled })
	return { pick, emit, select, openDetails, announce, hovered }
}

describe('useFlowPick', () => {
	it('объявляет выбор по подписи узла, связи и группы, а для неизвестных — по id', () => {
		const { pick, announce } = setup()
		pick.pick({ entity: 'node', id: 'n' })
		pick.pick({ entity: 'edge', id: 'e' })
		pick.pick({ entity: 'group', id: 'g' })
		pick.pick({ entity: 'node', id: 'нет-узла' })
		pick.pick({ entity: 'edge', id: 'нет-связи' })
		pick.pick({ entity: 'group', id: 'нет-группы' })
		expect(announce.mock.calls.map(call => call[0])).toEqual([
			'Выбрано: Узел',
			'Выбрано: Связь',
			'Выбрано: Группа',
			'Выбрано: нет-узла',
			'Выбрано: нет-связи',
			'Выбрано: нет-группы',
		])
	})

	it('выбор сценария ничего не шлёт событием, но выделяет и открывает подробности', () => {
		const { pick, emit, select, openDetails } = setup()
		pick.pick({ entity: 'scenario', id: 's' } as never)
		expect(select).toHaveBeenCalledWith(['s'], 'replace')
		expect(openDetails).toHaveBeenCalled()
		expect(emit).not.toHaveBeenCalled()
	})

	it('у группы есть только click и contextmenu, наведение и двойной щелчок игнорируются', () => {
		const { pick, emit } = setup()
		pick.hover({ entity: 'group', id: 'g' })
		pick.hover(null)
		pick.open({ entity: 'group', id: 'g' })
		pick.menu({ entity: 'group', id: 'g' }, new MouseEvent('contextmenu'))
		pick.pick({ entity: 'group', id: 'g' })
		expect(emit.mock.calls.map(call => call[0])).toEqual(['group-contextmenu', 'group-click'])
	})

	it('отключённая карта не выбирает, clear снимает выбор и объявляет об этом', () => {
		const disabled = setup(true)
		disabled.pick.pick({ entity: 'node', id: 'n' })
		expect(disabled.select).not.toHaveBeenCalled()
		const active = setup()
		active.pick.clear()
		expect(active.select).toHaveBeenCalledWith([])
		expect(active.openDetails).toHaveBeenCalledWith(null)
		expect(active.announce).toHaveBeenCalledWith('Выбор снят')
	})
})
