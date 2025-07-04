param(
    [Parameter(Mandatory=$true)]
    [string]$m3u8Url
)

# 可执行文件路径（假设与脚本在同一目录）
$exePath = Join-Path $PSScriptRoot "N_m3u8DL-CLI.exe"

# 保存名（根据当前时间戳生成）
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$saveName = "video_$timestamp"
$outputFile = Join-Path (Get-Location) "tmp/$saveName/Part_0/00.ts"
$outputDir = Join-Path (Get-Location) "tmp/$saveName/Part_0"

# 下载命令
& $exePath $m3u8Url --noMerge --workDir tmp --saveName $saveName

# 检查文件是否生成并输出路径
if (Test-Path $outputFile) {
    Write-Host "`n✅ 下载完成，文件保存路径为：$outputFile"

    # 开始解密
    node run_auto.js "$outputDir" "测试文件"

} else {
    Write-Host "`n❌ 下载失败或未生成文件。"
}
Start-Sleep -Seconds 5