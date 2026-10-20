import { mountWith } from '../../fixtures/model.test-utils'
import { useRoadmap3DList } from '../../../model/interaction/useRoadmap3DList'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D } from '../../fixtures/roadmap3d.test-utils'

describe('useRoadmap3DList', () => {
	it('список этапов для скринридера: номер, название, проценты или «закрыт», темы со статусом', () => {
		const { made: list } = mountWith(DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, ({ snapshot }) => useRoadmap3DList({ snapshot }))
		const items = list.value
		expect(items.map(item => item.id)).toEqual(['basics', 'frame', 'build', 'ship'])
		expect(items[0].label).toContain('Основы')
		expect(items[0].label).toContain('100')
		expect(items[2].label).toContain('Закрыт')
		expect(items.map(item => item.isCurrent)).toEqual([false, true, false, false])
		expect(items[0].topics).toEqual([
			{ id: 'html', label: expect.stringMatching(/^HTML, /) },
			{ id: 'css', label: expect.stringMatching(/^CSS, /) },
		])
		expect(items[3].topics).toEqual([])
	})
})
