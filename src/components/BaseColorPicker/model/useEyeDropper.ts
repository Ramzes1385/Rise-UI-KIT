import type { EyeDropperConstructor } from '../types/BaseColorPicker.types'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'

function findEyeDropper(): EyeDropperConstructor | undefined {
	if (typeof window === 'undefined') return undefined
	return (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper
}

export function useEyeDropper(picker: UseColorPickerReturn) {
	const EyeDropper = findEyeDropper()

	return {
		isEyeDropperSupported: EyeDropper !== undefined,
		pickFromScreen(): Promise<void> {
			if (!EyeDropper) return Promise.resolve()
			return new EyeDropper()
				.open()
				.then(result => picker.setHex(result.sRGBHex))
				.catch(() => undefined)
		},
	}
}
