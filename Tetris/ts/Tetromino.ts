interface Point {
    x: number;
    y: number;
}

/**
 * Base class for all Tetrominos
 * */
abstract class Tetromino {
    points: Array<Point>;
    color: Colors;
    constructor() {
        this.points = new Array<Point>(4);
    }

    moveLeft() {
        this.points.forEach(p => { if (p.x > 0) p.x--; });
    }

    moveRight() {
        this.points.forEach(p => { p.x++; });
    }

    moveDown() {
        this.points.forEach(p => { p.y++; });
    }

    rotate(maxX: number) {
    }

    rotatePoints(maxX: number): Array<Point> {
        return this.points;
    }

    isInside(point: Point): boolean {
        for (let p of this.points) {
            if (p.x == point.x && p.y == point.y)
                return true;
        }
        return false;
    }

    getDX(): number {
        let newPoints = Array<Point>(4);
        // var minX = Math.min(this.points[0].x, this.points[1].x, this.points[2].x, this.points[3].x);
        var minX = Math.min(...(this.points.map (p => p.x)));
        return minX;
    }

    setDX(dx: number) {
        this.points.forEach(p => p.x += dx);
    }

    /**
     * create a random Tetromino
     * @param dx
     */
    static NewTetromino(): Tetromino {
        var num = Math.floor(Math.random() * 7);
        switch (num) {
            case 0:
                return new SquareTetromino();
            case 1:
                return new StraitTetromino();
            case 2:
                return new LTetromino();
            case 3:
                return new JTetromino();
            case 4:
                return new STetromino();
            case 5:
                return new ZTetromino();
            case 6:
                return new TTetromino();
            default:
                throw new Error('no Tetromino');
        }
    }
}


/**
 * Square Tetromino  (2x2)
 * */
class SquareTetromino extends Tetromino {
    constructor() {
        super();
        this.points[0] = { x: 0, y: 0 };
        this.points[1] = { x: 1, y: 0 };
        this.points[2] = { x: 0, y: 1 };
        this.points[3] = { x: 1, y: 1 };
        this.color = Colors.Yellow;
    }
}

/**
 * Strait Tetromino  (4 in a row)
 * */
class StraitTetromino extends Tetromino {
    protected up: boolean;
    constructor() {
        super();
        this.points[0] = { x: 0, y: 0 };
        this.points[1] = { x: 0, y: 1 };
        this.points[2] = { x: 0, y: 2 };
        this.points[3] = { x: 0, y: 3 };
        this.color = Colors.Cyan;
        this.up = true;
    }

     rotate(maxX: number) {
        this.points = this.rotatePoints(maxX);
        this.up = !this.up;
    }

    rotatePoints(maxX: number): Array<Point> {
        var points = new Array<Point>(4);
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
    }
}


/**
 * Tetromino with middle point to rotate
 * */
abstract class TetrominoWithMiddle extends Tetromino {
    protected middle: Point;

    setDX(dx: number) {
        super.setDX(dx);
        this.middle.x += dx;
    }

    rotatePoints(maxX: number): Array<Point> {
        var points = new Array<Point>(4);
        for (let i in this.points)
            points[i] = this.rotatePoint(this.points[i], this.middle);
        return points;
    }

    rotate(maxX: number) {
        this.points = this.rotatePoints(maxX);
    }

    moveLeft() {
        super.moveLeft();
        this.middle.x--;
    }

    moveRight() {
        super.moveRight();
        this.middle.x++;
    }

    moveDown() {
        super.moveDown();
        this.middle.y++;
    }

    protected rotatePoint(pO: Point, m: Point): Point {
        var p = <Point>{};
        p.x = - (pO.y - m.y) + m.x;
        p.y = (pO.x - m.x + m.y);
        return p;
    }
}


/**
 * L Tetromino  
 * */
class LTetromino extends TetrominoWithMiddle {
    constructor() {
        super();
        this.points[0] = { x: 0, y: 0 };
        this.points[1] = { x: 0, y: 1 };
        this.points[2] = { x: 0, y: 2 };
        this.points[3] = { x: 1, y: 2 };
        this.color = Colors.Orange;
        this.middle = { x: 1, y: 1};
    }
}

/**
 * J Tetromino  
 * */
class JTetromino extends TetrominoWithMiddle {
    constructor() {
        super();
        this.points[0] = { x: 1, y: 0 };
        this.points[1] = { x: 1, y: 1 };
        this.points[2] = { x: 1, y: 2 };
        this.points[3] = { x: 0, y: 2 };
        this.color = Colors.Blue;
        this.middle = { x: 0, y: 1 };
    }
}

/**
 * S Tetromino  
 * */
class STetromino extends TetrominoWithMiddle {
    constructor() {
        super();
        this.points[0] = { x: 0, y: 1 };
        this.points[1] = { x: 1, y: 1 };
        this.points[2] = { x: 1, y: 0 };
        this.points[3] = { x: 2, y: 0 };
        this.color = Colors.Green;
        this.middle = { x: 1, y: 1 };
    }
}

/**
 * Z Tetromino  
 * */
class ZTetromino extends TetrominoWithMiddle {
    constructor() {
        super();
        this.points[0] = { x: 0, y: 0 };
        this.points[1] = { x: 1, y: 0 };
        this.points[2] = { x: 1, y: 1 };
        this.points[3] = { x: 2, y: 1 };
        this.color = Colors.Red;
        this.middle = { x: 1, y: 1 };
    }
}

/**
 * T Tetromino  
 * */
class TTetromino extends TetrominoWithMiddle {
    constructor() {
        super();
        this.points[0] = { x: 0, y: 0 };
        this.points[1] = { x: 1, y: 0 };
        this.points[2] = { x: 2, y: 0 };
        this.points[3] = { x: 1, y: 1 };
        this.color = Colors.Pink;
        this.middle = { x: 1, y: 1 };
    }
}