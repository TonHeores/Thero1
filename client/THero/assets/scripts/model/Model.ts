
import ChestModel from './ChestModel';
import FightMode from './FightMode';
import UserModel from './UserModel';
export default class Model {

    static init() {
        UserModel.init();
        ChestModel.init()
        FightMode.init()
    }

    static reset() {
        UserModel.reset()
        ChestModel.reset()
        FightMode.reset()
    }

}