import Mfm from "@mi-deck/react-mfm";
import "@mi-deck/react-mfm/style.css";
import "katex/dist/katex.min.css"; // to support Formula
import { Fragment } from "react";

interface MfmTextProps {
  text: string;
  host?: string;
  emojis?: { [key: string]: string } | undefined;
}

export function MfmText({ text, host, emojis }: MfmTextProps) {
  return (
    <Fragment>
      <span>
        <Mfm text={text} host={host} emojis={emojis} />
      </span>
    </Fragment>
  );
}
