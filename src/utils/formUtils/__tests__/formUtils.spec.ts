/** Тесты утилит проверки формы по Standard Schema */
import { issueName, issuesToErrors, validateSchema } from '../formUtils'
import type { StandardSchemaResult, StandardSchemaV1 } from '../formUtils.types'

/** Схема для тестов: имя обязательно, возраст — число от 18 */
function userSchema(isAsync = false): StandardSchemaV1<unknown, { name: string; age: number }> {
	const check = (value: unknown): StandardSchemaResult<{ name: string; age: number }> => {
		const data = value as { name?: string; age?: number }
		const issues = []
		if (!data.name) issues.push({ message: 'Введите имя', path: ['name'] })
		if (!data.age || data.age < 18) issues.push({ message: 'С 18 лет', path: [{ key: 'age' }] })
		if (issues.length) return { issues }
		return { value: { name: data.name as string, age: Number(data.age) } }
	}
	return {
		'~standard': {
			version: 1,
			vendor: 'test',
			validate: value => (isAsync ? Promise.resolve(check(value)) : check(value)),
		},
	}
}

describe('formUtils', () => {
	describe('issueName', () => {
		it('соединяет путь через точку, сегменты { key } разворачивает', () => {
			expect(issueName({ message: '', path: ['address', { key: 'city' }] })).toBe('address.city')
			expect(issueName({ message: '', path: ['tags', 0] })).toBe('tags.0')
		})

		it('ошибка без пути — ошибка всей формы (пустое имя)', () => {
			expect(issueName({ message: 'Форма заполнена неверно' })).toBe('')
		})
	})

	describe('validateSchema', () => {
		it('успех — значение после схемы и пустой список ошибок', async () => {
			await expect(validateSchema(userSchema(), { name: 'Анна', age: '30' })).resolves.toEqual({
				value: { name: 'Анна', age: 30 },
				issues: [],
			})
		})

		it('ошибки — имя поля и сообщение; асинхронная схема тоже', async () => {
			const result = await validateSchema(userSchema(true), { age: 12 })
			expect(result.value).toBeUndefined()
			expect(result.issues).toEqual([
				{ name: 'name', message: 'Введите имя' },
				{ name: 'age', message: 'С 18 лет' },
			])
		})
	})

	describe('issuesToErrors', () => {
		it('у поля остаётся первое сообщение', () => {
			expect(
				issuesToErrors([
					{ name: 'email', message: 'Введите e-mail' },
					{ name: 'email', message: 'Неверный формат' },
					{ name: '', message: 'Проверьте форму' },
				]),
			).toEqual({ email: 'Введите e-mail', '': 'Проверьте форму' })
		})
	})
})
