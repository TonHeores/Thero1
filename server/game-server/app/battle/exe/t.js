import { Battle } from "./Battle.js";
console.log('----BEGIN---');
let tdJson1 = "{\"heroInfos\":[\
            {\"id\":\"1\",\"attack\":\"209\",\"defense\":\"225\",\"attackS\":\"104\",\"defenseS\":\"91\",\"speed\":\"456\",\"threat\":\"279\",\"hp\":\"113\",\"trumpRate\":\"856\",\"rsTrumpRate\":\"925\",\"trumpDmgRate\":\"56\",\"dodgeRate\":\"609\",\"rsDodgeRate\":\"948\",\"luckRate\":\"272\",\"extDmgAll\":\"655\",\"extDmgNormal\":\"613\",\"extDmgSkill\":\"977\",\"extRsDmgAll\":\"155\",\"extRsDmgNormal\":\"986\",\"extRsDmgSkill\":\"889\"},\
            {\"id\":\"2\",\"attack\":\"101\",\"defense\":\"194\",\"attackS\":\"118\",\"defenseS\":\"195\",\"speed\":\"261\",\"threat\":\"465\",\"hp\":\"158\",\"trumpRate\":\"365\",\"rsTrumpRate\":\"818\",\"trumpDmgRate\":\"686\",\"dodgeRate\":\"939\",\"rsDodgeRate\":\"190\",\"luckRate\":\"49\",\"extDmgAll\":\"522\",\"extDmgNormal\":\"746\",\"extDmgSkill\":\"757\",\"extRsDmgAll\":\"767\",\"extRsDmgNormal\":\"894\",\"extRsDmgSkill\":\"784\"},\
            {\"id\":\"3\",\"attack\":\"118\",\"defense\":\"119\",\"attackS\":\"69\",\"defenseS\":\"123\",\"speed\":\"164\",\"threat\":\"325\",\"hp\":\"205\",\"trumpRate\":\"680\",\"rsTrumpRate\":\"313\",\"trumpDmgRate\":\"900\",\"dodgeRate\":\"600\",\"rsDodgeRate\":\"981\",\"luckRate\":\"149\",\"extDmgAll\":\"776\",\"extDmgNormal\":\"303\",\"extDmgSkill\":\"897\",\"extRsDmgAll\":\"607\",\"extRsDmgNormal\":\"414\",\"extRsDmgSkill\":\"740\"},\
            {\"id\":\"4\",\"attack\":\"193\",\"defense\":\"149\",\"attackS\":\"112\",\"defenseS\":\"170\",\"speed\":\"248\",\"threat\":\"107\",\"hp\":\"170\",\"trumpRate\":\"430\",\"rsTrumpRate\":\"596\",\"trumpDmgRate\":\"713\",\"dodgeRate\":\"753\",\"rsDodgeRate\":\"363\",\"luckRate\":\"458\",\"extDmgAll\":\"125\",\"extDmgNormal\":\"468\",\"extDmgSkill\":\"312\",\"extRsDmgAll\":\"492\",\"extRsDmgNormal\":\"347\",\"extRsDmgSkill\":\"919\"},\
            {\"id\":\"5\",\"attack\":\"179\",\"defense\":\"211\",\"attackS\":\"149\",\"defenseS\":\"153\",\"speed\":\"435\",\"threat\":\"334\",\"hp\":\"218\",\"trumpRate\":\"54\",\"rsTrumpRate\":\"619\",\"trumpDmgRate\":\"345\",\"dodgeRate\":\"951\",\"rsDodgeRate\":\"272\",\"luckRate\":\"861\",\"extDmgAll\":\"315\",\"extDmgNormal\":\"980\",\"extDmgSkill\":\"166\",\"extRsDmgAll\":\"852\",\"extRsDmgNormal\":\"536\",\"extRsDmgSkill\":\"370\"}\
            ],\"heroPoses\":[]}";
let tdJson2 = "{\"heroInfos\":[\
            {\"id\":\"6\",\"attack\":\"219\",\"defense\":\"176\",\"attackS\":\"92\",\"defenseS\":\"248\",\"speed\":\"209\",\"threat\":\"399\",\"hp\":\"107\",\"trumpRate\":\"674\",\"rsTrumpRate\":\"597\",\"trumpDmgRate\":\"412\",\"dodgeRate\":\"875\",\"rsDodgeRate\":\"715\",\"luckRate\":\"459\",\"extDmgAll\":\"368\",\"extDmgNormal\":\"764\",\"extDmgSkill\":\"989\",\"extRsDmgAll\":\"213\",\"extRsDmgNormal\":\"500\",\"extRsDmgSkill\":\"750\"},\
            {\"id\":\"7\",\"attack\":\"151\",\"defense\":\"194\",\"attackS\":\"155\",\"defenseS\":\"115\",\"speed\":\"357\",\"threat\":\"254\",\"hp\":\"250\",\"trumpRate\":\"646\",\"rsTrumpRate\":\"548\",\"trumpDmgRate\":\"450\",\"dodgeRate\":\"986\",\"rsDodgeRate\":\"89\",\"luckRate\":\"867\",\"extDmgAll\":\"69\",\"extDmgNormal\":\"497\",\"extDmgSkill\":\"914\",\"extRsDmgAll\":\"285\",\"extRsDmgNormal\":\"648\",\"extRsDmgSkill\":\"690\"},\
            {\"id\":\"8\",\"attack\":\"171\",\"defense\":\"194\",\"attackS\":\"171\",\"defenseS\":\"54\",\"speed\":\"197\",\"threat\":\"332\",\"hp\":\"168\",\"trumpRate\":\"260\",\"rsTrumpRate\":\"668\",\"trumpDmgRate\":\"91\",\"dodgeRate\":\"462\",\"rsDodgeRate\":\"172\",\"luckRate\":\"996\",\"extDmgAll\":\"818\",\"extDmgNormal\":\"761\",\"extDmgSkill\":\"84\",\"extRsDmgAll\":\"14\",\"extRsDmgNormal\":\"999\",\"extRsDmgSkill\":\"986\"},\
            {\"id\":\"9\",\"attack\":\"141\",\"defense\":\"84\",\"attackS\":\"102\",\"defenseS\":\"141\",\"speed\":\"458\",\"threat\":\"140\",\"hp\":\"100\",\"trumpRate\":\"748\",\"rsTrumpRate\":\"182\",\"trumpDmgRate\":\"737\",\"dodgeRate\":\"604\",\"rsDodgeRate\":\"204\",\"luckRate\":\"670\",\"extDmgAll\":\"689\",\"extDmgNormal\":\"560\",\"extDmgSkill\":\"576\",\"extRsDmgAll\":\"978\",\"extRsDmgNormal\":\"311\",\"extRsDmgSkill\":\"245\"},\
            {\"id\":\"10\",\"attack\":\"102\",\"defense\":\"93\",\"attackS\":\"210\",\"defenseS\":\"56\",\"speed\":\"126\",\"threat\":\"174\",\"hp\":\"294\",\"trumpRate\":\"62\",\"rsTrumpRate\":\"362\",\"trumpDmgRate\":\"97\",\"dodgeRate\":\"759\",\"rsDodgeRate\":\"575\",\"luckRate\":\"369\",\"extDmgAll\":\"807\",\"extDmgNormal\":\"250\",\"extDmgSkill\":\"949\",\"extRsDmgAll\":\"504\",\"extRsDmgNormal\":\"764\",\"extRsDmgSkill\":\"91\"}\
            ],\"heroPoses\":[]}";
let td1 = JSON.parse(tdJson1);
let td2 = JSON.parse(tdJson2);
let battle = new Battle();
battle.init(td1, td2);
battle.running();
//let data=JSON.parse(json1);
//  let dataCfg:BDataCfg = new BDataCfg();
//  dataCfg.init("../../gamedata/datas/server_game_data.json");
//  let dataStr = dataCfg.getSet("TestHeroInfo1");
// declare var require;
// let dataStr = require('./ttt.json');
// let fs = require("fs");
// let dataStr=fs.readFileSync(filepath, 'utf8');
//let dataStr = FileUtils.readFromFile(filepath);
//console.log(battle.troops[1].units[3]);
console.log('----END---');
