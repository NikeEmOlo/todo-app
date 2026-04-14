import "./index.css"
import "./tasks.css"
import {isStorageAvailable, loadFromLocal} from "./storage.js"
import { initTabs } from "./display.js"

isStorageAvailable("localStorage")
initTabs()


// addTask('Go to the shop', 'Need to go asap', '11/08/2027', 'Home')
// addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')
// addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')
// addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')