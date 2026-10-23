import { layoutBottom } from './dashboardLayout'
import type {
	DashboardBreakpoint,
	DashboardBreakpoints,
	DashboardColumns,
	DashboardLayoutItem,
	DashboardLayouts,
	DashboardMetrics,
	DashboardPointerDrag,
	DashboardRect,
} from '../../types/BaseDashboardGrid.types'

const DEFAULT_COLS = 12

const DEFAULT_BREAKPOINTS: DashboardBreakpoints = { sm: 0, md: 640, lg: 1024 }

const FALLBACK_ORDER: Record<DashboardBreakpoint, DashboardBreakpoint[]> = {
	sm: ['sm', 'md', 'lg'],
	md: ['md', 'lg', 'sm'],
	lg: ['lg', 'md', 'sm'],
}

export function createMetrics(width: number, cols: number, size: { rowHeight: number; gap: number }): DashboardMetrics {
	const colWidth = Math.max(0, (width - size.gap * (cols - 1)) / cols)
	return { cols, colWidth, rowHeight: size.rowHeight, gap: size.gap }
}

export function itemRect(item: DashboardLayoutItem, metrics: DashboardMetrics): DashboardRect {
	const { colWidth, rowHeight, gap } = metrics
	return {
		left: item.x * (colWidth + gap),
		top: item.y * (rowHeight + gap),
		width: item.w * colWidth + (item.w - 1) * gap,
		height: item.h * rowHeight + (item.h - 1) * gap,
	}
}

export function cellAt(point: { left: number; top: number }, metrics: DashboardMetrics): { x: number; y: number } {
	return {
		x: Math.round(point.left / (metrics.colWidth + metrics.gap || 1)),
		y: Math.round(point.top / (metrics.rowHeight + metrics.gap || 1)),
	}
}

export function sizeAt(extent: { width: number; height: number }, metrics: DashboardMetrics): { w: number; h: number } {
	return {
		w: Math.round((extent.width + metrics.gap) / (metrics.colWidth + metrics.gap || 1)),
		h: Math.round((extent.height + metrics.gap) / (metrics.rowHeight + metrics.gap || 1)),
	}
}

export function gridHeight(layout: DashboardLayoutItem[], metrics: DashboardMetrics): number {
	const rows = layoutBottom(layout)
	return Math.max(0, rows * (metrics.rowHeight + metrics.gap) - metrics.gap)
}

export function resolveBreakpoints(custom?: Partial<DashboardBreakpoints>): DashboardBreakpoints {
	return { ...DEFAULT_BREAKPOINTS, ...custom }
}

export function breakpointFor(width: number, breakpoints: DashboardBreakpoints): DashboardBreakpoint {
	if (width <= 0 || width >= breakpoints.lg) return 'lg'
	return width >= breakpoints.md ? 'md' : 'sm'
}

export function colsFor(cols: number | DashboardColumns, breakpoint: DashboardBreakpoint): number {
	const value = typeof cols === 'number' ? cols : (cols[breakpoint] ?? cols.lg ?? DEFAULT_COLS)
	return Math.max(1, Math.round(value) || DEFAULT_COLS)
}

export function pickLayout(layouts: DashboardLayouts, breakpoint: DashboardBreakpoint): DashboardLayoutItem[] | undefined {
	const found = FALLBACK_ORDER[breakpoint].find(name => layouts[name])
	return found ? layouts[found] : undefined
}

export function draggedRect(drag: DashboardPointerDrag, delta: { dx: number; dy: number }, metrics: DashboardMetrics): DashboardRect {
	const origin = itemRect(drag.origin, metrics)
	if (drag.mode === 'resize') {
		return {
			...origin,
			width: Math.max(metrics.colWidth, origin.width + delta.dx),
			height: Math.max(metrics.rowHeight, origin.height + delta.dy),
		}
	}
	const maxLeft = Math.max(0, metrics.cols * (metrics.colWidth + metrics.gap) - metrics.gap - origin.width)
	return { ...origin, left: Math.min(Math.max(0, origin.left + delta.dx), maxLeft), top: Math.max(0, origin.top + delta.dy) }
}
