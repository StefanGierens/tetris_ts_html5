/** the interface for a button on the canvas */
interface Button {
    x: number;
    y: number;
    dx: number;
    dy: number;
    text: string;
    desc: string;
    type: ButtonType 
}

enum ButtonType {
    ArrowUp,
    ArrowLeft,
    ArrowRight,
    ArrowDown,
    Space
}

/** the main view class, displays the board as HTML5 canvas */
class BoardCanvas {
    protected fieldsize: number;
    protected canvas: HTMLCanvasElement;
    protected app: App;
    protected board: Board;
    protected ctx: CanvasRenderingContext2D;

    protected buttons: Button[];

    constructor(canvas: HTMLCanvasElement,app: App) {
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

    draw() {
        let height = this.getCanvasHeight();
        let changed = height != this.canvas.height;
        // draw field
        if (changed) {
            // adjust the height, width and fieldsize
            this.ctx.fillStyle = Colors[Colors.Grey];
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.height = height;
            this.canvas.width = Math.ceil(this.canvas.height / 2) * 1.5 ;
            this.fieldsize = this.canvas.height / this.board.numberRows;
        }
        // draw the board
        for (let r = 0; r < this.board.numberRows; r++) {
            for (let c = 0; c < this.board.numberCols; c++) {
                this.ctx.strokeRect(c * this.fieldsize, r * this.fieldsize, this.fieldsize, this.fieldsize);
                this.ctx.fillStyle = this.board.getColor(c, r);
                this.ctx.fillRect(c * this.fieldsize, r * this.fieldsize, this.fieldsize, this.fieldsize);
            }
        }

        // draw nextTetromino
        let nextTetromino = this.board.getNextTetromino();
        
        let dx = (this.board.numberCols + 1) * this.fieldsize;
        let dy = 4 * this.fieldsize;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                this.ctx.strokeRect(dx + c * this.fieldsize, dy + r * this.fieldsize, this.fieldsize, this.fieldsize);
                if (nextTetromino != undefined && nextTetromino.isInside({ x: c, y: r }))
                    this.ctx.fillStyle = Colors[nextTetromino.color];
                else this.ctx.fillStyle = Colors[this.board.blankColor];
                this.ctx.fillRect(dx + c * this.fieldsize, dy + r * this.fieldsize, this.fieldsize, this.fieldsize);
            }
        }
        
        
        // score, level, rows and status
        dy = this.fieldsize;
        this.ctx.fillStyle = Colors[Colors.White];
        this.ctx.fillRect(dx, 0, 5 * this.fieldsize, 3 * this.fieldsize);
        this.ctx.font = this.getFont ();
        this.ctx.fillStyle = Colors[Colors.Black];
        this.ctx.fillText(this.app.getStatus(), dx, dy);
        $('#status').html (this.app.getStatus());
        this.ctx.fillText("Score: " + this.app.getPoints(), dx, dy + this.fieldsize);
        $('#score').html(this.app.getPoints().toString());
        this.ctx.fillText("Rows: " + this.app.getRowsDeleted(), dx, dy + this.fieldsize * 3 / 2);
        $('#rows').html(this.app.getRowsDeleted().toString());
        this.ctx.fillText("Level: " + this.app.getLevel(), dx, dy + 2 * this.fieldsize);
        $('#level').html(this.app.getLevel().toString());
        // Highscore
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
    }

    /** the height of the canvas is 80% of the page height */ 
    protected getCanvasHeight(): number {
        return Math.ceil(document.documentElement.clientHeight * .8);
    }

    /** draw the buttons to the canvas */
    protected drawButtons(){
        let dx = this.board.numberCols * this.fieldsize;
        let dy = 15 * this.fieldsize;

        this.buttons.forEach(b => {
            this.ctx.fillStyle = Colors[Colors.White];
            this.ctx.strokeRect(dx + b.x * this.fieldsize, dy + b.y * this.fieldsize, b.dx * this.fieldsize, b.dy * this.fieldsize);
            this.ctx.fillStyle = Colors[Colors.Black];
            this.ctx.fillText(b.text, dx + (b.x + 0.4) * this.fieldsize, dy + (b.y + 0.5) * this.fieldsize);
        });
    }

    /** the font size depends on the fieldsize */
    protected getFont(): string {
        if (this.fieldsize > 35)
            return "20px Segoe UI";
        if (this.fieldsize > 25)
            return "15px Segoe UI";
        return "10px Segoe UI";
    }

    /**
     * listen for clicks on buttons
     * @param buttontype
     */
    pressButton(buttontype: ButtonType): void {
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
    }

    /** listen for mouse clicks on the buttons */
    protected doMouseDown = (event: MouseEvent) : void => {
        let x: number = event.x;
        let y: number = event.y;
        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;
        let dx = this.board.numberCols * this.fieldsize;
        let dy = 15 * this.fieldsize;

        for (let b of this.buttons) {
            if (x >= dx + b.x * this.fieldsize && x <= dx + (b.x + b.dx) * this.fieldsize &&
                y >= dy + b.y * this.fieldsize && y <= dy + (b.y + b.dy) * this.fieldsize)
                this.pressButton(b.type);
        }

    }
}