const NARROW = /[ilI.,:;|'!`]/
const WIDE = /[mwMW@%]/
const UPPER = /\p{Lu}/u
const DIGIT = /\d/
const CJK = /[⺀-鿿가-힯＀-￯]/

function charWidth(char: string): number {
	if (CJK.test(char)) return 1
	if (NARROW.test(char)) return 0.28
	if (WIDE.test(char)) return 0.9
	if (UPPER.test(char)) return 0.66
	return DIGIT.test(char) ? 0.56 : 0.52
}

export function estimateTextWidth(text: string, fontSize = 12): number {
	let sum = 0
	for (const char of text) sum += charWidth(char)
	return Math.ceil(sum * fontSize)
}
