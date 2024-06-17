
import ChestModel from './ChestModel';
import FightMode from './FightMode';
import RankModel from './RankModel';
import UserModel from './UserModel';
export default class Model {

    static init() {
        UserModel.init();
        ChestModel.init()
        FightMode.init()
        RankModel.init()
    }

    static reset() {
        UserModel.reset()
        ChestModel.reset()
        FightMode.reset()
        RankModel.reset()
    }

}