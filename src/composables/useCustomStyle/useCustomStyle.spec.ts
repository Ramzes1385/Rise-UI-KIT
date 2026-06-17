/**
 * Unit-тесты для useCustomStyle.
 * Покрывают все ветки: строки, плоские объекты, вложенные объекты по ключам,
 * массивы (StyleValue), undefined, null, пустые значения.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { useCustomStyle } from './useCustomStyle'

describe('useCustomStyle', () => {
	describe('elementKeys', () => {
		it('использует ["root"] по умолчанию когда elementKeys не передан', () => {
			const { styles } = useCustomStyle({
				getStyle: () => 'color: red',
			})
			expect(styles.value).toEqual({ root: 'color: red' })
		})

		it('использует переданный elementKeys', () => {
			const { styles } = useCustomStyle({
				getStyle: () => undefined,
				elementKeys: ['root', 'input', 'label'],
			})
			expect(styles.value).toEqual({
				root: undefined,
				input: undefined,
				label: undefined,
			})
		})
	})

	describe('пустые значения customStyle', () => {
		it('возвращает все ключи undefined когда customStyle = undefined', () => {
			const { styles } = useCustomStyle({
				getStyle: () => undefined,
				elementKeys: ['root', 'input'],
			})
			expect(styles.value).toEqual({ root: undefined, input: undefined })
		})

		it('возвращает все ключи undefined когда customStyle = null', () => {
			const { styles } = useCustomStyle({
				getStyle: () => null as unknown as undefined,
				elementKeys: ['root'],
			})
			expect(styles.value).toEqual({ root: undefined })
		})

		it('возвращает все ключи undefined когда customStyle — пустая строка', () => {
			const { styles } = useCustomStyle({
				getStyle: () => '',
				elementKeys: ['root'],
			})
			expect(styles.value).toEqual({ root: undefined })
		})
	})

	describe('строка как customStyle', () => {
		it('присваивает строку корневому элементу', () => {
			const { styles } = useCustomStyle({
				getStyle: () => 'color: blue; font-size: 16px',
				elementKeys: ['root', 'input'],
			})
			expect(styles.value).toEqual({
				root: 'color: blue; font-size: 16px',
				input: undefined,
			})
		})
	})

	describe('объект как customStyle', () => {
		it('распределяет значения по известным ключам элементов', () => {
			const inputStyle = { color: 'red' }
			const labelStyle = { fontWeight: 'bold' }
			const { styles } = useCustomStyle({
				getStyle: () => ({ root: { padding: '4px' }, input: inputStyle, label: labelStyle }),
				elementKeys: ['root', 'input', 'label'],
			})
			expect(styles.value).toEqual({
				root: { padding: '4px' },
				input: inputStyle,
				label: labelStyle,
			})
		})

		it('пропускает undefined значения внутри объекта со известными ключами', () => {
			const { styles } = useCustomStyle({
				getStyle: () => ({ root: { color: 'red' }, input: undefined }),
				elementKeys: ['root', 'input'],
			})
			expect(styles.value).toEqual({
				root: { color: 'red' },
				input: undefined,
			})
		})

		it('частичный объект — заполняет только переданные ключи', () => {
			const { styles } = useCustomStyle({
				getStyle: () => ({ input: { color: 'green' } }),
				elementKeys: ['root', 'input', 'label'],
			})
			expect(styles.value).toEqual({
				root: undefined,
				input: { color: 'green' },
				label: undefined,
			})
		})

		it('весь объект относится к root когда нет известных ключей элементов', () => {
			const styleObj = { color: 'red', padding: '8px' }
			const { styles } = useCustomStyle({
				getStyle: () => styleObj,
				elementKeys: ['root', 'input'],
			})
			expect(styles.value).toEqual({
				root: styleObj,
				input: undefined,
			})
		})
	})

	describe('массив как customStyle (StyleValue)', () => {
		it('массив игнорируется — все ключи undefined', () => {
			const { styles } = useCustomStyle({
				getStyle: () => [{ color: 'red' }, { padding: '4px' }],
				elementKeys: ['root'],
			})
			expect(styles.value).toEqual({ root: undefined })
		})
	})

	describe('реактивность', () => {
		it('пересчитывает стили при изменении источника', () => {
			const source = ref<string | undefined>('color: red')
			const { styles } = useCustomStyle({
				getStyle: () => source.value,
			})
			expect(styles.value).toEqual({ root: 'color: red' })

			source.value = 'color: blue'
			expect(styles.value).toEqual({ root: 'color: blue' })
		})
	})
})
