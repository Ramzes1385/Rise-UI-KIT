import { getCurrentInstance } from 'vue'

function useExplicitPropDetection() {
	const rawProps = getCurrentInstance()?.vnode.props ?? null

	function wasPropPassed(propName: string): boolean {
		return rawProps !== null && propName in rawProps
	}

	return { wasPropPassed }
}

export { useExplicitPropDetection }
