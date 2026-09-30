/** Синхронизация v-model компонента с args Storybook. */

import { computed } from 'vue'
import { useArgs } from 'storybook/preview-api'

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
 * `setup` истории со своим шаблоном — пара к `storySource` с теми же `models`: `args` для `v-bind="args"` без слотов
 * и аргументов `v-model`, переменные `v-model`, связанные с Controls, и данные шаблона.
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
export function useStorySetup(
	args: Record<string, unknown>,
	options: { models?: Readonly<Record<string, string>>; data?: Readonly<Record<string, unknown>>; slots?: readonly string[] } = {},
): () => Record<string, unknown> {
	const [, updateArgs] = useArgs()
	const models = options.models ?? {}
	const hidden = new Set([...(options.slots ?? ['default']), ...Object.values(models)])
	return () => ({
		args: computed(() => Object.fromEntries(Object.entries(args).filter(([key]) => !hidden.has(key)))),
		...Object.fromEntries(
			Object.entries(models).map(([name, arg]) => [
				name,
				computed({ get: () => args[arg], set: (value: unknown) => updateArgs({ [arg]: value }) }),
			]),
		),
		...options.data,
	})
}
