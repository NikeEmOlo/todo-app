import "./index.css"
import {Task} from "./tasks.js";
import {isStorageAvailable} from "./storage.js"

window.Task = Task;

if (isStorageAvailable("localStorage")) {
  console.log("Yippee! We can use localStorage awesomeness")
} else {
  console.log("Too bad, no localStorage for us")
}

