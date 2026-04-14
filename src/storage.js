let localStorageAvailable = false;

function isStorageAvailable(type) {
  let storage = false;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    localStorageAvailable = true;
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

function saveToLocal(key, data) {
  if (localStorageAvailable){
    localStorage.setItem(key, JSON.stringify(data))
  } else {
    console.log("Local Storage is not available")
  }
}

function loadFromLocal(data) {
  return JSON.parse(localStorage.getItem(data)) || [];
}

export {
    saveToLocal,
    isStorageAvailable,
    localStorageAvailable,
    loadFromLocal,
}