"use client";

import { useEffect, useState } from "react";

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState("正在加载文字…");
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw Error();
      const content = await response.text();
      if (!controller.signal.aborted) setText(content);
    }).catch(() => { if (!controller.signal.aborted) setText("文字预览暂不可用，请打开原文件。"); });
    return () => controller.abort();
  }, [url]);
  return <pre className="material-text-preview">{text}</pre>;
}

export interface MaterialFile {
  name: string;
  type: string;
  url: string;
}

export function MaterialAttachment({
  file,
  onExpand,
}: {
  file: MaterialFile;
  onExpand?: () => void;
}) {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  return (
    <div className="material-attachment">
      {file.type.startsWith("image/") ? (
        onExpand ? (
          <button type="button" className="material-image-button" onClick={onExpand} aria-label={`放大图片：${file.name}`}>
            <img src={file.url} alt={file.name} loading="lazy" />
          </button>
        ) : <img src={file.url} alt={file.name} />
      ) : file.type.startsWith("video/") ? (
        <video controls playsInline preload="metadata" src={file.url} aria-label={`视频：${file.name}`} />
      ) : file.type.startsWith("audio/") ? (
        <div className="material-audio">
          <span>音频 · {file.name}</span>
          <audio controls preload="metadata" src={file.url} aria-label={`试听音频：${file.name}`} />
        </div>
      ) : isPdf ? (
        <iframe src={file.url} title={`PDF：${file.name}`} loading="lazy" className="material-pdf" />
      ) : /\.txt$/i.test(file.name) || file.type === "text/plain" ? <TextPreview key={file.url} url={file.url} /> : null}
      <a href={file.url} target="_blank" rel="noreferrer" className="material-file-link">
        {isPdf ? "打开 PDF" : "打开原文件"} · {file.name}
      </a>
    </div>
  );
}
