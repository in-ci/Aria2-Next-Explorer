@echo off
@chcp 65001 >nul
:: ==============================================================================
:: Aria2-Next-Explorer - Edge 浏览器插件一键打包快捷工具
:: 双击即可自动执行打包流程，生成支持 Microsoft Edge 浏览器的安装包与解压包。
:: ==============================================================================

echo.
echo ================================================================
echo    Aria2-Next-Explorer (Edge 版) 一键打包工具
echo ================================================================
echo.

:: 切换到项目根目录（脚本目录的上一级）
cd /d "%~dp0\.."

:: 检查系统是否安装了 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境，请先安装 Node.js (https://nodejs.org/)！
    echo.
    pause
    exit /b 1
)

:: 执行 Node.js 打包程序
node "%~dp0package-edge.js"

if %errorlevel% neq 0 (
    echo.
    echo [错误] 打包过程发生异常，请检查上述错误信息。
    echo.
) else (
    echo.
    echo [提示] 打包完成！你可以直接双击打开 dist 文件夹查看生成的扩展包。
)

echo.
pause
