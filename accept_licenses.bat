@echo off
for /L %%i in (1,1,10) do (
    echo y
) | D:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat --licenses