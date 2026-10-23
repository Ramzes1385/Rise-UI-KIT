import { cleanRequisite } from '../../model/requisites/requisiteRules'

describe('cleanRequisite', () => {
	it('оставляет цифры; КПП — ещё и латинские буквы', () => {
		expect(cleanRequisite('7707-083893 x', 'inn')).toBe('7707083893')
		expect(cleanRequisite('7707 abc83', 'kpp')).toBe('7707ABC83')
	})

	it('цифры и буквы полной ширины (японский IME) приводятся к обычным', () => {
		expect(cleanRequisite('７７０７　０８３８９３', 'inn')).toBe('7707083893')
		expect(cleanRequisite('７７０７ａｂ８３', 'kpp')).toBe('7707AB83')
	})
})
