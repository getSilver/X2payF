$root = 'd:\github\X2payF\src\views'
$extensions = @('.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md')
$files = Get-ChildItem -Path $root -Recurse -File |
    Where-Object { $extensions -contains $_.Extension }

$converted = @()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
        [System.IO.File]::WriteAllText($file.FullName, $text, $utf8NoBom)
        $converted += $file.FullName
    }
}

if ($converted.Count -eq 0) {
    Write-Output 'No UTF-8 BOM files found.'
} else {
    Write-Output 'Converted files:'
    $converted | ForEach-Object { Write-Output $_ }
}
