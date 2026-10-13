/** BaseFileManager file manager */
export const enFileManager = {
	fileManager: {
		/** Default area name (`aria-label`) */
		LABEL: 'File manager',
		/** Root name in the tree and breadcrumbs */
		ROOT: 'Files',
		TREE_LABEL: 'Folders',
		/** Path navigation name: `{name}` is the area name (`aria-label`) */
		PATH_LABEL: 'Path: {name}',
		/** List name: `{name}` is the open folder */
		LIST_LABEL: 'Contents of folder "{name}"',
		UP: 'Up',
		SEARCH_LABEL: 'Search by name in this folder',
		SEARCH_PLACEHOLDER: 'Search by name',
		ACTIONS_LABEL: 'File actions',
		NEW_FOLDER: 'New folder',
		/** Name suggested for a new folder */
		NEW_FOLDER_NAME: 'New folder',
		UPLOAD: 'Upload',
		OPEN: 'Open',
		RENAME: 'Rename',
		MOVE: 'Move to…',
		DELETE: 'Delete',
		VIEW_LABEL: 'View',
		VIEW_LIST: 'List',
		VIEW_GRID: 'Grid',
		SORT_LABEL: 'Sort',
		SORT_NAME: 'Name',
		SORT_SIZE: 'Size',
		SORT_MODIFIED: 'Modified',
		SORT_ASC: 'ascending',
		SORT_DESC: 'descending',
		/** Sort button accessible name: `{name}` is the column and order */
		SORT_BY: 'Sort by: {name}',
		/** Folder mark for screen readers */
		KIND_FOLDER: 'Folder',
		LOADING: 'Loading files…',
		EMPTY_TITLE: 'This folder is empty',
		EMPTY_TEXT: 'Create a folder or upload files.',
		SEARCH_EMPTY_TITLE: 'Nothing found',
		/** `{query}` is the search query */
		SEARCH_EMPTY_TEXT: 'No item in this folder has a name containing "{query}".',
		ERROR_TITLE: 'Could not load files',
		RETRY: 'Try again',
		/** Field accessible name when creating a folder */
		CREATE_LABEL: 'New folder name',
		/** Field accessible name when renaming: `{name}` is the previous name */
		RENAME_LABEL: 'New name for "{name}"',
		NAME_EMPTY: 'Enter a name',
		NAME_FORBIDDEN: 'The name cannot contain "/" or "\\"',
		NAME_EXISTS: 'An item with this name already exists in this folder',
		/** `{name}` is the item name */
		DELETE_ONE_TITLE: 'Delete "{name}"?',
		/** `{count}` is the number of items with a label, for example "3 items" */
		DELETE_MANY_TITLE: 'Delete {count}?',
		DELETE_DESCRIPTION: 'This action cannot be undone.',
		DELETE_FOLDER_NOTE: 'Folders are deleted together with their contents.',
		MOVE_TITLE: 'Move to…',
		MOVE_HINT: 'Choose the destination folder.',
		MOVE_TREE_LABEL: 'Destination folder',
		MOVE_SUBMIT: 'Move',
		UPLOAD_TITLE: 'Upload files',
		UPLOAD_SUBMIT: 'Upload',
	},
}
