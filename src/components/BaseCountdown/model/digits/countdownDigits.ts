import type { CountdownDigit, CountdownSegment } from '../../types/BaseCountdown.types'

const DIGIT = /^\p{Nd}$/u

const DAYS_SEPARATOR = ' '

const CLOCK_SEPARATOR = ':'

export function countdownDigits(text: string, unit: string): CountdownDigit[] {
	const chars = Array.from(text)
	return chars.map((char, index) => ({ key: `${unit}-${chars.length - 1 - index}`, char, isDigit: DIGIT.test(char) }))
}

function separator(previous: CountdownSegment): CountdownDigit {
	return { key: `sep-${previous.unit}`, char: previous.unit === 'days' ? DAYS_SEPARATOR : CLOCK_SEPARATOR, isDigit: false }
}

export function segmentDigits(segments: readonly CountdownSegment[]): CountdownDigit[] {
	return segments.flatMap((segment, index) => {
		const digits = countdownDigits(segment.text, segment.unit)
		return index === 0 ? digits : [separator(segments[index - 1]), ...digits]
	})
}
