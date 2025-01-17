import createShip from '../ship/ship';
import createBoard from './gameboard';

let gamingBoard;
let ship1;
let ship2;

beforeEach(() => {
	gamingBoard = createBoard();
	ship1 = createShip(3);
	ship2 = createShip(4);
	gamingBoard.shipPlacement('Horizontal', 0, 2, ship1.length, ship1);
	gamingBoard.shipPlacement('Vertical', 3, 5, ship2.length, ship2);
});

describe('test shipPlacement function to check for correct placement', () => {
	test('horizontal shipPlacement', () => {
		expect(gamingBoard.board[0][2].ship).toBe(ship1);
		expect(gamingBoard.board[1][2].ship).toBe(ship1);
		expect(gamingBoard.board[2][2].ship).toBe(ship1);
		expect(gamingBoard.board[3][2].ship).toBe(undefined);
	});

	test('vertical placement', () => {
		expect(gamingBoard.board[3][5].ship).toBe(ship2);
		expect(gamingBoard.board[3][6].ship).toBe(ship2);
		expect(gamingBoard.board[3][7].ship).toBe(ship2);
		expect(gamingBoard.board[3][8].ship).toBe(ship2);
		expect(gamingBoard.board[3][9].ship).toBe(undefined);
	});
});

describe('test receiveAttack function', () => {
	test('attack missed the ships', () => {
		expect(gamingBoard.missedAttack).toBe(0);
		gamingBoard.receiveAttack(3, 2);

		expect(gamingBoard.missedAttack).toBe(1);
		expect(gamingBoard.board[3][2].hit).toBe(true);
		expect(ship1.hitStat).toBe(0);
		expect(ship2.hitStat).toBe(0);
		gamingBoard.receiveAttack(3, 3);
		expect(gamingBoard.missedAttack).toBe(2);
	});
	test('attack landed on ship1', () => {
		gamingBoard.receiveAttack(1, 2);
		expect(gamingBoard.board[1][2].hit).toBe(true);
		expect(ship1.hitStat).toBe(1);
		expect(ship2.hitStat).toBe(0);
		gamingBoard.receiveAttack(2, 2);
		expect(gamingBoard.board[2][2].hit).toBe(true);
		expect(ship1.hitStat).toBe(2);
		expect(ship2.hitStat).toBe(0);
	});
	test('attack sunk ship2', () => {
		gamingBoard.receiveAttack(3, 5);

		expect(gamingBoard.board[3][5].hit).toBeTruthy();
		expect(ship1.hitStat).toBe(0);
		expect(ship2.hitStat).toBe(1);

		gamingBoard.receiveAttack(3, 6);
		gamingBoard.receiveAttack(3, 7);
		gamingBoard.receiveAttack(3, 8);

		expect(gamingBoard.board[3][8].hit).toBe(true);
		expect(ship1.hitStat).toBe(0);
		expect(ship2.hitStat).toBe(4);
		expect(ship2.isSunk).toBeTruthy();
	});

	test('report game over', () => {
		expect(gamingBoard.gameOver).toBe(false);
		gamingBoard.reportGameOver(0, 1, 1, 1, 1);
		expect(gamingBoard.gameOver).toBe(false);
		gamingBoard.reportGameOver(1, 1, 1, 1, 1);
		expect(gamingBoard.gameOver).toBe(true);
	});
});
