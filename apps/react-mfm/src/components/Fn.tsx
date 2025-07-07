"use client";

import { useAtomValue } from "jotai";
import { type MfmFn } from "mfm-js";
import { type CSSProperties, type ReactNode } from "react";
import { mfmConfigAtom } from "..";
import Sparkle from "./Sparkle";

type Arg = string | true;

// https://developer.mozilla.org/ja/docs/Web/CSS/time
function timstr(s: Arg) {
  if (typeof s === "string") {
    const match = /.+(?=ms$)|.+(?=s$)/.exec(s)?.[0];
    if (!Number.isNaN(Number(match))) return s;
  }
  return null;
}

function numstr(s: Arg) {
  if (typeof s === "string" && s) {
    const n = Number(s);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function ccodestr(s: Arg) {
  if (typeof s === "string") {
    const match = /^([\da-f]{3}|[\da-f]{6})$/i.test(s);
    if (match) return "#" + s;
  }
  return null;
}

export default function Fn({
  name,
  args,
  children,
  nodeChildren,
}: MfmFn["props"] & { children: ReactNode; nodeChildren?: any[] }) {
  const config = useAtomValue(mfmConfigAtom);

  const advanced = config.advanced ?? true;
  const animation = config.animation ?? true;
  const anim = advanced && animation;

  switch (name) {
    case "sparkle":
      return anim ? <Sparkle>{children}</Sparkle> : <span>{children}</span>;

    case "ruby": {
      // MFMのrubyは $[ruby base rt] の形式（スペース区切り）
      // mfm-jsでは単一のtextノードとしてパースされる

      // nodeChildrenから直接テキストを取得
      if (
        nodeChildren &&
        nodeChildren.length === 1 &&
        nodeChildren[0].type === "text"
      ) {
        const text = nodeChildren[0].props.text.trim();
        const spaceIndex = text.indexOf(" ");

        if (spaceIndex !== -1) {
          const base = text.substring(0, spaceIndex);
          const rt = text.substring(spaceIndex + 1);

          return (
            <ruby>
              {base}
              <rt>{rt}</rt>
            </ruby>
          );
        }
      }

      // 複数の子要素がある場合（HTMLタグなどが含まれる場合）
      if (Array.isArray(children) && children.length >= 2) {
        // 最後の要素がrt（読み仮名）、残りがbase（漢字など）
        const rt = children[children.length - 1];
        const base = children.slice(0, children.length - 1);

        return (
          <ruby>
            {base}
            <rt>{rt}</rt>
          </ruby>
        );
      }

      // 単一の子要素の場合、スペースで分割を試行（フォールバック）
      if (typeof children === "string") {
        const text = children.trim();
        const spaceIndex = text.indexOf(" ");

        if (spaceIndex !== -1) {
          const base = text.substring(0, spaceIndex);
          const rt = text.substring(spaceIndex + 1);

          return (
            <ruby>
              {base}
              <rt>{rt}</rt>
            </ruby>
          );
        }

        // スペースが見つからない場合、カンマで分割を試行
        const parts = text.split(",");
        if (parts.length === 2) {
          return (
            <ruby>
              {parts[0].trim()}
              <rt>{parts[1].trim()}</rt>
            </ruby>
          );
        }
      }

      // フォールバック: 引数からrtを取得
      const rt = args.rt || "";
      return (
        <ruby>
          {children}
          <rt>{rt}</rt>
        </ruby>
      );
    }

    case "unixtime": {
      const timestamp =
        numstr(args.timestamp) || Number(children?.toString() || "0");
      const date = new Date(timestamp * 1000);
      return <time dateTime={date.toISOString()}>{date.toLocaleString()}</time>;
    }

    case "clickable":
      return (
        <span>
          {"$[" + name + "(wip) "}
          {children}
          {"]"}
        </span>
      );

    default: {
      const res = composeStyle(name, args, advanced, anim);
      // falsy
      if (res == null)
        return (
          <span>
            {"$[" + name + " "}
            {children}
            {"]"}
          </span>
        );
      const [sty, cls] = res;
      const style = sty || undefined;
      return (
        <span className={cls} style={style}>
          {children}
        </span>
      );
    }
  }
}

function composeStyle(
  name: MfmFn["props"]["name"],
  args: MfmFn["props"]["args"],
  advanced: boolean,
  anim: boolean,
): [CSSProperties | undefined | false, string?] | null {
  const speed = timstr(args.speed);
  const delay = timstr(args.delay);

  switch (name) {
    case "tada":
      return [
        {
          fontSize: "150%",
          ...(anim && {
            display: "inline-block",
            animation: `mfm-tada ${speed ?? "1s"} linear infinite both`,
            animationDelay: delay ?? "0s",
          }),
        },
      ];

    case "jelly":
      return [
        anim && {
          display: "inline-block",
          animation: `mfm-jelly ${speed ?? "1s"} linear infinite both`,
          animationDelay: delay ?? "0s",
        },
      ];

    case "twitch":
      return [
        anim && {
          display: "inline-block",
          animation: `mfm-twitch ${speed ?? ".5s"} ease infinite`,
          animationDelay: delay ?? "0s",
        },
      ];

    case "shake":
      return [
        anim && {
          display: "inline-block",
          animation: `mfm-shake ${speed ?? ".5s"} ease infinite`,
          animationDelay: delay ?? "0s",
        },
      ];

    case "spin": {
      const aname = args.x ? "mfm-spin-x" : args.y ? "mfm-spin-y" : "mfm-spin";
      return [
        anim && {
          display: "inline-block",
          animation: `${aname} ${speed ?? "1.5s"} linear infinite`,
          animationDelay: delay ?? "0s",
          animationDirection: args.left
            ? "reverse"
            : args.alternate
              ? "alternate"
              : "normal",
        },
      ];
    }

    case "jump":
      return [
        anim && {
          display: "inline-block",
          animation: `mfm-jump ${speed ?? ".75s"} linear infinite`,
          animationDelay: delay ?? "0s",
        },
      ];

    case "bounce":
      return [
        anim && {
          display: "inline-block",
          animation: `mfm-bounce ${speed ?? ".75s"} linear infinite`,
          animationDelay: delay ?? "0s",
          transformOrigin: "center bottom",
        },
      ];

    case "flip":
      return [
        anim && {
          display: "inline-block",
          transform:
            args.h && args.v
              ? "scale(-1, -1)"
              : args.v
                ? "scaleY(-1)"
                : "scaleX(-1)",
        },
      ];

    case "x2":
      return [undefined, "mfm-x2"];

    case "x3":
      return [undefined, "mfm-x3"];

    case "x4":
      return [undefined, "mfm-x4"];

    case "font":
      for (const e of [
        "serif",
        "monospace",
        "cursive",
        "fantasy",
        "emoji",
        "math",
      ])
        if (args[e]) return [{ fontFamily: e }];
      return null;

    case "blur":
      return [undefined, "mfm-blur"];

    case "rainbow":
      return anim
        ? [
            {
              animation: `mfm-rainbow ${speed ?? "1s"} linear infinite`,
              animationDelay: delay ?? "0s",
            },
          ]
        : [undefined, "mfm-rainbowStatic"];

    case "rotate":
      return [
        {
          transform: `rotate(${numstr(args.deg) ?? 90}deg)`,
          transformOrigin: "center",
        },
      ];

    case "position":
      return [
        advanced && {
          transform: `translateX(${numstr(args.x) ?? 0}em) translateY(${numstr(args.y) ?? 0}em)`,
        },
      ];

    case "scale": {
      const x = Math.min(numstr(args.x) ?? 1, 5);
      const y = Math.min(numstr(args.y) ?? 1, 5);
      return [advanced && { transform: `scale(${x}, ${y})` }];
    }

    case "fg":
      return [
        {
          color: ccodestr(args.color) ?? "var(--mfm-fg)",
          overflowWrap: "anywhere",
        },
      ];

    case "bg":
      return [
        {
          backgroundColor: ccodestr(args.color) ?? "var(--mfm-bg)",
          overflowWrap: "anywhere",
        },
      ];

    case "border": {
      const line = typeof args.style === "string" ? args.style : "solid";
      return [
        {
          border: `${numstr(args.width) ?? 1}px ${line} ${ccodestr(args.color) ?? "var(--mfm-border)"}`,
          borderRadius: `${numstr(args.radius) ?? 0}px`,
          ...(!args.noclip && { overflow: "clip" }),
        },
      ];
    }

    default:
      return null;
  }
}
