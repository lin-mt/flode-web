import { Lexical } from "@/components";

function LexicalViewer({
  value,
  emptyDescription,
}: {
  value?: string;
  emptyDescription?: string;
}) {
  return (
    <Lexical
      value={value}
      editable={false}
      emptyDescription={emptyDescription}
    />
  );
}

export default LexicalViewer;
