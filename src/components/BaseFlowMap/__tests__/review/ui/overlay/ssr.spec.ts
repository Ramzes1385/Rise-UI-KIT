import { createSSRApp, h } from 'vue'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { renderToString } from 'vue/server-renderer'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import type { BaseFlowMapProps } from '../../../../types/BaseFlowMap.types'
import { ANNA, BORIS, renameA, reviewData, suggestion } from '../../fixtures/reviewHarness'

const html = (props: Partial<BaseFlowMapProps> = {}) =>
	renderToString(createSSRApp({ render: () => h(BaseFlowMap, { data: reviewData(), currentUser: ANNA, ...props }) }))

describe('«Правки» на сервере', () => {
	it('режим «Правки» на сервере отдаёт просмотр: карта и узлы есть, панели, вкладок, карточек и булавок нет', async () => {
		const result = await html({
			mode: 'review',
			suggestions: [suggestion('s1', [renameA])],
			comments: [{ id: 't1', target: { entity: 'node', id: 'a' }, comments: [{ id: 'c1', author: BORIS, text: 'Вопрос', date: 1 }] }],
			versions: [{ id: 'v1', label: 'v1', date: 1, data: reviewData() }],
		})
		expect(result).toContain('role="graphics-document"')
		expect(result).toContain('Alpha')
		expect(result).not.toContain(`aria-label="${UI_FLOW_REVIEW.PANEL}"`)
		expect(result).not.toContain('role="tablist"')
		expect(result).not.toContain('base-flow-map__review-pin')
		expect(result).not.toContain('base-flow-map__review-mark--rename')
	})

	it('вне режима «Правки» панели нет', async () => {
		const result = await html({ suggestions: [suggestion('s1', [renameA])] })
		expect(result).not.toContain('base-flow-map__review-panel')
		expect(result).not.toContain('base-flow-map__review-mark--rename')
	})
})
