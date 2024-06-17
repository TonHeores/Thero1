
import ReduxName from "../reduxName";

export default class Store {
	public static storeName = ReduxName.wallet;

	public static state = {
		address: '',
		balance:BigInt(0),
		blockTime:0
	}

}