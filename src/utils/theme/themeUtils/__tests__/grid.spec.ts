import { createTheme } from '../theme'
import { describe, expect, it } from 'vitest'

const STEPS = [0, 51, 102, 153, 204, 255].map(value => value.toString(16).padStart(2, '0'))
const BRANDS = STEPS.flatMap(r => STEPS.flatMap(g => STEPS.map(b => `#${r}${g}${b}`)))
const NEUTRALS = ['tinted', 'gray', '#64748b', '#78716c']

function failuresOf(input: Parameters<typeof createTheme>[0]): string[] {
	return createTheme(input)
		.contrast.filter(row => !row.ok && !row.informational)
		.map(row => `${input.primary} ${input.neutral ?? ''} ${row.mode} ${row.fg}/${row.bg} ${row.ratio}`)
}

describe('createTheme: сетка брендов', () => {
	it('216 брендов (RGB с шагом 51) × 4 нейтрали — все обязательные пары контраста в обоих режимах проходят', () => {
		expect(BRANDS).toHaveLength(216)
		const failures = BRANDS.flatMap(primary => NEUTRALS.flatMap(neutral => failuresOf({ name: 'grid', primary, neutral })))
		expect(failures).toEqual([])
	})

	it('с primaryDark и цветами статусов — тоже без провалов', () => {
		const failures: string[] = []
		for (const primary of BRANDS.filter((_, index) => index % 7 === 0)) {
			const theme = createTheme({
				name: 'grid',
				primary,
				primaryDark: primary,
				success: primary,
				info: primary,
				warning: primary,
				error: primary,
			})
			for (const row of theme.contrast)
				if (!row.ok && !row.informational) failures.push(`${primary} ${row.mode} ${row.fg}/${row.bg} ${row.ratio}`)
		}
		expect(failures).toEqual([])
	})
})
