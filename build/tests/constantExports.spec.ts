import * as components from '@/components'

describe('публичные константы компонентов', () => {
	it.each([
		['ALERT_TYPES', ['info', 'success', 'warning', 'error']],
		['ALERT_VARIANTS', ['default', 'ghost', 'outline', 'shadow', 'soft']],
		['EMPTY_VARIANTS', ['default', 'ghost', 'soft']],
		['CHAT_VARIANTS', ['bubble', 'flat', 'modern']],
		['PROGRESS_SHAPES', ['line', 'circle']],
	])('%s экспортируется из пакета компонентов', (name, values) => {
		expect(components).toHaveProperty(name, values)
	})
})
