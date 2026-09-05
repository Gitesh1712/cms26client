import { useEffect, useCallback, useState, useRef, memo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $findMatchingParent } from '@lexical/utils';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Undo, Redo,
  Image, Youtube, Twitter, Facebook, Instagram, X, Plus, Trash2,
  Link, Link2Off, Upload, Video,
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
  link: 'text-orange-400 underline cursor-pointer hover:text-orange-300 transition-colors',
  text: { bold: 'font-bold', italic: 'italic', underline: 'underline' },
};

const EDITOR_NODES = [HeadingNode, ListNode, ListItemNode, LinkNode];
function onError(error) { console.error(error); }

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${url}`;
};

const LinkInputPopup = memo(function LinkInputPopup({ initialUrl, onConfirm, onRemove, onClose }) {
  const [url, setUrl] = useState(initialUrl || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    onConfirm(finalUrl);
  }, [url, onConfirm]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  }, [handleConfirm, onClose]);

  return (
    <div className="absolute z-50 top-full mt-1 left-0 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-3 w-80 flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300 mb-1">Insert Hyperlink</p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 placeholder-slate-500"
        />
        <button type="button" onClick={handleConfirm} disabled={!url.trim()}
          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors">
          Apply
        </button>
      </div>
      <div className="flex items-center justify-between">
        {initialUrl ? (
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
            <Link2Off size={12} /> Remove link
          </button>
        ) : <span />}
        <button type="button" onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
});

const ToolbarPlugin = memo(function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [isLinkActive, setIsLinkActive] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) { setIsLinkActive(false); return; }
        const node = selection.anchor.getNode();
        const linkNode = $findMatchingParent(node, $isLinkNode);
        if (linkNode) {
          setIsLinkActive(true);
          setCurrentLinkUrl(linkNode.getURL());
        } else {
          setIsLinkActive(false);
          setCurrentLinkUrl('');
        }
      });
    });
  }, [editor]);

  const formatHeading = useCallback((size) => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createHeadingNode(size));
    });
  }, [editor]);

  const handleLinkConfirm = useCallback((url) => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target: '_blank', rel: 'noopener noreferrer' });
    setShowLinkPopup(false);
  }, [editor]);

  const handleLinkRemove = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setShowLinkPopup(false);
    setIsLinkActive(false);
    setCurrentLinkUrl('');
  }, [editor]);

  const btn = "p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all";
  const btnActive = "p-2 text-orange-400 bg-orange-500/15 rounded-lg";
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
      {sep}
      <div className="relative">
        <button type="button" onClick={() => setShowLinkPopup(p => !p)}
          className={isLinkActive ? btnActive : btn}
          title={isLinkActive ? 'Edit link' : 'Insert link'}>
          <Link size={18} />
        </button>
        {showLinkPopup && (
          <LinkInputPopup
            initialUrl={currentLinkUrl}
            onConfirm={handleLinkConfirm}
            onRemove={handleLinkRemove}
            onClose={() => setShowLinkPopup(false)}
          />
        )}
      </div>
    </div>
  );
});

function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!initialContent) return;

    try {
      const parsed = typeof initialContent === 'string'
        ? JSON.parse(initialContent)
        : initialContent;
      if (parsed?.root) {
        const editorState = editor.parseEditorState(
          typeof initialContent === 'string' ? initialContent : JSON.stringify(initialContent)
        );
        editor.setEditorState(editorState);
        return;
      }
    } catch (_) {}

    if (typeof initialContent === 'string') {
      editor.update(() => {
        const root = $getRoot();
        if (root.getTextContent().trim() === '') {
          root.clear();
          const p = $createParagraphNode();
          p.append($createTextNode(initialContent));
          root.append(p);
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

const TextBlock = memo(function TextBlock({ block, index, onTextChange, onDelete, placeholder }) {
  const initialConfigRef = useRef(null);
  if (!initialConfigRef.current) {
    initialConfigRef.current = {
      namespace: `StoryEditor_${block.id}`,
      theme,
      onError,
      nodes: EDITOR_NODES,
    };
  }

  const handleChange = useCallback((editorState) => {
    onTextChange(index, editorState.toJSON());
  }, [index, onTextChange]);

  const handleDelete = useCallback(() => onDelete(index), [index, onDelete]);

  return (
    <LexicalComposer initialConfig={initialConfigRef.current}>
      <div className="relative bg-slate-950/50 rounded-xl border border-slate-800 overflow-visible focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[120px] p-4 outline-none text-slate-200" />}
          placeholder={<div className="absolute top-[60px] left-4 text-slate-500 pointer-events-none">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin validateUrl={(url) => /^https?:\/\/.+/.test(url)} />
        <InitialContentPlugin initialContent={block.content} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
      </div>
      <button type="button" onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all z-10"
        title="Remove block">
        <Trash2 size={14} />
      </button>
    </LexicalComposer>
  );
});

const EmbedBlock = memo(function EmbedBlock({ block, index, onDelete, onReplace }) {
  const replaceInputRef = useRef(null);

  const handleReplaceClick = () => {
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImageBlock = block.type === 'uploadedPhoto';
    const isVideoBlock = block.type === 'uploadedVideo';

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (isImageBlock && !allowedImageTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    if (isVideoBlock && !allowedVideoTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, WebM, MOV, or AVI)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large! Maximum size is 50MB');
      return;
    }

    const newBlock = {
      ...block,
      file: file,
      url: URL.createObjectURL(file),
      fileName: file.name,
    };
    onReplace(index, newBlock);

    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

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
        return block.url
          ? <img src={block.url} alt="Embedded" className="max-h-48 rounded-lg object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/400x200/1e293b/475569?text=Invalid+URL'; }} />
          : <p className="text-red-400 text-sm">No image URL</p>;

      case 'uploadedPhoto':
      case 'uploadedVideo': {
        let displayUrl = block.url;
        if (!displayUrl && block.file) {
          displayUrl = URL.createObjectURL(block.file);
        }
        if (!displayUrl) {
          return (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-400 text-sm"> File: {block.fileName || 'Unknown'}</p>
              <p className="text-slate-400 text-xs mt-1">Preview will be available after saving</p>
            </div>
          );
        }
        const isVideo = block.type === 'uploadedVideo' || block.file?.type?.startsWith('video/');
        return (
          <div className="space-y-1">
            {isVideo ? (
              <video src={displayUrl} controls className="max-h-48 rounded-lg object-cover border border-slate-700 w-full" />
            ) : (
              <img src={displayUrl} alt="Uploaded" className="max-h-48 rounded-lg object-cover border border-slate-700"
                onError={(e) => { e.target.src = 'https://placehold.co/400x200/1e293b/475569?text=Preview+unavailable'; }} />
            )}
            {block.fileName && <p className="text-xs text-slate-500 truncate">{block.fileName}</p>}
          </div>
        );
      }
      default: return null;
    }
  };

  const typeLabels = {
    youtube: 'YouTube', tweet: 'Twitter / X', instagram: 'Instagram',
    facebook: 'Facebook', image: 'Image URL',
    uploadedPhoto: 'Local Image', uploadedVideo: 'Local Video',
  };
  const typeColors = {
    youtube: 'text-red-400', tweet: 'text-sky-400', instagram: 'text-pink-400',
    facebook: 'text-blue-400', image: 'text-green-400',
    uploadedPhoto: 'text-orange-400', uploadedVideo: 'text-purple-400',
  };

  const isUploadType = block.type === 'uploadedPhoto' || block.type === 'uploadedVideo';

  return (
    <div className="relative bg-slate-900/80 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${typeColors[block.type] || 'text-slate-400'}`}>
          {typeLabels[block.type] || block.type}
        </span>
        <div className="flex items-center gap-1">
          {isUploadType && onReplace && (
            <>
              <button type="button" onClick={handleReplaceClick}
                className="p-1.5 text-slate-600 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                title="Replace with new file">
                <Upload size={14} />
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept={block.type === 'uploadedVideo'
                  ? 'video/mp4,video/webm,video/quicktime,video/x-msvideo'
                  : 'image/jpeg,image/png,image/webp,image/gif'}
                onChange={handleReplaceFileChange}
                className="hidden"
              />
            </>
          )}
          <button type="button" onClick={() => onDelete(index)}
            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {getEmbedPreview()}
    </div>
  );
});

const AddMediaPanel = memo(function AddMediaPanel({ onAdd, onClose }) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [uploadMode, setUploadMode] = useState('image');
  const [url, setUrl] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'youtube',   label: 'YouTube',    icon: <Youtube size={16} />,   placeholder: 'https://youtube.com/watch?v=...' },
    { id: 'tweet',     label: 'Twitter/X',  icon: <Twitter size={16} />,   placeholder: 'https://x.com/user/status/...' },
    { id: 'instagram', label: 'Instagram',  icon: <Instagram size={16} />, placeholder: 'https://instagram.com/p/...' },
    { id: 'facebook',  label: 'Facebook',   icon: <Facebook size={16} />,  placeholder: 'https://facebook.com/...' },
    { id: 'image',     label: 'Image URL',  icon: <Image size={16} />,     placeholder: 'https://example.com/image.jpg' },
    { id: 'localFile', label: 'Local File', icon: <Upload size={16} />,    placeholder: '' },
  ];

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setUrl('');
    setLocalFile(null);
    setLocalPreview('');
    if (tabId === 'localFile') {
      setUploadMode('image');
    }
  }, []);

  const handleLocalFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if (uploadMode === 'image') {
      if (!allowedImageTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
        return;
      }
    } else {
      if (!allowedVideoTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, WebM, MOV, or AVI)');
        return;
      }
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large! Maximum size is 50MB');
      return;
    }

    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const clearLocalFile = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(null);
    setLocalPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = useCallback(() => {
    if (activeTab === 'localFile') {
      if (!localFile) return;
      const blockId = Date.now().toString();
      onAdd({
        type: uploadMode === 'video' ? 'uploadedVideo' : 'uploadedPhoto',
        id: blockId,
        url: localPreview,
        file: localFile,
        fileName: localFile.name,
      });
      setLocalFile(null);
      setLocalPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
      return;
    }

    if (!url.trim()) return;
    onAdd({ type: activeTab, url: url.trim(), id: Date.now().toString() });
    setUrl('');
    onClose();
  }, [url, activeTab, onAdd, onClose, localFile, localPreview, uploadMode]);

  const active = tabs.find(t => t.id === activeTab);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">Add Media Block</p>
        <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-white rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 border border-transparent hover:border-slate-600'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'localFile' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setUploadMode('image'); clearLocalFile(); }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                uploadMode === 'image'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-800 text-slate-400 border border-transparent'
              }`}
            >
              <Image size={16} /> Image
            </button>
            <button
              type="button"
              onClick={() => { setUploadMode('video'); clearLocalFile(); }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                uploadMode === 'video'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-800 text-slate-400 border border-transparent'
              }`}
            >
              <Video size={16} /> Video
            </button>
          </div>

          <label htmlFor="inline-local-upload"
            className="flex items-center gap-3 w-full border-2 border-dashed border-slate-700 rounded-xl p-5 cursor-pointer hover:border-orange-500/30 transition-colors bg-slate-950/30">
            <Upload size={20} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-slate-300 text-sm font-medium">Click to upload {uploadMode}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {uploadMode === 'image'
                  ? 'JPG, PNG, WebP, GIF supported (max 50MB)'
                  : 'MP4, WebM, MOV, AVI supported (max 50MB)'}
              </p>
            </div>
            <input
              id="inline-local-upload"
              ref={fileInputRef}
              type="file"
              accept={uploadMode === 'image'
                ? 'image/jpeg,image/png,image/webp,image/gif'
                : 'video/mp4,video/webm,video/quicktime,video/x-msvideo'}
              onChange={handleLocalFileChange}
              className="hidden"
            />
          </label>

          {localPreview && (
            <div className="relative inline-block">
              {uploadMode === 'video' ? (
                <video src={localPreview} controls className="max-h-40 rounded-xl object-cover border border-slate-700" />
              ) : (
                <img src={localPreview} alt="Preview" className="max-h-40 rounded-xl object-cover border border-slate-700" />
              )}
              <button type="button" onClick={clearLocalFile}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg">
                <X size={12} className="text-white" />
              </button>
              <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{localFile?.name}</p>
              <p className="text-xs text-slate-600">{(localFile?.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          <button type="button" onClick={handleAdd} disabled={!localFile}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors">
            Add {uploadMode === 'video' ? 'Video' : 'Image'}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={active?.placeholder}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-orange-500/50 placeholder-slate-500"
          />
          <button type="button" onClick={handleAdd} disabled={!url.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors">
            Add
          </button>
        </div>
      )}
    </div>
  );
});

export default function LexicalEditor({ value, onChange, placeholder = "Enter story description...", videoMode = false }) {

  const [blocks, setBlocks] = useState(() => {
    if (!value) return [{ type: 'text', content: '', id: 'initial' }];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [{ type: 'text', content: value, id: 'initial' }];
  });

  const [showMediaPanel, setShowMediaPanel] = useState(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  const debounceTimer = useRef(null);

  const notifyParent = useCallback((newBlocks) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const serialisable = newBlocks.map(b => {
        if (b.type === 'uploadedPhoto' || b.type === 'uploadedVideo') {
          const { file, ...rest } = b;
          const isServerUrl = b.url && !b.url.startsWith('blob:') && b.url !== '';
          return {
            ...rest,
            url: isServerUrl ? b.url : '',
            fileName: isServerUrl ? b.fileName : ''
          };
        }
        return b;
      });
      onChangeRef.current(JSON.stringify(serialisable));
    }, 300);
  }, []);

  useEffect(() => {
    window.__lexicalBlocks = blocks;
    return () => { window.__lexicalBlocks = null; };
  }, [blocks]);

  const handleTextChange = useCallback((index, editorStateJSON) => {
    setBlocks(prev => {
      const next = prev.map((b, i) => i === index ? { ...b, content: editorStateJSON } : b);
      notifyParent(next);
      return next;
    });
  }, [notifyParent]);

  const handleDeleteBlock = useCallback((index) => {
    setBlocks(prev => {
      const next = prev.filter((_, i) => i !== index);
      const result = next.length === 0
        ? [{ type: 'text', content: '', id: Date.now().toString() }]
        : next;
      notifyParent(result);
      return result;
    });
  }, [notifyParent]);

  const handleAddMedia = useCallback((embedBlock) => {
    setBlocks(prev => {
      const next = [
        ...prev,
        embedBlock,
        { type: 'text', content: '', id: Date.now().toString() + '_text' },
      ];
      notifyParent(next);
      return next;
    });
  }, [notifyParent]);

  const handleAddTextBlock = useCallback(() => {
    setBlocks(prev => {
      const next = [...prev, { type: 'text', content: '', id: Date.now().toString() }];
      notifyParent(next);
      return next;
    });
  }, [notifyParent]);

  // ✅ NEW: Replace media handler
  const handleReplaceMedia = useCallback((index, newBlock) => {
    setBlocks(prev => {
      const next = prev.map((b, i) => i === index ? newBlock : b);
      notifyParent(next);
      return next;
    });
  }, [notifyParent]);

  const toggleMediaPanel = useCallback(() => setShowMediaPanel(p => !p), []);
  const closeMediaPanel  = useCallback(() => setShowMediaPanel(false), []);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id || index} className="relative">
          {block.type === 'text' ? (
            <TextBlock
              block={block}
              index={index}
              onTextChange={handleTextChange}
              onDelete={handleDeleteBlock}
              placeholder={index === 0 ? placeholder : 'Continue writing...'}
            />
          ) : (
            <EmbedBlock
              block={block}
              index={index}
              onDelete={handleDeleteBlock}
              onReplace={handleReplaceMedia}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={handleAddTextBlock}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
          <Plus size={15} /> Add Text Block
        </button>
        {!videoMode && (
          <button type="button" onClick={toggleMediaPanel}
            className={`flex items-center gap-2 px-3 py-2 border text-sm font-medium rounded-lg transition-colors ${
              showMediaPanel
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}>
            <Image size={15} /> Add Media
          </button>
        )}
      </div>

      {!videoMode && showMediaPanel && (
        <AddMediaPanel onAdd={handleAddMedia} onClose={closeMediaPanel} />
      )}
    </div>
  );
}