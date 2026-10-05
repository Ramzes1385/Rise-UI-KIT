import { computed, ref } from 'vue'
import { cardCoverLayer } from '@utils/form/cardFaceUtils'
import type { CardCoverProps } from '../types/cardCover.types'

export function useCardCover(props: CardCoverProps) {
	const failedImage = ref<string>()
	const layer = computed(() => cardCoverLayer(props.cover))
	return {
		image: computed(() => (layer.value.image === failedImage.value ? undefined : layer.value.image)),
		fillStyle: computed(() => (layer.value.fill ? { '--card-cover-fill': layer.value.fill } : undefined)),
		handleImageError(): void {
			failedImage.value = layer.value.image
		},
	}
}
