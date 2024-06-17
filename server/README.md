## 环境安装

### 安装 nodejs

直接从[官网](https://nodejs.org/en)下载安装包

### 安装项目依赖

进入 game-server 目录，执行 npm install

### mysql

#### 安装 mysql server

chatgpt 介绍的 windows 下安装步骤如下（未验证）：

1. 访问 MySQL 官方下载页面：https://dev.mysql.com/downloads/installer/
2. 选择适合您的 Windows 版本的 MySQL Installer（例如，如果您使用的是 64 位的 Windows，那么您应该选择 "Windows (x86, 64-bit), MSI Installer"）。
3. 点击 "Download" 按钮开始下载。您可能会被提示创建一个 Oracle 账户，但这不是必需的。您可以直接点击 "No thanks, just start my download." 链接来开始下载。
4. 下载完成后，双击下载的 .msi 文件来启动 MySQL Installer。
5. 在 MySQL Installer 中，选择 "Setup Type"。对于大多数用户来说，"Developer Default" 是一个好的选择，因为它会安装 MySQL Server 以及其他一些有用的工具，如 MySQL Workbench。
6. 按照安装程序的指示进行操作。在 "Accounts and Roles" 步骤中，您需要设置一个密码，这将用于 MySQL 的 root 用户。请记住这个密码，因为您将需要它来管理您的 MySQL 服务器。
7. 完成安装后，您可以通过在命令行中输入 mysql -u root -p 并输入您之前设置的密码来访问 MySQL 服务器。

#### 创建 mysql 配置文件

在 game-server 下创建.env 文件（注意，文件名字前面有一个点）,内容为：

MYSQL_USERNAME=<YOUR_USER_NAME>
MYSQL_PASSWORD=<YOUR_PASSWORD>

将用户名和密码替换成你本地的

#### 初始化mysql db
登录mysql，创建database: 
```
create database thero;
use thero;
```
创建table:
```
source <YOUR_PROJECT_PATH/THERO/server/sql/thero.sql>
desc t_player_info;
```


### 安装 redis server

1. 在 Windows 上安装 Redis，您可以从 Redis 官方 GitHub 存储库下载预编译的二进制文件。以下是具体步骤：
2. 访问 Redis 官方 GitHub 存储库的 releases 页面：https://github.com/redis/redis/releases
3. 在页面上找到最新的稳定版本（stable version），点击对应的 .zip 文件（例如 redis-6.2.6.zip）进行下载。
4. 下载完成后，将 .zip 文件解压到一个合适的位置，例如 C:\Program Files\Redis。
5. 打开 Windows 命令提示符（Command Prompt）并切换到 Redis 解压后的目录。例如：
   ```
   redis-server
   ```

现在，Redis 服务器应该已经在您的 Windows 机器上运行。您可以通过运行以下命令打开 Redis 命令行客户端（CLI）进行测试：
```
redis-cli
```

### 运行
进入game-server目录，运行
```
npm run start_dev
```
如果遇到端口占用报错，可先运行pomelo stop，来关闭之前未关闭的进程
## 调试
### 日志
运行npm run start_dev后，可在控制台可看到日志
如需使用vscode自带的debugger功能，需创建launch.json来配置调试入口，执行npm run build来编译代码，然后入口设置为dist/index.js

## 服务器
服务器上相关环境已经搭建好，如需更新代码：
1. git pull (确保在Dev分支)
2. npm run build (生成dist目录)
3. pomelo stop (停止运行已有的项目)
4. npm start (重新启动)

服务器redis:
redis-cli 命令可直接查看redis

查看服务器密码：
cd sever/game-server
cat .env

服务器mysql:
mysql -uroot -p
输入服务器密码

## 客户端测试
1. 进入game-server-test-client中，执行npm install
2. 运行 serve -S . （在当前目录下运行一个静态文件服务器）
如果未安装serve，可 npm install serve -g
3. 访问http://localhost:3000



