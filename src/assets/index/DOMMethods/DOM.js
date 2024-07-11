/* eslint-disable no-param-reassign */
import {
	addBoard1Grids,
	addBoard2Grids,
	getPlayer1GridCoordinate,
	getPlayer2GridCoordinate,
	getPlayer1GridIndex,
} from '../boardGrid/grid';

import createShip from '../ship/ship';

let orientationValue = 'Horizontal';
let selectedShip = null;
let selectedShipLength = null;
let shipsPlacedByPlayer1 = 0;

const getSelectedShipLength = function () {
	if (selectedShip === 'Carrier') {
		selectedShipLength = 5;
	} else if (selectedShip === 'Battleship') {
		selectedShipLength = 4;
	} else if (selectedShip === 'Destroyer' || selectedShip === 'Submarine') {
		selectedShipLength = 3;
	} else {
		selectedShipLength = 2;
	}
	return selectedShipLength;
};

const selectShipHandler = function (event) {
	const shipList = document.querySelectorAll('.ship');
	shipList.forEach((s) => s.classList.remove('selected'));
	event.target.classList.add('selected');
	selectedShip = event.target.textContent;
	selectedShipLength = getSelectedShipLength(selectedShip);
};

const selectShip = function () {
	const shipList = document.querySelectorAll('.ship');
	shipList.forEach((ship) => {
		ship.addEventListener('click', selectShipHandler);
	});
};

const removeSelectedShip = function () {
	// remove event listeener for selected ship
	const selectedShipClass = (
		selectedShip.charAt(0).toLowerCase() + selectedShip.slice(1)
	)
		.split(' ')
		.join('');

	const shipUnavailableForPlacement = document.querySelector(
		`.${selectedShipClass}`
	);
	if (shipUnavailableForPlacement) {
		shipUnavailableForPlacement.removeEventListener(
			'click',
			selectShipHandler
		);
		shipUnavailableForPlacement.classList.add('removed');
	}
	selectedShip = null;
};

const addShipToGridEventListener = function (grid, player1, player2) {
	return function handleGridClick() {
		if (selectedShip) {
			const { x, y } = getPlayer1GridCoordinate(grid);
			let firstGridIndex = getPlayer1GridIndex(grid);
			const firstGridElement = document.querySelector(
				`[data-index="${firstGridIndex}"]`
			);

			player1.ownBoard.shipPlacement(
				orientationValue,
				x,
				y,
				selectedShipLength,
				selectedShip
			);
			if (player1.ownBoard.checkSpace) {
				if (orientationValue === 'Vertical') {
					firstGridElement.style.backgroundColor = 'green';
					for (let i = 1; i < selectedShipLength; i += 1) {
						firstGridIndex += 10;
						const subsequentGridElement = document.querySelector(
							`[data-index="${firstGridIndex}"]`
						);
						subsequentGridElement.style.backgroundColor = 'green';
					}
				} else if (orientationValue === 'Horizontal') {
					firstGridElement.style.backgroundColor = 'green';
					for (let i = 1; i < selectedShipLength; i += 1) {
						firstGridIndex += 1;
						const subsequentGridElement = document.querySelector(
							`[data-index="${firstGridIndex}"]`
						);
						subsequentGridElement.style.backgroundColor = 'green';
					}
				}
				// Remove event listener after ship placement
				grid.removeEventListener('click', handleGridClick);
				removeSelectedShip();
				shipsPlacedByPlayer1 += 1;
				if (shipsPlacedByPlayer1 > 4) {
					// eslint-disable-next-line no-use-before-define
					playerAttacksEachOtherSubsequently(player2)
				}
			} else {
				alert('Choose another grid!');
			}
		}
	};
};

const addShipToBoard = function (player1, player2) {
	// get grid index from addBoard1Grid, process it with getGridCoordinate
	const gridList = document.querySelectorAll('.grid.one');
	gridList.forEach((grid) => {
		grid.addEventListener(
			'click',
			addShipToGridEventListener(grid, player1, player2)
		);
	});
};

const changeShipOrientation = function () {
	const orientationBtn = document.querySelector('.orientationBtn');
	orientationBtn.addEventListener('click', () => {
		if (orientationBtn.textContent === 'Horizontal') {
			orientationBtn.textContent = 'Vertical';
			orientationValue = orientationBtn.textContent;
		} else {
			orientationBtn.textContent = 'Horizontal';
			orientationValue = orientationBtn.textContent;
		}
	});
};

const randomlyAddShiptoAI = function (AIplayer) {
	const listOfShipObj = [
		createShip(5),
		createShip(4),
		createShip(3),
		createShip(3),
		createShip(2),
	];
	const orientationList = ['Horizontal', 'Vertical'];

	// get a random value from 0 to 9 for grid index
	const getRandomGridValue = function () {
		const randomValue = Math.floor(Math.random() * 10);
		return randomValue;
	};

	// randomly get an orientation: horizontal or vertical
	const getRandomOrientationValue = function () {
		const randomValue = Math.floor(Math.random() * 2);
		return randomValue;
	};

	// using getRandomGridValue, access the grids. Continue finding until
	// we find a grid that has enuf space for the entire ship and is not alld
	// occupied
	let x;
	let y;
	let orientation;
	for (let i = 0; i < listOfShipObj.length; i += 1) {
		const shipObj = listOfShipObj[i];
		// continue finding the grid as long as grid selected is not available
		do {
			x = getRandomGridValue();
			y = getRandomGridValue();
			orientation = orientationList[getRandomOrientationValue()];
			// get the grid and check whether it has enuf space
			AIplayer.ownBoard.shipPlacement(
				orientation,
				x,
				y,
				shipObj.length,
				shipObj
			);
		} while (!AIplayer.ownBoard.checkSpace);

		// change x & y to index and add them to DOM in the board
		const gridIndex = y * 10 + x;
		// iterate over the ship length
		if (orientation === 'Horizontal') {
			for (let j = 0; j < shipObj.length; j += 1) {
				const gridToPlaceShip = document.querySelector(
					`[data-grid-num="${gridIndex + j}"]`
				);
				gridToPlaceShip.style.backgroundColor = 'green';
				gridToPlaceShip.classList.add('shipPlaced');
			}
		} else {
			for (let j = 0; j < shipObj.length; j += 1) {
				const gridToPlaceShip = document.querySelector(
					`[data-grid-num="${gridIndex + j * 10}"]`
				);
				gridToPlaceShip.style.backgroundColor = 'green';
				gridToPlaceShip.classList.add('shipPlaced');
			}
		}
	}
	console.log(AIplayer.ownBoard.board);
};

const player1Attack = function (player2) {
	// add event listener to all the grids
	const player2Grids = document.querySelectorAll('.grid.secondPlayer');
	player2Grids.forEach((grid) => {
		grid.addEventListener(
			'click',
			() => {
				const { x, y } = getPlayer2GridCoordinate(grid);
				player2.ownBoard.receiveAttack(x, y);
				// color the grid red if it is occupied by a ship
				if (grid.classList.contains('shipPlaced')) {
					grid.style.backgroundColor = 'red';
				} else {
					grid.style.backgroundColor = 'grey';
				}
			},
			{ once: true }
		);
	});
};
const AIAttack = function (player1) {
	// AI attacks
};

const playerAttacksEachOtherSubsequently = function (player2) {
	const roundCounter = 1;
	if (roundCounter % 2 === 1) {
		player1Attack(player2);
	} else {
		AIAttack();
	}
};

const createPage = function () {
	const body = document.querySelector('body');

	const header = document.createElement('div');
	header.classList.add('header');
	const boardDiv = document.createElement('div');
	boardDiv.classList.add('boardDiv');

	// create 2 boards, 1 ship div &  1 text line
	const shipDiv = document.createElement('div');
	shipDiv.classList.add('shipDiv');
	const orientationBtn = document.createElement('button');
	orientationBtn.classList.add('orientationBtn');
	orientationBtn.textContent = 'Horizontal';
	const shipArea = document.createElement('div');
	shipArea.classList.add('shipArea');

	const carrierShip = document.createElement('p');
	carrierShip.textContent = 'Carrier';
	carrierShip.classList.add('carrier', 'ship');

	const battleship = document.createElement('p');
	battleship.textContent = 'Battleship';
	battleship.classList.add('battleship', 'ship');

	const destroyer = document.createElement('p');
	destroyer.textContent = 'Destroyer';
	destroyer.classList.add('destroyer', 'ship');

	const submarine = document.createElement('p');
	submarine.textContent = 'Submarine';
	submarine.classList.add('submarine', 'ship');

	const patrolBoat = document.createElement('p');
	patrolBoat.textContent = 'Patrol Boat';
	patrolBoat.classList.add('patrolBoat', 'ship');

	shipArea.append(carrierShip, battleship, destroyer, submarine, patrolBoat);

	const player1Board = document.createElement('div');
	player1Board.classList.add('player1Board');
	const player2Board = document.createElement('div');
	player2Board.classList.add('player2Board');
	const textIndicator = document.createElement('p');
	textIndicator.textContent = 'Battleship!';

	addBoard1Grids(player1Board);
	addBoard2Grids(player2Board);

	header.append(textIndicator);
	shipDiv.append(orientationBtn, shipArea);
	boardDiv.append(shipDiv, player1Board, player2Board);
	body.append(header, boardDiv);
};

export {
	player1Attack,
	randomlyAddShiptoAI,
	createPage,
	selectShip,
	addShipToBoard,
	getSelectedShipLength,
	changeShipOrientation,
};
