@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
:: 山药List - 智能安装启动器
:: 自动检测系统架构并安装对应版本
:: ============================================

title 山药List 安装程序

echo.
echo ╔═══════════════════════════════════════╗
echo ║      山药List - 智能安装程序          ║
echo ╚═══════════════════════════════════════╝
echo.
echo [1/3] 正在检测系统架构...
echo.

:: 检测系统架构
set ARCH=unknown
if defined PROCESSOR_ARCHITEW6432 (
    set ARCH=64
) else if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set ARCH=64
) else if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    set ARCH=32
)

if "%ARCH%"=="64" (
    echo [√] 检测到 64位 Windows 系统
    echo.
    echo [2/3] 正在启动 64位 安装程序...
    echo.

    :: 查找64位安装包
    if exist "山药List Setup *.exe" (
        for %%f in ("山药List Setup *.exe") do (
            echo [3/3] 启动安装包: %%f
            start "" "%%f"
            goto :end
        )
    ) else if exist "*Setup*.exe" (
        for %%f in (*Setup*.exe) do (
            set "filename=%%f"
            echo !filename! | findstr /i /c:"ia32" >nul
            if errorlevel 1 (
                echo [3/3] 启动安装包: %%f
                start "" "%%f"
                goto :end
            )
        )
    ) else (
        echo [×] 错误：找不到64位安装包
        echo.
        echo 请确保以下文件存在：
        echo   - 山药List Setup [版本号].exe
        echo.
        pause
        exit /b 1
    )
) else if "%ARCH%"=="32" (
    echo [√] 检测到 32位 Windows 系统
    echo.
    echo [2/3] 正在启动 32位 安装程序...
    echo.

    :: 查找32位安装包
    if exist "*ia32*.exe" (
        for %%f in (*ia32*.exe) do (
            echo [3/3] 启动安装包: %%f
            start "" "%%f"
            goto :end
        )
    ) else if exist "*x86*.exe" (
        for %%f in (*x86*.exe) do (
            echo [3/3] 启动安装包: %%f
            start "" "%%f"
            goto :end
        )
    ) else (
        echo [×] 错误：找不到32位安装包
        echo.
        echo 请确保以下文件存在：
        echo   - 山药List Setup [版本号]-ia32.exe
        echo.
        pause
        exit /b 1
    )
) else (
    echo [×] 无法识别系统架构
    echo.
    echo 系统信息：
    echo   PROCESSOR_ARCHITECTURE=%PROCESSOR_ARCHITECTURE%
    echo   PROCESSOR_ARCHITEW6432=%PROCESSOR_ARCHITEW6432%
    echo.
    pause
    exit /b 1
)

:end
echo.
echo [√] 安装程序已启动！
echo.
echo 提示：安装完成后可以关闭此窗口
timeout /t 3 >nul
exit /b 0
