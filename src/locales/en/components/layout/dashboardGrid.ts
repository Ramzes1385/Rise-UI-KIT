/** BaseDashboardGrid widget grid */
export const enDashboardGrid = {
	dashboardGrid: {
		/** Accessible name of the grid (`aria-label`) */
		LABEL: 'Widget grid',
		/** Empty state */
		EMPTY: 'No widgets',
		/** Name of a widget without `label`: {n} is its number in order */
		ITEM: 'Widget {n}',
		/** Hidden hint of the widgets in edit mode */
		HINT: 'Enter or Space picks up a widget, arrow keys move it, Shift with arrow keys resizes it, Enter drops it, Escape cancels',
		/** Keyboard mode announcements: {item} is the name, {x} and {y} are the column and row from one, {w} and {h} are the size */
		PICKED: 'Widget "{item}" picked up. Arrow keys move it, Shift with arrow keys resizes it, Enter drops it, Escape cancels',
		MOVED: '"{item}": column {x}, row {y}, width {w}, height {h}',
		DROPPED: 'Widget "{item}" dropped: column {x}, row {y}, width {w}, height {h}',
		CANCELLED: 'Move cancelled, widget "{item}" is back in its place',
	},
}
