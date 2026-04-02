import "./index.css"
import "./tasks.css"
import {isStorageAvailable} from "./storage.js"
import { addTask } from "./tasks.js"


if (isStorageAvailable("localStorage")) {
  console.log("Yippee! We can use localStorage awesomeness")
} else {
  console.log("Too bad, no localStorage for us")
}

addTask('Go to the shop', 'Need to go asap', '11/08/2027', 'Home')
addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')
addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')
addTask('Buy present for ricky', 'TKMAxx', '11/08/2027', 'Gifts')