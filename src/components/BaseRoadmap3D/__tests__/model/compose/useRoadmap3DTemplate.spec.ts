import { reactive, ref, shallowRef } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import type { Roadmap3DView } from '../../../types/BaseRoadmap3D.types'
import { useRoadmap3DTemplate } from '../../../model/compose/useRoadmap3DTemplate'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, stagesData } from '../../fixtures/roadmap3d.test-utils'

const INDEXES: Record<string, number> = { basics: 0, ship: 3 }

function mountTemplate(
	options: { data?: RoadmapData; props?: Record<string, unknown>; view?: Roadmap3DView; isSupported?: boolean | null } = {},
) {
	const props = reactive({ isLoading: false, ariaLabel: undefined as string | undefined, ui: undefined, ...options.props })
	const shownView = ref<Roadmap3DView>(options.view ?? '3d')
	const isSupported = ref<boolean | null>(options.isSupported ?? true)
	const focus = {
		focused: ref<string | null>(null),
		cursor: ref<string | null>(null),
		indexOf: (id: string | null) => INDEXES[id ?? ''] ?? -1,
	}
	const tour = { isPlaying: ref(false), step: ref(0), total: ref(4) }
	const content = shallowRef<object | null>({})
	const mounted = mountWith(options.data ?? DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, ({ model, snapshot }) =>
		useRoadmap3DTemplate(
			{
				props,
				model,
				view: { shownView, setView: vi.fn(), fallback: { isSupported } },
				snapshot,
				focus,
				tour,
			} as never,
			{ content } as never,
		),
	)
	return { ...mounted, template: mounted.made, props, shownView, isSupported, focus, tour, content }
}

describe('useRoadmap3DTemplate: плашка состояния', () => {
	it('собранная сцена — плашки нет', () => {
		expect(mountTemplate().template.status.value).toBeNull()
	})

	it('2D-вид — плашки нет, загрузка — «loading», пустой путь — «empty», сцена строится — «loading»', () => {
		expect(mountTemplate({ view: '2d' }).template.status.value).toBeNull()
		expect(mountTemplate({ props: { isLoading: true } }).template.status.value).toMatchObject({ kind: 'loading' })
		expect(mountTemplate({ data: stagesData(0) }).template.status.value).toMatchObject({ kind: 'empty' })
		const building = mountTemplate()
		building.content.value = null
		expect(building.template.status.value).toMatchObject({ kind: 'loading', text: expect.stringContaining('остров') })
	})
})

describe('useRoadmap3DTemplate: подписи и состояния', () => {
	it('название области: ariaLabel, иначе название данных, иначе запасное', () => {
		expect(mountTemplate().template.label.value).toBe('Путь')
		expect(mountTemplate({ props: { ariaLabel: 'Свой' } }).template.label.value).toBe('Свой')
		const bare = mountTemplate({ data: { ...DATA_ROADMAP_3D, title: undefined as never } })
		expect(bare.template.label.value).toBe('Дорожная карта')
	})

	it('холст нужен только в 3D при поддержке WebGL; панель — при фокусе в 3D', () => {
		const { template, shownView, isSupported, focus } = mountTemplate()
		expect(template.hasCanvas.value).toBe(true)
		expect(template.hasPanel.value).toBe(false)
		focus.focused.value = 'frame'
		expect(template.hasPanel.value).toBe(true)
		shownView.value = '2d'
		expect(template.hasCanvas.value).toBe(false)
		expect(template.hasPanel.value).toBe(false)
		shownView.value = '3d'
		isSupported.value = null
		expect(template.hasCanvas.value).toBe(false)
		expect(template.isSupported).toBe(isSupported)
	})

	it('подпись тура: шаг из числа этапов, пока тур идёт', () => {
		const { template, tour } = mountTemplate()
		expect(template.caption.value).toBe('')
		tour.isPlaying.value = true
		tour.step.value = 1
		expect(template.caption.value).toBe('Этап 2 из 4')
	})

	it('полоса этапов: номер, статус, фокус и озвучка', () => {
		const { template, focus } = mountTemplate()
		focus.focused.value = 'frame'
		expect(template.steps.value.map(step => [step.id, step.n, step.isFocused])).toEqual([
			['basics', 1, false],
			['frame', 2, true],
			['build', 3, false],
			['ship', 4, false],
		])
		expect(template.steps.value[0].label).toContain('Основы')
	})

	it('сводка: тем, проценты, осталось часов и «Продолжить»', () => {
		const { template } = mountTemplate()
		expect(template.summary.value.total).toBeGreaterThan(0)
		expect(template.summary.value.percentText).toContain('%')
		expect(template.summary.value.leftText).toContain('ч')
		expect(template.summary.value.continueText).toContain('Vue')
		const done = mountTemplate({
			data: stagesData(1),
		})
		expect(done.template.summary.value.continueText).toContain('Тема 1')
	})

	it('сводка без часов и без продолжения: всё пройдено', () => {
		const everything = mountTemplate({ data: stagesData(1) })
		everything.model.setTopicStatus('t1', 'done', 'user')
		return Promise.resolve().then(() => {
			expect(everything.template.summary.value.continueText).toBe('')
			expect(everything.template.summary.value.leftText).toBe('')
		})
	})

	it('края пути: первый, последний, без места — оба false', () => {
		const { template, focus } = mountTemplate()
		expect(template.nav.value).toEqual({ isFirst: false, isLast: false })
		focus.focused.value = 'basics'
		expect(template.nav.value).toEqual({ isFirst: true, isLast: false })
		focus.focused.value = 'ship'
		expect(template.nav.value).toEqual({ isFirst: false, isLast: true })
	})

	it('пустой путь, варианты вида, подсказка клавиатуры и общий класс панели темы', () => {
		const { template } = mountTemplate({ data: stagesData(0) })
		expect(template.snapshotEmpty.value).toBe(true)
		expect(template.viewOptions.map(option => option.value)).toEqual(['3d', '2d'])
		expect(template.keyboardHint).toContain('.')
		expect(template.hintId.endsWith('-hint')).toBe(true)
		expect(template.panelUi('topic')).toBe('base-roadmap__topic')
		expect(template.ui('root')).toBe('base-roadmap-3d')
	})
})
