"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  MapPin,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MATERIAL_CATEGORIES, materialCategoryLabel } from "@/lib/material-categories";
import { MaterialMasonry } from "./MaterialMasonry";
import { MaterialAttachment, type MaterialFile } from "./MaterialAttachment";

interface ResidentMaterial {
  id: string;
  category: string;
  title: string;
  content: string;
  location: string;
  event_date: string;
  created_at: string;
  files: MaterialFile[];
}

const DISCLOSURE_REQUESTS = [
  {
    id: "A", title: "泊位设置及车道调整依据",
    items: [
      "建材路现有道路停车泊位的设置依据。",
      "停车泊位设置的审批或决定文件，含文号、签批机关、日期及实施范围。",
      "道路停车泊位设置方案及道路交通组织方案。",
      "停车泊位设置前后的道路断面图。",
      "停车泊位设置前后的交通组织设计图。",
      "原非机动车道取消的依据及批准文件。",
      "“机非混合车道”认定所依据的法律、法规、规章、规范性文件及技术标准。",
    ],
  },
  {
    id: "B", title: "“居民要求增加停车位”的依据",
    items: [
      "该路段停车需求调查报告。",
      "居民意见征集材料。",
      "居民意见统计结果。",
      "将居民意见作为设置停车泊位依据的相关材料。",
    ],
  },
  {
    id: "C", title: "交通运行与安全评估材料",
    items: [
      "设置停车位前后的交通流量调查数据。",
      "道路交通拥堵情况调查或评估材料。",
      "泊位设置前的交通安全评估、论证或相关技术审查材料。",
      "取消原非机动车道后非机动车通行组织的论证材料。",
      "行人、非机动车与机动车混行安全性的论证材料。",
    ],
  },
  {
    id: "D", title: "公告及意见处理材料",
    items: [
      "道路停车泊位设置前后的公示、公告材料。",
      "公示、公告的时间、地点、内容及网上发布的原始网址。",
      "公示、公告期间收到的意见及处理情况。",
    ],
  },
];

export function DisclosureRequests() {
  return <div className="disclosure-list">
    {DISCLOSURE_REQUESTS.map((group) => <details key={group.id} className="disclosure-group">
      <summary>{group.id} · {group.title}<span>{group.items.length} 项</span></summary>
      <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
    </details>)}
    <p className="section-note">对未制作、不存在或依法不能公开的材料，请分别说明情况及依据。</p>
  </div>;
}

export function Participation({
  onUpload,
  refreshKey = 0,
  latestSubmittedId = "",
}: {
  onUpload: () => void;
  refreshKey?: number;
  latestSubmittedId?: string;
}) {
  const [wall, setWall] = useState<ResidentMaterial[]>([]);
  const [wallError, setWallError] = useState(false);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [lightbox, setLightbox] = useState<{
    item: ResidentMaterial;
    activeFileIndex: number;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function refreshWall() {
      try {
        const response = await fetch(`/api/evidence${category ? `?category=${category}` : ""}`, { signal: controller.signal });
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!controller.signal.aborted) { setWall(data.items); setWallError(false); }
      } catch {
        if (!controller.signal.aborted) setWallError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void refreshWall();
    const timer = setInterval(refreshWall, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refreshKey, category, retryKey]);

  function chooseCategory(value: string) {
    setCategory(value);
    setLoading(true);
    setWallError(false);
    setWall([]);
  }

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) => {
          if (!prev) return null;
          const len = prev.item.files.length;
          return {
            ...prev,
            activeFileIndex: (prev.activeFileIndex - 1 + len) % len,
          };
        });
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) => {
          if (!prev) return null;
          const len = prev.item.files.length;
          return {
            ...prev,
            activeFileIndex: (prev.activeFileIndex + 1) % len,
          };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function formatTimeAgo(isoString: string): string {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "刚刚发布";
      if (diffMins < 60) return `${diffMins} 分钟前`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} 小时前`;
      return date.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
    } catch {
      return isoString;
    }
  }

  return (
    <>
      <div className="public-materials" id="wall" role="region" aria-labelledby="wall-heading">
        <div className="section-heading wall-section-heading">
          <div>
            <div className="live-status-pill">
              <span className="live-dot" /> 用户上传 · 即时公开 · 内容待核实
            </div>
            <h3 id="wall-heading">诉求与答复公开台</h3>
            <p>诉求、答复原文与整改结果，在此公开。</p>
          </div>
          <div className="wall-header-actions">
            <span className="wall-count-badge">
              当前显示 <strong>{wall.length}</strong> 份 · 最新60份
            </span>
            <button onClick={onUpload} className="primary wall-upload-main-btn" title="上传部门答复、工单截图、回访录音或现场材料">
              <Upload size={17} /> 公开办理材料
            </button>
          </div>
        </div>
        <p className="section-note">保留诉求与答复上下文，遮挡无关个人信息。用户上传的部门材料不等于官方发布。</p>
        <div className="wall-filters" role="group" aria-label="按材料分类筛选">
          {[{value: "", label: "全部"}, ...MATERIAL_CATEGORIES].map((filter) => (
            <button key={filter.value} type="button" aria-pressed={category === filter.value}
              onClick={() => { if (category !== filter.value) chooseCategory(filter.value); }}>{filter.label}</button>
          ))}
        </div>
        {loading && <p className="wall-loading" role="status">正在加载公开材料…</p>}
        {wallError ? (
          <div className="notice" role="alert">公开材料暂时无法更新。
            <button type="button" className="wall-retry" onClick={() => { setLoading(true); setWallError(false); setRetryKey((key) => key + 1); }}>重新加载</button>
          </div>
        ) : null}

        {wall.length ? (
          <MaterialMasonry>
            {wall.map((item) => {
              const isHighlighted = item.id === latestSubmittedId;
              return (
                <article
                  className={`wall-card ${
                    isHighlighted ? "wall-card-highlighted" : ""
                  }`}
                  key={item.id}
                  id={`wall-${item.id}`}
                >
                  <header className="wall-card-heading">
                    <div className="wall-card-meta-top">
                      <span className="auto-pass-pill">
                        {materialCategoryLabel(item.category)}
                      </span>
                      <time className="wall-card-time" dateTime={item.created_at}>
                        {formatTimeAgo(item.created_at)}
                      </time>
                    </div>

                    <h3 className="wall-card-title">{item.title}</h3>
                  </header>
                  <div className="wall-attachment-stack">
                    {item.files.map((file, index) => (
                      <MaterialAttachment
                        key={file.url}
                        file={file}
                        onExpand={() => setLightbox({ item, activeFileIndex: index })}
                      />
                    ))}
                  </div>

                  <div className="wall-card-body">
                    {item.content.length > 240 ? <details className="wall-text-details">
                      <summary><span className="wall-description">{item.content.slice(0, 240)}…</span><span className="wall-read-more">展开全文</span></summary>
                      <p className="wall-description">{item.content}</p>
                    </details> : <p className="wall-description">{item.content}</p>}
                    {isHighlighted && <span className="wall-new-label">刚刚提交 · 已公开</span>}

                    <div className="wall-card-meta-bottom">
                      <span className="meta-chip">
                        <MapPin size={13} /> {item.location || "位置未注明"}
                      </span>
                      <span className="meta-chip">
                        <Calendar size={13} />{" "}
                        {item.event_date
                          ? `材料日期：${item.event_date}`
                          : "材料日期未注明"}
                      </span>
                    </div>

                  </div>
                </article>
              );
            })}
          </MaterialMasonry>
        ) : !wallError && !loading ? (
          <div className="wall-empty">
            <h3>{category ? "该分类暂无公开材料。" : "暂无公开材料。"}</h3>
            <p>
              可发布文字、图片、视频、PDF和音频，提交成功即显示。
            </p>
          </div>
        ) : null}
      </div>

      {/* 大图灯箱浏览组件 */}
      {lightbox && (
        <Dialog open onOpenChange={(value) => { if (!value) setLightbox(null); }}>
        <DialogContent className="material-lightbox-dialog" showCloseButton={false} aria-describedby={undefined}>
          <div className="lightbox-header">
            <div className="lightbox-title-wrap">
              <DialogTitle className="lightbox-title">{lightbox.item.title}</DialogTitle>
              <span className="lightbox-counter">
                {lightbox.activeFileIndex + 1} / {lightbox.item.files.length}
              </span>
            </div>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightbox(null)}
              title="关闭 (ESC)"
            >
              <X size={20} />
            </button>
          </div>

          <div className="lightbox-body">
            {lightbox.item.files.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  const len = lightbox.item.files.length;
                  setLightbox({
                    ...lightbox,
                    activeFileIndex: (lightbox.activeFileIndex - 1 + len) % len,
                  });
                }}
                title="上一张 (←)"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div className="lightbox-attachment">
              <MaterialAttachment key={lightbox.activeFileIndex} file={lightbox.item.files[lightbox.activeFileIndex]} />
            </div>

            {lightbox.item.files.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={(e) => {
                  e.stopPropagation();
                  const len = lightbox.item.files.length;
                  setLightbox({
                    ...lightbox,
                    activeFileIndex: (lightbox.activeFileIndex + 1) % len,
                  });
                }}
                title="下一张 (→)"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {lightbox.item.files.length > 1 && (
            <div className="lightbox-footer">
              <div className="lightbox-strip">
                {lightbox.item.files.map((f, idx) => (
                  <button
                    type="button"
                    aria-label={`查看附件：${f.name}`}
                    aria-pressed={idx === lightbox.activeFileIndex}
                    key={idx}
                    className={`lightbox-strip-item ${
                      idx === lightbox.activeFileIndex ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox({ ...lightbox, activeFileIndex: idx });
                    }}
                  >
                    {f.type.startsWith("image/") ? (
                      <img src={f.url} alt={f.name} />
                    ) : (
                      <div className="lightbox-strip-fallback">
                        <FileText size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
        </Dialog>
      )}
    </>
  );
}
