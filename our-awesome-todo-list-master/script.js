/**
 * ItemObject is a term (technically a class we have not really defined) we use to refer to the object
 *      representation of 'li' elements.
 * An ItemObject has the following fields:
 * Text: a string of paragraph text content in the 'li' element.
 * isCompleted: a boolean that is true if the 'li' element is completed and false otherwise.
 * id: an integer for the 'li' element that is unique among the whole list which the element belongs to.
 *      id is used to access the 'li' in a list, both as a DOM element and as an ItemObject
 */

//Field variables
let ul = document.getElementById("toDo"); //Get the UL
let menuToDo = document.getElementById("menuLists"); //Get the Menu UL
let elements = [];
let workbenchItemObjects;
let inputText = document.getElementById("textInput"); //Get the textinput
let workbenchIdCounter = 0;
let menuId = 0;
let dragItems = document.querySelectorAll(".draggable");
let menuItems = document.querySelectorAll(".menuLi");
let menuList = [];
let containers = document.querySelectorAll(".container");
let workbenchTitle = document.querySelector(".listTitle").textContent;

window.onload = function () {
    if (JSON.parse(localStorage.getItem(workbenchTitle)) != null) {
        workbenchItemObjects = JSON.parse(localStorage.getItem(workbenchTitle));
        workbenchItemObjects.forEach(function (item) { 
            loadListItem(item, ul, item.id);
            workbenchIdCounter++;
            }
        );
    } else {
        elements = localStorage.setItem(workbenchTitle, JSON.stringify(elements));
        workbenchItemObjects = JSON.parse(localStorage.getItem(workbenchTitle));
    }
    if (JSON.parse(localStorage.getItem("Andy")) != null) {
        menuList = JSON.parse(localStorage.getItem("Andy"));
        menuList.forEach(function (item) {
            let text = item.Title;
            let li = document.createElement("li");
            li.classList.add("menuLi");
            li.textContent = text;
            li.setAttribute("id", menuId);
            menuToDo.appendChild(li);
            menuId++;
            localStorage.setItem("Andy", JSON.stringify(menuList));
        });
    }
    containers.forEach(container => addDragoverEvent(container.parentElement));
}

//Document event listener
document.addEventListener('click', function (event) {
    let isCompleteAbleTask = event.target.classList.contains("strike");
    let isInputButton = event.target.classList.contains("inputButton");
    let isDeleteButton = event.target.classList.contains("deleteStyle");
    let isClearButton = event.target.classList.contains("clearButton");
    let isSaveButton = event.target.classList.contains("saveButton");
    let isMenuElement = event.target.classList.contains("menuLi");
    let isMinimize = event.target.classList.contains("minimize");

    if (isCompleteAbleTask) { setCompleted(event); }
    if (isDeleteButton) { deleteNode(event); }
    if (isClearButton) { clearClick(); }
    if (isSaveButton) { saveClick(); }
    if (isInputButton) {
        let input = document.getElementById("textInput").value.trim();
        addTask(input, ul, workbenchIdCounter);
        workbenchIdCounter++;
    }
    if (event.target.id == "listTitleButton") { editListTitle(); }
    if (isMenuElement) {
        if (!event.target.classList.contains("displaying")) {
            displayList(event.target);
            event.target.classList.add("displaying");
        } else {
            removeDisplay(event.target);
            event.target.classList.remove("displaying");
        }
    }
    if (isMinimize) {
        let list = [...menuToDo.querySelectorAll(".menuLi")];
        let variabel = event.target.parentElement.parentElement.firstChild;
        removeDisplay(variabel);
        let found = menuList.find(element => element.Title == variabel.textContent);
        list.forEach(function (bullet) {
            if (found.Title == bullet.textContent) {
                bullet.classList.remove("displaying");
            }
        });
    }
});

/**
 * Add dragover event for a given list.
 * @param wrapper is the DOM element that encapsulates list header, hr, ul and footer.
 */
function addDragoverEvent(wrapper) {
    wrapper.addEventListener('dragover', event => {
        let hr = wrapper.querySelector(".hr");
        event.preventDefault();
        let afterElement = getDragAfterElement(wrapper, event.clientY);
        let draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            hr.nextElementSibling.appendChild(draggable);
        } else {
            hr.nextElementSibling.insertBefore(draggable, afterElement);
        }
    })
}


// Add keyup event to text input field.
document.getElementById("textInput").addEventListener("keyup", event => checkKey(event));

// Event listeners for info symbol at the upper right corner.
document.querySelector(".informationIcon").addEventListener("mouseenter", () => document.querySelector(".informationBoard").classList.add("show"));
document.querySelector(".informationIcon").addEventListener("mouseleave", () => document.querySelector(".informationBoard").classList.remove("show"));

// Check to see if user presses ENTER key.
function checkKey(e) {
    let enterKey = 13;
    if (e.which == enterKey) { // Call addTask if ENTER, otherwise do nothing
        let txt = document.querySelector("#textInput").value.trim();
        addTask(txt, ul, workbenchIdCounter);
        workbenchIdCounter++;
    }
}

// What happens when you press the edit title button.
function editListTitle() {
    let newTitle = prompt("Please enter your list name", "");
    if (newTitle !== "" & newTitle != null) {
        let oldHeader = document.getElementById("toDoHeader");
        oldHeader.textContent = newTitle;
        let found = workbenchItemObjects.find(element => document.querySelector(".listTitle").textContent == element.Title);
    }
}

/**
 * What happens when you press the + button. Constructs a li DOM element and appends to ulEl.
 * @param input is the text of the list item.
 * @param ulEl is the ul DOM element of a list.
 * @param index is id of the list item.
 */
function addTask(input, ulEl, index) {
    if (input != "") { //Check to see if input text is non-empty
        let txt = input;
        let div = document.createElement("div");
        let child = document.createElement("p");
        let newToDo = document.createElement("li");
        let listName = ulEl.parentElement.querySelector("header").textContent;
        child.classList.add("textClass");
        child.textContent = txt;
        newToDo.className = "liBullet";
        newToDo.classList.add("draggable");
        newToDo.draggable = true;
        newToDo.setAttribute("id", index);
        newToDo.appendChild(child);
        newToDo.appendChild(div);
        addDragEvents(newToDo, listName);
        ulEl.appendChild(newToDo);
        workbenchItemObjects.push({ Text: input, isCompleted: false, id: index });
        localStorage.setItem(workbenchTitle, JSON.stringify(workbenchItemObjects));
        inputText.value = ''; // Reset the textinput
        createButtons(ulEl);
    }
}

// Adding dragging event listeners
function addDragEvents(input, oldList) {
    input.addEventListener('dragstart', () => {
        input.classList.add("dragging");
    })
    input.addEventListener('dragend', () => {
        input.classList.remove("dragging");
        let listName = input.parentElement.parentElement.querySelector("header").textContent;
        saveLocalStorage(oldList);
        saveLocalStorage(listName);
    })
}

/**
 * Add the buttons to the last li item in the given ul and save the li in the local storage.
 * @param ulEl is an ul DOM element that would contain list items.
 */
function createButtons(ulEl) {
    let editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.className = "editStyle";
    editButton.addEventListener('click', event => setEdit(event));

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("deleteStyle");

    let completeButton = document.createElement("button");
    completeButton.innerText = "";
    completeButton.classList.add("strike");

    let lastliEl = ulEl.lastChild;
    if (lastliEl.classList.contains("completedTask")) {
        lastliEl.lastChild.appendChild(deleteButton);
    } else {
        lastliEl.lastChild.append(editButton, deleteButton, completeButton);
    }
}

/**
 * If the Delete button is clicked. Deletes the list item of the Delete button.
 * @param event is the event of clicking the Delete button on a list item.
 */
function deleteNode(event) {

    function del(liEl) {
        liEl.parentElement.removeChild(liEl);
    }

    function delInStorage(found, listName, retrievedItems, eventId) {
        retrievedItems.splice(eventId, 1);
        while (eventId < retrievedItems.length) {
            retrievedItems[eventId].id = parseInt(eventId);
            eventId++;
        }
        workbenchIdCounter = parseInt(eventId);
        localStorage.setItem(listName, JSON.stringify(retrievedItems));
    }

    clickliButton(event, del, delInStorage);
}

/**
 * If the Edit button is clicked. Gives a prompt to Edit the list item of the Edit button.
 * @param event is the event of clicking the Edit button.
 */
function setEdit(event) {

    let newTxt = prompt("Enter new task", "");
    if (newTxt !== "" & newTxt != null) {
        function edit(liEl) {
            liEl.firstChild.textContent = "" + newTxt;
        }

        function editInStorage(found, listName, retrievedItems, eventId) {
            found.Text = newTxt;
            retrievedItems.splice(eventId, 1, found);
            localStorage.setItem(listName, JSON.stringify(retrievedItems));
        }

        clickliButton(event, edit, editInStorage);
    }
}

/**
 * If the Complete button is clicked. The list item of the Complete button will be marked as completed.
 * @param {*} event is the event of clicking the Complete button.
 */
function setCompleted(event) {

    function complete(liEl) {
        let buttonParent = liEl.lastChild;
        liEl.classList.remove("liBullet");
        liEl.classList.add("completedTask");
        buttonParent.removeChild(buttonParent.firstChild);
        buttonParent.removeChild(buttonParent.lastChild);
    }

    function completeInStorage(found, listName, retrievedItems, eventId) {
        found.isCompleted = true;
        retrievedItems.splice(eventId, 1, found);
        localStorage.setItem(listName, JSON.stringify(retrievedItems));
    }

    clickliButton(event, complete, completeInStorage);

}

// Clear all tasks button and clear the local storage.
function clearClick() {
    clearTodo();
    while (workbenchItemObjects.length > 0) {
        workbenchItemObjects.pop();
    }
    workbenchIdCounter = 0;
    localStorage.setItem(workbenchTitle, JSON.stringify(workbenchItemObjects));
}

// Clears the current todo list.
function clearTodo() {
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}

// Save the list to the menu.
function saveClick() {
    let listName = document.getElementById("toDoHeader").textContent;


    if (localStorage.getItem(listName) != null & listName != "ToDo List") {
        alert("Please give your list a name");
        return;
    }
    if (workbenchItemObjects.length == 0) {
        alert("You cannot save an empty list!");
        return;
    }
    if (listName !== "") {
        if (confirm("Do you want to save list " + listName + "?")) {
            let child = document.createElement("a");
            let txt = document.createTextNode(listName);
            let listElement = document.createElement("li");
            child.classList.add("menuText");
            child.appendChild(txt);
            child.title = listName;
            listElement.classList.add("menuLi");
            listElement.appendChild(child);
            menuToDo.appendChild(listElement);
            let retrievedItems = JSON.parse(localStorage.getItem(workbenchTitle));
            localStorage.setItem("" + listName, JSON.stringify(retrievedItems));
            clearClick();
            document.querySelector(".listTitle").textContent = "";
            menuList.push({ Title: listName, id: menuId });
            menuId++;
            localStorage.setItem("Andy", JSON.stringify(menuList));
            workbenchIdCounter = 0;
        }
    }
}

/**
 * Finding the next sibling based on y cursor position.
 * @param Wrapper is the DOM element that encapsulates list header, hr, ul and footer.
 * @param y is the vertical coordinate of the cursor.
 * @returns li DOM element that is closest to the cursor.
 */
function getDragAfterElement(Wrapper, y) {
    let draggableElements = [...Wrapper.querySelectorAll('.draggable:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        let box = child.getBoundingClientRect();
        let offset = y - box.top - box.height / 2;
        if (offset < 0 & offset > closest.offset) {
            return { offset: offset, element: child };
        } else { return closest };
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Save changes on lists in local storage
 * @param listName is the name of the list that is subjected to change
 *      and to be stored in local storage
 */
function saveLocalStorage(listName) {
    let wrapper = document.getElementById(listName);
    let ulEl = wrapper.querySelector("ul");
    let retrievedItems = [...ulEl.querySelectorAll('.draggable')];
    let itemObjects = [];
    let itemId = 0;
    retrievedItems.forEach(item => {
        if (item.classList.contains("completedTask")) {
            itemObjects.push({ Text: item.firstChild.textContent, isCompleted: true, id: itemId });
        }
        else {
            itemObjects.push({ Text: item.firstChild.textContent, isCompleted: false, id: itemId });
        }
        item.setAttribute("id", itemId);
        itemId++;
    });
    itemId = 0;
    while (itemId < workbenchItemObjects.length) {
        workbenchItemObjects[itemId].id = parseInt(itemId);
        itemId++;
    }
    localStorage.setItem("" + listName, JSON.stringify(itemObjects));
    if (listName == workbenchTitle) {
        workbenchItemObjects = JSON.parse(localStorage.getItem(listName));
    }
}

/**
 * Displays a list on the screen with all its list items.
 * @param list is the DOM element that contains the name of a list.
 */
function displayList(list) {
    let listWrapperEl = document.createElement("div");
    listWrapperEl.classList.add("listWrapper", "displayList");
    let listHeader = list.textContent;
    listWrapperEl.setAttribute("id", listHeader);
    let ul = document.createElement("ul");
    ul.classList.add("container");
    let hr = document.createElement("hr");
    hr.classList.add("hr");
    let footer = document.createElement("div");
    footer.classList.add("footer");
    let button = document.createElement("button");
    button.textContent = "Minimize";
    button.classList.add("minimize");
    footer.appendChild(button);
    let headerEl = document.createElement("header");
    headerEl.classList.add("displayHeader");
    let wrapper = document.querySelector(".wrapper");
    headerEl.textContent = listHeader;
    let listItems = JSON.parse(localStorage.getItem("" + listHeader));
    listWrapperEl.appendChild(headerEl);
    listWrapperEl.appendChild(hr);
    listWrapperEl.appendChild(ul);
    listWrapperEl.appendChild(footer);
    wrapper.appendChild(listWrapperEl);
    addDragoverEvent(listWrapperEl);

    listItems.forEach(element => {
        loadListItem(element, ul, element.id)
        }
    );
}

/**
 * Removes a div list from the display.
 * @param list is the li DOM element containing the list name.
 */
function removeDisplay(list) {
    let found = menuList.find(element => element.Title = list.textContent);
    let displayList = [...document.querySelectorAll(".displayHeader")];
    displayList.forEach(function (bullet) {
        if (bullet.textContent != found.Title) {
            return;
        }
        else {
            bullet.parentElement.remove();
        }
    });

}

/**
 * Append a single list item to some given 'ul' element.
 * @param item is the object representation of the list item to append AKA ItemObject.
 *      Should have the fields: 'Text', 'isCompleted' and 'id'.
 * @param ul is the DOM element with element type of 'ul' and is where 
 *      the item will be appended to.
 */
function loadListItem(item, ul, index) {
    if (item.isCompleted == true) {
        addTask(item.Text, ul, index);
        workbenchItemObjects.pop();
        let itemEl = ul.lastChild; // The 'item' represented as DOM object instead as just object
        itemEl.className = "completedTask";
        itemEl.classList.add("draggable");
        itemEl.lastChild.removeChild(itemEl.firstChild.nextSibling.firstChild); //Remove edit
        itemEl.lastChild.removeChild(itemEl.lastChild.lastChild); //Remove strike
        localStorage.setItem(workbenchTitle, JSON.stringify(workbenchItemObjects));
    } else {
        addTask(item.Text, ul, index);
        workbenchItemObjects.pop();
        localStorage.setItem(workbenchTitle, JSON.stringify(workbenchItemObjects));
    }
}

/**
 * Generalization of the bodies of setCompleted, -Edit and -Delete
 * Variability point 1: Mutation of the li element itself.
 * Variability point 2: The update on localStorage
 * @param event is the event that is registered
 * @param liMutator is a function of type '(liEl) => void'. For variability 1
 *      liMutator receives the li DOM element to mutate on and returns nothing.
 * @param storageMutator is a function of type '(found, listName, retrievedItems, eventId) => void'. For variability 2
 *      Receives ItemObject found to mutate on and replaces the old found in Array retrievedItems of listName via eventId
 */
function clickliButton(event, liMutator, storageMutator) {
    // DOM element li to mutate on
    let liEl = event.target.parentElement.parentElement;
    // Id of liEl in order to find in localStorage
    let eventId = liEl.id;
    // Name of list liEl belongs to
    let listName = liEl.parentElement.parentElement.querySelector("header").textContent;
    // Array of ItemObject listName consists of
    let retrievedItems = JSON.parse(localStorage.getItem(listName));
    // The ItemObject corresponding to liEl
    let found = retrievedItems.find(element => element.id == eventId);
    // Mutate liEl
    liMutator(liEl);
    // Mutate localStorage
    storageMutator(found, listName, retrievedItems, eventId);
}
