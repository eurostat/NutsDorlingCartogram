
import 'core-js/es/symbol/key-for'
import 'core-js/features/set'
import 'core-js/stable/array/includes'
import 'core-js/stable/object/assign'

import 'regenerator-runtime/runtime'

// NutsDorlingCartogram
import "./css/standalone.css";
import "./css/styles.css";

//bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { modal } from 'bootstrap';

// font awesome
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faTwitter, faFacebookF } from '@fortawesome/free-brands-svg-icons'
import { faCircle, faShareAlt, faInfo, faCode, faExternalLinkAlt, faGlobeEurope, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
// import { tooltip, modal } from 'bootstrap'

library.add(faTwitter, faFacebookF, faCircle, faShareAlt, faExternalLinkAlt, faInfo, faCode, faGlobeEurope, faEllipsisV)
dom.watch();

export { dorling } from "./dorling.js";
