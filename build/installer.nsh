; ============================================
; 山药List - 智能架构检测安装脚本
; 自动识别32位/64位系统
; ============================================

!macro customInit
  ; 检测系统架构
  ${If} ${RunningX64}
    ; 64位系统
    !ifdef ARCH_X64
      ; 正在安装64位版本到64位系统 - 完美匹配
      DetailPrint "检测到64位系统，正在安装64位版本..."
    !else
      ; 尝试在64位系统上安装32位版本 - 给出警告但允许继续
      DetailPrint "警告：检测到64位系统，但正在安装32位版本"
      DetailPrint "建议下载64位版本以获得更好的性能"
    !endif
  ${Else}
    ; 32位系统
    !ifdef ARCH_X64
      ; 试图在32位系统上安装64位版本 - 阻止安装
      MessageBox MB_ICONSTOP|MB_OK "错误：检测到32位系统$\r$\n$\r$\n此安装包仅支持64位系统。$\r$\n$\r$\n请下载32位版本（标记为 ia32 或 x86）。"
      Quit
    !else
      ; 正在安装32位版本到32位系统 - 完美匹配
      DetailPrint "检测到32位系统，正在安装32位版本..."
    !endif
  ${EndIf}
!macroend

!macro customInstall
  ; 安装后的架构信息
  ${If} ${RunningX64}
    !ifdef ARCH_X64
      DetailPrint "64位版本安装完成"
    !else
      DetailPrint "32位版本安装完成（运行在64位系统上）"
    !endif
  ${Else}
    DetailPrint "32位版本安装完成"
  ${EndIf}
!macroend
