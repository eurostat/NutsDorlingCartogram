
import $ from "jquery";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/standalone.css";
import "./css/styles.css";

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faTwitter, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import {
    faCircle,
    faShareAlt,
    faSpinner,
    faInfo,
    faCode,
    faCheck,
    faSort,
    faSortDown,
    faSortUp,
    faGlobeEurope,
    faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'
import { tooltip, modal } from 'bootstrap'
library.add(
    faTwitter,
    faFacebookF,
    faCircle,
    faShareAlt,
    faSpinner,
    faInfo,
    faCheck,
    faCode,
    faSort,
    faSortDown,
    faSortUp,
    faGlobeEurope,
    faExternalLinkAlt
)

export { dorling } from "./dorling.js";
