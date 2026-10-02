import { onMounted, watch } from 'vue'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { DeepLinkContext } from '../../types/imageMapInternal.types'

function writeParam(param: string, id: string | null): void {
	const url = new URL(window.location.href)
	if (url.searchParams.get(param) === id) return
	if (id) url.searchParams.set(param, id)
	else url.searchParams.delete(param)
	window.history.replaceState(window.history.state, '', url)
}

export function useImageMapDeepLink(props: ImageMapProps, context: DeepLinkContext) {
	onMounted(() => {
		if (!props.hasDeepLinking) return
		const id = new URL(window.location.href).searchParams.get(props.deepLinkParam)
		if (id && context.findObject(id) && !context.findObject(id)?.isDisabled) context.activateFromLink(id)
	})

	watch(context.getActive, id => {
		if (props.hasDeepLinking) writeParam(props.deepLinkParam, id)
	})
}
