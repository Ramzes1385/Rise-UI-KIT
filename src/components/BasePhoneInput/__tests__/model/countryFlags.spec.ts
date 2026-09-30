import { countryFlag } from '../../model/phone/countryFlags'
import { PHONE_COUNTRIES } from '../../model/phone/phoneCountries'

describe('флаги стран', () => {
	it('у каждой страны списка свой флаг, без запасной плашки', () => {
		const flags = PHONE_COUNTRIES.map(country => countryFlag(country.code))
		for (const flag of flags) expect(flag.some(shape => shape.tag === 'text')).toBe(false)
		expect(new Set(flags.map(flag => JSON.stringify(flag))).size).toBe(PHONE_COUNTRIES.length)
	})

	it('триколоры — три полосы от своего верха до низа флага', () => {
		expect(countryFlag('RU')).toEqual([
			{ tag: 'rect', attrs: { x: 0, y: 0, width: 30, height: 20, fill: '#FFFFFF' } },
			{ tag: 'rect', attrs: { x: 0, y: 6.67, width: 30, height: 13.33, fill: '#0039A6' } },
			{ tag: 'rect', attrs: { x: 0, y: 13.33, width: 30, height: 6.67, fill: '#D52B1E' } },
		])
	})

	it('звёзды: пять лучей у Китая и Турции, восемь у Азербайджана', () => {
		const pointsOf = (code: string) => countryFlag(code).filter(shape => shape.tag === 'polygon')
		const vertices = (points: string | number) => String(points).split(' ').length
		expect(pointsOf('CN').map(shape => vertices(shape.attrs.points))).toEqual([10, 10, 10, 10, 10])
		expect(vertices(pointsOf('TR')[0].attrs.points)).toBe(10)
		expect(vertices(pointsOf('AZ')[0].attrs.points)).toBe(16)
		expect(pointsOf('TR')[0].attrs.points).toMatch(/^14\.3,10 /)
	})

	it('код без своего флага — плашка с двумя буквами кода; регистр не важен', () => {
		expect(countryFlag('ru')).toBe(countryFlag('RU'))
		expect(countryFlag('deu').at(-1)).toMatchObject({ tag: 'text', text: 'DE' })
	})
})
