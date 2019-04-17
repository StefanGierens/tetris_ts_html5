declare enum GameStatus {
    Init = 0,
    Started = 1,
    Over = 2,
    Paused = 3,
    Single = 4,
    Double = 5,
    Triple = 6,
    Tetris = 7
}
declare class Consts {
    static readonly numberRows: number;
    static readonly numberCols: number;
    static readonly startTimeoutInMs: number;
    static readonly timeOutMinPerLevel: number;
    static readonly newLevelSeconds: number;
    static readonly scoreSingle: number;
    static readonly scoreDouble: number;
    static readonly scoreTriple: number;
    static readonly scoreTetris: number;
    static readonly scorePerfectClear: number;
}
declare class App {
    protected board: Board;
    protected canvas: HTMLCanvasElement;
    protected boardCanvas: BoardCanvas;
    protected rowsDeleted: number;
    protected points: number;
    protected loopInterval: number;
    protected wait: boolean;
    protected counter: number;
    protected level: number;
    protected timeoutInMs: number;
    protected gameStatus: GameStatus;
    getBoard(): Board;
    getRowsDeleted(): number;
    getPoints(): number;
    getLevel(): number;
    getStatus(): string;
    constructor(canvas: HTMLCanvasElement);
    startGame(): void;
    protected gameLoop: () => void;
    protected timerLoop: () => void;
    isStarted(): boolean;
    protected storeHighscore(): void;
    getMaxRows(): number;
    getMaxPoints(): number;
    pressArrowLeft(): void;
    pressArrowRight(): void;
    pressArrowUp(): void;
    pressArrowDown(): void;
    pressSpace(): void;
    restart(): void;
    keyboardInput(event: KeyboardEvent): void;
    protected rowsToScore(rows: number): number;
}
declare enum Colors {
    Grey = 0,
    Green = 1,
    Red = 2,
    Pink = 3,
    Blue = 4,
    Orange = 5,
    Yellow = 6,
    Cyan = 7,
    White = 8,
    Black = 9
}
interface Field {
    c: number;
    r: number;
    color: Colors;
}
declare class Board {
    numberRows: number;
    numberCols: number;
    protected heap: Field[][];
    protected tetromino: Tetromino;
    protected nextTetromino: Tetromino;
    readonly blankColor: Colors;
    constructor(numberRows: number, numberCols: number);
    initHeap(): void;
    getColor(x: number, y: number): string;
    protected getRow(r: number): Field[];
    protected setPointToHeap(p: Point, color: Colors): void;
    tetrominoToHeap(): void;
    clearHeap(): number;
    newTetromino(): boolean;
    getNextTetromino(): Tetromino;
    isPerfectClear(): boolean;
    protected fitsToBoard(tetromino: Tetromino): boolean;
    canMoveDown(): boolean;
    protected canMoveLeft(): boolean;
    protected canMoveRight(): boolean;
    protected canRotate(): boolean;
    tetrominoMoveLeft(): void;
    tetrominoMoveRight(): void;
    tetrominoMoveDown(): void;
    tetrominoRotate(): void;
    protected fieldOccupied(x: number, y: number): boolean;
}
interface Button {
    x: number;
    y: number;
    dx: number;
    dy: number;
    text: string;
    desc: string;
    type: ButtonType;
}
declare enum ButtonType {
    ArrowUp = 0,
    ArrowLeft = 1,
    ArrowRight = 2,
    ArrowDown = 3,
    Space = 4
}
declare class BoardCanvas {
    protected fieldsize: number;
    protected canvas: HTMLCanvasElement;
    protected app: App;
    protected board: Board;
    protected ctx: CanvasRenderingContext2D;
    protected buttons: Button[];
    constructor(canvas: HTMLCanvasElement, app: App);
    draw(): void;
    protected getCanvasHeight(): number;
    protected drawButtons(): void;
    protected getFont(): string;
    pressButton(buttontype: ButtonType): void;
    protected doMouseDown: (event: MouseEvent) => void;
}
interface Point {
    x: number;
    y: number;
}
declare abstract class Tetromino {
    points: Array<Point>;
    color: Colors;
    constructor();
    moveLeft(): void;
    moveRight(): void;
    moveDown(): void;
    rotate(maxX: number): void;
    rotatePoints(maxX: number): Array<Point>;
    isInside(point: Point): boolean;
    getDX(): number;
    setDX(dx: number): void;
    static NewTetromino(): Tetromino;
}
declare class SquareTetromino extends Tetromino {
    constructor();
}
declare class StraitTetromino extends Tetromino {
    protected up: boolean;
    constructor();
    rotate(maxX: number): void;
    rotatePoints(maxX: number): Array<Point>;
}
declare abstract class TetrominoWithMiddle extends Tetromino {
    protected middle: Point;
    setDX(dx: number): void;
    rotatePoints(maxX: number): Array<Point>;
    rotate(maxX: number): void;
    moveLeft(): void;
    moveRight(): void;
    moveDown(): void;
    protected rotatePoint(pO: Point, m: Point): Point;
}
declare class LTetromino extends TetrominoWithMiddle {
    constructor();
}
declare class JTetromino extends TetrominoWithMiddle {
    constructor();
}
declare class STetromino extends TetrominoWithMiddle {
    constructor();
}
declare class ZTetromino extends TetrominoWithMiddle {
    constructor();
}
declare class TTetromino extends TetrominoWithMiddle {
    constructor();
}
