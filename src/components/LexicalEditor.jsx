import { useEffect, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
} from 'lucide-react';

const theme = {
  paragraph: 'mb-2 text-slate-200',
  heading: {
    h1: 'text-3xl font-bold mb-3 text-white',
    h2: 'text-2xl font-bold mb-2 text-white',
    h3: 'text-xl font-bold mb-2 text-white',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-4 mb-2 text-slate-200',
    ul: 'list-disc ml-4 mb-2 text-slate-200',
  },
  link: 'text-orange-400 underline',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  }
};

function onError(error) {
  console.error(error);
}


function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = useCallback((headingSize) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-700 bg-slate-900/50">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Redo"
      >
        <Redo size={18} />
      </button>
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <button
        type="button"
        onClick={() => formatHeading('h1')}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => formatHeading('h2')}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Underline"
      >
        <Underline size={18} />
      </button>
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
}


function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent && typeof initialContent === 'string') {
      editor.update(() => {
        const root = $getRoot();
        
        if (root.getTextContent().trim() === '') {
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(initialContent));
          root.append(paragraph);
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

export default function LexicalEditor({ value, onChange, placeholder = "Enter story description..." }) {
  const initialConfig = {
    namespace: 'StoryEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      
      const root = $getRoot();
      const textContent = root.getTextContent();
      onChange(textContent);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[200px] p-4 outline-none text-slate-200" />
          }
          placeholder={
            <div className="absolute top-[60px] left-4 text-slate-500 pointer-events-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <InitialContentPlugin initialContent={value} />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
