$(document).ready(function () {
    let canvas = document.getElementById('cnvs');
    let ids = ['scoreSingle', 'scoreDouble', 'scoreTriple', 'scoreTetris', 'scorePerfectClear'];
    let scores = [Consts.scoreSingle, Consts.scoreDouble, Consts.scoreTriple, Consts.scoreTetris, Consts.scorePerfectClear];
    for (let i in ids) {
       document.getElementById(ids[i]).innerHTML = scores[i].toString();
    }
    if (canvas == undefined)
        return;
    var app = new App(<HTMLCanvasElement>canvas);
    document.addEventListener('keydown', function (event: KeyboardEvent) { app.keyboardInput(event) });
    app.startGame();
});

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
        this.board = new Board();
        this.boardCanvas = new BoardCanvas(<HTMLCanvasElement>this.canvas, this);
        this.loopInterval = setInterval(this.gameLoop, this.timeoutInMs);
        $("#btnSpace").click(e => this.pressSpace());
        $("#btnUp").click(e => this.pressArrowUp());
        $("#btnLeft").click(e => this.pressArrowLeft());
        $("#btnRight").click(e => this.pressArrowRight());
        $("#btnDown").click(e => this.pressArrowDown());

        setInterval(this.timerLoop, 1000);  // every second
    }

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

    isStarted(): boolean {
        return [GameStatus.Started, GameStatus.Single, GameStatus.Double, GameStatus.Triple, GameStatus.Tetris].some(e => e == this.gameStatus);
    }

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

    getMaxRows(): number {
        if (localStorage.maxRows == undefined)
            return 0;
        return localStorage.maxRows;
    }

    getMaxPoints(): number {
        if (localStorage.maxPoints == undefined)
            return 0;
        return localStorage.maxPoints;
    }

    pressArrowLeft(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveLeft();
            this.boardCanvas.draw();
        }
    }

    pressArrowRight(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveRight();
            this.boardCanvas.draw();
        }
    }

    pressArrowUp(): void {
        if (this.isStarted()) {
            this.board.tetrominoRotate();
            this.boardCanvas.draw();
        }
    }

    pressArrowDown(): void {
        if (this.isStarted()) {
            this.board.tetrominoMoveDown();
            this.boardCanvas.draw();
        }
    }

    pressSpace(): void {
        {
            if (this.gameStatus == GameStatus.Init)
                this.gameStatus = GameStatus.Started;
            else if (this.isStarted())
                this.gameStatus = GameStatus.Paused;
            else if (this.gameStatus == GameStatus.Paused)
                this.gameStatus = GameStatus.Started;
        }
    }

    
    keyboardInput(event: KeyboardEvent) {
        // press left arrow
        if (event.keyCode == 37)
            this.pressArrowLeft();
        // press up arrow
        else if (event.keyCode == 38)
            this.pressArrowUp();
        // press right arrow
        else if (event.keyCode == 39)
            this.pressArrowRight();
        // press down arrow
        else if (event.keyCode == 40)
            this.pressArrowDown();
        // press space bar
        else if (event.keyCode == 32)
            this.pressSpace();
    }

    /**
     *  map rows to points and set status
     * @param rows
     */
    protected rowsToScore(rows: number): number {
        if (rows == 1) {
            this.gameStatus = GameStatus.Single;
            return Consts.scoreSingle;
        }
        if (rows == 2) {
            this.gameStatus = GameStatus.Double;
            return Consts.scoreDouble;
        }
        if (rows == 3) {
            this.gameStatus = GameStatus.Triple;
            return Consts.scoreTriple;
        }
        if (rows == 4) {
            this.gameStatus = GameStatus.Tetris;
            return Consts.scoreTetris;
        }
        return 0;
    }
}