import State from './state';
import ReduxName from './reduxName';

function Watch(that, reduxName, name, cb) {
	State.connect(that.node.uuid, reduxName,name, cb)
}

function disConnect(that) {
	State.disconnect(that.node.uuid)
}

const Redux = {
	ReduxName,
	State,
	Watch,
	disConnect
}

export default Redux;