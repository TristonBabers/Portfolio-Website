document.addEventListener("DOMContentLoaded", function () {
    initializeGrid();
    document.querySelectorAll('.component').forEach(item => {
      item.addEventListener('dragstart', drag);
    });
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.querySelector('.circuit-board').appendChild(overlay);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  });
  
  // Grid initialization to track component placements
  const grid = {};
  
  function initializeGrid() {
    const gridSize = 50; // Assuming grid cells are 50px x 50px
    const board = document.querySelector('.circuit-board');
    const rows = Math.floor(board.clientHeight / gridSize);
    const cols = Math.floor(board.clientWidth / gridSize);
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[`${i}-${j}`] = null; // Initialize each cell as empty
      }
    }
  }
  
  function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    showOverlay();
  }
  
  function drop(ev) {
    ev.preventDefault();
    hideOverlay();
  
    const data = ev.dataTransfer.getData("text");
    const component = document.getElementById(data).cloneNode(true);
    component.id = "new" + Date.now(); // Ensure a unique ID
  
    const boardRect = ev.target.getBoundingClientRect();
    const x = Math.floor((ev.clientX - boardRect.left) / 50);
    const y = Math.floor((ev.clientY - boardRect.top) / 50);
    const key = `${y}-${x}`;
  
    // Replace existing component if cell is already occupied
    if (grid[key]) {
      grid[key].remove(); // Remove existing component from the DOM
    }
  
    // Assign new component to the grid and position it
    grid[key] = component;
    component.style.position = "absolute";
    component.style.left = x * 50 + 'px';
    component.style.top = y * 50 + 'px';
    ev.target.appendChild(component);
  }
  
  function showOverlay() {
    document.querySelector('.overlay').style.display = 'block';
  }
  
  function hideOverlay() {
    document.querySelector('.overlay').style.display = 'none';
  }
  
  function handleKeyDown(e) {
    if (e.key === 'Delete') {
      showOverlay();
      document.querySelectorAll('.component').forEach(item => {
        item.addEventListener('click', removeComponent);
      });
    }
  }
  
  function handleKeyUp(e) {
    if (e.key === 'Delete') {
      hideOverlay();
      document.querySelectorAll('.component').forEach(item => {
        item.removeEventListener('click', removeComponent);
      });
    }
  }
  
  function removeComponent(e) {
    const gridSize = 50;
    const x = parseInt(e.target.style.left) / gridSize;
    const y = parseInt(e.target.style.top) / gridSize;
    const key = `${y}-${x}`;
  
    // Clear grid position and remove element
    if (grid[key] === e.target) {
      grid[key] = null;
      e.target.remove();
    }
  }
  