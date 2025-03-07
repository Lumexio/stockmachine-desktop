# First time setup
WINEARCH=win64 WINEPREFIX=~/.wine winecfg

# Then run the build with the prefix
WINEPREFIX=~/.wine npm run make-win