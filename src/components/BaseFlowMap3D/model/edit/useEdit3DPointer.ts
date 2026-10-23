import { watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { createPickAt, tagIdOf } from '../interaction/useFlowMap3DPointer'
import type { FlowMap3DEditTool, FlowMap3DPointerParts } from '../../types/internal/flowMap3dEdit.types'

const isScene = (target: EventTarget | null): boolean => target instanceof HTMLCanvasElement || Boolean(tagIdOf(target))

function useLinkTool(options: FlowMap3DPointerParts, nodeAt: (event: MouseEvent) => string | null) {
	const { parts, stage, state, connect } = options
	const { model } = parts.core
	let pressed: string | null = null

	function setTool(next: FlowMap3DEditTool): void {
		if (next === state.tool.value) return
		const [source] = state.targets()
		if (next === 'link' && !source) return
		state.tool.value = next
		if (next === 'select') {
			connect.clear()
			parts.core.announce(UI_FLOW_MAP_3D.EDIT_LINK_OFF)
			return
		}
		if (state.selected().length === 0) state.pickNode(source)
		connect.aim(null)
		parts.core.announce(formatMessage(UI_FLOW_MAP_3D.EDIT_LINK_START, { name: model.graph.value.nodes.get(source)?.label ?? source }))
	}

	function onLinkUp(event: PointerEvent): void {
		const from = pressed
		pressed = null
		stage.camera.setOrbit(true)
		const goal = from && state.tool.value === 'link' ? nodeAt(event) : null
		if (goal && goal !== state.selected()[0]) void connect.commit(goal).then(isDone => isDone && setTool('select'))
	}

	function pressLink(id: string, source: string | undefined): void {
		pressed = id
		if (id === source) stage.camera.setOrbit(false)
		window.addEventListener('pointerup', onLinkUp, { once: true })
	}

	return { setTool, pressLink }
}

export function useEdit3DPointer(options: FlowMap3DPointerParts) {
	const { parts, stage, state, drag, connect } = options
	const pickAt = createPickAt({
		hostRef: parts.refs.viewportRef,
		getContent: () => stage.scene.content.value,
		getCamera: () => stage.viewport.camera.value,
	})
	const nodeAt = (event: MouseEvent): string | null => tagIdOf(event.target) ?? pickAt(event.clientX, event.clientY)
	const link = useLinkTool(options, nodeAt)

	function onDown(event: PointerEvent): void {
		if (!state.isActive.value || event.button !== 0 || !event.isPrimary || !isScene(event.target)) return
		const id = nodeAt(event)
		if (!id) return
		if (state.tool.value === 'select') drag.begin(id, event)
		else link.pressLink(id, state.selected()[0])
	}

	function onMove(event: PointerEvent): void {
		if (state.isActive.value && state.tool.value === 'link' && isScene(event.target)) connect.track(event, nodeAt(event))
	}

	watch(
		parts.refs.viewportRef,
		(host, _previous, onCleanup) => {
			if (!host) return
			host.addEventListener('pointerdown', onDown, true)
			host.addEventListener('pointermove', onMove)
			onCleanup(() => {
				host.removeEventListener('pointerdown', onDown, true)
				host.removeEventListener('pointermove', onMove)
			})
		},
		{ immediate: true, flush: 'post' },
	)

	return {
		setTool: link.setTool,
		toggleLink: () => link.setTool(state.tool.value === 'link' ? 'select' : 'link'),
		reset(palette: { close: () => void }): void {
			state.tool.value = 'select'
			connect.clear()
			palette.close()
		},
		guardClick:
			<T extends (event: MouseEvent) => void>(handler: T) =>
			(event: MouseEvent): void => {
				if (!state.isActive.value) return handler(event)
				if (!drag.consumeClick() && state.tool.value !== 'link') handler(event)
			},
	}
}
