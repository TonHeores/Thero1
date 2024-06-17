
import { _decorator, Component, macro, Mask, game, Graphics, UITransform, CCInteger } from 'cc';

const { ccclass, property, requireComponent, menu, executeInEditMode, disallowMultiple } = _decorator;


    macro.ENABLE_WEBGL_ANTIALIAS = true;

    @ccclass()
    //@ts-ignore
    @executeInEditMode(true)
    //@ts-ignore
    @disallowMultiple(true)
    @requireComponent(Mask)
    @menu("渲染组件/圆角遮罩")
    export class RoundRectMask extends Component {
        @property(CCInteger)
        private _radius: number = 10;

        @property({tooltip: "圆角半径:\n0-1之间为最小边长比例值, \n>1为具体像素值"})

        public get radius(): number {
            return this._radius;
        }

    //    public radius: number = 50;
        public set radius(r: number) {
            this._radius = r;
            this.updateMask(r);
        }

        // @property(cc.Mask)
        protected mask: Mask = null;

        protected onEnable(): void {
            this.mask = this.getComponent(Mask);
            this.updateMask(this.radius);
        }

        private updateMask(r: number) {
            let _radius = r >= 0 ? r : 0;
            if (_radius < 1) {
                _radius = Math.min(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height) * _radius;
            }
            this.mask["radius"] = _radius;
            this.mask["onDraw"] = this.onDraw.bind(this.mask);
            this.mask["_updateGraphics"] = this._updateGraphics.bind(this.mask);
            this.mask.type = Mask.Type.GRAPHICS_RECT;
        }

        private _updateGraphics() {

            // @ts-ignore.
            let graphics = this._graphics;
            if (!graphics) {
                return;
            }
            this.onDraw(graphics);
        }

        /**
         * mask 用于绘制罩子的函数.
         * this 指向mask 对象,需要特别注意.
         * @param graphics
         */
        protected onDraw(graphics: Graphics) {
            // Share render data with graphics content
            graphics.clear();
            let node = this.node;
            let width = node.getComponent(UITransform).width;
            let height = node.getComponent(UITransform).height;
            let x = -width * node.getComponent(UITransform).anchorX;
            let y = -height * node.getComponent(UITransform).anchorY;
            graphics.roundRect(x, y, width, height, this.radius || 0);
            // if (game.renderType === game.RENDER_TYPE_CANVAS) {
            //     graphics.stroke();
            // } else {
                graphics.fill();
            // }
        }
    }