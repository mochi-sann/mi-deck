import Mfm from "@mi-deck/react-mfm";
import "@mi-deck/react-mfm/style.css";
import "katex/dist/katex.min.css"; // to support Formula
import { Fragment } from "react";

interface MfmTextProps {
  text: string;
}

export function MfmText({ text }: MfmTextProps) {
  return (
    <Fragment>
      <Mfm text={text} />
    </Fragment>
  );
}
