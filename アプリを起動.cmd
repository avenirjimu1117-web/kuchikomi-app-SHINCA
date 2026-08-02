@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 口コミアプリを起動しています...
echo この黒い画面は、アプリを使っている間は閉じないでください。
echo.
"C:\Users\PC_User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" ".\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5174 --open
echo.
echo サーバーが停止しました。何かキーを押すと閉じます。
pause >nul
