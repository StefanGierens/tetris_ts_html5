var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
$(document).ready(function () {
    var canvas = document.getElementById('cnvs');
    var ids = ['scoreSingle', 'scoreDouble', 'scoreTriple', 'scoreTetris', 'scorePerfectClear'];
    var scores = [Consts.scoreSingle, Consts.scoreDouble, Consts.scoreTriple, Consts.scoreTetris, Consts.scorePerfectClear];
    for (var i in ids) {
        document.getElementById(ids[i]).innerHTML = scores[i].toString();
    }
    if (canvas == undefined)
        return;
    var app = new App(canvas);
    document.addEventListener('keydown', function (event) { app.keyboardInput(event); });
    app.startGame();
});
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Init"] = 0] = "Init";
    GameStatus[GameStatus["Started"] = 1] = "Started";
    GameStatus[GameStatus["Over"] = 2] = "Over";
    GameStatus[GameStatus["Paused"] = 3] = "Paused";
    GameStatus[GameStatus["Single"] = 4] = "Single";
    GameStatus[GameStatus["Double"] = 5] = "Double";
    GameStatus[GameStatus["Triple"] = 6] = "Triple";
    GameStatus[GameStatus["Tetris"] = 7] = "Tetris";
})(GameStatus || (GameStatus = {}));
var Consts = (function () {
    function Consts() {
    }
    Consts.numberRows = 20;
    Consts.numberCols = 10;
    Consts.startTimeoutInMs = 500;
    Consts.timeOutMinPerLevel = 20;
    Consts.newLevelSeconds = 100;
    Consts.scoreSingle = 1;
    Consts.scoreDouble = 3;
    Consts.scoreTriple = 6;
    Consts.scoreTetris = 10;
    Consts.scorePerfectClear = 20;
    return Consts;
}());
var App = (function () {
    function App(canvas) {
        var _this = this;
        this.rowsDeleted = 0;
        this.points = 0;
        this.wait = false;
        this.counter = 0;
        this.level = 1;
        this.timeoutInMs = Consts.startTimeoutInMs;
        this.gameStatus = GameStatus.Init;
        this.gameLoop = function () {
            if (!_this.isStarted()) {
                _this.boardCanvas.draw();
                return;
            }
            var gameOver = false;
            var numberOfRows = 0;
            if (_this.board.canMoveDown())
                _this.board.tetrominoMoveDown();
            else {
                if (!_this.wait) {
                    _this.wait = true;
                    return;
                }
                _this.board.tetrominoToHeap();
                numberOfRows = _this.board.clearHeap();
                _this.rowsDeleted += numberOfRows;
                _this.points += (_this.rowsToScore(numberOfRows) * _this.level);
                if (numberOfRows > 0 && _this.board.isPerfectClear())
                    _this.points += Consts.scorePerfectClear * _this.level;
                gameOver = !_this.board.newTetromino();
                _this.wait = false;
            }
            _this.boardCanvas.draw();
            if (gameOver) {
                _this.gameStatus = GameStatus.Over;
                clearInterval(_this.loopInterval);
                _this.storeHighscore();
                _this.boardCanvas.draw();
            }
        };
        this.timerLoop = function () {
            if (!_this.isStarted()) {
                return;
            }
            _this.counter++;
            if (_this.counter % Consts.newLevelSeconds == 0) {
                clearInterval(_this.loopInterval);
                _this.level++;
                if (_this.timeoutInMs > 100)
                    _this.timeoutInMs = _this.timeoutInMs - Consts.timeOutMinPerLevel;
                _this.loopInterval = setInterval(_this.gameLoop, _this.timeoutInMs);
            }
        };
        this.canvas = canvas;
    }
    App.prototype.getBoard = function () { return this.board; };
    App.prototype.getRowsDeleted = function () { return this.rowsDeleted; };
    App.prototype.getPoints = function () { return this.points; };
    App.prototype.getLevel = function () { return this.level; };
    App.prototype.getStatus = function () {
        if (this.gameStatus == GameStatus.Init)
            return "Press Space";
        if (this.gameStatus == GameStatus.Over)
            return "Game over!";
        return GameStatus[this.gameStatus];
    };
    App.prototype.startGame = function () {
        var _this = this;
        this.board = new Board(Consts.numberRows, Consts.numberCols);
        this.boardCanvas = new BoardCanvas(this.canvas, this);
        this.loopInterval = setInterval(this.gameLoop, this.timeoutInMs);
        $("#btnSpace").click(function (e) { return _this.pressSpace(); });
        $("#btnUp").click(function (e) { return _this.pressArrowUp(); });
        $("#btnLeft").click(function (e) { return _this.pressArrowLeft(); });
        $("#btnRight").click(function (e) { return _this.pressArrowRight(); });
        $("#btnDown").click(function (e) { return _this.pressArrowDown(); });
        setInterval(this.timerLoop, 1000);
    };
    App.prototype.isStarted = function () {
        var _this = this;
        return [GameStatus.Started, GameStatus.Single, GameStatus.Double, GameStatus.Triple, GameStatus.Tetris].some(function (e) { return e == _this.gameStatus; });
    };
    App.prototype.storeHighscore = function () {
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
    };
    App.prototype.getMaxRows = function () {
        if (localStorage.maxRows == undefined)
            return 0;
        return localStorage.maxRows;
    };
    App.prototype.getMaxPoints = function () {
        if (localStorage.maxPoints == undefined)
            return 0;
        return localStorage.maxPoints;
    };
    App.prototype.pressArrowLeft = function () {
        if (this.isStarted()) {
            this.board.tetrominoMoveLeft();
            this.boardCanvas.draw();
        }
    };
    App.prototype.pressArrowRight = function () {
        if (this.isStarted()) {
            this.board.tetrominoMoveRight();
            this.boardCanvas.draw();
        }
    };
    App.prototype.pressArrowUp = function () {
        if (this.isStarted()) {
            this.board.tetrominoRotate();
            this.boardCanvas.draw();
        }
    };
    App.prototype.pressArrowDown = function () {
        if (this.isStarted()) {
            this.board.tetrominoMoveDown();
            this.boardCanvas.draw();
        }
    };
    App.prototype.pressSpace = function () {
        {
            if (this.gameStatus == GameStatus.Init)
                this.gameStatus = GameStatus.Started;
            else if (this.isStarted())
                this.gameStatus = GameStatus.Paused;
            else if (this.gameStatus == GameStatus.Paused)
                this.gameStatus = GameStatus.Started;
        }
    };
    App.prototype.keyboardInput = function (event) {
        if (event.keyCode == 37)
            this.pressArrowLeft();
        else if (event.keyCode == 38)
            this.pressArrowUp();
        else if (event.keyCode == 39)
            this.pressArrowRight();
        else if (event.keyCode == 40)
            this.pressArrowDown();
        else if (event.keyCode == 32)
            this.pressSpace();
    };
    App.prototype.rowsToScore = function (rows) {
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
    };
    return App;
}());
var Colors;
(function (Colors) {
    Colors[Colors["Grey"] = 0] = "Grey";
    Colors[Colors["Green"] = 1] = "Green";
    Colors[Colors["Red"] = 2] = "Red";
    Colors[Colors["Pink"] = 3] = "Pink";
    Colors[Colors["Blue"] = 4] = "Blue";
    Colors[Colors["Orange"] = 5] = "Orange";
    Colors[Colors["Yellow"] = 6] = "Yellow";
    Colors[Colors["Cyan"] = 7] = "Cyan";
    Colors[Colors["White"] = 8] = "White";
    Colors[Colors["Black"] = 9] = "Black";
})(Colors || (Colors = {}));
var Board = (function () {
    function Board(numberRows, numberCols) {
        this.blankColor = Colors.Grey;
        this.numberRows = numberRows;
        this.numberCols = numberCols;
        this.initHeap();
    }
    Board.prototype.initHeap = function () {
        this.heap = [];
        this.tetromino = undefined;
        for (var r = 0; r < this.numberRows; r++) {
            this.heap[r] = new Array(this.numberCols);
            for (var c = 0; c < this.numberCols; c++) {
                this.heap[r][c] = { c: c, r: r, color: undefined };
            }
        }
    };
    Board.prototype.getColor = function (x, y) {
        if (this.tetromino) {
            if (this.tetromino.isInside({ x: x, y: y }))
                return Colors[this.tetromino.color];
        }
        if (Colors[this.getRow(y)[x].color] == undefined)
            return Colors[this.blankColor];
        else
            return Colors[this.getRow(y)[x].color];
    };
    Board.prototype.getRow = function (r) {
        if (r < 0 || r >= this.heap.length)
            return undefined;
        return this.heap[r];
    };
    Board.prototype.setPointToHeap = function (p, color) {
        var r = this.getRow(p.y);
        r[p.x].color = color;
    };
    Board.prototype.tetrominoToHeap = function () {
        var _this = this;
        if (this.tetromino) {
            this.tetromino.points.forEach(function (p) { return _this.setPointToHeap(p, _this.tetromino.color); });
            this.tetromino = undefined;
        }
    };
    Board.prototype.clearHeap = function () {
        var count = 0;
        var _loop_1 = function (r) {
            var row = this_1.getRow(r);
            var rowFull = true;
            row.forEach(function (c) { if (c.color == undefined)
                rowFull = false; });
            if (rowFull) {
                for (var i = r - 1; i >= 0; i--) {
                    for (var j = 0; j < this_1.numberCols; j++) {
                        this_1.heap[i + 1][j] = this_1.heap[i][j];
                        this_1.heap[i + 1][j].r++;
                    }
                }
                for (var c = 0; c < this_1.numberCols; c++)
                    this_1.heap[0][c] = { r: 0, c: c, color: undefined };
                count++;
            }
        };
        var this_1 = this;
        for (var r = 0; r < this.numberRows; r++) {
            _loop_1(r);
        }
        return count;
    };
    Board.prototype.newTetromino = function () {
        if (this.nextTetromino == undefined) {
            this.tetromino = Tetromino.NewTetromino();
            this.nextTetromino = Tetromino.NewTetromino();
        }
        else {
            this.tetromino = this.nextTetromino;
            this.nextTetromino = Tetromino.NewTetromino();
        }
        this.tetromino.setDX(this.numberCols / 2 - 1);
        if (!this.fitsToBoard(this.tetromino))
            return false;
        return true;
    };
    Board.prototype.getNextTetromino = function () {
        return this.nextTetromino;
    };
    Board.prototype.isPerfectClear = function () {
        for (var r = this.numberRows - 1; r >= 0; r--) {
            for (var c = 0; r < this.numberCols; c++) {
                if (this.fieldOccupied(c, r))
                    return false;
            }
        }
        return true;
    };
    Board.prototype.fitsToBoard = function (tetromino) {
        var _this = this;
        var b = true;
        if (tetromino != undefined) {
            tetromino.points.forEach(function (p) { if (_this.fieldOccupied(p.x, p.y))
                b = false; });
            return b;
        }
        return false;
    };
    Board.prototype.canMoveDown = function () {
        var _this = this;
        var b = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(function (p) { if (_this.fieldOccupied(p.x, p.y + 1))
                b = false; });
            return b;
        }
        return false;
    };
    Board.prototype.canMoveLeft = function () {
        var _this = this;
        var b = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(function (p) { if (_this.fieldOccupied(p.x - 1, p.y))
                b = false; });
            return b;
        }
        return false;
    };
    Board.prototype.canMoveRight = function () {
        var _this = this;
        var b = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(function (p) { if (_this.fieldOccupied(p.x + 1, p.y))
                b = false; });
            return b;
        }
        return false;
    };
    Board.prototype.canRotate = function () {
        var _this = this;
        var b = true;
        if (this.tetromino != undefined) {
            this.tetromino.rotatePoints(this.numberCols).forEach(function (p) { if (_this.fieldOccupied(p.x, p.y))
                b = false; });
            return b;
        }
        return false;
    };
    Board.prototype.tetrominoMoveLeft = function () {
        if (this.tetromino != undefined && this.canMoveLeft())
            this.tetromino.moveLeft();
    };
    Board.prototype.tetrominoMoveRight = function () {
        if (this.tetromino != undefined && this.canMoveRight())
            this.tetromino.moveRight();
    };
    Board.prototype.tetrominoMoveDown = function () {
        if (this.tetromino != undefined && this.canMoveDown())
            this.tetromino.moveDown();
    };
    Board.prototype.tetrominoRotate = function () {
        if (this.tetromino != undefined && this.canRotate())
            this.tetromino.rotate(this.numberCols);
    };
    Board.prototype.fieldOccupied = function (x, y) {
        var r = this.getRow(y);
        if (r == undefined)
            return true;
        if (x < 0 || x >= r.length)
            return true;
        return r[x].color != undefined;
    };
    return Board;
}());
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["ArrowUp"] = 0] = "ArrowUp";
    ButtonType[ButtonType["ArrowLeft"] = 1] = "ArrowLeft";
    ButtonType[ButtonType["ArrowRight"] = 2] = "ArrowRight";
    ButtonType[ButtonType["ArrowDown"] = 3] = "ArrowDown";
    ButtonType[ButtonType["Space"] = 4] = "Space";
})(ButtonType || (ButtonType = {}));
var BoardCanvas = (function () {
    function BoardCanvas(canvas, app) {
        var _this = this;
        this.doMouseDown = function (event) {
            var x = event.offsetX;
            var y = event.offsetY;
            var dx = _this.board.numberCols * _this.fieldsize;
            var dy = 15 * _this.fieldsize;
            for (var _i = 0, _a = _this.buttons; _i < _a.length; _i++) {
                var b = _a[_i];
                if (x >= dx + b.x * _this.fieldsize && x <= dx + (b.x + b.dx) * _this.fieldsize &&
                    y >= dy + b.y * _this.fieldsize && y <= dy + (b.y + b.dy) * _this.fieldsize)
                    _this.pressButton(b.type);
            }
        };
        this.canvas = canvas;
        this.app = app;
        this.board = app.getBoard();
        this.ctx = canvas.getContext("2d");
        this.canvas.addEventListener("mousedown", this.doMouseDown, false);
        this.canvas.addEventListener("touchstart", this.doMouseDown, false);
        this.buttons = [];
        this.buttons.push({ x: 2, y: 1, dx: 1, dy: 1, text: "\u2191", desc: "arrow up", type: ButtonType.ArrowUp });
        this.buttons.push({ x: 1, y: 2, dx: 1, dy: 1, text: "\u2190", desc: "arrow left", type: ButtonType.ArrowLeft });
        this.buttons.push({ x: 2, y: 2, dx: 1, dy: 1, text: "\u2193", desc: "arrow down", type: ButtonType.ArrowDown });
        this.buttons.push({ x: 3, y: 2, dx: 1, dy: 1, text: "\u2192", desc: "arrow right", type: ButtonType.ArrowRight });
        this.buttons.push({ x: 1, y: 4, dx: 3, dy: 1, text: "SPACE", desc: "SPACE", type: ButtonType.Space });
    }
    BoardCanvas.prototype.draw = function () {
        var height = this.getCanvasHeight();
        var changed = height != this.canvas.height;
        if (changed) {
            this.ctx.fillStyle = Colors[Colors.Grey];
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.height = height;
            this.canvas.width = Math.ceil(this.canvas.height / 2) * 1.5;
            this.fieldsize = this.canvas.height / this.board.numberRows;
        }
        for (var r = 0; r < this.board.numberRows; r++) {
            for (var c = 0; c < this.board.numberCols; c++) {
                this.ctx.strokeRect(c * this.fieldsize, r * this.fieldsize, this.fieldsize, this.fieldsize);
                this.ctx.fillStyle = this.board.getColor(c, r);
                this.ctx.fillRect(c * this.fieldsize, r * this.fieldsize, this.fieldsize, this.fieldsize);
            }
        }
        var nextTetromino = this.board.getNextTetromino();
        var dx = (this.board.numberCols + 1) * this.fieldsize;
        var dy = 4 * this.fieldsize;
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 3; c++) {
                this.ctx.strokeRect(dx + c * this.fieldsize, dy + r * this.fieldsize, this.fieldsize, this.fieldsize);
                if (nextTetromino != undefined && nextTetromino.isInside({ x: c, y: r }))
                    this.ctx.fillStyle = Colors[nextTetromino.color];
                else
                    this.ctx.fillStyle = Colors[this.board.blankColor];
                this.ctx.fillRect(dx + c * this.fieldsize, dy + r * this.fieldsize, this.fieldsize, this.fieldsize);
            }
        }
        dy = this.fieldsize;
        this.ctx.fillStyle = Colors[Colors.White];
        this.ctx.fillRect(dx, 0, 5 * this.fieldsize, 3 * this.fieldsize);
        this.ctx.font = this.getFont();
        this.ctx.fillStyle = Colors[Colors.Black];
        this.ctx.fillText(this.app.getStatus(), dx, dy);
        $('#status').html(this.app.getStatus());
        this.ctx.fillText("Score: " + this.app.getPoints(), dx, dy + this.fieldsize);
        $('#score').html(this.app.getPoints().toString());
        this.ctx.fillText("Rows: " + this.app.getRowsDeleted(), dx, dy + this.fieldsize * 3 / 2);
        $('#rows').html(this.app.getRowsDeleted().toString());
        this.ctx.fillText("Level: " + this.app.getLevel(), dx, dy + 2 * this.fieldsize);
        $('#level').html(this.app.getLevel().toString());
        dy = 8 * this.fieldsize;
        this.ctx.fillStyle = Colors[Colors.White];
        this.ctx.fillRect(dx, dy, 5 * this.fieldsize, dy + 3 * this.fieldsize);
        this.ctx.fillStyle = Colors[Colors.Black];
        this.ctx.fillText("Highscore: " + this.app.getMaxPoints(), dx, dy + this.fieldsize);
        $('#highscore').html(this.app.getMaxPoints().toString());
        this.ctx.fillText("Max Rows: " + this.app.getMaxRows(), dx, dy + this.fieldsize * 3 / 2);
        $('#maxRows').html(this.app.getMaxRows().toString());
        this.drawButtons();
        this.ctx.stroke();
    };
    BoardCanvas.prototype.getCanvasHeight = function () {
        return Math.ceil(document.documentElement.clientHeight * .8);
    };
    BoardCanvas.prototype.drawButtons = function () {
        var _this = this;
        var dx = this.board.numberCols * this.fieldsize;
        var dy = 15 * this.fieldsize;
        this.buttons.forEach(function (b) {
            _this.ctx.fillStyle = Colors[Colors.White];
            _this.ctx.strokeRect(dx + b.x * _this.fieldsize, dy + b.y * _this.fieldsize, b.dx * _this.fieldsize, b.dy * _this.fieldsize);
            _this.ctx.fillStyle = Colors[Colors.Black];
            _this.ctx.fillText(b.text, dx + (b.x + 0.4) * _this.fieldsize, dy + (b.y + 0.5) * _this.fieldsize);
        });
    };
    BoardCanvas.prototype.getFont = function () {
        if (this.fieldsize > 35)
            return "20px Segoe UI";
        if (this.fieldsize > 25)
            return "15px Segoe UI";
        return "10px Segoe UI";
    };
    BoardCanvas.prototype.pressButton = function (buttontype) {
        if (buttontype == ButtonType.Space)
            this.app.pressSpace();
        else if (buttontype == ButtonType.ArrowLeft)
            this.app.pressArrowLeft();
        else if (buttontype == ButtonType.ArrowRight)
            this.app.pressArrowRight();
        else if (buttontype == ButtonType.ArrowDown)
            this.app.pressArrowDown();
        else if (buttontype == ButtonType.ArrowUp)
            this.app.pressArrowUp();
    };
    return BoardCanvas;
}());
var Tetromino = (function () {
    function Tetromino() {
        this.points = new Array(4);
    }
    Tetromino.prototype.moveLeft = function () {
        this.points.forEach(function (p) { if (p.x > 0)
            p.x--; });
    };
    Tetromino.prototype.moveRight = function () {
        this.points.forEach(function (p) { p.x++; });
    };
    Tetromino.prototype.moveDown = function () {
        this.points.forEach(function (p) { p.y++; });
    };
    Tetromino.prototype.rotate = function (maxX) {
    };
    Tetromino.prototype.rotatePoints = function (maxX) {
        return this.points;
    };
    Tetromino.prototype.isInside = function (point) {
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.x == point.x && p.y == point.y)
                return true;
        }
        return false;
    };
    Tetromino.prototype.getDX = function () {
        var newPoints = Array(4);
        var minX = Math.min.apply(Math, (this.points.map(function (p) { return p.x; })));
        return minX;
    };
    Tetromino.prototype.setDX = function (dx) {
        this.points.forEach(function (p) { return p.x += dx; });
    };
    Tetromino.NewTetromino = function () {
        var num = Math.floor(Math.random() * 7);
        if (num == 0)
            return new SquareTetromino();
        else if (num == 1)
            return new StraitTetromino();
        else if (num == 2)
            return new LTetromino();
        else if (num == 3)
            return new JTetromino();
        else if (num == 4)
            return new STetromino();
        else if (num == 5)
            return new ZTetromino();
        else if (num == 6)
            return new TTetromino();
        throw new Error('no Tetromino');
    };
    return Tetromino;
}());
var SquareTetromino = (function (_super) {
    __extends(SquareTetromino, _super);
    function SquareTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 0 };
        _this.points[1] = { x: 1, y: 0 };
        _this.points[2] = { x: 0, y: 1 };
        _this.points[3] = { x: 1, y: 1 };
        _this.color = Colors.Yellow;
        return _this;
    }
    return SquareTetromino;
}(Tetromino));
var StraitTetromino = (function (_super) {
    __extends(StraitTetromino, _super);
    function StraitTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 0 };
        _this.points[1] = { x: 0, y: 1 };
        _this.points[2] = { x: 0, y: 2 };
        _this.points[3] = { x: 0, y: 3 };
        _this.color = Colors.Cyan;
        _this.up = true;
        return _this;
    }
    StraitTetromino.prototype.rotate = function (maxX) {
        this.points = this.rotatePoints(maxX);
        this.up = !this.up;
    };
    StraitTetromino.prototype.rotatePoints = function (maxX) {
        var points = new Array(4);
        if (this.up) {
            var rp = this.points[0].x < maxX / 2 ? 1 : 2;
            var nY = this.points[rp].y;
            var nX = this.points[rp].x;
            if (nX < 1) {
                nX = 1;
            }
            if (nX == maxX - 1)
                nX = maxX - 2;
            points[0] = { x: nX - rp, y: nY };
            points[1] = { x: nX - rp + 1, y: nY };
            points[2] = { x: nX - rp + 2, y: nY };
            points[3] = { x: nX - rp + 3, y: nY };
        }
        else {
            var rp = this.points[1].x < maxX / 2 ? 1 : 2;
            var nY = this.points[rp].y;
            var nX = this.points[rp].x;
            points[0] = { x: nX, y: nY - rp };
            points[1] = { x: nX, y: nY - rp + 1 };
            points[2] = { x: nX, y: nY - rp + 2 };
            points[3] = { x: nX, y: nY - rp + 3 };
        }
        return points;
    };
    return StraitTetromino;
}(Tetromino));
var TetrominoWithMiddle = (function (_super) {
    __extends(TetrominoWithMiddle, _super);
    function TetrominoWithMiddle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TetrominoWithMiddle.prototype.setDX = function (dx) {
        _super.prototype.setDX.call(this, dx);
        this.middle.x += dx;
    };
    TetrominoWithMiddle.prototype.rotatePoints = function (maxX) {
        var points = new Array(4);
        for (var i in this.points)
            points[i] = this.rotatePoint(this.points[i], this.middle);
        return points;
    };
    TetrominoWithMiddle.prototype.rotate = function (maxX) {
        this.points = this.rotatePoints(maxX);
    };
    TetrominoWithMiddle.prototype.moveLeft = function () {
        _super.prototype.moveLeft.call(this);
        this.middle.x--;
    };
    TetrominoWithMiddle.prototype.moveRight = function () {
        _super.prototype.moveRight.call(this);
        this.middle.x++;
    };
    TetrominoWithMiddle.prototype.moveDown = function () {
        _super.prototype.moveDown.call(this);
        this.middle.y++;
    };
    TetrominoWithMiddle.prototype.rotatePoint = function (pO, m) {
        var p = {};
        p.x = -(pO.y - m.y) + m.x;
        p.y = (pO.x - m.x + m.y);
        return p;
    };
    return TetrominoWithMiddle;
}(Tetromino));
var LTetromino = (function (_super) {
    __extends(LTetromino, _super);
    function LTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 0 };
        _this.points[1] = { x: 0, y: 1 };
        _this.points[2] = { x: 0, y: 2 };
        _this.points[3] = { x: 1, y: 2 };
        _this.color = Colors.Orange;
        _this.middle = { x: 1, y: 1 };
        return _this;
    }
    return LTetromino;
}(TetrominoWithMiddle));
var JTetromino = (function (_super) {
    __extends(JTetromino, _super);
    function JTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 1, y: 0 };
        _this.points[1] = { x: 1, y: 1 };
        _this.points[2] = { x: 1, y: 2 };
        _this.points[3] = { x: 0, y: 2 };
        _this.color = Colors.Blue;
        _this.middle = { x: 0, y: 1 };
        return _this;
    }
    return JTetromino;
}(TetrominoWithMiddle));
var STetromino = (function (_super) {
    __extends(STetromino, _super);
    function STetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 1 };
        _this.points[1] = { x: 1, y: 1 };
        _this.points[2] = { x: 1, y: 0 };
        _this.points[3] = { x: 2, y: 0 };
        _this.color = Colors.Green;
        _this.middle = { x: 1, y: 1 };
        return _this;
    }
    return STetromino;
}(TetrominoWithMiddle));
var ZTetromino = (function (_super) {
    __extends(ZTetromino, _super);
    function ZTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 0 };
        _this.points[1] = { x: 1, y: 0 };
        _this.points[2] = { x: 1, y: 1 };
        _this.points[3] = { x: 2, y: 1 };
        _this.color = Colors.Red;
        _this.middle = { x: 1, y: 1 };
        return _this;
    }
    return ZTetromino;
}(TetrominoWithMiddle));
var TTetromino = (function (_super) {
    __extends(TTetromino, _super);
    function TTetromino() {
        var _this = _super.call(this) || this;
        _this.points[0] = { x: 0, y: 0 };
        _this.points[1] = { x: 1, y: 0 };
        _this.points[2] = { x: 2, y: 0 };
        _this.points[3] = { x: 1, y: 1 };
        _this.color = Colors.Pink;
        _this.middle = { x: 1, y: 1 };
        return _this;
    }
    return TTetromino;
}(TetrominoWithMiddle));
//# sourceMappingURL=tetris.js.map