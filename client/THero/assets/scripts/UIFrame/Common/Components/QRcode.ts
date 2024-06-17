import { _decorator, Component, Graphics, Color } from "cc";
import EXT from "../../../utils/exts/index";

const { ccclass, property } = _decorator;

@ccclass
export default class QRcode extends Component {
    // 二维码内容
    @property({ tooltip: "二维码内容" })
    content = "";

    onLoad() {
        if (this.content) {
            this.create(this.content);
        }
    }

    // 创建二维码
    create(content: string) {
        const ctx = this.node.addComponent(Graphics);
        const code = new EXT.QRCode(-1, 2);
        code.addData(content);
		code.make();
        ctx.fillColor = Color.BLACK;
 
		const width = (this.node as any).width / code.getModuleCount();
		const height = (this.node as any).height / code.getModuleCount();

        for (var row = 0; row < code.getModuleCount(); row++) {
			for (var col = 0; col < code.getModuleCount(); col++) {
				if (code.isDark(row, col)) {
					var w = (Math.ceil((col + 1) * width) - Math.floor(col * width));
					var h = (Math.ceil((row + 1) * width) - Math.floor(row * width));
					ctx.rect(Math.round(col * width), Math.round(row * height), w, h);
					ctx.fill();
				}
			}
		}
    }

    // 更新
    setContent(content: string) {
        this.create(content);
    }
}
