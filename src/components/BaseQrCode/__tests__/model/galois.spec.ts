import { GF, generatorPolynomial, multiply, reedSolomon } from '../../model/encode/galois'

describe('поле GF(256) и код Рида — Соломона', () => {
	it('таблицы степеней и логарифмов обратны друг другу', () => {
		expect([GF.exp[0], GF.exp[8], GF.exp[255]]).toEqual([1, 0x1d, 1])
		for (let value = 1; value < 256; value++) expect(GF.exp[GF.log[value]]).toBe(value)
	})

	it('умножение: ноль поглощает, единица нейтральна, α · α⁷ = α⁸', () => {
		expect([multiply(0, 7), multiply(7, 0), multiply(1, 0x53), multiply(2, 0x80)]).toEqual([0, 0, 0x53, 0x1d])
	})

	it('порождающий многочлен степени 7 совпадает с таблицей стандарта и берётся из кэша', () => {
		expect(generatorPolynomial(7).map(value => GF.log[value])).toEqual([0, 87, 229, 146, 149, 238, 102, 21])
		expect(generatorPolynomial(7)).toBe(generatorPolynomial(7))
	})

	it('10 байт коррекции для «HELLO WORLD» версии 1-M', () => {
		const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]
		expect(reedSolomon(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23])
	})
})
