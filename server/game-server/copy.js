const cpy = require('cpy')
// 复制配置文件到打包好的目录中
cpy(['./config/**'], './dist/config').then(() => {
  console.log('build. config files copied')
})

cpy(['./protos/**'], './dist/protos').then(() => {
  console.log('build. protos files copied')
})

cpy(['./.env'], './dist/').then(() => {
  console.log('build. .env files copied')
})

cpy(['../shared/**'], './dist/shared').then(() => {
  console.log('build. shared files copied')
})

cpy(['./datas/**'], './dist/datas').then(() => {
  console.log('build. data files copied')
})