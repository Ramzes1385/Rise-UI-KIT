import type { Ref } from 'vue'
import { getCurrentInstance } from 'vue'
import { useFlowMap3DView } from '../view/useFlowMap3DView'
import { useFlowMap3DFrame } from '../view/useFlowMap3DContext'
import { useFlowMap3DMotion } from '../motion/useFlowMap3DMotion'
import { useFlowModel } from '@components/BaseFlowMap/model/useFlowModel'
import { readListeners } from '@components/BaseFlowMap/model/state/flowListeners'
import { useFlowAnnouncer } from '@components/BaseFlowMap/model/a11y/useFlowAnnouncer'
import type { BaseFlowMap3DEmits, FlowMap3DProps } from '../../types/BaseFlowMap3D.types'
import { useFlowVisibility } from '@components/BaseFlowMap/model/viewport/useFlowVisibility'
import type { FlowModelProps } from '@components/BaseFlowMap/types/internal/flowModel.types'
import type { FlowEmit } from '@components/BaseFlowMap/types/internal/core/flowModelCore.types'

function withMode(props: FlowMap3DProps, mode: Readonly<Ref<string>>): FlowModelProps {
	return new Proxy(props, { get: (target, key) => (key === 'mode' ? mode.value : Reflect.get(target, key)) }) as unknown as FlowModelProps
}

export function useFlowMap3DCore(props: FlowMap3DProps, emit: BaseFlowMap3DEmits, rootRef: Readonly<Ref<HTMLElement | null>>) {
	const instance = getCurrentInstance()
	const motion = useFlowMap3DMotion(rootRef)
	const isReducedMotion = motion.isReduced
	const { announcement, announce } = useFlowAnnouncer()
	const state = useFlowMap3DFrame(props, rootRef)
	const { isVisible } = useFlowVisibility(rootRef as Ref<HTMLElement | null>)
	const view = useFlowMap3DView({ props, emit, isNarrow: () => state.isNarrow.value })
	const model = useFlowModel(withMode(props, view.mode), {
		emit: emit as unknown as FlowEmit,
		listeners: () => readListeners(instance?.vnode.props),
		environment: { isVisible: () => isVisible.value, isReducedMotion: () => isReducedMotion.value, announce },
		isCompact: () => state.isCompact.value,
	})
	return { model, view, state, announce, announcement, isReducedMotion, isVisible, motion }
}
