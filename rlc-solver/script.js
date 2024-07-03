//####################[Interface Rendering]############################//
let circuitMap = new Map();
const GRID_SIZE = 70;

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.component').forEach(item => {
    item.addEventListener('dragstart', drag);
  });
  let overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.querySelector('.circuit-board').appendChild(overlay);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

function allowDrop(anEvent) {
  anEvent.preventDefault();
}

function drag(anEvent) {
  anEvent.dataTransfer.setData("text", anEvent.target.id);
  showOverlay();
}

function drop(anEvent) {
  anEvent.preventDefault();
  hideOverlay();
  let theData = anEvent.dataTransfer.getData("text");
  let theComponent = document.getElementById(theData).cloneNode(true);
  theComponent.id = theData + getRandomInt(0, 2147483647); // Ensure uniqueness
  let theBoardRect = anEvent.target.getBoundingClientRect();
  let x = Math.floor((anEvent.clientX - theBoardRect.left) / GRID_SIZE) * GRID_SIZE;
  let y = Math.floor((anEvent.clientY - theBoardRect.top) / GRID_SIZE) * GRID_SIZE;
  let theCircuitX = Math.floor(x / GRID_SIZE);
  let theCircuitY = Math.floor(y / GRID_SIZE);
  theComponent.dataset.circuit_x = theCircuitX;
  theComponent.dataset.circuit_y = theCircuitY;
  theComponent.style.position = "absolute";
  theComponent.style.left = x + 'px';
  theComponent.style.top = y + 'px';
  anEvent.target.appendChild(theComponent);
  circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
  updateGrid();
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
let nodeMap = new Map();

/* returns true/false if all components were connected */
function onEachConnection(aComponent, aCallback) {
  allConnectionsMatched = true;
  if (aComponent.dataset.north) {
    let theConnectedComponent = circuitMap.get(`(${aComponent.dataset.circuit_x}, ${Number(aComponent.dataset.circuit_y) - 1})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.south) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = false;
    }
  }
  if (aComponent.dataset.east) {
    let theConnectedComponent = circuitMap.get(`(${Number(aComponent.dataset.circuit_x) + 1}, ${aComponent.dataset.circuit_y})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.west) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = false;
    }
  }
  if (aComponent.dataset.south) {
    let theConnectedComponent = circuitMap.get(`(${aComponent.dataset.circuit_x}, ${Number(aComponent.dataset.circuit_y) + 1})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.north) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = false;
    }
  }
  if (aComponent.dataset.west) {
    let theConnectedComponent = circuitMap.get(`(${Number(aComponent.dataset.circuit_x) - 1}, ${aComponent.dataset.circuit_y})`);
    if (theConnectedComponent != undefined && theConnectedComponent.dataset.east) {
      aCallback(theConnectedComponent);
    } else {
      allConnectionsMatched = false;
    }
  }
  return allConnectionsMatched;
}

function connectWires(aComponent, aNode) {
  if (aComponent.dataset.type == 'wire' && !nodeMap.has(Number(aComponent.dataset.node))) {
    aComponent.dataset.node = aNode;
    onEachConnection(aComponent, (aConnectedComponent) => {
      connectWires(aConnectedComponent, aNode);
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
  nodeMap = new Map();
  let theChar = 65; // 'A'
  for (let [theKey, theComponent] of circuitMap) {
    let theType = theComponent.dataset.type;
    if (theType == 'wire') {
      if (nodeMap.has(Number(theComponent.dataset.node))) continue;
      let theNode = getRandomInt(0, 2147483647);
      nodeMap.set(theNode, String.fromCharCode(theChar++));
      theComponent.dataset.node = theNode;
      onEachConnection(theComponent, (aConnectedComponent) => {
        connectWires(aConnectedComponent, theNode);
      });
    } else if (theType == 'source') {
      sources.push(theComponent);
    } else if (theType == 'passive') { // R, L, or C
      components.push(theComponent);
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
          theFirst = false;
        } else {
          theComponent.dataset.connection2 = aConnectedComponent.dataset.node;
        }
      })) {
      console.log('[ERROR] component is floating'); // DEBUG
      // Circuit Error: component is floating (should highlight in red)
      //theComponent.style.background = 255;
      // DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! [TODO]
    }
  });
  sources.forEach(theSource => {
    // possibly create DAG using sources? // or will this be done in C++?
    // DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! [TODO]
  });
  // Send JSON version of all connections to C++ and async wait the solutions!
  // DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! [TODO]
}