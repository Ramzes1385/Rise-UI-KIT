import { curvedRouter } from './curved'
import { straightRouter } from './straight'
import { orthogonalRouter } from './orthogonal'
import { UI_FLOW_MAP } from '@/locales/messages'
import { createRegistry } from '../notations/registry'
import type { FlowRouter } from '../../types/api/flowLayout.types'

const BUILTIN_ROUTERS: readonly FlowRouter[] = [straightRouter, curvedRouter, orthogonalRouter]

export function createRouterRegistry(extra: readonly FlowRouter[]): Map<string, FlowRouter> {
	return createRegistry([...BUILTIN_ROUTERS, ...extra], () => UI_FLOW_MAP.ENTITY_ROUTER)
}
