import { describe, expect, it } from 'vitest'
import { useInputMask } from './useInputMask'

describe('useInputMask', () => {
	const { applyMask, stripMask } = useInputMask({ getMask: () => '##.##.####' })

	it('должен накладывать маску на дату', () => {
		expect(applyMask('12042024', '##.##.####')).toBe('12.04.2024')
	})

	it('должен очищать значение от маски', () => {
		expect(stripMask('12.04.2024', '##.##.####')).toBe('12042024')
	})
})
