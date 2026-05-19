import { formatAIContent } from "../utils/parseAI";

function MarkdownBody({ content }) {
  const blocks = formatAIContent(content);

  if (!blocks.length) {
    return <p className="ai-empty">No content available.</p>;
  }

  return (
    <div className="markdown-body">
      {blocks.map((block, i) => {
        if (block.type === "list") {
          return (
            <li key={i} className="ai-list-item">
              <span className="ai-bullet" />
              {block.text}
            </li>
          );
        }
        if (block.type === "bold") {
          return (
            <strong key={i} className="ai-bold-line">
              {block.text}
            </strong>
          );
        }
        return (
          <p key={i} className="ai-paragraph">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default MarkdownBody;
