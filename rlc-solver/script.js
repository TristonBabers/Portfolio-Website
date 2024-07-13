//####################[Interface Interaction]############################//
let circuitMap = new Map();
const GRID_SIZE = 70;

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.component').forEach(item => {
    item.addEventListener('dragstart', drag);
    item.addEventListener('click', doubleClick);
    item.dataset.rotation = 0;
  });
  document.addEventListener('drop', discard)
  let overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.querySelector('.circuit-board').appendChild(overlay);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

function preventDefault(anEvent) {
  anEvent.preventDefault();
}

function drag(anEvent) {
  anEvent.dataTransfer.setData('componentID', anEvent.target.id);
  showOverlay();
}

function cloneDrag(anEvent) {
  anEvent.dataTransfer.setData('componentID', 'clone');
  anEvent.dataTransfer.setData('cloneComponentID', anEvent.target.id);
  showOverlay();
}

function discard(anEvent) {
  anEvent.preventDefault();
  hideOverlay();
  let theData = anEvent.dataTransfer.getData('componentID');
  if (anEvent.target.className != 'circuit-board' && anEvent.target.className != 'component' && theData == 'clone') { // Drag & Drop Cloned Component
    let theData = anEvent.dataTransfer.getData('cloneComponentID');
    let theComponent = document.getElementById(theData);
    circuitMap.delete(`(${theComponent.dataset.circuit_x}, ${theComponent.dataset.circuit_y})`);
    theComponent.remove();
    updateGrid();
  }
}

function drop(anEvent) {
  anEvent.preventDefault();
  hideOverlay();
  let theData = anEvent.dataTransfer.getData('componentID');
  if (theData == '') return; // Break if a non-component is dropped
  if (anEvent.target.className == 'component') { // For drop behavior onto existing components
    let theComponentUnderneath = anEvent.target;
    let theCircuitX = Math.floor(theComponentUnderneath.dataset.circuit_x);
    let theCircuitY = Math.floor(theComponentUnderneath.dataset.circuit_y);
    circuitMap.delete(`(${theCircuitX}, ${theCircuitY})`);
    if (theData == 'clone') { // Drag & Drop Cloned Component
      let theData = anEvent.dataTransfer.getData('cloneComponentID');
      let theComponent = document.getElementById(theData);
      circuitMap.delete(`(${theComponent.dataset.circuit_x}, ${theComponent.dataset.circuit_y})`);
      circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
      theComponent.dataset.circuit_x = theCircuitX;
      theComponent.dataset.circuit_y = theCircuitY;
      theComponent.style.position = 'absolute';
      theComponent.style.left = theComponentUnderneath.style.left;
      theComponent.style.top = theComponentUnderneath.style.top;
    } else { // Drag & Drop New Component
      let theComponent = document.getElementById(theData).cloneNode(true);
      theComponent.id = theData + "_" + getRandomInt(0, 2147483647); // Ensure uniqueness
      theComponent.dataset.circuit_x = theCircuitX;
      theComponent.dataset.circuit_y = theCircuitY;
      theComponent.style.position = 'absolute';
      theComponent.style.left = theComponentUnderneath.style.left;
      theComponent.style.top = theComponentUnderneath.style.top;
      anEvent.target.parentNode.appendChild(theComponent);
      theComponent.addEventListener('dragstart', cloneDrag);
      theComponent.addEventListener('click', doubleClick);
      circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
    }
    theComponentUnderneath.remove();
  } else if (theData == 'clone') { // Drag & Drop Cloned Component
    let theData = anEvent.dataTransfer.getData('cloneComponentID');
    let theComponent = document.getElementById(theData);
    let theBoardRect = anEvent.target.getBoundingClientRect();
    let x = Math.floor((anEvent.clientX - theBoardRect.left) / GRID_SIZE) * GRID_SIZE;
    let y = Math.floor((anEvent.clientY - theBoardRect.top) / GRID_SIZE) * GRID_SIZE;
    let theCircuitX = Math.floor(x / GRID_SIZE);
    let theCircuitY = Math.floor(y / GRID_SIZE);
    circuitMap.delete(`(${theComponent.dataset.circuit_x}, ${theComponent.dataset.circuit_y})`);
    circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
    theComponent.dataset.circuit_x = theCircuitX;
    theComponent.dataset.circuit_y = theCircuitY;
    theComponent.style.position = 'absolute';
    theComponent.style.left = x + 'px';
    theComponent.style.top = y + 'px';
  } else { // Drag & Drop New Component
    let theComponent = document.getElementById(theData).cloneNode(true);
    theComponent.id = theData + "_" + getRandomInt(0, 2147483647); // Ensure uniqueness
    let theBoardRect = anEvent.target.getBoundingClientRect();
    let x = Math.floor((anEvent.clientX - theBoardRect.left) / GRID_SIZE) * GRID_SIZE;
    let y = Math.floor((anEvent.clientY - theBoardRect.top) / GRID_SIZE) * GRID_SIZE;
    let theCircuitX = Math.floor(x / GRID_SIZE);
    let theCircuitY = Math.floor(y / GRID_SIZE);
    theComponent.dataset.circuit_x = theCircuitX;
    theComponent.dataset.circuit_y = theCircuitY;
    theComponent.style.position = 'absolute';
    theComponent.style.left = x + 'px';
    theComponent.style.top = y + 'px';
    anEvent.target.appendChild(theComponent);
    theComponent.addEventListener('dragstart', cloneDrag);
    theComponent.addEventListener('click', doubleClick);
    circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
  }
  updateGrid();
}

let clickCount = 0;
let clickTimer = null;
const doubleClickThreshold = 300; // Adjust as needed
function doubleClick(anEvent) {
  clickCount++;
  if (clickCount === 1) {
      clickTimer = setTimeout(() => {
          clickCount = 0; // Reset click count
      }, doubleClickThreshold);
  } else if (clickCount === 2) {
      clearTimeout(clickTimer); // Clear the single click timer
      clickCount = 0; // Reset click count
      rotate(anEvent); // Double click detected
  }
}

function rotate(anEvent) {
  let theComponent = document.getElementById(anEvent.target.id);
  rotateConnections(theComponent);
  theComponent.style.transform = 'rotate(' + (Number(theComponent.dataset.rotation) + 90) + 'deg)';
  theComponent.dataset.rotation = (Number(theComponent.dataset.rotation) + 90) % 360;
  updateGrid();
}

function rotateConnections(aComponent) {
  let setNorth = ''; // false
  let setEast = ''; // false 
  let setSouth = ''; // false
  let setWest = ''; // false
  if (aComponent.dataset.north) {
    aComponent.dataset.north = ''; // false
    setEast = true;
  }
  if (aComponent.dataset.east) {
    aComponent.dataset.east = ''; // false
    setSouth = true;
  }
  if (aComponent.dataset.south) {
    aComponent.dataset.south = ''; // false
    setWest = true;
  }
  if (aComponent.dataset.west) {
    aComponent.dataset.west = ''; // false
    setNorth = true;
  }
  aComponent.dataset.north = setNorth;
  aComponent.dataset.east = setEast;
  aComponent.dataset.south = setSouth;
  aComponent.dataset.west = setWest;
}

function showOverlay() {
  document.querySelector('.overlay').style.display = 'block';
}

function hideOverlay() {
  document.querySelector('.overlay').style.display = 'none';
}

function handleKeyDown(anEvent) {
  if (anEvent.key === 'Delete') {
    showOverlay();
    document.querySelectorAll('.component').forEach(item => {
      item.addEventListener('click', removeComponent);
    });
  }
}

function handleKeyUp(anEvent) {
  if (anEvent.key === 'Delete') {
    hideOverlay();
    document.querySelectorAll('.component').forEach(item => {
      item.removeEventListener('click', removeComponent);
    });
  }
}

function removeComponent(anEvent) {
  circuitMap.delete(`(${anEvent.target.dataset.circuit_x}, ${anEvent.target.dataset.circuit_y})`);
  anEvent.target.remove();
  updateGrid();
}

//####################[Circuit Logic]############################//
let sources = [];
let components = [];
let nodeSet = new Map();

/* returns true/false if all components were connected */
function onEachConnection(aComponent, aCallback) {
  allConnectionsMatched = true;
  if (aComponent.dataset.north) {
    let theConnectedComponent = circuitMap.get(`(${aComponent.dataset.circuit_x}, ${Number(aComponent.dataset.circuit_y) - 1})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.south) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = ''; // false
    }
  }
  if (aComponent.dataset.east) {
    let theConnectedComponent = circuitMap.get(`(${Number(aComponent.dataset.circuit_x) + 1}, ${aComponent.dataset.circuit_y})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.west) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = ''; // false
    }
  }
  if (aComponent.dataset.south) {
    let theConnectedComponent = circuitMap.get(`(${aComponent.dataset.circuit_x}, ${Number(aComponent.dataset.circuit_y) + 1})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.north) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = ''; // false
    }
  }
  if (aComponent.dataset.west) {
    let theConnectedComponent = circuitMap.get(`(${Number(aComponent.dataset.circuit_x) - 1}, ${aComponent.dataset.circuit_y})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.east) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = ''; // false
    }
  }
  return allConnectionsMatched;
}

function connectWires(aComponent, aNodeName) {
  if (aComponent.dataset.type == 'wire' && !nodeSet.has(aComponent.dataset.node)) {
    aComponent.dataset.node = aNodeName;
    onEachConnection(aComponent, (aConnectedComponent) => {
      connectWires(aConnectedComponent, aNodeName);
    });
  }
}

function getRandomInt(aMin, aMax) {
  aMin = Math.ceil(aMin);
  aMax = Math.floor(aMax);
  return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
}

function updateGrid() {
  sources = [];
  components = [];
  nodeSet = new Set();
  let theCircuitIsCorrect = true;
  for (let [theKey, theComponent] of circuitMap) {
    let theType = theComponent.dataset.type;
    if (theType == 'wire') {
      if (nodeSet.has(theComponent.dataset.node)) continue;
      let theNodeName = "node_" + getRandomInt(0, 2147483647);
      nodeSet.add(theNodeName);
      theComponent.dataset.node = theNodeName;
      onEachConnection(theComponent, (aConnectedComponent) => {
        connectWires(aConnectedComponent, theNodeName);
      });
    } else if (theType == 'source') {
      sources.push(theComponent);
      components.push(theComponent);
    } else if (theType == 'passive') { // R, L, or C
      theComponent.dataset.node = "node_" + getRandomInt(0, 2147483647);
      components.push(theComponent);
    } else if (theType == 'ground') {
      theComponent.dataset.node = "GND";
    } else {
      console.log('[ERROR] Unrecognized Type'); // DEBUG
    }
  }
  components.forEach(theComponent => {
    theFirst = true;
    if (!onEachConnection(theComponent, (aConnectedComponent) => {
        // Connect R, L, or C component to the nodes touching it
        if (theFirst) {
          theComponent.dataset.connection1 = aConnectedComponent.dataset.node;
          theFirst = ''; // false
        } else {
          if (aConnectedComponent.dataset.type == 'passive') {
            theComponent.dataset.connection2 = theComponent.dataset.node;
          } else {
            theComponent.dataset.connection2 = aConnectedComponent.dataset.node;
          }
        }
      })) {
      theCircuitIsCorrect = ''; // false
      theComponent.style.backgroundColor = 'rgb(255, 155, 155)'; // Circuit Error: Component is floating
    } else {
      theComponent.style.backgroundColor = ''; // Change back to CSS default
    }
  });
  if (theCircuitIsCorrect) {
    // Send JSON version of all connections to C++ and async wait the solutions!
    let theCircuitPayload = {Circuit: {Nodes: {}}};

    function addNode(aNodeName, aConnection) {
      if (!theCircuitPayload.Circuit.Nodes[aNodeName]) {
        theCircuitPayload.Circuit.Nodes[aNodeName] = [];
      }
      theCircuitPayload.Circuit.Nodes[aNodeName].push(aConnection);
    }

    components.forEach((aComponent) => {
      addNode(aComponent.dataset.connection1, {[aComponent.id]: aComponent.dataset.connection2});
      addNode(aComponent.dataset.connection2, {[aComponent.id]: aComponent.dataset.connection1});
    });
    
    console.log(JSON.stringify(theCircuitPayload, null, 2)); // DEBUG
  }
}