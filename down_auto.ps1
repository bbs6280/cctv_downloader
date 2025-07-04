
# 可执行文件路径（假设与脚本在同一目录）
$exePath = Join-Path $PSScriptRoot "N_m3u8DL-CLI.exe"

# 设置你的下载列表文件,内容格式 https://cdn.example.com/v3.m3u8|video3.mp4
$listPath = "list.txt"

# 读取并处理每一行
Get-Content -Path $listPath -Encoding UTF8 | ForEach-Object {
    $rawLine = $_

    # 去掉前后空格
    $trimmedLine = $rawLine.Trim()

    # 将中间所有空格替换为下划线
    #$cleanLine = $trimmedLine -replace '\s+', '_'
    $cleanLine = $trimmedLine

    if ($cleanLine -match "^(.*?)\|(.*?)$") {
        
        $m3u8Url = $matches[1].Trim()
        $fileName = $matches[2].Trim()
        Write-Warning "文件名是: $fileName"
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
            node run_auto.js "$outputDir" "$fileName"

        } else {
            Write-Host "`n❌ 下载失败或未生成文件。"
        }
    }
    else {
        Write-Warning "无效行格式: $_"
    }
}
Start-Sleep -Seconds 5