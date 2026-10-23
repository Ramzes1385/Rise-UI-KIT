import { onMounted, watch } from 'vue'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { DeepLinkContext } from '../../types/internal/imageMapInternal.types'

function writeParam(param: string, id: string | null): void {
	const url = new URL(window.location.href)
	if (url.searchParams.get(param) === id) return
	if (id) url.searchParams.set(param, id)
	else url.searchParams.delete(param)
	window.history.replaceState(window.history.state, '', url)
}

function openFromLink(context: DeepLinkContext, id: string): void {
	const item = context.findObject(id)
	if (item && !item.isDisabled && context.isShown(item)) context.activateFromLink(id)
}

function openWhenLoaded(context: DeepLinkContext, id: string): void {
	if (context.findObject(id)) {
		openFromLink(context, id)
		return
	}
	const stop = watch(
		() => context.findObject(id),
		() => {
			stop()
			openFromLink(context, id)
		},
	)
}

export function useImageMapDeepLink(props: ImageMapProps, context: DeepLinkContext) {
	onMounted(() => {
		if (!props.hasDeepLinking) return
		const id = new URL(window.location.href).searchParams.get(props.deepLinkParam)
		if (id) openWhenLoaded(context, id)
	})

	watch(context.getActive, id => {
		if (props.hasDeepLinking) writeParam(props.deepLinkParam, id)
	})
}
