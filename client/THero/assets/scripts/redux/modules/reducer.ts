import wallet from "./wallet";
import user from "./user";
export default class Resucer {
	public static getStates() {
		return [
			user,
			wallet,
		]
	}
}