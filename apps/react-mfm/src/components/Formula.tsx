"use client";

import { atom, useAtomValue } from "jotai";
import { Suspense, useMemo } from "react";

type FormulaProps = {
  formula: string;
  block?: boolean;
};

const katexAtom = atom(async () => (await import("katex")).default);

function FormulaSuspense({ formula, block }: FormulaProps) {
  const { renderToString } = useAtomValue(katexAtom);
  const html = useMemo(
    () =>
      renderToString(formula, {
        displayMode: block,
        throwOnError: false,
      }),
    [renderToString, formula, block],
  );

  return block ? (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: mfmの表示に必要
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: mfmの表示に必要
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const Formula = (props: FormulaProps) => (
  <Suspense
    fallback={
      props.block ? <div>{props.formula}</div> : <span>{props.formula}</span>
    }
  >
    <FormulaSuspense {...props} />
  </Suspense>
);

export default Formula;
