import { describeLibraryModel } from '../../libraryChecks'
import { buildAnalytics } from '../../../../models/library/ops/analytics'

describeLibraryModel('analytics', buildAnalytics, {
	parts: ['body', 'accent', 'detail', 'screen', 'light'],
	animations: ['pulse'],
	anchorY: 1.36,
})
