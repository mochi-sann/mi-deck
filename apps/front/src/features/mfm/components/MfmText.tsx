import Mfm, { MfmBasicProps } from "@mi-deck/react-mfm";
import "@mi-deck/react-mfm/style.css";
import "katex/dist/katex.min.css"; // to support Formula
import { Fragment } from "react";
import { getWordBreakClasses } from "@/lib/utils/text";

interface MfmTextProps {
  text: string;
  host?: string;
  emojis?: { [key: string]: string } | undefined;
  isCat?: MfmBasicProps["nyaize"];
}

export function MfmText({ text, host, emojis, ...props }: MfmTextProps) {
  return (
    <Fragment>
      <span className={getWordBreakClasses(text)}>
        <Mfm text={text} host={host} emojis={emojis} nyaize={props.isCat} />
      </span>
    </Fragment>
  );
}
