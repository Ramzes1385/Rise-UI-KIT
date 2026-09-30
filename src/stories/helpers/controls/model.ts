/** Синхронизация v-model компонента с args Storybook. */

import { computed, ref, watch } from 'vue'
import type { WritableComputedRef } from 'vue'
import { useArgs } from 'storybook/preview-api'
import type { StorySetupOptions } from '../types/helpers.types'

/**
 * Возвращает обработчик для `@update:<name>`, который записывает новое значение обратно в args.
 * Так значение из Controls попадает в компонент, а ввод пользователя — в Controls: песочница ведёт себя как v-model.
 *
 * Вызывайте в теле render (это хук Storybook), а не внутри setup компонента.
 *
 * @example
 * render: args => {
 *   const onUpdate = useModelArg()
 *   return {
 *     components: { BaseInput },
 *     setup: () => ({ args, onUpdate }),
 *     template: '<BaseInput v-bind="args" @update:model-value="onUpdate" />',
 *   }
 * }
 */
export function useModelArg(name = 'modelValue'): (value: unknown) => void {
	const [, updateArgs] = useArgs()
	return (value: unknown) => updateArgs({ [name]: value })
}

const sameValue = (left: unknown, right: unknown): boolean => left === right || JSON.stringify(left) === JSON.stringify(right)

/**
 * Переменная `v-model`, связанная с аргументом Storybook: значение меняется сразу, в Controls уходит следом.
 * Ответ Storybook на своё же изменение приходит позже и пропускается — иначе быстрый ввод или выбор диапазона
 * получал бы устаревшее значение; изменение в Controls применяется.
 */
function modelArg(
	args: Record<string, unknown>,
	arg: string,
	updateArgs: (update: Record<string, unknown>) => void,
): WritableComputedRef<unknown> {
	const local = ref(args[arg])
	let sent: unknown[] = []
	watch(
		() => args[arg],
		value => {
			const echo = sent.findIndex(item => sameValue(item, value))
			if (echo >= 0) sent = sent.slice(echo + 1)
			else local.value = value
		},
	)
	return computed({
		get: () => local.value,
		set: (value: unknown) => {
			local.value = value
			sent.push(value)
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
		args: computed(() => Object.fromEntries(Object.entries(args).filter(([key]) => !hidden.has(key)))),
		slots: computed(() => Object.fromEntries(slots.map(name => [name, args[name]]))),
		...Object.fromEntries(Object.entries(models).map(([name, arg]) => [name, modelArg(args, arg, updateArgs)])),
		...Object.fromEntries(Object.entries(options.state ?? {}).map(([name, value]) => [name, ref(structuredClone(value))])),
		...options.data,
		...options.setup?.(),
	})
}
