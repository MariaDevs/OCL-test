# ============================================================
#  hide-mundial.ps1
#  Retira por completo la sección temporal del Mundial 2026.
#
#  Qué hace:
#   1. Elimina todos los bloques marcados con
#      <!-- WC2026:START --> ... <!-- WC2026:END -->
#      (entrada de menú en el <nav> de cada página y entradas del sitemap).
#   2. Borra la carpeta /mundial/ (portada + artículos).
#
#  Uso (desde la raíz del sitio):
#     powershell -ExecutionPolicy Bypass -File scripts/hide-mundial.ps1
#
#  Es seguro ejecutarlo más de una vez. Antes de borrar, haz commit
#  por si quieres recuperar la sección en el futuro.
# ============================================================

$ErrorActionPreference = 'Stop'

# Raíz del proyecto = carpeta padre de /scripts/
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
# Coincide con el bloque marcado, incluso si abarca varias líneas
$pattern = '(?s)<!-- WC2026:START -->.*?<!-- WC2026:END -->'

$changed = 0
Get-ChildItem -Path $root -Recurse -Include *.html, *.xml -File | ForEach-Object {
    $text = [System.IO.File]::ReadAllText($_.FullName)
    $new  = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, '')
    if ($new -ne $text) {
        [System.IO.File]::WriteAllText($_.FullName, $new, $utf8)
        $changed++
        Write-Output "  limpiado: $($_.FullName.Substring($root.Length + 1))"
    }
}
Write-Output "Bloques WC2026 eliminados en $changed archivo(s)."

# Borra la carpeta de la sección del Mundial
$mundial = Join-Path $root 'mundial'
if (Test-Path $mundial) {
    Remove-Item -Recurse -Force $mundial
    Write-Output "Carpeta /mundial/ eliminada."
} else {
    Write-Output "La carpeta /mundial/ ya no existe."
}

Write-Output "Listo. Recuerda revisar y hacer commit de los cambios."
