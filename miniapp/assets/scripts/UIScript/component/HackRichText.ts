import { _decorator, Component, RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass()
export default class HackRichText extends Component {
	onLoad() {
		const richComp = this.node.getComponent(RichText);
		richComp.cacheMode = 2;
	}
}