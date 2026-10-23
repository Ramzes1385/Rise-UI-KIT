import { describeLibraryModel } from '../../libraryChecks'
import { buildFlag } from '../../../../models/library/goals/flag'

describeLibraryModel('flag', buildFlag, { parts: ['body', 'accent', 'detail', 'light'], animations: ['pulse'], anchorY: 1.15 })
