const weighted = (value: string, weights: readonly number[]): number =>
	weights.reduce((sum, weight, index) => sum + weight * Number(value[index]), 0)

const INN_10 = [2, 4, 10, 3, 5, 9, 4, 6, 8]

const INN_11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]

const INN_12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]

const ACCOUNT_WEIGHTS = [7, 1, 3]

const control = (sum: number, divisor: number): number => (sum % divisor) % 10

export function isValidInn(value: string): boolean {
	if (/^\d{10}$/.test(value)) return control(weighted(value, INN_10), 11) === Number(value[9])
	if (!/^\d{12}$/.test(value)) return false
	return control(weighted(value, INN_11), 11) === Number(value[10]) && control(weighted(value, INN_12), 11) === Number(value[11])
}

export const isValidKpp = (value: string): boolean => /^\d{4}[\dA-Z]{2}\d{3}$/.test(value)

export function isValidOgrn(value: string): boolean {
	if (!/^(\d{13}|\d{15})$/.test(value)) return false
	return control(Number(value.slice(0, -1)), value.length === 13 ? 11 : 13) === Number(value.slice(-1))
}

export const isValidBik = (value: string): boolean => /^04\d{7}$/.test(value)

function hasAccountKey(value: string): boolean {
	const sum = [...value].reduce((total, digit, index) => total + ((Number(digit) * ACCOUNT_WEIGHTS[index % 3]) % 10), 0)
	return sum % 10 === 0
}

export function isValidAccount(account: string, bik: string): boolean {
	return /^\d{20}$/.test(account) && isValidBik(bik) && hasAccountKey(`${bik.slice(-3)}${account}`)
}

export function isValidCorrespondentAccount(account: string, bik: string): boolean {
	return /^\d{20}$/.test(account) && isValidBik(bik) && hasAccountKey(`0${bik.slice(4, 6)}${account}`)
}

export function isValidSnils(value: string): boolean {
	const digits = value.replace(/[\s-]/g, '')
	if (!/^\d{11}$/.test(digits)) return false
	if (Number(digits.slice(0, 9)) <= 1001998) return true
	const sum = [...digits.slice(0, 9)].reduce((total, digit, index) => total + Number(digit) * (9 - index), 0)
	return (sum % 101) % 100 === Number(digits.slice(9))
}
