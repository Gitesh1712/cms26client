import { useMemo } from 'react';


function renderNode(node, index) {
  if (!node) return null;

  switch (node.type) {

    case 'root':
      return (
        <div key={index}>
          {(node.children || []).map((child, i) => renderNode(child, i))}
        </div>
      );

    case 'paragraph': {
      const children = (node.children || []).map((child, i) => renderNode(child, i));
      const isEmpty = !node.children?.length ||
        node.children.every(c => c.type === 'text' && c.text?.trim() === '');
      return isEmpty
        ? <div key={index} className="h-4" />  
        : <p key={index} className="mb-3 text-slate-200 leading-relaxed">{children}</p>;
    }

    case 'heading': {
      const children = (node.children || []).map((child, i) => renderNode(child, i));
      if (node.tag === 'h1')
        return <h1 key={index} className="text-3xl font-bold mb-4 text-white">{children}</h1>;
      if (node.tag === 'h2')
        return <h2 key={index} className="text-2xl font-bold mb-3 text-white">{children}</h2>;
      return <h3 key={index} className="text-xl font-bold mb-2 text-white">{children}</h3>;
    }

    case 'list': {
      const items = (node.children || []).map((child, i) => renderNode(child, i));
      return node.listType === 'number'
        ? <ol key={index} className="list-decimal ml-6 mb-3 text-slate-200 space-y-1">{items}</ol>
        : <ul key={index} className="list-disc ml-6 mb-3 text-slate-200 space-y-1">{items}</ul>;
    }

    case 'listitem':
      return (
        <li key={index} className="leading-relaxed">
          {(node.children || []).map((child, i) => renderNode(child, i))}
        </li>
      );

    case 'link': {
      const children = (node.children || []).map((child, i) => renderNode(child, i));
      return (
        <a
          key={index}
          href={node.url}
          target={node.target || '_blank'}
          rel={node.rel || 'noopener noreferrer'}
          className="text-orange-400 underline hover:text-orange-300 transition-colors"
        >
          {children}
        </a>
      );
    }

    case 'text': {
      if (!node.text) return null;

      let el = <>{node.text}</>;
      if (node.format & 1)  el = <strong>{el}</strong>;  
      if (node.format & 2)  el = <em>{el}</em>;          
      if (node.format & 8)  el = <u>{el}</u>;            
      if (node.format & 4)  el = <s>{el}</s>;             
      if (node.format & 16) el = <code className="bg-slate-800 px-1 rounded text-orange-300 text-sm">{el}</code>; // code
      return <span key={index}>{el}</span>;
    }

    case 'linebreak':
      return <br key={index} />;

    default:
     
      if (node.children?.length)
        return <span key={index}>{node.children.map((c, i) => renderNode(c, i))}</span>;
      return null;
  }
}


function renderEmbedBlock(block, index, postMedia = []) {
 
  if (block.type === 'uploadedPhoto' || block.type === 'uploadedVideo') {
    let mediaUrl = block.url;
    
   
    if (!mediaUrl && block.fileName && postMedia && postMedia.length > 0) {
      const matchedMedia = postMedia.find(m => {
        const filename = m.url?.split('/').pop();
        return filename === block.fileName;
      });
      if (matchedMedia) {
        mediaUrl = matchedMedia.url.startsWith('http')
          ? matchedMedia.url
          : `${import.meta.env.VITE_API_URL || ''}${matchedMedia.url}`;
      }
    } else if (mediaUrl && mediaUrl.startsWith('/uploads/')) {
  
      mediaUrl = mediaUrl.startsWith('http')
        ? mediaUrl
        : `${import.meta.env.VITE_API_URL || ''}${mediaUrl}`;
    }

    if (!mediaUrl) return null;

    if (block.type === 'uploadedVideo') {
      return (
        <div key={index} className="my-4">
          <video
            src={mediaUrl}
            controls
            className="max-w-full rounded-xl border border-slate-700"
          />
        </div>
      );
    } else {
      return (
        <div key={index} className="my-4">
          <img
            src={mediaUrl}
            alt="Uploaded media"
            className="max-w-full rounded-xl border border-slate-700"
            onError={(e) => { 
              e.target.src = 'https://placehold.co/800x400/1e293b/475569?text=Image+not+found'; 
            }}
          />
        </div>
      );
    }
  }

 
  switch (block.type) {
    case 'youtube': {
      const ytId = block.url?.match(
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
      )?.[1];
      return ytId ? (
        <div key={index} className="aspect-video w-full rounded-xl overflow-hidden my-4">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}`}
            allowFullScreen
            title="YouTube video"
          />
        </div>
      ) : null;
    }
    case 'tweet':
      return (
        <div key={index} className="my-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <a href={block.url} target="_blank" rel="noopener noreferrer"
            className="text-sky-400 hover:underline text-sm break-all">
            🐦 {block.url}
          </a>
        </div>
      );
    case 'instagram':
      return (
        <div key={index} className="my-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <a href={block.url} target="_blank" rel="noopener noreferrer"
            className="text-pink-400 hover:underline text-sm break-all">
            📸 {block.url}
          </a>
        </div>
      );
    case 'facebook':
      return (
        <div key={index} className="my-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <a href={block.url} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm break-all">
            📘 {block.url}
          </a>
        </div>
      );
    case 'image':
      return block.url ? (
        <div key={index} className="my-4">
          <img
            src={block.url}
            alt="Embedded media"
            className="max-w-full rounded-xl border border-slate-700"
            onError={(e) => { 
              e.target.src = 'https://placehold.co/800x400/1e293b/475569?text=Image+not+found'; 
            }}
          />
        </div>
      ) : null;
    default:
      return null;
  }
}


function renderPlainText(text) {
  return text.split(/\n+/).map((para, i) =>
    para.trim()
      ? <p key={i} className="mb-3 text-slate-200 leading-relaxed">{para}</p>
      : <div key={i} className="h-2" />
  );
}


export default function RenderDescription({ content, className = '', postMedia = [] }) {
  const rendered = useMemo(() => {
    if (!content || typeof content !== 'string') return null;

   
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((block, i) => {
          if (block.type === 'text') {
            if (!block.content) return null;
            try {
          
              const editorState = typeof block.content === 'string'
                ? JSON.parse(block.content)
                : block.content;
              if (editorState?.root) {
                return (
                  <div key={block.id || i}>
                    {renderNode(editorState.root, 0)}
                  </div>
                );
              }
            } catch (_) {}
    
            if (typeof block.content === 'string') {
              return <div key={block.id || i}>{renderPlainText(block.content)}</div>;
            }
            return null;
          }

       
          return renderEmbedBlock(block, i, postMedia);
        });
      }
    } catch (_) {}

   
    try {
      const parsed = JSON.parse(content);
      if (parsed?.root) {
        return renderNode(parsed.root, 0);
      }
    } catch (_) {}

   
    return renderPlainText(content);
  }, [content, postMedia]);

  return (
    <div className={`prose-custom ${className}`}>
      {rendered}
    </div>
  );
}