import { describeLibraryModel } from '../../libraryChecks'
import { buildRocket } from '../../../../models/library/goals/rocket'

describeLibraryModel('rocket', buildRocket, { parts: ['body', 'accent', 'glass', 'light'], animations: ['pulse'], anchorY: 1.2 })
