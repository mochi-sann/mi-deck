import { type MfmNode } from "mfm-js";
import { Fragment, type ReactNode } from "react";
import { type MfmBasicProps } from ".";
import Code from "./components/Code";
import CustomEmoji from "./components/CustomEmoji";
import Emoji from "./components/Emoji";
import Fn from "./components/Fn";
import Formula from "./components/Formula";
import Hashtag from "./components/Hashtag";
import Link from "./components/Link";
import Mention from "./components/Mention";
import Search from "./components/Search";
import { id, intersperse } from "./utils";
import { nyaize } from "misskey-js";

const Node = ({ nodes, ...props }: MfmBasicProps & { nodes?: MfmNode[] }) =>
  nodes?.map((node, i) => <SingleNode node={node} {...props} key={i} />);

export default Node;

function SingleNode({ node, ...props }: MfmBasicProps & { node: MfmNode }) {
  switch (node.type) {
    case "quote":
      return node.props?.nowrap ? (
        <span className="mfm-quote">
          <Node nodes={node.children} nyaize={props.nyaize} />
        </span>
      ) : (
        <div className="mfm-quote">
          <Node nodes={node.children} nyaize={props.nyaize} />
        </div>
      );

    case "search":
      return <Search {...node.props} />;

    case "blockCode":
      return (
        <Code code={node.props.code} lang={node.props.lang ?? undefined} />
      );

    case "mathBlock":
      return <Formula formula={node.props.formula} block />;

    case "center":
      return (
        <div className="mfm-center">
          <Node nodes={node.children} {...props} />
        </div>
      );

    case "unicodeEmoji":
      return <Emoji {...node.props} />;

    case "emojiCode":
      return (
        <CustomEmoji {...node.props} host={props.host} emojis={props.emojis} />
      );

    case "bold":
      return (
        <b>
          <Node nodes={node.children} {...props} />
        </b>
      );

    case "small":
      return (
        <small className="mfm-small">
          <Node nodes={node.children} {...props} />
        </small>
      );

    case "italic":
      return (
        <i className="mfm-italic">
          <Node nodes={node.children} {...props} />
        </i>
      );

    case "strike":
      return (
        <del>
          <Node nodes={node.children} {...props} />
        </del>
      );

    case "inlineCode":
      return <code className="mfm-inlineCode">{node.props.code}</code>;

    case "mathInline":
      return <Formula formula={node.props.formula} />;

    case "mention":
      return <Mention {...node.props} />;

    case "hashtag":
      return <Hashtag {...node.props} />;

    case "url": {
      const scheme = node.props.url.split(":")[0] + ":";
      const body = node.props.url.slice(scheme.length);

      if (!body.startsWith("//"))
        return (
          <Link href={node.props.url} rel="nofollow noopener">
            {node.props.url}
          </Link>
        );

      let prefix = scheme + "//";
      let auth = body.slice(2).split("/")[0];
      if (auth.includes("@")) {
        const userinfo = auth.split("@")[0] + "@";
        prefix += userinfo;
        auth = auth.slice(userinfo.length);
      }
      const host = auth.split(":")[0];

      return (
        <Link href={node.props.url} rel="nofollow noopener">
          {prefix}
          <span className="mfm-urlHost">{host}</span>
          {node.props.url.slice(prefix.length + host.length)}
        </Link>
      );
    }

    case "link":
      return (
        <Link href={node.props.url} rel="nofollow noopener">
          <Node nodes={node.children} {...props} nyaize={props.nyaize} />
        </Link>
      );

    case "fn":
      return (
        <Fn {...node.props} nodeChildren={node.children}>
          <Node nodes={node.children} {...props} />
        </Fn>
      );

    case "plain":
      return (
        <span>
          <Node nodes={node.children} {...props} nyaize={props.nyaize} />
        </span>
      );

    case "text": {
      const orig = node.props.text.replace(/\r\n?/g, "\n");
      const text = props.nyaize ? nyaize(orig) : orig;

      if (props.plain) return text.replace(/\n/g, " ");
      return intersperse<ReactNode>(text.split("\n"), <br />)
        .filter(id)

        .map((e, i) => <Fragment key={i}>{e}</Fragment>);
    }
  }
}
