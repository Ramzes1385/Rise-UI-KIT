/**
 * Unit-тесты для composable useCustomClass.
 * Проверяют нормализацию и маппинг кастомных классов.
 */

import { useCustomClass } from './useCustomClass'

describe('useCustomClass', () => {
	it('должен возвращать undefined для всех ключей, если класс не передан', () => {
		const { classes } = useCustomClass({
			getClass: () => undefined,
			elementKeys: ['root', 'inner'],
		})

		expect(classes.value).toEqual({
			root: undefined,
			inner: undefined,
		})
	})

	it('должен маппить строку на root элемент', () => {
		const { classes } = useCustomClass({
			getClass: () => 'my-custom-class',
			elementKeys: ['root', 'inner'],
		})

		expect(classes.value).toEqual({
			root: 'my-custom-class',
			inner: undefined,
		})
	})

	it('должен маппить объект с соответствующими ключами', () => {
		const { classes } = useCustomClass({
			getClass: () => ({
				root: 'my-root-class',
				inner: 'my-inner-class',
				ignored: 'should-be-ignored',
			}),
			elementKeys: ['root', 'inner'],
		})

		expect(classes.value).toEqual({
			root: 'my-root-class',
			inner: 'my-inner-class',
		})
	})

	it('должен маппить весь объект на root, если в нем нет известных ключей элементов', () => {
		const customClassObj = {
			someOtherKey: 'some-value',
		}
		const { classes } = useCustomClass({
			getClass: () => customClassObj,
			elementKeys: ['root', 'inner'],
		})

		expect(classes.value).toEqual({
			root: customClassObj,
			inner: undefined,
		})
	})

	it('должен использовать ["root"] по умолчанию, если elementKeys не переданы', () => {
		const { classes } = useCustomClass({
			getClass: () => 'only-root',
		})

		expect(classes.value).toEqual({
			root: 'only-root',
		})
	})

	it('должен игнорировать массив (не объект) — не маппится на ключи', () => {
		// Массив — это не Record (isObject вернёт false), ветка else не сработает.
		// Покрывает ветку `else if (isObject(customClass))` ложной.
		const { classes } = useCustomClass({
			getClass: () => ['a', 'b'] as unknown as string,
			elementKeys: ['root', 'inner'],
		})

		expect(classes.value).toEqual({
			root: undefined,
			inner: undefined,
		})
	})
})
