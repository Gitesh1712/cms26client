import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

const theme = {
  paragraph: 'mb-2',
  heading: {
    h1: 'text-3xl font-bold mb-3',
    h2: 'text-2xl font-bold mb-2',
    h3: 'text-xl font-bold mb-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-4 mb-2',
    ul: 'list-disc ml-4 mb-2',
  },
  link: 'text-blue-600 underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  }
};

function onError(error) {
  console.error(error);
}

export default function LexicalEditor({ value, onChange }) {
  const initialConfig = {
    namespace: 'StoryEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
    editorState: value || undefined,
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const json = editorState.toJSON();
      onChange(JSON.stringify(json));
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative bg-white rounded-xl border border-slate-300 overflow-hidden">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[250px] p-4 outline-none prose max-w-none" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
              Enter story description...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
