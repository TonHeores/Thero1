set cfgdir=..\client\THero\assets\scripts\utils\pomelo
set landir=..\client\THero\assets\scripts\utils
set srcdir= ..\server\game-server\proto
COPY %srcdir%\DataDefine.ts %cfgdir%
COPY %srcdir%\ProtoPackage.ts %cfgdir%
COPY %srcdir%\ProtoRoute.ts %cfgdir%
COPY %srcdir%\ConstDefine.ts %cfgdir%
COPY %srcdir%\CommUtil.ts %cfgdir%
pause