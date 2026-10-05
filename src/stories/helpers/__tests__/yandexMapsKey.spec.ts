import { mount } from '@vue/test-utils'
import { defineComponent, h, inject } from 'vue'
import { DEFAULTS_KEY } from '@composables/base/useDefaults/useDefaults'
import { createYandexMapsKeyDecorator, resolveYandexMapsKey, STORY_YANDEX_MAPS_KEY } from '../render/yandexMapsKey'

const KEY = 'fake-key-for-test'

const Probe = defineComponent({
	setup() {
		const defaults = inject(DEFAULTS_KEY, null)
		return () => h('output', JSON.stringify(defaults))
	},
})

function mountDecorated(key: string) {
	const scope = createYandexMapsKeyDecorator(key)({} as never, {} as never) as unknown as {
		components: { Scope: ReturnType<typeof defineComponent> }
	}
	return mount(scope.components.Scope, { slots: { default: () => h(Probe) } })
}

describe('resolveYandexMapsKey', () => {
	it('обычный браузер: значение из переменной без пробелов по краям', () => {
		expect(resolveYandexMapsKey(`  ${KEY}\n`, false)).toBe(KEY)
	})

	it('переменной нет или она пустая — пустая строка', () => {
		expect(resolveYandexMapsKey(undefined, false)).toBe('')
		expect(resolveYandexMapsKey('   ', false)).toBe('')
	})

	it('автоматический прогон (Playwright) — всегда без ключа', () => {
		expect(resolveYandexMapsKey(KEY, true)).toBe('')
	})

	it('в тестах переменной нет — ключ пустой', () => {
		expect(STORY_YANDEX_MAPS_KEY).toBe('')
	})
})

describe('createYandexMapsKeyDecorator', () => {
	it('с ключом: превью получает defaults.BaseMap.apiKey, подсказки нет', () => {
		const wrapper = mountDecorated(KEY)

		expect(wrapper.get('output').text()).toBe(JSON.stringify({ BaseMap: { apiKey: KEY } }))
		expect(wrapper.find('.story-hint').exists()).toBe(false)
	})

	it('без ключа: defaults не заданы, под превью подсказка про .env.local', () => {
		const wrapper = mountDecorated('')

		expect(wrapper.get('output').text()).toBe('null')
		expect(wrapper.get('.story-hint').text()).toContain('.env.local')
		expect(wrapper.get('.story-hint').text()).toContain('STORYBOOK_YANDEX_MAPS_API_KEY')
	})
})
