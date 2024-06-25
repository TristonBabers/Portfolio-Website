document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.component').forEach(item => {
      item.addEventListener('dragstart', drag);
    });
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.querySelector('.circuit-board').appendChild(overlay);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  });

  const GRID_SIZE = 70;
  
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
    var data = ev.dataTransfer.getData("text");
    var component = document.getElementById(data).cloneNode(true);
    component.id = "new" + data; // Ensure uniqueness
  
    var boardRect = ev.target.getBoundingClientRect();
    var x = Math.floor((ev.clientX - boardRect.left) / GRID_SIZE) * GRID_SIZE;
    var y = Math.floor((ev.clientY - boardRect.top) / GRID_SIZE) * GRID_SIZE;
  
    component.style.position = "absolute";
    component.style.left = x + 'px';
    component.style.top = y + 'px';
  
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
    e.target.remove();
  }
  