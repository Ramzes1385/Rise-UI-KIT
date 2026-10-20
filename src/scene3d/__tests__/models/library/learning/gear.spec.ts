import { describeLibraryModel } from '../../libraryChecks'
import { buildGear } from '../../../../models/library/learning/gear'

describeLibraryModel('gear', buildGear, { parts: ['body', 'accent'], animations: ['spin'], anchorY: 1.1 })
