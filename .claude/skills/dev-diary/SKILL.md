---
name: dev-diary
description: Use when a work session is ending, or when asked to write the development diary (開発日誌) entry for this session.
disable-model-invocation: true
---

# 開発日誌の作成

AGENTS.md の必須ルール: 作業セッション終了時に `memo/dev_diary/yyyy-mm-dd_hhmm.md` へ開発日誌を追記する。

## 手順

1. `date +%Y-%m-%d_%H%M` で現在日時を取得し、ファイル名にする(例: `memo/dev_diary/2026-06-13_1430.md`)
2. このセッションの会話と git の変更内容(`git status` / `git diff --stat` / `git log --oneline -5`)を振り返る
3. 下記テンプレートに沿って日本語・箇条書きで書く
4. 5 セクションすべて埋める(感想・気分・愚痴も省略しない)

## テンプレート

```markdown
- 日付: YYYY-MM-DD HH:MM
- 実施内容:
  - (このセッションでやったことを具体的に。対象ファイル・コマンドはバッククォートで)
- 問題と解決策:
  - 問題: (ハマったこと)
  - 解決: (どう解決したか。未解決なら「未解決」と明記)
- 次回予定:
  - (積み残し・次にやるべきこと)
- 感想・気分・愚痴:
  - (率直に)
```

## 注意

- コミットログと日誌の整合性を保つ(日誌に書いた変更がコミットされているか確認する)
- 同じセッションで複数回書く場合は新しいファイルを作る(追記ではなくファイル単位)
