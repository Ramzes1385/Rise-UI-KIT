/**
 * Витрина JSON-LD для историй с SEO: под превью — разметка компонента из `<script type="application/ld+json">`,
 * как её прочитает поисковик. Картинки data URI сокращены. Декоратор не попадает в «Show code»: код истории остаётся кодом компонента.
 */

import type { Decorator } from '@storybook/vue3-vite'
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'

const EMPTY_TEXT = 'SEO выключено — разметки нет'

const DATA_URI_LIMIT = 80

const shortDataUri = (_key: string, value: unknown): unknown =>
	typeof value === 'string' && value.startsWith('data:') && value.length > DATA_URI_LIMIT
		? `${value.slice(0, value.indexOf(',') + 1)}…`
		: value

function readJsonLd(root: HTMLElement): string {
	const scripts = [...root.querySelectorAll('script[type="application/ld+json"]')]
	return scripts.map(script => JSON.stringify(JSON.parse(script.textContent ?? '{}'), shortDataUri, 2)).join('\n\n')
}

const StoryJsonLd = defineComponent({
	name: 'StoryJsonLd',
	setup(_, { slots }) {
		const root = ref<HTMLElement>()
		const json = ref('')
		const observer = new MutationObserver(() => {
			json.value = readJsonLd(root.value!)
		})

		onMounted(() => {
			json.value = readJsonLd(root.value!)
			observer.observe(root.value!, { subtree: true, childList: true, characterData: true })
		})
		onBeforeUnmount(() => observer.disconnect())

		return () =>
			h('div', { ref: root, class: 'story-stack' }, [
				slots.default?.(),
				h(
					'pre',
					{ class: 'story-json-ld', role: 'region', tabindex: 0, 'aria-label': 'Разметка JSON-LD' },
					json.value || EMPTY_TEXT,
				),
			])
	},
})

/** Декоратор истории с SEO: превью и под ним — JSON-LD компонента, обновляется вместе с Controls */
export const withJsonLd: Decorator = () => ({
	components: { StoryJsonLd },
	template: '<StoryJsonLd><story /></StoryJsonLd>',
})
