# Script para gerar favicons de diferentes tamanhos
# Requer ImageMagick instalado: https://imagemagick.org/script/download.php

# Certifique-se de que você está no diretório correto
Set-Location -Path "c:\Users\p.laurenti.de.matos\Desktop\DEVP\PCT\public"

# Copia o favicon.ico existente para backup
Copy-Item -Path ".\public\favicon.ico" -Destination ".\public\favicon.ico.bak" -Force

# Gera favicon.ico com múltiplos tamanhos
magick convert ".\public\images\logo_mini.svg" -background transparent -define icon:auto-resize=64,48,32,16 ".\public\favicon.ico"

# Gera PNG para Android/Chrome
magick convert ".\public\images\logo_mini.svg" -background transparent -resize 192x192 ".\public\favicon-192x192.png"
magick convert ".\public\images\logo_mini.svg" -background transparent -resize 512x512 ".\public\favicon-512x512.png"

# Gera ícone para Apple Touch
magick convert ".\public\images\logo_mini.svg" -background transparent -resize 180x180 ".\public\apple-touch-icon.png"

Write-Output "Favicons gerados com sucesso!"
