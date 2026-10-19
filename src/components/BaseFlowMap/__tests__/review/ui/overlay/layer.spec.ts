import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { mountReview, stubFrame } from '../../fixtures/reviewUi'
import { flowServices } from '../../../../model/notations/services'
import type { FlowChange } from '../../../../types/data/flowReview.types'
import { ANNA, addEdgeD, addNodeD, moveB, removeC, renameA, reviewData, suggestion } from '../../fixtures/reviewHarness'

beforeEach(() => stubFrame(1200))

const marks = (kind?: string) => Array.from(document.querySelectorAll(`.base-flow-map__review-mark${kind ? `--${kind}` : ''}`))
const glyphOf = (element: Element) =>
	element.querySelector('.base-flow-map__review-glyph > text:not(.base-flow-map__review-author)')?.textContent
const titleOf = (element: Element) => element.querySelector('title')?.textContent

describe('метки на холсте', () => {
	it('вне режима «Правки» меток нет', () => {
		mountReview({ mode: 'view', suggestions: [suggestion('s1', [renameA])] })
		expect(marks()).toHaveLength(0)
		expect(document.querySelector('.base-flow-map__review-layer')).toHaveAttribute('data-mode', 'view')
	})

	it('слой скрыт от скринридера и не перехватывает указатель, режим записан в data-mode', () => {
		mountReview({ suggestions: [suggestion('s1', [renameA])] })
		const layer = document.querySelector('.base-flow-map__review-layer')
		expect(layer).toHaveAttribute('aria-hidden', 'true')
		expect(layer).toHaveAttribute('data-mode', 'review')
		expect(layer).not.toHaveAttribute('data-side')
	})

	it('переименование: «~» над узлом, подсказка и автор', () => {
		mountReview({ suggestions: [suggestion('s1', [renameA])] })
		const [mark] = marks('rename')
		expect(glyphOf(mark)).toBe('~')
		expect(titleOf(mark)).toBe(formatMessage(UI_FLOW_REVIEW.MARK_RENAME, { name: 'Alpha' }))
		expect(mark.querySelector('.base-flow-map__review-author')).toHaveTextContent(ANNA.name)
		expect(mark.querySelector('.base-flow-map__review-frame')).not.toBeNull()
		expect(mark.classList.contains('base-flow-map__review-mark--ghost')).toBe(false)
	})

	it('удаление: «−» на существующем узле', () => {
		mountReview({ suggestions: [suggestion('s1', [removeC])] })
		const [mark] = marks('remove')
		expect(glyphOf(mark)).toBe('−')
		expect(titleOf(mark)).toBe(formatMessage(UI_FLOW_REVIEW.MARK_REMOVE, { name: 'Gamma' }))
	})

	it('перемещение: «→», призрак на новом месте и пунктирная стрелка от прежнего', () => {
		mountReview({ suggestions: [suggestion('s1', [moveB])] })
		const [mark] = marks('move')
		expect(glyphOf(mark)).toBe('→')
		const frame = mark.querySelector('.base-flow-map__review-frame') as SVGRectElement
		expect(Number(frame.getAttribute('x'))).toBe(336)
		expect(Number(frame.getAttribute('y'))).toBe(36)
		const arrow = mark.querySelector('.base-flow-map__review-move') as SVGLineElement
		expect(Number(arrow.getAttribute('x1'))).toBeLessThan(Number(arrow.getAttribute('x2')))
	})

	it('добавление: призрак с подписью узла и «+»; связь к нему — пунктирный путь', () => {
		mountReview({ suggestions: [suggestion('s1', [addNodeD, addEdgeD])] })
		const [node, edge] = marks('add')
		expect(node).toHaveClass('base-flow-map__review-mark--ghost')
		expect(node.querySelector('.base-flow-map__review-text')).toHaveTextContent('Delta')
		expect(glyphOf(node)).toBe('+')
		expect(edge).toHaveClass('base-flow-map__review-mark--ghost')
		expect(edge.querySelector('.base-flow-map__review-path')?.getAttribute('d')).toMatch(/^M[\d. -]+L[\d. -]+$/)
		expect(edge.querySelector('.base-flow-map__review-frame')).toBeNull()
	})

	it('призрак встаёт под соседа по связи, а узел с позицией — на свою позицию', () => {
		const placed: FlowChange = {
			type: 'add',
			entity: 'node',
			value: { id: 'p', kind: 'service', label: 'Placed', position: { x: 700, y: 500 } },
		}
		mountReview({ suggestions: [suggestion('s1', [addNodeD, addEdgeD, placed])] })
		const frameOf = (text: string) =>
			marks('add')
				.find(mark => mark.querySelector('.base-flow-map__review-text')?.textContent?.trim() === text)
				?.querySelector('.base-flow-map__review-frame')
		expect(frameOf('Delta')?.getAttribute('x')).toBe('296')
		expect(frameOf('Delta')?.getAttribute('y')).toBe('100')
		expect(frameOf('Placed')?.getAttribute('x')).toBe('696')
		expect(frameOf('Placed')?.getAttribute('y')).toBe('496')
	})

	it('призрак узла неизвестного вида получает размер по умолчанию', () => {
		const odd: FlowChange = { type: 'add', entity: 'node', value: { id: 'o', kind: 'такого-вида-нет', label: 'Odd' } }
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		mountReview({ suggestions: [suggestion('s1', [odd])] })
		const frame = marks('add')[0].querySelector('.base-flow-map__review-frame')
		expect(Number(frame?.getAttribute('width'))).toBeGreaterThan(8)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('такого-вида-нет'))
		warn.mockRestore()
	})

	it('призрак узла вида без размера (обход типов в JS) получает размер по умолчанию 180×64', () => {
		const sized = {
			...flowServices,
			id: 'sized',
			nodeKinds: { ...flowServices.nodeKinds, ghost: { ...flowServices.nodeKinds.service, size: { width: 180, height: 64 } } },
		}
		const sizeless = {
			...flowServices,
			id: 'sizeless',
			nodeKinds: { ...flowServices.nodeKinds, ghost: { ...flowServices.nodeKinds.service, size: undefined } as never },
		}
		const frameOf = (notation: typeof sized, id: string) => {
			const added: FlowChange = { type: 'add', entity: 'node', value: { id: 'o', kind: 'ghost', label: 'Odd' } }
			const view = mountReview({
				notations: [notation],
				data: reviewData({ notation: id }),
				suggestions: [suggestion('s1', [added])],
			})
			const frame = marks('add')[0].querySelector('.base-flow-map__review-frame')
			const size = [frame?.getAttribute('width'), frame?.getAttribute('height')]
			view.unmount()
			return size
		}
		expect(frameOf(sizeless, 'sizeless')).toEqual(frameOf(sized, 'sized'))
	})

	it('перемещение, которое вернуло узел на место, ничего не рисует', () => {
		const back: FlowChange = {
			type: 'update',
			entity: 'node',
			id: 'b',
			patch: { position: { x: 300, y: 0 } },
			previous: { position: { x: 340, y: 40 } },
		}
		mountReview({ suggestions: [suggestion('s1', [moveB, back])] })
		expect(marks()).toHaveLength(0)
	})

	it('призрак без соседей встаёт справа от карты', () => {
		mountReview({ suggestions: [suggestion('s1', [addNodeD])] })
		const frame = marks('add')[0].querySelector('.base-flow-map__review-frame')
		expect(Number(frame?.getAttribute('x'))).toBeGreaterThan(460)
	})

	it('связь, которой нет на холсте и к узлам которой не подойти, не рисуется', () => {
		const lost: FlowChange = { type: 'add', entity: 'edge', value: { id: 'e9', source: 'q', target: 'w' } }
		mountReview({ suggestions: [suggestion('s1', [lost])] })
		expect(marks()).toHaveLength(0)
	})

	it('изменения связи и группы: путь существующей связи и рамка группы', () => {
		const edge: FlowChange = { type: 'update', entity: 'edge', id: 'e1', patch: { label: 'x' }, previous: { label: 'заказ' } }
		const bare: FlowChange = { type: 'update', entity: 'edge', id: 'e2', patch: { label: 'y' }, previous: {} }
		const group: FlowChange = { type: 'update', entity: 'group', id: 'g', patch: { label: 'Новая' }, previous: { label: 'Зона' } }
		const data = reviewData({
			groups: [{ id: 'g', kind: 'zone', label: 'Зона' }],
			nodes: reviewData().nodes.map(node => (node.id === 'a' ? { ...node, group: 'g' } : node)),
		})
		mountReview({ data, suggestions: [suggestion('s1', [edge, bare, group])] })
		const [first, second, third] = marks()
		expect(first.querySelector('.base-flow-map__review-path')?.getAttribute('d')).toBeTruthy()
		expect(titleOf(first)).toBe(formatMessage(UI_FLOW_REVIEW.MARK_RENAME, { name: 'заказ' }))
		expect(titleOf(second)).toBe(formatMessage(UI_FLOW_REVIEW.MARK_RENAME, { name: 'e2' }))
		expect(titleOf(third)).toBe(formatMessage(UI_FLOW_REVIEW.MARK_RENAME, { name: 'g' }))
		expect(third.querySelector('.base-flow-map__review-frame')).not.toBeNull()
	})

	it('метки того, чего нет на холсте, не рисуются: чужой узел, группа, сценарий, перемещение без позиции', () => {
		const ghostNode: FlowChange = { type: 'update', entity: 'node', id: 'zzz', patch: { label: 'x' }, previous: {} }
		const ghostMove: FlowChange = { type: 'update', entity: 'node', id: 'zzz', patch: { position: { x: 1, y: 1 } }, previous: {} }
		const ghostGroup: FlowChange = { type: 'update', entity: 'group', id: 'nope', patch: { label: 'x' }, previous: {} }
		const ghostEdge: FlowChange = { type: 'update', entity: 'edge', id: 'nope', patch: { label: 'x' }, previous: {} }
		const scenario: FlowChange = { type: 'update', entity: 'scenario', id: 's', patch: { label: 'x' }, previous: {} }
		mountReview({ suggestions: [suggestion('s1', [ghostNode, ghostMove, ghostGroup, ghostEdge, scenario])] })
		expect(marks()).toHaveLength(0)
	})

	it('фокус на карточке подсвечивает метки её предложения', async () => {
		const user = userEvent.setup()
		mountReview({ suggestions: [suggestion('s1', [renameA]), suggestion('s2', [moveB])] })
		expect(marks().some(mark => mark.classList.contains('base-flow-map__review-mark--hot'))).toBe(false)
		await user.hover(
			screen.getByRole('listitem', {
				name: formatMessage(UI_FLOW_REVIEW.SUGGESTION_ARIA, { title: 'Предложение s2', name: ANNA.name }),
			}),
		)
		expect(marks('hot')).toHaveLength(1)
		expect(titleOf(marks('hot')[0])).toContain('Beta')
	})

	it('разобранные предложения меток не оставляют', () => {
		mountReview({ suggestions: [suggestion('s1', [renameA], { status: 'accepted' })] })
		expect(marks()).toHaveLength(0)
	})
})
