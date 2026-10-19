import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { useRoadmapDetails } from '../../model/view/useRoadmapDetails'

function setup(root: HTMLElement | null = null) {
	const selectTopic = vi.fn()
	const expandStage = vi.fn()
	const options = {
		rootRef: ref(root),
		mode: computed(() => 'side' as const),
		stageViews: computed(() => []),
		selectedId: ref<string | null>(null),
		progress: ref({ version: 1 as const, topics: {} }),
		index: computed(() => ({ topics: new Map(), stages: new Map() })),
		selectTopic,
		expandStage,
	}
	let details = null as unknown as ReturnType<typeof useRoadmapDetails>
	mount(
		defineComponent({
			setup() {
				details = useRoadmapDetails(options as never)
				return () => h('div')
			},
		}),
	)
	return { details, selectTopic, expandStage }
}

describe('useRoadmapDetails: краевые случаи', () => {
	it('без выбранной темы нет следующей и нет готовых подтем, openNext ничего не делает', () => {
		const { details, selectTopic } = setup()
		expect(details.hasNext.value).toBe(false)
		expect(details.doneSubtopics.value).toEqual([])
		details.openNext()
		expect(selectTopic).not.toHaveBeenCalled()
	})

	it('открытие неизвестной темы только выбирает её, этап не раскрывается', () => {
		const { details, selectTopic, expandStage } = setup()
		details.open('ghost')
		expect(selectTopic).toHaveBeenCalledWith('ghost')
		expect(expandStage).not.toHaveBeenCalled()
	})

	it('фокус без корневого элемента и без строки темы не падает', async () => {
		setup().details.focusTopic('ghost')
		setup(document.createElement('div')).details.focusTopic('ghost')
		await nextTick()
		expect(document.activeElement).toBe(document.body)
	})
})
