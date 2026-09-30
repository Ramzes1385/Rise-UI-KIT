/** Синхронизация v-model компонента с args Storybook. */

import { computed, ref } from 'vue'
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
		...Object.fromEntries(
			Object.entries(models).map(([name, arg]) => [
				name,
				computed({ get: () => args[arg], set: (value: unknown) => updateArgs({ [arg]: value }) }),
			]),
		),
		...Object.fromEntries(Object.entries(options.state ?? {}).map(([name, value]) => [name, ref(structuredClone(value))])),
		...options.data,
	})
}
