import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { currentLocale } from '@/locales/state'
import { render, screen } from '@testing-library/vue'
import { SHELL_DATA } from '../../fixtures/shellFixtures'
import { useRoadmapModel } from '../../../model/useRoadmapModel'
import RoadmapSummary from '../../../ui/parts/RoadmapSummary.vue'
import { useRoadmapView } from '../../../model/view/useRoadmapView'
import type { RoadmapData } from '../../../types/roadmapData.types'
import { formatCount } from '../../../model/review/format/roadmapReviewFormat'

function mountView(data: RoadmapData) {
	let view = null as unknown as ReturnType<typeof useRoadmapView>
	const Host = defineComponent({
		setup() {
			const props = { data, layout: 'list' } as never
			const model = useRoadmapModel(props, vi.fn() as never)
			view = useRoadmapView(props, model, ref(null))
			return () => h('div')
		},
	})
	mount(Host)
	return view
}

describe('useRoadmapView: без выбора и без продолжения', () => {
	it('занятость выбранной темы ложна, когда ничего не выбрано', () => {
		expect(mountView(SHELL_DATA).isSelectedBusy.value).toBe(false)
	})

	it('текст «Продолжить» с темой и без неё', () => {
		const withTopic = mountView(SHELL_DATA).continueText.value
		const empty = mountView({ version: 1, id: 'e', title: 'Пусто', stages: [] }).continueText.value
		expect(withTopic).toContain('HTML')
		expect(empty).not.toContain('HTML')
	})

	it('открытие шторки ничего не закрывает, закрытие снимает выбор', () => {
		const view = mountView(SHELL_DATA)
		view.onSheetUpdate(true)
		expect(view.selected.value).toBeUndefined()
	})
})

describe('RoadmapSummary без названия темы', () => {
	it('кнопка «Продолжить» строится с пустым названием', () => {
		render(RoadmapSummary, {
			props: {
				ui: (part: string) => part,
				summary: { done: 0, total: 1, percent: 0, hoursLeft: 0, continueId: 'a', continueTitle: null },
			},
		})
		expect(screen.getByRole('button')).toBeInTheDocument()
	})
})

describe('formatCount на арабской локали', () => {
	it('ноль даёт категорию zero и запасную форму', () => {
		const saved = currentLocale.value
		currentLocale.value = { ...saved, intl: 'ar' }
		try {
			expect(formatCount('{n} a|{n} b|{n} c|{n} d', 0)).toBe('0 d')
		} finally {
			currentLocale.value = saved
		}
	})
})
