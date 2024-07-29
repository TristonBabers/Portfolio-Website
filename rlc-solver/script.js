//############################[Circuit Component]############################//
class CircuitComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const circuitComponentContainer = document.createElement('div');
    circuitComponentContainer.setAttribute('class', 'circuit-component-container');
    this.img = document.createElement('img');
    this.img.setAttribute('class', 'background-image');
    this.img.src = this.getAttribute('src');
    this.img.alt = this.getAttribute('alt');
    circuitComponentContainer.appendChild(this.img);
    this.shadowRoot.appendChild(circuitComponentContainer);
    this.overlayText = document.createElement('div');
    circuitComponentContainer.appendChild(this.overlayText);
    // Component Styles
    const style = document.createElement('style');
    style.textContent = `
      .circuit-component-container {
        position: absolute;
      }
      .background-image {
        width: 70px;
        height: 70px;
        display: inline-block;
        margin: 0;
        padding: 0;
        background: #e2e2e2;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        text-align: center;
        line-height: 30px;
        /*touch-action: none; Prevent selection */
        -webkit-touch-callout: none;
      }
      .overlay-text {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: black;
        font-size: 1.15em;
        text-align: center;
        padding: 10px;
        border-radius: 5px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setText(aText) {
    if (aText) {
      this.overlayText.setAttribute('class', 'overlay-text');
      this.overlayText.textContent = aText + this.dataset.symbol; // Set overlay text from attribute
    } else {
      this.overlayText.setAttribute('class', '');
      this.overlayText.textContent = '';
    }
  }

  showError(anError) {
    if (!anError) {
      this.img.style.backgroundColor = '';
    } else {
      this.img.style.backgroundColor = 'rgb(255, 155, 155)';
    }
  }

  select() {
    this.img.style.border = '2px dashed grey';
  }

  deselect() {
    this.img.style.border = '';
  }
}
customElements.define('circuit-component', CircuitComponent);

//############################[Interface Interaction]############################//
let circuitMap = new Map();
const GRID_SIZE = 70;

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('circuit-component').forEach(item => {
    item.addEventListener('dragstart', (event) => drag(event, false));
    item.addEventListener('click', doubleClick);
    item.dataset.rotation = 0;
  });
  document.addEventListener('drop', discard)
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

function preventDefault(anEvent) {
  anEvent.preventDefault();
}

function drag(anEvent, isClone) {
  anEvent.dataTransfer.setData('componentID', anEvent.target.id);
  if (isClone) {
    anEvent.dataTransfer.setData('isClone', 'true');
  }
  showOverlay();
}

function discard(anEvent) {
  anEvent.preventDefault();
  hideOverlay();
  if (anEvent.target.className != 'circuit-board' && anEvent.target.className != 'component' && anEvent.dataTransfer.getData('isClone')) {
    // Delete the Cloned Component
    let theComponent = document.getElementById(anEvent.dataTransfer.getData('componentID'));
    if (theComponent != null) { // For some reason this event fires twice
      circuitMap.delete(`(${theComponent.dataset.circuit_x}, ${theComponent.dataset.circuit_y})`);
      theComponent.remove();
      updateGrid();
    }
  }
}

function drop(anEvent) {
  anEvent.preventDefault();
  hideOverlay();
  let theComponentId = anEvent.dataTransfer.getData('componentID');
  if (theComponentId == '') return; // Break if a non-component is dropped
  let theCircuitX;
  let theCircuitY;
  let theComponentStyleLeft;
  let theComponentStyleTop;
  let theCircuitBoard;
  if (anEvent.target.classList.contains('component')) {
    // Drop onto an existing component
    theCircuitBoard = anEvent.target.parentNode;
    let theComponentUnderneath = anEvent.target;
    theCircuitX = theComponentUnderneath.dataset.circuit_x;
    theCircuitY = theComponentUnderneath.dataset.circuit_y;
    theComponentStyleLeft = theComponentUnderneath.style.left;
    theComponentStyleTop = theComponentUnderneath.style.top;
    circuitMap.delete(`(${theCircuitX}, ${theCircuitY})`);
    theComponentUnderneath.remove();
  } else {
    // Drop onto circuit board
    theCircuitBoard = anEvent.target;
    let theBoardRect = anEvent.target.getBoundingClientRect();
    let x = Math.floor((anEvent.clientX - theBoardRect.left) / GRID_SIZE) * GRID_SIZE;
    let y = Math.floor((anEvent.clientY - theBoardRect.top) / GRID_SIZE) * GRID_SIZE;
    theCircuitX = Math.floor(x / GRID_SIZE);
    theCircuitY = Math.floor(y / GRID_SIZE);
    theComponentStyleLeft = x + 'px';
    theComponentStyleTop = y + 'px';
  }
  let theComponent;
  if (anEvent.dataTransfer.getData('isClone')) {
    // Move existing component
    theComponent = document.getElementById(theComponentId);
  } else {
    // Create new component
    theComponent = document.getElementById(theComponentId).cloneNode(true);
    theComponent.id = theComponentId + "_" + getRandomInt(0, 2147483647); // Ensure uniqueness
    theCircuitBoard.appendChild(theComponent);
    theComponent.addEventListener('dragstart', (event) => drag(event, true));
    theComponent.addEventListener('click', doubleClick);
    
  }
  theComponent.style.left = theComponentStyleLeft;
  theComponent.style.top = theComponentStyleTop;
  theComponent.style.position = 'absolute';
  theComponent.dataset.circuit_x = theCircuitX;
  theComponent.dataset.circuit_y = theCircuitY;
  circuitMap.set(`(${theCircuitX}, ${theCircuitY})`, theComponent);
  updateGrid();
}

let clickCount = 0;
let clickTimer = null;
const doubleClickThreshold = 300; // Adjust as needed
function doubleClick(anEvent) {
  clickCount++;
  select(document.getElementById(anEvent.target.id));
  if (clickCount === 1) {
      clickTimer = setTimeout(() => {
          clickCount = 0; // Reset click count
      }, doubleClickThreshold);
  } else if (clickCount === 2) {
      clearTimeout(clickTimer); // Clear the single click timer
      clickCount = 0; // Reset click count
      rotate(document.getElementById(anEvent.target.id)); // Double click detected
  }
}

function rotate(aComponent) {
  rotateConnections(aComponent);
  aComponent.style.transform = 'rotate(' + (Number(aComponent.dataset.rotation) + 90) + 'deg)';
  aComponent.dataset.rotation = (Number(aComponent.dataset.rotation) + 90) % 360;
  updateGrid();
}

let selectedComponent = '';
function select(aComponent) {
  if (aComponent == selectedComponent) return;
  if (selectedComponent) {
    selectedComponent.deselect();
  }
  aComponent.select();
  selectedComponent = aComponent;
  renderEditor(aComponent);
}

function renderEditor() {

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

//############################[Circuit Logic]############################//
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
    } else if (theType == 'passive') { // R, L, or C
      theComponent.dataset.node = "node_" + getRandomInt(0, 2147483647);
      components.push(theComponent);
    } else if (theType == 'ground') {
      theComponent.dataset.node = "GND";
    } else {
      //console.log('[ERROR] Unrecognized Type'); // DEBUG
    }
  }
  components.forEach(theComponent => {
    theFirst = true;
    if (!onEachConnection(theComponent, (aConnectedComponent) => {
        // Show Text
        theComponent.setText(theComponent.dataset.impedence);

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
      theComponent.showError('floating'); // Circuit Error: Component is floating
    } else {
      theComponent.showError(''); // Change back to CSS default
    }
  });
  sources.forEach(theSource => {
    // Assuming 2 connections, will go through connections in N->E->S->W
    // Determines positive end according to order.
    if (Number(theSource.dataset.rotation) >= 180) {
      theVddSide = ''; // false
    } else {
      theVddSide = true;
    }
    if (!onEachConnection(theSource, (aConnectedComponent) => {
        // Connect Sources
        if (theVddSide) {
          theSource.dataset.connection1 = aConnectedComponent.dataset.node;
          theVddSide = ''; // false
        } else {
          theSource.dataset.connection2 = aConnectedComponent.dataset.node;
          theVddSide = true;
        }
    })) {
      theCircuitIsCorrect = ''; // false
      theSource.showError('floating'); // Circuit Error: Component is floating
    } else {
      theSource.showError(''); // Change back to CSS default
    }
  });
  if (theCircuitIsCorrect) {
    // Send JSON version of all connections to C++ and async wait the solutions!
    let theCircuitPayload = {Circuit: {Nodes: {}, Sources: {}}};

    function addNode(aNodeName, aConnection) {
      if (!theCircuitPayload.Circuit.Nodes[aNodeName]) {
        theCircuitPayload.Circuit.Nodes[aNodeName] = [];
      }
      theCircuitPayload.Circuit.Nodes[aNodeName].push(aConnection);
    }

    components.forEach((aComponent) => {
      if (aComponent.dataset.type != 'source') {
        addNode(aComponent.dataset.connection1, {[aComponent.id]: aComponent.dataset.connection2});
        addNode(aComponent.dataset.connection2, {[aComponent.id]: aComponent.dataset.connection1});
      }
    });
    theCircuitPayload.Circuit.Sources  = [];
    sources.forEach((aSource) => {
      theCircuitPayload.Circuit.Sources.push({[aSource.id]: {["VDD"]: aSource.dataset.connection1, ["GND"]: aSource.dataset.connection2}});
    });
    
    console.log(JSON.stringify(theCircuitPayload, null, 2)); // DEBUG
    sendPayload(theCircuitPayload)
  }
}

//############################[Server Interaction]############################//
function sendPayload(aPayload) {
  let url = 'https://www.tristonbabers.com/rlc-solver/endpoint.php';

  fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(aPayload)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
      } else {
        return response.json();
      }
  })
  .then(data => {
    const theCircuitSolution = JSON.parse(data.Circuit_Solution[0])
    if (theCircuitSolution)
    console.log('Circuit: ' + JSON.stringify(theCircuitSolution, null, 4)); // DEBUG
  })
  .catch(e => {
    // Do nothing on error // DEBUG
  });
}


//############################[Rendering and Calculation Logic]############################//
// Function to create a dynamic evaluator for the equation using math.js
/*
function createEquationEvaluator(equation) {
  // Replace placeholders with variable names (without curly braces)
  const parsedEquation = equation.replace(/{(\w+)}/g, (_, varName) => varName);

  // Compile the expression using math.js
  const compiled = math.compile(parsedEquation);

  // Return a function that evaluates the compiled expression with given variables
  return (variables) => compiled.evaluate(variables);
}

// Example usage
let jsonObject = {
  "Equation": "({x1} + 4 - {y1})/2"
};

// Create the evaluator function
const evaluator = createEquationEvaluator(jsonObject.Equation);

// Variables to substitute, including a complex number
let variables = {
  x1: math.complex('200 + 1/4i'),
  y1: math.complex('50 + 1/4i')
};

// Evaluate the expression with initial values
let result = evaluator(variables);
console.log("The result of the equation with complex x1 and y1 is:", result.toString());

// Change the variables and re-evaluate quickly
variables.x1 = math.complex('300 + 1/2i');
variables.y1 = math.complex('100 + 1/2i');
result = evaluator(variables);
console.log("The result of the equation with new complex x1 and y1 is:", result.toString());*/