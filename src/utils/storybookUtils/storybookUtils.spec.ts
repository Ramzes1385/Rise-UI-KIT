import '@testing-library/jest-dom/vitest'

import { buildArgTypes } from './storybookUtils'

describe('storybookUtils', () => {
	describe('buildArgTypes', () => {
		it('скрывает Vue-пропы по умолчанию', () => {
			const result = buildArgTypes({ props: {} })
			expect(result.class?.table?.disable).toBe(true)
			expect(result.style?.table?.disable).toBe(true)
			expect(result.key?.table?.disable).toBe(true)
			expect(result.ref?.table?.disable).toBe(true)
		})

		it('скрывает дополнительные пропы', () => {
			const result = buildArgTypes({ props: {}, hidden: ['items'] })
			expect(result.items?.table?.disable).toBe(true)
		})

		it('строит argType для пропа с control', () => {
			const result = buildArgTypes({
				props: { variant: { control: 'radio', options: ['a', 'b'] } },
			})
			expect(result.variant.control).toBe('radio')
			expect(result.variant.options).toEqual(['a', 'b'])
		})

		it('строит argType с description', () => {
			const result = buildArgTypes({
				props: { label: { control: 'text', description: 'Текст кнопки' } },
			})
			expect(result.variant).toBeUndefined()
			expect(result.label.description).toBe('Текст кнопки')
		})

		it('строит argType с table', () => {
			const result = buildArgTypes({
				props: { onClick: { table: { disable: true } } },
			})
			expect((result.onClick as Record<string, unknown>).table).toEqual({ disable: true })
		})

		it('не добавляет пустые поля', () => {
			const result = buildArgTypes({
				props: { label: { control: 'text' } },
			})
			expect(result.label).not.toHaveProperty('options')
			expect(result.label).not.toHaveProperty('description')
			expect(result.label).not.toHaveProperty('table')
		})

		it('строит argType с control как объектом', () => {
			const result = buildArgTypes({
				props: { size: { control: { type: 'range', min: 50, max: 200, step: 10 } } },
			})
			expect(result.size.control).toEqual({ type: 'range', min: 50, max: 200, step: 10 })
		})

		it('строит argType с options из чисел', () => {
			const result = buildArgTypes({
				props: { count: { control: 'inline-radio', options: [1, 2, 3] } },
			})
			expect(result.count.options).toEqual([1, 2, 3])
		})

		it('строит argType только с options без control', () => {
			const result = buildArgTypes({
				props: { status: { options: ['active', 'inactive'] } },
			})
			expect(result.status.options).toEqual(['active', 'inactive'])
			expect(result.status).not.toHaveProperty('control')
		})

		it('строит argType только с description без control и options', () => {
			const result = buildArgTypes({
				props: { title: { description: 'Заголовок' } },
			})
			expect(result.title.description).toBe('Заголовок')
			expect(result.title).not.toHaveProperty('control')
			expect(result.title).not.toHaveProperty('options')
		})
	})
})
