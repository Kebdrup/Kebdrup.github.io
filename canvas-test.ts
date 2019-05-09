
interface Line
{
    start: number;
    end: number;
}

interface Polygon
{
    points: Point[];
    lines: Array<[number, number]>;
}

interface Point
{
    x: number;
    y: number;
    z: number;
}

class Camera {

    focalLength: number;
    width: number;
    height: number;
    canvas: CanvasRenderingContext2D;

    constructor(focalLength: number, width: number, height: number, canvasId: string)
    {
        this.focalLength = focalLength;
        this.width = width;
        this.height = height;

        var c = <HTMLCanvasElement> document.getElementById(canvasId);
        this.canvas = c.getContext("2d");

    }

    DrawBackground() : void
    {
        // Create background
        var backGroundImage = this.canvas.createImageData(this.width, this.height);
        for (let i = 0; i < backGroundImage.data.length; i += 4) {
          backGroundImage.data[i + 0] = 245;
          backGroundImage.data[i + 1] = 245;
          backGroundImage.data[i + 2] = 255;
          backGroundImage.data[i + 3] = 255;
        }
            this.canvas.putImageData(backGroundImage, 0, 0);
    }

    DrawPoint(x: number, y: number, color: [number, number, number]) : void
    {
        var point = this.canvas.createImageData(1, 1);
        for (let i = 0; i < point.data.length; i += 4)
        {
            point.data[i + 0] = color[0];
            point.data[i + 1] = color[1];
            point.data[i + 2] = color[2];
            point.data[i + 3] = 255;
        }
        this.canvas.putImageData(point, x, y);
    }

    DrawPolygon(polygon: Polygon) : void
    {
        // Draw points
        for (let i = 0; i < polygon.points.length; i++)
        {
            var p = this.WorldToCamera(polygon.points[i]);
            this.DrawPoint(p.x, p.y, [255, 0, 0]);
        }

        // Draw lines between points
        for (let i = 0; i < polygon.lines.length; i++)
        {
            var v = this.WorldToCamera(polygon.points[polygon.lines[i][0]]);
            var w = this.WorldToCamera(polygon.points[polygon.lines[i][1]]);

            // Direction to next point 
            var d = [w.x - v.x, w.y - v.y];
            var max = d.reduce((a, b) => Math.max(Math.abs(a), Math.abs(b)));
            d = d.map(x => x / max);
            var n = {x: v.x + d[0], y: v.y + d[1]};

            // Determine sign of difference
            var xSign = 1;
            if ((w.x - v.x) < 0)
            {
               xSign = -1; 
            }

            var ySign = 1;
            if ((w.y - v.y) < 0)
            {
               ySign = -1; 
            }
            while ((xSign * (Math.round(w.x) - Math.round(n.x))) > 0 || (ySign * (Math.round(w.y) - Math.round(n.y))) > 0)
            {
                var p = {x: Math.round(n.x), y: Math.round(n.y), z: 50};
                this.DrawPoint(p.x, p.y, [0, 255, 0]);
                n = {x: n.x + d[0], y: n.y + d[1]};
            }
        }
    }

    WorldToCamera(p: Point) : Point
    {
        //return {x: (p.z * (this.width - 2 * p.x))/(2 * this.focalLength),
        //        y: (p.z * (this.height - 2 * p.y))/(2 * this.focalLength),
        //        z: p.z};

        return {x: this.focalLength * ((p.x+(this.width/2))/p.z),
            y: this.focalLength * ((p.y+(this.height/2))/p.z),
                z: p.z};
    }
}

//var square = {points: [{x: 100, y: 100, z: 50}, {x: 100, y: 200, z: 50}, {x: 200, y: 200, z: 100}, {x: 200, y: 100, z: 100}],
//    lines: new Array<[number, number]>([0, 1], [1, 2], [2, 3], [3, 0])};

var cube = {points: [{x: -50, y: -50, z: 80}, {x: -50, y: 50, z: 80}, {x: 50, y: 50, z: 80}, {x: 50, y: -50, z: 80}, {x: -50, y: -50, z: 100}, {x: -50, y: 50, z: 100}, {x: 50, y: 50, z: 100}, {x: 50, y: -50, z: 100}],
    lines: new Array<[number, number]>([0, 1], [1, 2], [2, 3], [3, 0],
                                       [4, 5], [5, 6], [6, 7], [7, 4],
                                       [0, 4], [1, 5], [2, 6], [3, 7])};

//var l = {points: [{x: -50, y: 0, z: 100}, {x: 50, y: 0, z: 100}], lines: new Array<[number, number]>([0, 1])}; 

var camera = new Camera(100, 640, 480, "myCanvas");

setInterval(function()
    {
        var cubeZ = parseInt((<HTMLInputElement>document.getElementById("z-range")).value);
        var cubeX = parseInt((<HTMLInputElement>document.getElementById("x-range")).value);
        for (let i = 0; i < cube.points.length; i++)
        {
            cube.points[i].z -= cubeZ;
        }
        for (let i = 0; i < cube.points.length; i++)
        {
            cube.points[i].x -= cubeX;
        }
        camera.DrawBackground();
        camera.DrawPolygon(cube);

    }, 200);

