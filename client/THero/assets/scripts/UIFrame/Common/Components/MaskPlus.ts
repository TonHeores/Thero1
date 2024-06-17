import { Enum, game, Mask, Mat4, v2, Vec2, _decorator } from "cc";

export enum MaskPlusType {
    /**
     * !#en Rect mask.
     * !#zh 使用矩形作为遮罩
     * @property {Number} RECT
     */
    RECT = 0,
    /**
     * !#en Ellipse Mask.
     * !#zh 使用椭圆作为遮罩
     * @property {Number} ELLIPSE
     */
    ELLIPSE = 1,
    /**
     * !#en Image Stencil Mask.
     * !#zh 使用图像模版作为遮罩
     * @property {Number} IMAGE_STENCIL
     */
    IMAGE_STENCIL = 2,

    /**
     * 多边形遮罩
     */
    Polygon = 3,
}

let _vec2_temp = new Vec2();
let _mat4_temp = new Mat4();

let _circlepoints =[];
function _calculateCircle (center, radius, segements) {
    _circlepoints.length = 0;
    let anglePerStep = Math.PI * 2 / segements;
    for (let step = 0; step < segements; ++step) {
        _circlepoints.push(v2(radius.x * Math.cos(anglePerStep * step) + center.x,
            radius.y * Math.sin(anglePerStep * step) + center.y));
    }

    return _circlepoints;
}

class EllipseConfig {
    center: Vec2;
    r: Vec2;
    segments: number;
}

/**
 * 遮罩扩展
 * 自定义多边形遮罩
 */
const {ccclass, property, executeInEditMode, menu, help, inspector} = _decorator;
@ccclass
@menu('i18n:MAIN_MENU.component.renderers/MaskPlus') 
@executeInEditMode
@help('i18n:COMPONENT.help_url.mask')
@inspector('packages://maskplus/inspector.js')
export default class MaskPlus extends Mask {

    static Type = MaskPlusType;

    @property({type: Enum(MaskPlusType), override: true})
    _type: MaskPlusType = 0;
    @property({type: Enum(MaskPlusType), override: true})
    // @ts-ignore
    get type() {
        return this._type; 
    }
    // @ts-ignore
    set type(value) {
        if (this._type !== value) {
            this['_resetAssembler']();
        }

        this._type = value;

        if(this._type === MaskPlusType.Polygon) {
            if(this._polygon.length === 0) {
                let [x, y, width, height] = this.getNodeRect();
                this._polygon.push(v2(x, y), v2(x+width, y), v2(x+width, y+height), v2(x, y+height));
            }
        }

        if (this._type !== MaskPlusType.IMAGE_STENCIL) {
            this.spriteFrame = null;
            this.alphaThreshold = 0;
            this._updateGraphics();
        }        
        this['_activateMaterial']();
    }

    @property({type: [Vec2], serializable: true})
    _polygon: Vec2[] = [];
    @property({type: [Vec2], serializable: true})
    public get polygon() {
        return this._polygon;
    }
    public set polygon(points: Vec2[]) {
        this._polygon = points;
        this._updateGraphics();
    }

    private ellipse: EllipseConfig = new EllipseConfig();
    public setEllipse(center?: Vec2, r?: Vec2, segments?: number) {
        this.ellipse.center = center;
        this.ellipse.r = r;
        this.ellipse.segments = segments || this.segements;
    }

    _updateGraphics () {
        let node = this.node;
        let graphics = this['_graphics'];
        // Share render data with graphics content
        graphics.clear(false);
        let [x, y, width, height] = this.getNodeRect();
        if (this['_type'] === MaskPlusType.RECT) {
            graphics.rect(x, y, width, height);
        }
        else if (this['_type'] === MaskPlusType.ELLIPSE) {
            let center = this.ellipse.center || v2(x + width / 2, y + height / 2);
            let radius = this.ellipse.r || {x: width / 2,y: height / 2};
            let segments = this.ellipse.segments || this['_segments'];
            let points = _calculateCircle(center, radius, segments);
            for (let i = 0; i < points.length; ++i) {
                let point = points[i];
                if (i === 0) {
                    graphics.moveTo(point.x, point.y);
                }
                else {
                    graphics.lineTo(point.x, point.y);
                }
            }
            graphics.close();
        }else if(this['_type'] === MaskPlusType.Polygon) {
            if(this._polygon.length === 0) this._polygon.push(v2(0, 0));
            graphics.moveTo(this._polygon[0].x, this._polygon[0].y);
            for(let i=1; i<this._polygon.length; i++) {
                graphics.lineTo(this._polygon[i].x, this._polygon[i].y);
            }
            graphics.lineTo(this._polygon[0].x, this._polygon[0].y);
        }

        if (game.renderType === game.RENDER_TYPE_CANVAS) {
            graphics.stroke();
        }
        else {
            graphics.fill();
        }
    }

    _hitTest (cameraPt: Vec2) {
        let node = this.node;
        let size = node.getContentSize(),
            w = size.width,
            h = size.height,
            testPt = _vec2_temp;
        
        node['_updateWorldMatrix']();
        // If scale is 0, it can't be hit.
        if (!Mat4.invert(_mat4_temp, node['_worldMatrix'])) {
            return false;
        }
        let point = v2(0, 0);
        Vec2.transformMat4(point, cameraPt, _mat4_temp);
        testPt.x = point.x + node['_anchorPoint'].x * w;
        testPt.y = point.y + node['_anchorPoint'].y * h;

        let result = false;
        if (this.type === MaskPlusType.RECT || this.type === MaskPlusType.IMAGE_STENCIL) {
            result = testPt.x >= 0 && testPt.y >= 0 && testPt.x <= w && testPt.y <= h;
        }
        else if (this.type === MaskPlusType.ELLIPSE) {
            let rx = w / 2, ry = h / 2;
            let px = testPt.x - 0.5 * w, py = testPt.y - 0.5 * h;
            result = px * px / (rx * rx) + py * py / (ry * ry) < 1;
        }else if(this.type === MaskPlusType.Polygon) {
            result = this.isInPolygon(point, this.polygon);
        }
        if (this.inverted) {
            result = !result;
        }
        return result;
    }

    private getNodeRect() {
        let width = this.node['_contentSize'].width;
        let height = this.node['_contentSize'].height;
        let x = -width * this.node['_anchorPoint'].x;
        let y = -height * this.node['_anchorPoint'].y;
        return [x, y, width, height];
    }

    private isInPolygon(checkPoint: Vec2, polygonPoints: Vec2[]) {
        let counter = 0, i: number, xinters: number;
        let p1: Vec2, p2: Vec2;
        let pointCount = polygonPoints.length;
        p1 = polygonPoints[0];
     
        for (i = 1; i <= pointCount; i++) {
            p2 = polygonPoints[i % pointCount];
            if (
                checkPoint.x > Math.min(p1.x, p2.x) &&
                checkPoint.x <= Math.max(p1.x, p2.x)
            ) {
                if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                    if (p1.x != p2.x) {
                        xinters = (checkPoint.x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                        if (p1.y == p2.y || checkPoint.y <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        return (counter & 1) !== 0;
    }

    

}
// cc['MaskPlus'] = MaskPlus;