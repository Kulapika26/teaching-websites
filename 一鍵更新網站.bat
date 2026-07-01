@echo off
cd /d "%~dp0"
echo ============================
echo   Uploading website update...
echo ============================
echo.

git add -A
git commit -m "update website"
git push

echo.
echo ============================
echo   Done. If there are no red error lines above, the site is updated.
echo   Vercel will finish deploying in about 1-3 minutes.
echo ============================
pause
