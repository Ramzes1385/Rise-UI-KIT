import { nextTick, ref } from 'vue'
import { useStructuredData } from '../useStructuredData'
import type { SeoProp, StructuredDataBuilder } from '../types/useStructuredData.types'

const build: StructuredDataBuilder = ({ url }) => ({ '@type': 'Person', name: 'Анна', url: url('/team/anna') })

describe('useStructuredData', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		warnSpy.mockRestore()
		vi.unstubAllEnvs()
	})

	it('без пропа и с false разметки нет', () => {
		expect(useStructuredData('BaseUser', () => undefined, build).structuredData.value).toBe('')
		expect(useStructuredData('BaseUser', () => false, build).structuredData.value).toBe('')
	})

	it('true — поля из пропсов', () => {
		const { structuredData } = useStructuredData('BaseUser', () => true, build)
		expect(JSON.parse(structuredData.value)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Анна',
			url: '/team/anna',
		})
	})

	it('объект — свои поля поверх собранных и абсолютные адреса', () => {
		const seo: SeoProp = { baseUrl: 'https://example.com', data: { '@type': 'Person', jobTitle: 'Дизайнер', name: 'Анна Петрова' } }
		const { structuredData } = useStructuredData('BaseUser', () => seo, build)
		expect(JSON.parse(structuredData.value)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Анна Петрова',
			url: 'https://example.com/team/anna',
			jobTitle: 'Дизайнер',
		})
	})

	it('сборщик вернул null — разметки нет даже со своими полями', () => {
		expect(
			useStructuredData(
				'BaseUser',
				() => ({ data: { name: 'Анна' } }),
				() => null,
			).structuredData.value,
		).toBe('')
	})

	it('следит за пропом', async () => {
		const seo = ref<SeoProp>(false)
		const { structuredData } = useStructuredData('BaseUser', () => seo.value, build)
		seo.value = true
		await nextTick()
		expect(structuredData.value).toContain('"Person"')
	})

	it('в разработке предупреждает о нехватке обязательных полей один раз на набор полей', async () => {
		vi.stubEnv('NODE_ENV', 'development')
		const name = ref('')
		useStructuredData(
			'BaseUser',
			() => true,
			() => ({ '@type': 'Person', name: name.value }),
		)
		expect(warnSpy).toHaveBeenCalledTimes(1)
		expect(warnSpy.mock.calls[0]![0]).toContain('BaseUser')
		expect(warnSpy.mock.calls[0]![0]).toContain('Person')
		expect(warnSpy.mock.calls[0]![0]).toContain('name')
		name.value = 'Анна'
		await nextTick()
		expect(warnSpy).toHaveBeenCalledTimes(1)
	})

	it('в production не предупреждает', () => {
		vi.stubEnv('NODE_ENV', 'production')
		useStructuredData(
			'BaseUser',
			() => true,
			() => ({ '@type': 'Person' }),
		)
		expect(warnSpy).not.toHaveBeenCalled()
	})
})
