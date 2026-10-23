@echo off
chcp 65001 >nul
:: ==============================================================================
:: Aria2-Next 协议注册脚本 (Windows)
:: 用于在 Windows 注册表为当前用户 (HKCU) 注册 aria2:// 与 aria2-next:// 协议关联
:: 关联后，在浏览器中点击“启动 Aria2-Next”或按快捷键 Alt+X 即可直接静默启动本地核心
:: ==============================================================================

echo ----------------------------------------------------------------------
echo  Aria2-Next Explorer - 本地协议注册工具
echo ----------------------------------------------------------------------

set "DEFAULT_VBS=D:\Infra\Aria2Next\Aria2_Start_No_Delay.vbs"

if exist "%DEFAULT_VBS%" (
    set "TARGET_VBS=%DEFAULT_VBS%"
) else (
    echo 未在默认位置检测到启动脚本: %DEFAULT_VBS%
    set /p "TARGET_VBS=请输入本地 Aria2_Start_No_Delay.vbs 的完整路径: "
)

if not exist "%TARGET_VBS%" (
    echo [错误] 找不到指定的启动脚本: "%TARGET_VBS%"
    pause
    exit /b 1
)

echo.
echo 目标启动脚本: "%TARGET_VBS%"
echo 正在写入当前用户注册表 (无需管理员权限)...
echo.

:: 注册 aria2-next:// 协议
reg add "HKCU\Software\Classes\aria2-next" /ve /d "URL:Aria2-Next Protocol" /f >nul
reg add "HKCU\Software\Classes\aria2-next" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\aria2-next\shell\open\command" /ve /d "wscript.exe \"%TARGET_VBS%\"" /f >nul

:: 注册 aria2:// 协议 (兼容回退)
reg add "HKCU\Software\Classes\aria2" /ve /d "URL:Aria2 Protocol" /f >nul
reg add "HKCU\Software\Classes\aria2" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\aria2\shell\open\command" /ve /d "wscript.exe \"%TARGET_VBS%\"" /f >nul

echo [成功] 协议关联注册完成！
echo   - 已注册: aria2-next:// -> "%TARGET_VBS%"
echo   - 已注册: aria2://      -> "%TARGET_VBS%"
echo.
echo 现在可以在浏览器扩展中点击“启动 Aria2-Next”或使用快捷键 Alt+X 唤醒核心服务。
echo ----------------------------------------------------------------------
pause
