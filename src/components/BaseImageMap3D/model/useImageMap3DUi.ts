import { computed } from 'vue'
import type { Ref } from 'vue'
import { useDefaults } from '@composables/base/useDefaults'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import { IMAGE_MAP_3D_PARTS } from '../types/BaseImageMap3D.types'
import type { BaseImageMap3DPart, ImageMap3DProps } from '../types/BaseImageMap3D.types'
import type { BaseImageMapPart } from '@components/BaseImageMap/types/BaseImageMap.types'

const PARTS: Array<BaseImageMap3DPart | 'root'> = ['root', ...IMAGE_MAP_3D_PARTS]

function partClass(block: string, part: string): string {
	return part === 'root' ? block : `${block}__${part}`
}

export function useImageMap3DUi(props: Pick<ImageMap3DProps, 'ui'>, classes: Readonly<Ref<Record<string, string | undefined>>>) {
	const global = useDefaults()?.BaseImageMap3D?.ui as UiProp<BaseImageMap3DPart> | undefined
	const extra = (part: Parameters<UiClassFn<BaseImageMap3DPart>>[0]) => [global?.[part], props.ui?.[part]].filter(Boolean).join(' ')
	const withBlock = (block: string) => (part: Parameters<UiClassFn<BaseImageMap3DPart>>[0]) =>
		[partClass(block, part), extra(part)].filter(Boolean).join(' ')
	const ui: UiClassFn<BaseImageMap3DPart> = withBlock('base-image-map-3d')

	return {
		ui,
		sharedUi: withBlock('base-image-map') as UiClassFn<BaseImageMapPart>,
		popupClass: computed(() => [ui('popup'), classes.value.popup].filter(Boolean).join(' ')),
		uiProp: computed(() => Object.fromEntries(PARTS.map(part => [part, extra(part)]).filter(([, value]) => value))),
	}
}
