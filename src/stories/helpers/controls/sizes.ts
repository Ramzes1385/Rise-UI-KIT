/** Шкала размеров для stories «Sizes»: sizeScale — одно число в процентах; пресеты повторяют шкалу xs–xl из Nuxt UI, высота контрола указана в подписи каждого значения. */
export const SIZE_PRESETS = [
	{ name: 'xs', sizeScale: 75, control: '24px' },
	{ name: 'sm', sizeScale: 87.5, control: '28px' },
	{ name: 'md', sizeScale: 100, control: '32px' },
	{ name: 'lg', sizeScale: 112.5, control: '36px' },
	{ name: 'xl', sizeScale: 125, control: '40px' },
] as const

/** Подпись пресета для примеров: «md · 100». */
export function sizeLabel(preset: (typeof SIZE_PRESETS)[number]): string {
	return `${preset.name} · ${preset.sizeScale}`
}
