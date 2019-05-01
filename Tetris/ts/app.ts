$(document).ready(function () {
    // the canvas element for the game
    let canvas = document.getElementById('cnvs');
    // update the scores in html 
    let ids = ['scoreSingle', 'scoreDouble', 'scoreTriple', 'scoreTetris', 'scorePerfectClear'];
    let scores = [Consts.scoreSingle, Consts.scoreDouble, Consts.scoreTriple, Consts.scoreTetris, Consts.scorePerfectClear];
    for (let i in ids) {
       document.getElementById(ids[i]).innerHTML = scores[i].toString();
    }
    if (canvas == undefined)
        return;
    let app = new App(<HTMLCanvasElement>canvas);
    // listen for keyboard input
    document.addEventListener('keydown', function (event: KeyboardEvent) { app.keyboardInput(event) });
    // start the game
    app.startGame();
});

/**
 * the game statuses 
 * */
enum GameStatus {
    Init,
    Started,
    Over,
    Paused,
    Single,
    Double,
    Triple,
    Tetris
}

/** 
 *  global constants
 * */
class Consts {
    static readonly numberRows: number = 20;
    static readonly numberCols: number = 10;
    static readonly startTimeoutInMs: number = 500;
    static readonly timeOutMinPerLevel: number = 20;
    static readonly newLevelSeconds: number = 100;
    static readonly scoreSingle: number = 1;
    static readonly scoreDouble: number = 3;
    static readonly scoreTriple: number = 6;
    static readonly scoreTetris: number = 10;
    static readonly scorePerfectClear: number = 20;
}


/**
 * the tetris app class
 * */
class App {
    protected board: Board;
    protected canvas: HTMLCanvasElement;
    protected boardCanvas: BoardCanvas;
    protected rowsDeleted: number = 0;
    protected points: number = 0;
    protected loopInterval: number;
    protected wait: boolean = false;
    protected counter: number = 0;
    protected level: number = 1;
    protected timeoutInMs: number = Consts.startTimeoutInMs;
    protected gameStatus: GameStatus = GameStatus.Init;

    getBoard(): Board { return this.board; }
    getRowsDeleted(): number { return this.rowsDeleted; }
    getPoints(): number { return this.points; }
    getLevel(): number { return this.level; }
    getStatus(): string {
        if (this.gameStatus == GameStatus.Init)
            return "Press Space";
        if (this.gameStatus == GameStatus.Over)
            return "Game over!";
        return GameStatus[this.gameStatus];
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    startGame() {
        this.board = new Board(Consts.numberRows, Consts.numberCols);
        this.boardCanvas = new BoardCanvas(<HTMLCanvasElement>this.canvas, this);
        this.boardCanvas.initBoard(this.board);
        this.loopInterval = setInterval(this.gameLoop, this.timeoutInMs);
        $("#btnSpace").click(e => this.pressSpace());
        $("#btnUp").click(e => this.pressArrowUp());
        $("#btnLeft").click(e => this.pressArrowLeft());
        $("#btnRight").click(e => this.pressArrowRight());
        $("#btnDown").click(e => this.pressArrowDown());

        setInterval(this.timerLoop, 1000);  // every second
    }

    /** The main game loop */
    protected gameLoop = () => {
        if (!this.isStarted()) {
            this.boardCanvas.draw();
            return;
        }
        let gameOver = false;
        let numberOfRows = 0;
        if (this.board.canMoveDown())
            this.board.tetrominoMoveDown();
        else {
            if (!this.wait) {
                this.wait = true;
                return;
            }
            this.board.tetrominoToHeap();
            numberOfRows = this.board.clearHeap();
            this.rowsDeleted += numberOfRows;
            this.points += (this.rowsToScore(numberOfRows) * this.level);
            if (numberOfRows > 0 && this.board.isPerfectClear())
                this.points += Consts.scorePerfectClear * this.level;
            gameOver = !this.board.newTetromino();
            this.wait = false;
        }
        this.boardCanvas.draw();
        if (gameOver) {
            this.gameStatus = GameStatus.Over;
            clearInterval(this.loopInterval);
            this.storeHighscore();
            this.boardCanvas.draw();
        }
    }

    /**  the timer loop, to increase the level
     * */
    protected timerLoop = () => {
        if (!this.isStarted()) {
            return;
        }
        this.counter++;
        if (this.counter % Consts.newLevelSeconds == 0) {
            clearInterval(this.loopInterval);
            this.level++;
            if (this.timeoutInMs > 100)
                this.timeoutInMs = this.timeoutInMs - Consts.timeOutMinPerLevel;
            this.loopInterval = setInterval(this.gameLoop, this.timeoutInMs);
        }
    }

    /** is the game started? check the status */
    isStarted(): boolean {
        return [GameStatus.Started, GameStatus.Single, GameStatus.Double, GameStatus.Triple, GameStatus.Tetris].some(e => e == this.gameStatus);
    }

    /** store the Highscore in the local storage of the browser */
    protected storeHighscore() {
        if (localStorage.maxPoints == undefined) {
            localStorage.maxPoints = this.points;
            localStorage.maxRows = this.rowsDeleted;
        }
        else {
            if (this.points > localStorage.maxPoints)
                localStorage.maxPoints = this.points;
            if (this.rowsDeleted > localStorage.maxRows)
                localStorage.maxRows = this.rowsDeleted;
        }
    }

    /** the max. rows from local storage */
    getMaxRows(): number {
        if (localStorage.maxRows == undefined)
            return 0;
        return localStorage.maxRows;
    }

    /** the max. points from local storage */
    getMaxPoints(): number {
        if (localStorage.maxPoints == undefined)
            return 0;
        return localStorage.maxPoints;
    }

    /** move left */
    pressArrowLeft(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveLeft();
            this.boardCanvas.draw();
        }
    }

    /** move right */
    pressArrowRight(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveRight();
            this.boardCanvas.draw();
        }
    }

    /** move up (rotate) */
    pressArrowUp(): void {
        if (this.isStarted()) {
            this.board.tetrominoRotate();
            this.boardCanvas.draw();
        }
    }

    /** move down */
    pressArrowDown(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveDown();
            this.boardCanvas.draw();
        }
    }

    /** space pressed */
    pressSpace(): void {
        if (this.gameStatus == GameStatus.Init)
            this.gameStatus = GameStatus.Started;
        else if (this.isStarted())
            this.gameStatus = GameStatus.Paused;
        else if (this.gameStatus == GameStatus.Paused)
            this.gameStatus = GameStatus.Started;
    }

    restart(): void {
        this.rowsDeleted = 0;
        this.points = 0;
        this.wait = false;
        this.counter = 0;
        this.level = 1;
        this.timeoutInMs = Consts.startTimeoutInMs;
        this.gameStatus = GameStatus.Init;
        this.board = new Board(Consts.numberRows, Consts.numberCols);
        this.boardCanvas.initBoard(this.board);
    }

    /** handle keyboard input event */
    keyboardInput(event: KeyboardEvent) {
        switch (event.keyCode) {
            // press left arrow
            case 37:
                this.pressArrowLeft();
                break;
            // press up arrow          
            case 38:
                this.pressArrowUp();
                break;
            // press right arrow
            case 39:
                this.pressArrowRight();
                break;
            // press down arrow
            case 40:
                this.pressArrowDown();
                break;
            // press space bar
            case 32:
                this.pressSpace();
                break;
            // press F4
            case 115:
                this.restart();
                break;
        }
    }

    /**
     *  map rows to score and set status
     * @param rows
     */
    protected rowsToScore(rows: number): number {
        switch (rows) {
            case 1:
                this.gameStatus = GameStatus.Single;
                return Consts.scoreSingle;
            case 2:
                this.gameStatus = GameStatus.Double;
                return Consts.scoreDouble;
            case 3:
                this.gameStatus = GameStatus.Triple;
                return Consts.scoreTriple;
            case 4:
                this.gameStatus = GameStatus.Tetris;
                return Consts.scoreTetris;
        }
        return 0;
    }
}