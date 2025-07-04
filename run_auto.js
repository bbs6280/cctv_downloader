const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// 从命令行参数获取路径和输出文件名
const args = process.argv.slice(2);
const folderPath = args[0];
const customOutputFile = args[1]; // 可选参数


  if (!folderPath) {
    console.error('文件夹不存在！');
    return;
  }

  // 获取文件夹中所有.ts文件
  const files = fs.readdirSync(folderPath).filter(file => {
    return file.endsWith('.ts') && !file.endsWith('_dec.ts');
  });

  if (files.length === 0) {
    console.log('没有找到 .ts 文件。');
    return;
  }

  console.log(`找到 ${files.length} 个 .ts 文件，开始解密...`);

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const decryptedFile = file.replace('.ts', '_dec.ts');
    const decryptedPath = path.join(folderPath, decryptedFile);

    try {
      // 执行解密命令
      execSync(`node ts_decrypt.js "${filePath}" "${decryptedPath}"`, { stdio: 'inherit' });

      // 删除原始文件
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`解密文件失败: ${file}`, err.message);
    }
  });

  // 获取所有解密后的文件
  const decFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('_dec.ts'));

  // 按文件名排序
  decFiles.sort();

  const outputDir = "tmp_out"
  const outputFile = customOutputFile ? `${customOutputFile}.ts` : `${Math.floor(Date.now() / 1000)}.ts`;
  const outputPath = path.join(outputDir, outputFile);

  // 合并所有文件
  const writeStream = fs.createWriteStream(outputPath);

  console.log(`合并 ${decFiles.length} 个解密文件为 ${outputFile}...`);

  for (const file of decFiles) {
    const filePath = path.join(folderPath, file);
    const data = fs.readFileSync(filePath);
    writeStream.write(data);
  }

  writeStream.end(() => {
    console.log(`合并完成：${outputPath}`);

    // 删除所有 *_dec.ts 文件
    for (const file of decFiles) {
      fs.unlinkSync(path.join(folderPath, file));
    }

    console.log('临时解密文件已删除。任务完成。');
  });

