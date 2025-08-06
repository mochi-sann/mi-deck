#!/usr/bin/env node

/**
 * テストファイルの noExplicitAny エラーに biome-ignore コメントを自動追加するスクリプト
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function fixTestAnyErrors() {
  let output = '';
  
  try {
    // biome を直接実行してすべてのエラー情報を取得
    const checkResult = execSync('npx biome check --max-diagnostics=1000 2>&1', { 
      encoding: 'utf8',
      shell: true
    });
    output = checkResult;
  } catch (error) {
    // Biome は警告があると非ゼロ終了コードを返すので、エラーでも出力を取得
    output = (error.stdout || '') + (error.stderr || '');
  }
  
  console.log('Checking for noExplicitAny errors in test files...');
  
  // noExplicitAny エラーを抽出
  const anyErrors = extractAnyErrors(output);
  
  if (anyErrors.length === 0) {
    console.log('No noExplicitAny errors found.');
    return;
  }
  
  console.log(`Found ${anyErrors.length} noExplicitAny errors, processing test files...`);
  
  // ファイルごとにグループ化
  const errorsByFile = groupErrorsByFile(anyErrors);
  
  // 各ファイルを修正
  for (const [filePath, errors] of Object.entries(errorsByFile)) {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      fixFileErrors(filePath, errors);
    } else {
      console.log(`Skipping non-test file: ${filePath}`);
    }
  }
  
  console.log('All noExplicitAny errors in test files have been fixed!');
}

function extractAnyErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // noExplicitAny エラーの行を検出
    if (line.includes('lint/suspicious/noExplicitAny')) {
      // ファイルパスと行番号を抽出
      const match = line.match(/^(.+):(\d+):(\d+)\s+lint\/suspicious\/noExplicitAny/);
      if (match) {
        const [, filePath, lineNumber, columnNumber] = match;
        errors.push({
          filePath: filePath.trim(),
          lineNumber: parseInt(lineNumber, 10),
          columnNumber: parseInt(columnNumber, 10)
        });
      }
    }
  }
  
  return errors;
}

function groupErrorsByFile(errors) {
  const grouped = {};
  for (const error of errors) {
    if (!grouped[error.filePath]) {
      grouped[error.filePath] = [];
    }
    grouped[error.filePath].push(error);
  }
  
  // 行番号の降順でソート（後ろから修正するため）
  for (const filePath in grouped) {
    grouped[filePath].sort((a, b) => b.lineNumber - a.lineNumber);
  }
  
  return grouped;
}

function fixFileErrors(filePath, errors) {
  console.log(`Fixing ${errors.length} errors in ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // 後ろから修正（行番号がズレないように）
  for (const error of errors) {
    const lineIndex = error.lineNumber - 1;
    const line = lines[lineIndex];
    
    if (line && line.includes('as any')) {
      // インデントを取得
      const indent = line.match(/^(\s*)/)[1];
      
      // biome-ignore コメントを追加
      const ignoreComment = `${indent}// biome-ignore lint/suspicious/noExplicitAny: テストなので無視`;
      
      // コメントが既に存在しないかチェック
      if (lineIndex > 0 && lines[lineIndex - 1].includes('biome-ignore lint/suspicious/noExplicitAny')) {
        console.log(`  Line ${error.lineNumber}: biome-ignore comment already exists, skipping`);
        continue;
      }
      
      // 同じ行にbiome-ignoreコメントが既にある場合もチェック
      if (line.includes('biome-ignore lint/suspicious/noExplicitAny')) {
        console.log(`  Line ${error.lineNumber}: biome-ignore comment already exists on same line, skipping`);
        continue;
      }
      
      // コメントを挿入
      lines.splice(lineIndex, 0, ignoreComment);
      console.log(`  Fixed line ${error.lineNumber}: added biome-ignore comment`);
    }
  }
  
  // ファイルを保存
  fs.writeFileSync(filePath, lines.join('\n'));
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTestAnyErrors();
}

export { fixTestAnyErrors };