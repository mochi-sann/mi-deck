import React, { useState, useEffect, useMemo } from "react";
// パスはご自身のプロジェクト構成に合わせて調整してください
// import styles from "./MkTime.module.css"; // CSS Modulesとしてインポート

// Placeholder for i18n and dateTimeFormat - these should ideally be imported or globally provided
const i18n = {
  ts: {
    _ago: {
      invalid: "不正な日時",
      justNow: "たった今",
    },
  },
  tsx: {
    _ago: {
      yearsAgo: ({ n }: { n: string }) => `${n}年前`,
      monthsAgo: ({ n }: { n: string }) => `${n}か月前`,
      weeksAgo: ({ n }: { n: string }) => `${n}週間前`,
      daysAgo: ({ n }: { n: string }) => `${n}日前`,
      hoursAgo: ({ n }: { n: string }) => `${n}時間前`,
      minutesAgo: ({ n }: { n: string }) => `${n}分前`,
      secondsAgo: ({ n }: { n: string }) => `${n}秒前`,
    },
    _timeIn: {
      years: ({ n }: { n: string }) => `${n}年後`,
      months: ({ n }: { n: string }) => `${n}か月後`,
      weeks: ({ n }: { n: string }) => `${n}週間後`,
      days: ({ n }: { n: string }) => `${n}日後`,
      hours: ({ n }: { n: string }) => `${n}時間後`,
      minutes: ({ n }: { n: string }) => `${n}分後`,
      seconds: ({ n }: { n: string }) => `${n}秒後`,
    },
  },
};

const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "short",
});

const formatAbsolute = (timestamp: number) => {
  const date = new Date(timestamp);
  console.log(
    ...[{ timestamp, date }, "👀 [Time.tsx:47]: {timestamp , date}"].reverse(),
  );
  const pad = (v: number) => v.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

interface Props {
  time: Date | string | number | null;
  origin?: Date | null;
  mode?: "relative" | "absolute" | "detail";
  colored?: boolean;
}

const MfmTime: React.FC<Props> = ({
  time,
  origin = null,
  mode = "relative",
  colored = false,
}) => {
  console.log(...[time, "👀 [Time.tsx:71]: time"].reverse());
  // 日付を安全に取得するヘルパー
  const getDateSafe = (
    n: Date | string | number,
  ): Date | { getTime: () => number } => {
    try {
      if (n instanceof Date) {
        return n;
      }
      return new Date(n);
    } catch (err) {
      return {
        getTime: () => NaN,
      };
    }
  };

  // タイムスタンプの計算
  const _time = useMemo(
    () => (time == null ? NaN : getDateSafe(time).getTime()),
    [time],
  );

  const invalid = Number.isNaN(_time);

  // 絶対時間のフォーマット
  const absolute = useMemo(
    () => (!invalid ? formatAbsolute(_time) : i18n.ts._ago.invalid),
    [_time, invalid],
  );

  // 現在時刻の状態管理
  const [now, setNow] = useState<number>(origin?.getTime() ?? Date.now());

  // 経過時間（秒）の計算
  const ago = (now - _time) / 1000;

  // 定期的な更新ロジック (Tick)
  useEffect(() => {
    // 無効な日付、origin指定あり、または絶対時間モードの場合は更新不要
    if (invalid || origin !== null || mode === "absolute") return;

    let timeoutId: number;

    const tick = () => {
      const currentNow = Date.now();
      setNow(currentNow);

      // 次の更新間隔を動的に決定 (Vue版のロジックを踏襲)
      // agoを再計算（ステートのagoはレンダリング時のものなので、ここでは現在時刻から計算）
      const currentAgo = (currentNow - _time) / 1000;
      const nextInterval =
        currentAgo < 60 ? 10000 : currentAgo < 3600 ? 60000 : 180000;

      timeoutId = window.setTimeout(tick, nextInterval);
    };

    // 初回実行
    tick();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [_time, invalid, origin, mode]);

  // 相対時間の文字列生成
  const relative = useMemo(() => {
    if (mode === "absolute") return "";
    if (invalid) return i18n.ts._ago.invalid;

    if (ago >= 31536000)
      return i18n.tsx._ago.yearsAgo({
        n: Math.round(ago / 31536000).toString(),
      });
    if (ago >= 2592000)
      return i18n.tsx._ago.monthsAgo({
        n: Math.round(ago / 2592000).toString(),
      });
    if (ago >= 604800)
      return i18n.tsx._ago.weeksAgo({ n: Math.round(ago / 604800).toString() });
    if (ago >= 86400)
      return i18n.tsx._ago.daysAgo({ n: Math.round(ago / 86400).toString() });
    if (ago >= 3600)
      return i18n.tsx._ago.hoursAgo({ n: Math.round(ago / 3600).toString() });
    if (ago >= 60)
      return i18n.tsx._ago.minutesAgo({ n: (~~(ago / 60)).toString() });
    if (ago >= 10)
      return i18n.tsx._ago.secondsAgo({ n: (~~(ago % 60)).toString() });

    if (ago >= -3) return i18n.ts._ago.justNow;

    if (ago < -31536000)
      return i18n.tsx._timeIn.years({
        n: Math.round(-ago / 31536000).toString(),
      });
    if (ago < -2592000)
      return i18n.tsx._timeIn.months({
        n: Math.round(-ago / 2592000).toString(),
      });
    if (ago < -604800)
      return i18n.tsx._timeIn.weeks({
        n: Math.round(-ago / 604800).toString(),
      });
    if (ago < -86400)
      return i18n.tsx._timeIn.days({ n: Math.round(-ago / 86400).toString() });
    if (ago < -3600)
      return i18n.tsx._timeIn.hours({ n: Math.round(-ago / 3600).toString() });
    if (ago < -60)
      return i18n.tsx._timeIn.minutes({ n: (~~(-ago / 60)).toString() });

    return i18n.tsx._timeIn.seconds({ n: (~~(-ago % 60)).toString() });
  }, [ago, invalid, mode]);

  // クラス名の制御
  const className = useMemo(() => {
    const classes = [];
    if (colored) {
      if (ago > 60 * 60 * 24 * 180) {
        // classes.push(styles.old2); // old1かつold2の状態
        // classes.push(styles.old1); // CSS Modulesの構成によるが、念のため両方
      } else if (ago > 60 * 60 * 24 * 90) {
        // classes.push(styles.old1);
      }
    }
    return classes.join(" ");
  }, [ago, colored]);

  // レンダリング
  return (
    <time
      title={!invalid ? dateTimeFormat.format(_time) : absolute}
      className={className}
    >
      {invalid ? (
        i18n.ts._ago.invalid
      ) : mode === "relative" ? (
        relative
      ) : mode === "absolute" ? (
        absolute
      ) : mode === "detail" ? (
        <>
          {absolute} ({relative})
        </>
      ) : null}
    </time>
  );
};

export default MfmTime;
