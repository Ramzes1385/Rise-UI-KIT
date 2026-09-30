/** Синхронизация v-model компонента с args Storybook. */

import { computed, ref, watch } from 'vue'
import type { WritableComputedRef } from 'vue'
import { useArgs } from 'storybook/preview-api'
import type { StorySetupOptions } from '../types/helpers.types'

/**
 * Обработчик из args Storybook в имени события через дефис (`onDelete-messages`) → `onDeleteMessages`, как его
 * называет шаблон (`@delete-messages`). Иначе `v-bind="args"` и обработчик шаблона — разные ключи, и Vue при `emit`
 * вызывает только первый найденный: шпион из args, а обработчик шаблона молчит.
 */
const listenerKey = (key: string): string =>
	/^on[A-Z]/.test(key) && key.includes('-') ? key.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase()) : key

const sameValue = (left: unknown, right: unknown): boolean => left === right || JSON.stringify(left) === JSON.stringify(right)

/** Сколько ждать ответа Storybook на своё изменение, мс: в Docs ответа нет, и позже значение из Controls применяется */
const ECHO_WINDOW = 1000

/**
 * Переменная `v-model`, связанная с аргументом Storybook: значение меняется сразу, в Controls уходит следом.
 * Ответ Storybook на своё же изменение приходит позже и пропускается — иначе быстрый ввод или выбор диапазона
 * получал бы устаревшее значение; изменение в Controls применяется. На странице Docs Storybook не перерисовывает
 * историю после `updateArgs`, поэтому значение живёт в самой переменной — так примеры в Docs отвечают на ввод.
 */
function modelArg(
	args: Record<string, unknown>,
	arg: string,
	updateArgs: (update: Record<string, unknown>) => void,
): WritableComputedRef<unknown> {
	const local = ref(args[arg])
	let sent: { value: unknown; at: number }[] = []
	watch(
		() => args[arg],
		value => {
			const now = performance.now()
			sent = sent.filter(item => now - item.at < ECHO_WINDOW)
			const echo = sent.findIndex(item => sameValue(item.value, value))
			if (echo >= 0) sent = sent.slice(echo + 1)
			else local.value = value
		},
	)
	return computed({
		get: () => local.value,
		set: (value: unknown) => {
			local.value = value
			sent.push({ value, at: performance.now() })
			updateArgs({ [arg]: value })
		},
	})
}

/**
 * `setup` истории со своим шаблоном — пара к `storySource` с теми же `models` и `state`: `args` для `v-bind="args"`
 * без слотов и аргументов `v-model`, `slots` — тексты слотов из Controls (`{{ slots.default }}`), переменные
 * `v-model`, связанные с Controls, состояние шаблона (свой `ref` у каждого показа) и данные шаблона.
 *
 * Вызывайте в теле render (внутри — хук Storybook).
 *
 * @example
 * render: args => ({
 *   components: { BasePhoneInput },
 *   setup: useStorySetup(args, { models: { phone: 'modelValue' } }),
 *   template: '<BasePhoneInput v-bind="args" v-model="phone" />',
 * })
 */
export function useStorySetup(storyArgs: object, options: StorySetupOptions = {}): () => Record<string, unknown> {
	const args = storyArgs as Record<string, unknown>
	const [, updateArgs] = useArgs()
	const models = options.models ?? {}
	const slots = options.slots ?? ['default']
	const hidden = new Set([...slots, ...Object.values(models)])
	return () => ({
		args: computed(() =>
			Object.fromEntries(
				Object.entries(args)
					.filter(([key]) => !hidden.has(key))
					.map(([key, value]) => [listenerKey(key), value]),
			),
		),
		slots: computed(() => Object.fromEntries(slots.map(name => [name, args[name]]))),
		...Object.fromEntries(Object.entries(models).map(([name, arg]) => [name, modelArg(args, arg, updateArgs)])),
		...Object.fromEntries(Object.entries(options.state ?? {}).map(([name, value]) => [name, ref(structuredClone(value))])),
		...options.data,
		...options.setup?.(),
	})
}
