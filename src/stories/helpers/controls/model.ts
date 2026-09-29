/** Синхронизация v-model компонента с args Storybook. */

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
