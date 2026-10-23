import { resolveCssColor } from '@utils/data/colorUtils'

const DEFAULT_COLOR = 'var(--rise-primary)'

export function resolveColor(area: HTMLElement | null, color: string | undefined): string {
	return resolveCssColor(color ?? DEFAULT_COLOR, area)
}
