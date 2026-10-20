import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import type { Roadmap3DProps } from '../../../types/BaseRoadmap3D.types'
import { useRoadmap3DParts } from '../../../model/view/useRoadmap3DParts'
import { roadmapPanelUi, useRoadmap3DUi } from '../../../model/view/useRoadmap3DUi'

function classesOf(ui: Roadmap3DProps['ui'], defaults?: Record<string, unknown>) {
	let result: ReturnType<typeof useRoadmap3DUi> | null = null
	mount(
		defineComponent({
			setup() {
				result = useRoadmap3DUi({ ui })
				return () => h('div')
			},
		}),
		{ global: { plugins: defaults ? [createUiKitPlugin({ defaults } as never)] : [] } },
	)
	return result as unknown as ReturnType<typeof useRoadmap3DUi>
}

describe('useRoadmap3DUi', () => {
	it('класс кита для корня и частей', () => {
		const ui = classesOf(undefined)
		expect(ui('root')).toBe('base-roadmap-3d')
		expect(ui('panel')).toBe('base-roadmap-3d__panel')
	})

	it('классы из defaults плагина и пропа ui склеиваются после классов кита', () => {
		const ui = classesOf({ root: 'own', panel: 'own-panel' }, { BaseRoadmap3D: { ui: { root: 'global' } } })
		expect(ui('root')).toBe('base-roadmap-3d global own')
		expect(ui('panel')).toBe('base-roadmap-3d__panel own-panel')
		expect(ui('tag')).toBe('base-roadmap-3d__tag')
	})

	it('панель темы получает классы 2D-роадмапа', () => {
		expect(roadmapPanelUi('topic')).toBe('base-roadmap__topic')
	})
})

describe('useRoadmap3DParts', () => {
	it('2D-вид — асинхронный компонент BaseRoadmap', () => {
		expect(useRoadmap3DParts().TwoDRoadmap).toBeDefined()
	})
})
