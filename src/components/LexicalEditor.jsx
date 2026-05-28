import { useEffect, useCallback, useState } from 'react';
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
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Undo, Redo,
  Image, Youtube, Twitter, Facebook, Instagram, X, Plus, GripVertical, Trash2
} from 'lucide-react';

const theme = {
  paragraph: 'mb-2 text-slate-200',
  heading: {
    h1: 'text-3xl font-bold mb-3 text-white',
    h2: 'text-2xl font-bold mb-2 text-white',
  },
  list: {
    ol: 'list-decimal ml-4 mb-2 text-slate-200',
    ul: 'list-disc ml-4 mb-2 text-slate-200',
  },
  link: 'text-orange-400 underline',
  text: { bold: 'font-bold', italic: 'italic', underline: 'underline' }
};

function onError(error) { console.error(error); }

// ── Toolbar ──
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

  const btn = "p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all";
  const sep = <div className="w-px h-6 bg-slate-700 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-700 bg-slate-900/50">
      <button type="button" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className={btn} title="Undo"><Undo size={18} /></button>
      <button type="button" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className={btn} title="Redo"><Redo size={18} /></button>
      {sep}
      <button type="button" onClick={() => formatHeading('h1')} className={btn} title="Heading 1"><Heading1 size={18} /></button>
      <button type="button" onClick={() => formatHeading('h2')} className={btn} title="Heading 2"><Heading2 size={18} /></button>
      {sep}
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={btn} title="Bold"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={btn} title="Italic"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={btn} title="Underline"><Underline size={18} /></button>
      {sep}
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={btn} title="Bullet List"><List size={18} /></button>
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={btn} title="Numbered List"><ListOrdered size={18} /></button>
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

// ── Single Text Block (Lexical instance) ──
function TextBlock({ block, index, onTextChange, onDelete, placeholder }) {
  const initialConfig = {
    namespace: `StoryEditor_${index}_${block.id}`,
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode],
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      // Save as HTML-like string preserving newlines
      const text = root.getTextContent();
      onTextChange(index, text);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[120px] p-4 outline-none text-slate-200" />}
          placeholder={<div className="absolute top-[60px] left-4 text-slate-500 pointer-events-none">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <InitialContentPlugin initialContent={block.content} />
        <OnChangePlugin onChange={handleChange} />
      </div>
      {/* Delete text block button */}
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all z-10"
        title="Remove block"
      >
        <Trash2 size={14} />
      </button>
    </LexicalComposer>
  );
}

// ── Embed Block Preview ──
function EmbedBlock({ block, index, onDelete }) {
  const getEmbedPreview = () => {
    switch (block.type) {
      case 'youtube': {
        const ytId = block.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return ytId ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen title="YouTube" />
          </div>
        ) : <p className="text-red-400 text-sm">Invalid YouTube URL</p>;
      }
      case 'tweet':
        return (
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
            <Twitter size={20} className="text-sky-400 flex-shrink-0" />
            <p className="text-slate-300 text-sm truncate">{block.url}</p>
          </div>
        );
      case 'instagram':
        return (
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
            <Instagram size={20} className="text-pink-400 flex-shrink-0" />
            <p className="text-slate-300 text-sm truncate">{block.url}</p>
          </div>
        );
      case 'facebook':
        return (
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
            <Facebook size={20} className="text-blue-400 flex-shrink-0" />
            <p className="text-slate-300 text-sm truncate">{block.url}</p>
          </div>
        );
      case 'image':
        return block.url ? (
          <img src={block.url} alt="Embedded" className="max-h-48 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://placehold.co/400x200/1e293b/475569?text=Invalid+URL'; }} />
        ) : <p className="text-red-400 text-sm">No image URL</p>;
      default:
        return null;
    }
  };

  const typeLabels = { youtube: 'YouTube', tweet: 'Twitter / X', instagram: 'Instagram', facebook: 'Facebook', image: 'Image URL' };
  const typeColors = { youtube: 'text-red-400', tweet: 'text-sky-400', instagram: 'text-pink-400', facebook: 'text-blue-400', image: 'text-green-400' };

  return (
    <div className="relative bg-slate-900/80 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${typeColors[block.type]}`}>
          {typeLabels[block.type]}
        </span>
        <button type="button" onClick={() => onDelete(index)}
          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
          <Trash2 size={14} />
        </button>
      </div>
      {getEmbedPreview()}
    </div>
  );
}

// ── Add Media Panel ──
function AddMediaPanel({ onAdd, onClose }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [url, setUrl] = useState('');

  const tabs = [
    { id: 'youtube',   label: 'YouTube',    icon: <Youtube size={16} />,   placeholder: 'https://youtube.com/watch?v=...' },
    { id: 'tweet',     label: 'Twitter/X',  icon: <Twitter size={16} />,   placeholder: 'https://x.com/user/status/...' },
    { id: 'instagram', label: 'Instagram',  icon: <Instagram size={16} />, placeholder: 'https://instagram.com/p/...' },
    { id: 'facebook',  label: 'Facebook',   icon: <Facebook size={16} />,  placeholder: 'https://facebook.com/...' },
    { id: 'image',     label: 'Image URL',  icon: <Image size={16} />,     placeholder: 'https://example.com/image.jpg' },
  ];

  const handleAdd = () => {
    if (!url.trim()) return;
    onAdd({ type: activeTab, url: url.trim(), id: Date.now().toString() });
    setUrl('');
    onClose();
  };

  const active = tabs.find(t => t.id === activeTab);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">Add Media Block</p>
        <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-white rounded transition-colors"><X size={16} /></button>
      </div>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 border border-transparent hover:border-slate-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={active?.placeholder}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 placeholder-slate-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!url.trim()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main LexicalEditor Export ──
export default function LexicalEditor({ value, onChange, placeholder = "Enter story description..." }) {
  // Parse existing value — could be JSON blocks array or plain string
  const parseInitialBlocks = () => {
    if (!value) return [{ type: 'text', content: '', id: 'initial' }];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // Plain text — wrap in text block
    return [{ type: 'text', content: value, id: 'initial' }];
  };

  const [blocks, setBlocks] = useState(parseInitialBlocks);
  const [showMediaPanel, setShowMediaPanel] = useState(false);

  // Emit JSON string upward whenever blocks change
  useEffect(() => {
    onChange(JSON.stringify(blocks));
  }, [blocks]);

  const handleTextChange = (index, text) => {
    setBlocks(prev => prev.map((b, i) => i === index ? { ...b, content: text } : b));
  };

  const handleDeleteBlock = (index) => {
    setBlocks(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Always keep at least one text block
      return next.length === 0 ? [{ type: 'text', content: '', id: Date.now().toString() }] : next;
    });
  };

  const handleAddMedia = (embedBlock) => {
    // Add a new text block after the embed for continued writing
    setBlocks(prev => [
      ...prev,
      embedBlock,
      { type: 'text', content: '', id: Date.now().toString() + '_text' }
    ]);
  };

  const handleAddTextBlock = () => {
    setBlocks(prev => [...prev, { type: 'text', content: '', id: Date.now().toString() }]);
  };

  return (
    <div className="space-y-3">
      {/* Render blocks */}
      {blocks.map((block, index) => (
        <div key={block.id || index} className="relative group">
          {block.type === 'text' ? (
            <div className="relative">
              <TextBlock
                block={block}
                index={index}
                onTextChange={handleTextChange}
                onDelete={handleDeleteBlock}
                placeholder={index === 0 ? placeholder : 'Continue writing...'}
              />
            </div>
          ) : (
            <EmbedBlock block={block} index={index} onDelete={handleDeleteBlock} />
          )}
        </div>
      ))}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={handleAddTextBlock}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Text Block
        </button>
        <button
          type="button"
          onClick={() => setShowMediaPanel(!showMediaPanel)}
          className={`flex items-center gap-2 px-3 py-2 border text-sm font-medium rounded-lg transition-colors ${
            showMediaPanel
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          <Image size={15} /> Add Media
        </button>
      </div>

      {/* Media panel */}
      {showMediaPanel && (
        <AddMediaPanel onAdd={handleAddMedia} onClose={() => setShowMediaPanel(false)} />
      )}
    </div>
  );
}