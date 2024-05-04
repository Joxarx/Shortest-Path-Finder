const grid = document.getElementById('grid');
const findPathBtn = document.getElementById('findPathBtn');
const resetBtn = document.getElementById('resetBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const showVisitedBtn = document.getElementById('showVisitedBtn');
const message = document.getElementById('message');
const algorithmSelect = document.getElementById('algorithmSelect');

const numRows = 10;
const numCols = 10;
let startCell = null;
let endCell = null;
let cells = [];
let visitedCells = [];

// Crear la cuadrícula
function createGrid() {
  for (let i = 0; i < numRows; i++) {
    cells[i] = [];
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.addEventListener('click', () => handleCellClick(i, j));
      grid.appendChild(cell);
      cells[i][j] = cell;
    }
  }
}

// Manejar el evento de clic en la celda
function handleCellClick(fila, columna) {
  const celda = cells[fila][columna];
  if (!startCell) {
    celda.classList.add('start');
    startCell = celda;
  } else if (!endCell && celda !== startCell) {
    celda.classList.add('end');
    endCell = celda;
  } else if (celda !== startCell && celda !== endCell) {
    celda.classList.toggle('wall');
  }
}

// Encontrar la ruta más corta usando el algoritmo seleccionado
function findPath() {
  if (!startCell || !endCell) {
    message.textContent = 'Por favor selecciona los puntos de inicio y fin.';
    return;
  }

  const algoritmo = algorithmSelect.value;

  if (algoritmo === 'dijkstra') {
    findPathDijkstra();
  } else if (algoritmo === 'astar') {
    findPathAStar();
  }
}

// Encontrar la ruta más corta usando el algoritmo de Dijkstra
function findPathDijkstra() {
  const grafo = createGraph();
  const nodoInicio = getNodeFromCell(startCell);
  const nodoFin = getNodeFromCell(endCell);
  const distancias = {};
  const visitados = {};
  const previos = {};
  const noVisitados = new Set();

  // Inicializar distancias y conjunto de no visitados
  for (const nodo in grafo) {
    distancias[nodo] = Infinity;
    noVisitados.add(nodo);
  }
  distancias[nodoInicio] = 0;

  // Limpiar el array de celdas visitadas
  visitedCells = [];

  while (noVisitados.size > 0) {
    // Encontrar el nodo no visitado con la distancia más pequeña
    let nodoActual = null;
    let menorDistancia = Infinity;
    for (const nodo of noVisitados) {
      if (distancias[nodo] < menorDistancia) {
        nodoActual = nodo;
        menorDistancia = distancias[nodo];
      }
    }

    // Si el nodo actual es el nodo final, hemos encontrado la ruta más corta
    if (nodoActual === nodoFin) {
      break;
    }

    // Eliminar el nodo actual del conjunto de no visitados
    noVisitados.delete(nodoActual);

    // Resaltar la celda actual como visitada
    const [fila, columna] = nodoActual.split(',').map(Number);
    cells[fila][columna].classList.add('visited');
    visitedCells.push(cells[fila][columna]);

    // Actualizar las distancias de los vecinos
    for (const vecino of grafo[nodoActual]) {
      const distancia = distancias[nodoActual] + 1;
      if (distancia < distancias[vecino]) {
        distancias[vecino] = distancia;
        previos[vecino] = nodoActual;
      }
    }
  }

  // Reconstruir la ruta más corta
  const ruta = [];
  let nodoActual = nodoFin;
  while (nodoActual !== nodoInicio) {
    ruta.unshift(nodoActual);
    nodoActual = previos[nodoActual];
  }
  ruta.unshift(nodoInicio);

  // Esperar un momento antes de resaltar la ruta final
  setTimeout(() => {
    // Eliminar la clase 'visited' de todas las celdas
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        cells[i][j].classList.remove('visited');
      }
    }

    // Resaltar la ruta final
    for (const nodo of ruta) {
      const [fila, columna] = nodo.split(',').map(Number);
      cells[fila][columna].classList.add('path');
    }

    // Mostrar los colores de los puntos de inicio y fin
    startCell.style.backgroundColor = '#7f7';
    endCell.style.backgroundColor = '#f77';
  }, 500);
}

// Encontrar la ruta más corta usando el algoritmo A*
function findPathAStar() {
  const grafo = createGraph();
  const nodoInicio = getNodeFromCell(startCell);
  const nodoFin = getNodeFromCell(endCell);
  const openSet = new Set();
  const closedSet = new Set();
  const gScore = {};
  const fScore = {};
  const cameFrom = {};

  openSet.add(nodoInicio);
  gScore[nodoInicio] = 0;
  fScore[nodoInicio] = heuristic(nodoInicio, nodoFin);

  // Limpiar el array de celdas visitadas
  visitedCells = [];

  while (openSet.size > 0) {
    // Encontrar el nodo con el fScore más bajo en openSet
    let nodoActual = null;
    let menorFScore = Infinity;
    for (const nodo of openSet) {
      if (fScore[nodo] < menorFScore) {
        nodoActual = nodo;
        menorFScore = fScore[nodo];
      }
    }

    // Si el nodo actual es el nodo final, hemos encontrado la ruta más corta
    if (nodoActual === nodoFin) {
      // Reconstruir la ruta
      const ruta = [];
      let nodo = nodoFin;
      while (nodo !== nodoInicio) {
        ruta.unshift(nodo);
        nodo = cameFrom[nodo];
      }
      ruta.unshift(nodoInicio);

      // Esperar un momento antes de resaltar la ruta final
      setTimeout(() => {
        // Eliminar la clase 'visited' de todas las celdas
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            cells[i][j].classList.remove('visited');
          }
        }

        // Resaltar la ruta final
        for (const nodo of ruta) {
          const [fila, columna] = nodo.split(',').map(Number);
          cells[fila][columna].classList.add('path');
        }

        // Mostrar los colores de los puntos de inicio y fin
        startCell.style.backgroundColor = '#7f7';
        endCell.style.backgroundColor = '#f77';
      }, 500);

      return;
    }

    // Eliminar el nodo actual de openSet y agregarlo a closedSet
    openSet.delete(nodoActual);
    closedSet.add(nodoActual);

    // Resaltar la celda actual como visitada
    const [fila, columna] = nodoActual.split(',').map(Number);
    cells[fila][columna].classList.add('visited');
    visitedCells.push(cells[fila][columna]);

    // Actualizar los puntajes de los vecinos
    for (const vecino of grafo[nodoActual]) {
      if (closedSet.has(vecino)) {
        continue;
      }

      const puntajeGtentativo = gScore[nodoActual] + 1;

      if (!openSet.has(vecino)) {
        openSet.add(vecino);
      } else if (puntajeGtentativo >= gScore[vecino]) {
        continue;
      }

      cameFrom[vecino] = nodoActual;
      gScore[vecino] = puntajeGtentativo;
      fScore[vecino] = gScore[vecino] + heuristic(vecino, nodoFin);
    }
  }

  // Si no se encontró ninguna ruta, mostrar un mensaje de error
  message.textContent = 'No se encontró ninguna ruta.';
}

// Función heurística (distancia de Manhattan)
function heuristic(nodo1, nodo2) {
  const [x1, y1] = nodo1.split(',').map(Number);
  const [x2, y2] = nodo2.split(',').map(Number);
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Crear una representación de grafo de la cuadrícula
function createGraph() {
  const grafo = {};
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (!cells[i][j].classList.contains('wall')) {
        const nodo = `${i},${j}`;
        grafo[nodo] = getNeighbors(i, j);
      }
    }
  }
  return grafo;
}

// Obtener los vecinos de una celda
function getNeighbors(fila, columna) {
  const vecinos = [];
  if (fila > 0 && !cells[fila - 1][columna].classList.contains('wall')) {
    vecinos.push(`${fila - 1},${columna}`);
  }
  if (fila < numRows - 1 && !cells[fila + 1][columna].classList.contains('wall')) {
    vecinos.push(`${fila + 1},${columna}`);
  }
  if (columna > 0 && !cells[fila][columna - 1].classList.contains('wall')) {
    vecinos.push(`${fila},${columna - 1}`);
  }
  if (columna < numCols - 1 && !cells[fila][columna + 1].classList.contains('wall')) {
    vecinos.push(`${fila},${columna + 1}`);
  }
  return vecinos;
}

// Obtener la representación de nodo de una celda
function getNodeFromCell(celda) {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (cells[i][j] === celda) {
        return `${i},${j}`;
      }
    }
  }
}

// Reiniciar la cuadrícula
function resetGrid() {
  startCell = null;
  endCell = null;
  visitedCells = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      cells[i][j].classList.remove('start', 'end', 'wall', 'visited', 'path');
    }
  }
  message.textContent = '';
}

// Aleatorizar paredes
function randomizeWalls() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (cells[i][j] !== startCell && cells[i][j] !== endCell) {
        cells[i][j].classList.toggle('wall', Math.random() < 0.3);
      }
    }
  }
}

// Mostrar celdas visitadas
function showVisitedCells() {
  for (const celda of visitedCells) {
    celda.classList.add('visited');
  }
}

// Escuchadores de eventos
findPathBtn.addEventListener('click', findPath);
resetBtn.addEventListener('click', resetGrid);
randomizeBtn.addEventListener('click', randomizeWalls);
showVisitedBtn.addEventListener('click', showVisitedCells);

// Inicializar la cuadrícula
createGrid();
