"use client";

import { atom, useAtom, useAtomValue } from "jotai";
import { Suspense, useEffect, useMemo } from "react";
import {
  type BundledLanguage,
  bundledLanguages,
  createHighlighter,
} from "shiki/bundle/web";

type CodeProps = {
  code: string;
  lang?: string;
};

const theme = "monokai";
const defaultLang = "js";
const langs = [defaultLang];
const bundledLangs = Object.keys(bundledLanguages);

const highlighterAtom = atom(() =>
  createHighlighter({
    langs,
    themes: [theme],
  }),
);
const langsAtom = atom(langs);

function CodeSuspense({ code, lang = defaultLang }: CodeProps) {
  const highlighter = useAtomValue(highlighterAtom);
  const [langs, setLangs] = useAtom(langsAtom);

  useEffect(() => {
    let isMounted = true;
    if (
      !langs.includes(lang) &&
      bundledLangs.includes(lang as BundledLanguage)
    ) {
      highlighter.loadLanguage(lang as BundledLanguage).then(() => {
        if (isMounted) setLangs(highlighter.getLoadedLanguages());
      });
    }
    return () => {
      isMounted = false;
    };
  }, [highlighter, langs, lang, setLangs]);

  const html = useMemo(() => {
    return highlighter.codeToHtml(code, {
      lang: langs.includes(lang) ? lang : defaultLang,
      theme,
    });
  }, [highlighter, langs, code, lang]);

  return (
    <div className="mfm-blockCode" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const Code = (props: CodeProps) => (
  <Suspense
    fallback={
      <div className="mfm-blockCode">
        <pre>
          <code>{props.code}</code>
        </pre>
      </div>
    }
  >
    <CodeSuspense {...props} />
  </Suspense>
);

export default Code;
