export function trimFirstAndLastChar(str: string) {
  // 入力された文字列の長さが2以上の場合のみ処理
  if (str.length > 1) {
    // 最初と最後の文字を削る
    return str.substring(1, str.length - 1);
  } else {
    // 文字列が1文字以下の場合はそのまま返す
    return str;
  }
}
