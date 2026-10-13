/** BaseResult result screen, BaseBanner announcement and BaseCookieConsent cookie consent */
export const enNotices = {
	result: {
		/** Default titles: replaced by the `title` prop */
		TITLE_SUCCESS: 'Done',
		TITLE_INFO: 'Information',
		TITLE_WARNING: 'Attention required',
		TITLE_ERROR: 'Something went wrong',
		TITLE_403: 'Access denied',
		TITLE_404: 'Page not found',
		TITLE_500: 'Server error',
		/** Default descriptions of the codes: replaced by the `description` prop */
		DESCRIPTION_403: 'You do not have permission to view this page.',
		DESCRIPTION_404: 'The address may be mistyped or the page may have been removed.',
		DESCRIPTION_500: 'An error occurred on the server. Please try again later.',
	},
	banner: {
		/** Accessible name of the announcement region (`aria-label`) */
		LABEL: 'Announcement',
	},
	cookieConsent: {
		TITLE: 'We use cookies',
		DESCRIPTION: 'They keep the site working and help us improve it. Choose which cookies to allow.',
		ACCEPT_ALL: 'Accept all',
		REJECT_ALL: 'Reject all',
		ACCEPT_SELECTED: 'Only selected',
		CUSTOMIZE: 'Customize',
		CUSTOMIZE_CLOSE: 'Hide settings',
		/** Accessible name of the category list */
		CATEGORIES: 'Cookie categories',
		/** Mark of a required category: it cannot be turned off */
		REQUIRED: 'Always on',
	},
}
