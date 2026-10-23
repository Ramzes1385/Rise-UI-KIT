import { useEditContext } from '../useFlowEditing'

export function useFlowEditOverlay() {
	const { state } = useEditContext().env
	return { isActive: state.isActive, isCompact: state.isCompact }
}
