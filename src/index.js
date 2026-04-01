import "./index.css"
import {isStorageAvailable} from "./storage.js"

if (isStorageAvailable("localStorage")) {
  console.log("Yippee! We can use localStorage awesomeness")
} else {
  console.log("Too bad, no localStorage for us")
}
