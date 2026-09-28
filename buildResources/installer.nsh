; Included by electron-builder's NSIS template (see nsis.include in .electron-builder.config.js)

!macro customInstall
  ; electron-updater re-runs this installer silently on every update; never prompt then
  ${ifNot} ${isUpdated}
    ; sc exits 0 when the ViGEmBus service already exists
    nsExec::ExecToStack 'sc query ViGEmBus'
    Pop $0
    Pop $1
    ${if} $0 != 0
      MessageBox MB_YESNO|MB_ICONQUESTION "Install the ViGEmBus virtual gamepad driver?$\r$\n$\r$\nRequired for controller mode. You can install it later from the app." /SD IDNO IDNO skipVigem
        ExecWait '"$INSTDIR\resources\resources\drivers\ViGEmBus_1.22.0_x64_x86_arm64.exe"'
      skipVigem:
    ${endIf}
  ${endIf}
!macroend
