@echo off
rmdir /s /q repositorio
cls
echo ubique las facturas a buscar en el archivo ./facturas.txt. EJ IND;999 (prefijo;numero). Presione enter para continuar ...
pause >nul
@mkdir repositorio
node robot-armar-base repositorio
copy.bat