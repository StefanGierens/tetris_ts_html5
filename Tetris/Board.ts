/** all posible colors */
enum Colors {
    Grey,
    Green,
    Red,
    Pink,
    Blue,
    Orange,
    Yellow,
    Cyan,
    White,
    Black
}

/** one Field on the board */
interface Field  {
    c: number;
    r: number;
    color: Colors;
}


/**
 * the Board class, main game logic implemented in here
 * */
class Board {
    numberRows: number = 20;
    numberCols: number = 10;
    protected heap: Field[][];

    protected tetromino: Tetromino;
    protected nextTetromino: Tetromino;
    // the color, for empty fields
    readonly blankColor: Colors = Colors.Grey;

    constructor() {
        this.initHeap();
    }

    initHeap() {
        this.heap = [];
        this.tetromino = undefined;
        for (var r = 0; r < this.numberRows; r++) {
            this.heap[r] = new Array<Field>(this.numberCols);
            for (var c = 0; c < this.numberCols; c++) {
                this.heap[r][c] = { c: c, r: r, color: undefined };
            }
        }
    }
     
    getColor(x: number, y: number): string {
        if (this.tetromino) {
            if (this.tetromino.isInside({ x, y }))
                return Colors[this.tetromino.color];
        }
        if (Colors[this.getRow(y)[x].color] == undefined)
            return Colors[this.blankColor];
        else return Colors[this.getRow(y)[x].color];
    }

    protected getRow(r: number) {
        if (r < 0 || r >= this.heap.length)
            return undefined;
        return this.heap[r];
    }

    protected setPointToHeap(p: Point, color: Colors) {
        let r = this.getRow(p.y);
        r[p.x].color = color;
    }

    /** push the tetromino to the heap */
    tetrominoToHeap() {
        if (this.tetromino) {
            this.tetromino.points.forEach(p => this.setPointToHeap(p, this.tetromino.color));
            this.tetromino = undefined;
        }
    }

    /** determine, if a row is full, 
     * if so, remove it 
     * and move the above rows down */
    clearHeap(): number {
        let count: number = 0;
        for (let  r = 0; r < this.numberRows; r++) {
            let row = this.getRow(r);
            let rowFull: boolean = true;
            row.forEach(c => { if (c.color == undefined) rowFull = false; });
            if (rowFull) {
                // move all rows 1 row down
                for (let i = r - 1; i >= 0; i--) {
                    for (let j = 0; j < this.numberCols; j++) {
                        this.heap[i + 1][j] = this.heap[i][j];
                        this.heap[i + 1][j].r++;
                    }
                }
                for (let c = 0; c < this.numberCols; c++) 
                    this.heap[0][c] = { r: 0, c : c, color: undefined };
                count++;
            }
        }

        return count;
    }

    /** insert a new tetromino to the board */
    newTetromino(): boolean {
        if (this.nextTetromino == undefined) {
            this.tetromino = Tetromino.NewTetromino();
            this.nextTetromino = Tetromino.NewTetromino();
        } else {
            this.tetromino = this.nextTetromino;
            this.nextTetromino = Tetromino.NewTetromino();
        }
        this.tetromino.setDX(this.numberCols / 2 - 1);
        if (!this.fitsToBoard(this.tetromino))
            return false;
        return true;
    }

    getNextTetromino(): Tetromino {
        return this.nextTetromino;
    }

    isPerfectClear(): boolean {
        // start on bottom line
        for (let r = this.numberRows - 1; r >= 0; r--) {
            for (let c = 0; r < this.numberCols; c++) {
                if (this.fieldOccupied(c, r))
                    return false;
            }
        }
        return true;
    }


    protected fitsToBoard(tetromino : Tetromino): boolean  {
        let b: boolean = true;
        if (tetromino != undefined) {
            tetromino.points.forEach(p => { if (this.fieldOccupied(p.x, p.y)) b = false; });
            return b;
        }
        return false;
    }

    /** can the actual tetronino move down? */
    canMoveDown(): boolean {
        let b: boolean = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(p => { if (this.fieldOccupied(p.x, p.y + 1)) b = false; });
            return b;
        }
        return false;
    }

    protected canMoveLeft(): boolean {
        let b: boolean = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(p => { if (this.fieldOccupied(p.x-1, p.y)) b = false; });
            return b;
        }
        return false;
    }

    protected canMoveRight(): boolean {
        let b: boolean = true;
        if (this.tetromino != undefined) {
            this.tetromino.points.forEach(p => { if (this.fieldOccupied(p.x + 1, p.y)) b = false; });
            return b;
        }
        return false;
    }

    protected canRotate(): boolean {
        let b: boolean = true;
        if (this.tetromino != undefined) {
            this.tetromino.rotatePoints(this.numberCols).forEach(p => { if (this.fieldOccupied(p.x, p.y)) b = false; });
            return b;
        }
        return false;
    }


    tetrominoMoveLeft() {
        if (this.tetromino != undefined && this.canMoveLeft())
            this.tetromino.moveLeft();
    }

    tetrominoMoveRight() {
        if (this.tetromino != undefined && this.canMoveRight())
            this.tetromino.moveRight();
    }

    tetrominoMoveDown() {
        if (this.tetromino != undefined && this.canMoveDown())
            this.tetromino.moveDown();
    }

    tetrominoRotate() {
        if (this.tetromino != undefined && this.canRotate())
            this.tetromino.rotate(this.numberCols);
    }

    /** 
     *  Field occupied on Board?
    */
    protected fieldOccupied(x: number, y: number): boolean {
        let r = this.getRow(y);
        if (r == undefined)
            return true;
        if (x < 0 || x >= r.length)
            return true;
        return r[x].color != undefined;
    }
}