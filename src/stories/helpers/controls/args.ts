/** Работа с args внутри кастомного render. */

import { computed, type ComputedRef } from 'vue'

/**
 * Props компонента из args без ключей слотов — для `v-bind="props"` в кастомном render.
 * Без этого текст слота из args (например, `default: 'Сохранить'`) попадёт в HTML-атрибут корневого элемента.
 * Результат реактивен: изменения в панели Controls сразу применяются к примеру.
 *
 * @example
 * render: args => ({
 *   components: { BaseButton },
 *   setup: () => ({ props: useArgsWithoutSlots(args) }),
 *   template: '<BaseButton v-bind="props">Текст</BaseButton>',
 * })
 */
export function useArgsWithoutSlots<T extends object>(args: T, slots: readonly string[] = ['default']): ComputedRef<Partial<T>> {
	return computed(() => Object.fromEntries(Object.entries(args).filter(([key]) => !slots.includes(key))) as Partial<T>)
}
