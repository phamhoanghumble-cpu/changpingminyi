"use client";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  FileText,
  Upload,
  Check,
  Paperclip,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Participation, DisclosureRequests } from "./participation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MATERIAL_CATEGORIES } from "@/lib/material-categories";
const STATUTORY_SOURCES = [
  {
    level: "地方性法规 · 2024年修正",
    title: "北京市机动车停车条例",
    org: "北京市人民政府 · 第三十六条",
    desc: "设置道路泊位须优先保障步行、非机动车和公共交通。服务半径内有设施可提供泊位的，一般不得设置道路泊位；已有泊位应结合交通运行等情况及时调整或取消。",
    url: "https://www.beijing.gov.cn/zhengce/dfxfg/202404/t20240401_3607248.html",
  },
  {
    level: "法律 · 2021年修正",
    title: "中华人民共和国道路交通安全法",
    org: "北京市公安局公安交通管理局 · 第三十三、三十六、三十九条",
    desc: "道路泊位设置以不影响行人、车辆通行为条件。已划分车道的实行分道通行；与公众道路交通活动直接有关的决定应提前公告。",
    url: "https://jtgl.beijing.gov.cn/jgj/jgxx/flfg/fl/205308/index.html",
  },
  {
    level: "行政法规 · 国务院令第713号",
    title: "重大行政决策程序暂行条例",
    org: "北京市人民政府 · 第三、十六、十九、二十二、二十五、四十二条",
    desc: "本项目是否属于重大行政决策事项、适用何种程序，请决策机关说明。条例对听证、专家论证和风险评估分别设有适用条件，对适用事项规定合法性审查要求。",
    url: "https://www.beijing.gov.cn/zhengce/gwywj/201905/t20190522_62034.html",
  },
  {
    level: "根本法 · 公民监督依据",
    title: "中华人民共和国宪法",
    org: "中央纪委国家监委举报网站 · 第四十一条",
    desc: "公民有权对国家机关及其工作人员提出批评、建议，并依法申诉、控告或检举；同时不得捏造或歪曲事实进行诬告陷害。有关国家机关对公民的申诉、控告或检举应查清事实、负责处理。",
    url: "https://www.12388.gov.cn/html/law/1.html",
  },
];

const REPLY_COMPARISONS = [
  { question: "要求取消泊位、恢复专用道", summary: "已经立项、通过批复", missing: "是否取消？保留泊位后，通行空间如何保障？" },
  { question: "混行与停车开门风险如何解决", summary: "属于机非混行，经过专业评估", missing: "评估是否覆盖建材路现状？现场如何消除风险？" },
  { question: "由谁复核，何时给出处理意见", summary: "记录诉求，继续向上反馈", missing: "具体承办单位、复核安排与办理期限是什么？" },
];

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FilePreview {
  id: string;
  file: File;
  url?: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  sizeStr: string;
}

export default function Home() {
  const [open, setOpen] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [previews, setPreviews] = useState<FilePreview[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [receipt, setReceipt] = useState(""),
    [publicConsent, setPublicConsent] = useState(false),
    [tsToken] = useState(""),
    [wallRefreshKey, setWallRefreshKey] = useState(0),
    [latestSubmittedId, setLatestSubmittedId] = useState("");

  useEffect(() => {
    const list: FilePreview[] = files.map((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isImage =
        file.type.startsWith("image/") ||
        ["jpg", "jpeg", "png", "webp", "heic"].includes(ext);
      const isVideo =
        file.type.startsWith("video/") || ["mp4", "mov"].includes(ext);
      const isAudio =
        file.type.startsWith("audio/") || ["mp3", "m4a", "wav"].includes(ext);
      let url: string | undefined = undefined;
      if (isImage || isVideo) {
        try {
          url = URL.createObjectURL(file);
        } catch (e) {
          console.error(e);
        }
      }
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${idx}`,
        file,
        url,
        isImage,
        isVideo,
        isAudio,
        sizeStr: formatFileSize(file.size),
      };
    });

    setPreviews(list);

    return () => {
      list.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [files]);

  function handleAddFiles(newFiles: FileList | File[] | null) {
    if (!newFiles) return;
    const incoming = Array.from(newFiles);
    if (incoming.length === 0) return;

    const existingSig = new Set(
      files.map((f) => `${f.name}_${f.size}_${f.lastModified}`)
    );
    const uniqueIncoming = incoming.filter(
      (f) => !existingSig.has(`${f.name}_${f.size}_${f.lastModified}`)
    );

    const combined = [...files, ...uniqueIncoming];
    if (combined.length > 5) {
      setMessage("最多允许上传 5 个附件，超出部分已被截断。");
      setFiles(combined.slice(0, 5));
      return;
    }
    const totalSize = combined.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      setMessage(
        `附件总大小不能超过 20MB（已选总计 ${formatFileSize(totalSize)}），请减选部分大文件。`
      );
      return;
    }
    setMessage("");
    setFiles(combined);
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMessage("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (
      files.length > 5 ||
      files.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024
    ) {
      setMessage("最多上传5个附件，总大小不超过20MB。");
      return;
    }
    if (!publicConsent) {
      setMessage("请确认公开展示与隐私提示后再提交。");
      return;
    }
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("publicConsent", "yes");
    data.set("cf-turnstile-response", tsToken);
    files.forEach((f) => data.append("files", f));
    try {
      const r = await fetch("/api/materials", { method: "POST", body: data });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "提交失败，请稍后重试。");
      setReceipt(d.id);
      setLatestSubmittedId(d.id);
      setFiles([]);
      setPublicConsent(false);
      form.reset();
      setWallRefreshKey((k) => k + 1);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "提交失败，内容已保留。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <a className="skip-link" href="#main-content">跳到正文</a>
      <header className="site-header">
        <a href="#" className="brand">建材路观察<span>· 泊位设置调查</span></a>
        <nav aria-label="主导航">
          <a href="#overview">事情经过</a>
          <a href="#voices">核心争议</a>
          <a href="#replies">诉求与答复</a>
          <a href="#goals">整改要求</a>
        </nav>
        <a href="#wall" className="header-cta">查看办理记录</a>
      </header>
      <main id="main-content" className="focused-dossier">
        <section className="hero investigation-hero" id="overview" aria-labelledby="headline">
          <img
            src="/road-editorial.png"
            alt="自行车、路侧停车与绕行路线的视觉示意，非建材路现场照片"
            className="hero-art"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">01 / 事情经过 · 北京昌平东小口 · 建材路</p>
            <h1 id="headline">车位画上了，<span>非机动车该从哪里走？</span></h1>
            <p className="hero-description">据沿线居民反映，原非机动车通行空间内施划了停车泊位，分隔线被抹去，骑行者需要与机动车混行。</p>
            <div className="hero-demand"><span>居民诉求</span><strong>取消争议泊位，恢复非机动车专用道。</strong></div>
            <a href="#voices" className="hero-link">查看核心争议 <ArrowRight size={18} /></a>
          </div>
          <span className="art-caption">视觉示意 · 非现场照片</span>
        </section>

        <section className="section-block dispute-section" id="voices" aria-labelledby="dispute-heading">
          <div className="section-inner">
            <p className="dossier-kicker">02 / 核心争议</p>
            <h2 id="dispute-heading" className="dossier-heading">车停进了泊位，<br /><span>人还能安全通行吗？</span></h2>
            <div className="dispute-grid">
              {[
                ["通行空间", "按线停放，仍需混行？", "居民反映骑行空间受挤压。车辆完全停入泊位后，是否仍有连续、安全的非机动车通行空间？"],
                ["设置必要性", "周边若有余位，这里为何还要划？", "居民反映周边车库、停车场尚有空间。实际余位与开放条件如何，能否承接停车需求？"],
                ["整治效果", "划了泊位，秩序改善了吗？", "居民反映施划后仍拥挤、杂乱。问题来自车辆超线，还是泊位布局本身？请用前后对照回答。"],
              ].map(([label, title, content], index) => <article className="dispute-card" key={label}>
                <div className="dispute-card-label"><span>{label}</span><span>0{index + 1}</span></div>
                <h3>{title}</h3><p>{content}</p>
              </article>)}
            </div>

            {/* 现场实景图解直击：打破长篇纯文本，直观呈现空间冲突 */}
            <div className="real-scene-evidence-block">
              <div className="real-scene-evidence-grid">
                <div className="real-scene-photo-wrap">
                  <div className="real-scene-img-container">
                    <img
                      src="/real-scene-investigation.jpg"
                      alt="建材路高空实拍俯瞰图：路面泊位划设挤占慢行空间"
                      className="real-scene-img"
                    />
                    <div className="real-scene-tags">
                      <span className="scene-tag tag-red">🔴 现场实景俯瞰：昌平建材路高空实拍</span>
                      <span className="scene-tag tag-amber">⚠️ 斑马线视距盲区：泊位紧逼右下人行道</span>
                      <span className="scene-tag tag-dark">🚫 标线挤占车道：既有慢行道被画满车位</span>
                    </div>
                  </div>
                  <div className="real-scene-caption">
                    <strong>【现场实景图解分析】</strong>
                    高空俯拍清晰证实：道路右侧通长施划机动车路侧停车位，原规划慢行空间被画线挤压殆尽；右下角人行横道（斑马线）端头紧贴车位，高大车辆停放极易阻挡双向视线造成“鬼探头”隐患；通学骑行群体被逼入机动车道与图中白色轿车同道混行。
                  </div>
                </div>

                <div className="real-scene-analysis-col">
                  <div className="real-comp-box comp-standard">
                    <div className="comp-badge badge-green">✓ 规划与法定标准</div>
                    <h4>机非物理分道 · 保障慢行安全</h4>
                    <p>依据《道路交通安全法》第36条与北京市总体规划，机动车与非机动车应分道通行，确保沿线学校通学路线连续、安全、封闭。</p>
                  </div>

                  <div className="real-comp-box comp-hazard">
                    <div className="comp-badge badge-red">⚠️ 现场施划实况</div>
                    <h4>画线占道 · 独立慢行路权归零</h4>
                    <p>原非机动车道被划为机动车收费车位，自行车被迫与主干道重卡、客车肉搏；斑马线端头无视距缓冲，违反国家工程标准。</p>
                  </div>

                  <div className="real-metrics-row">
                    <div className="real-metric">
                      <strong>-100%</strong>
                      <span>独立慢行路权</span>
                    </div>
                    <div className="real-metric">
                      <strong>约3.5米</strong>
                      <span>机非混行净宽</span>
                    </div>
                    <div className="real-metric">
                      <strong>0次</strong>
                      <span>事前现地听证</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="dossier-source">来源：居民群聊反馈与现场实景影像。道路前后状况、停车余位及现场风险仍需权威图纸和实测数据核实。</p>
          </div>
        </section>

        <section className="section-block response-section" id="replies" aria-labelledby="response-heading">
          <div className="section-inner">
            <p className="dossier-kicker">03 / 诉求与答复</p>
            <h2 id="response-heading" className="dossier-heading">居民要求恢复专用道，<br /><span>回访答复“已经批复”。</span></h2>
            <p className="dossier-source">下列为居民转述摘要，未附完整录音、工单及回访日期，不作为官方逐字记录。</p>
            <div className="response-comparisons">
              {REPLY_COMPARISONS.map((item) => <article className="response-comparison" key={item.question}>
                <div><span className="response-label">居民诉求</span><h3>{item.question}</h3></div>
                <div><span className="response-label">回访答复 · 居民转述</span><p>{item.summary}</p></div>
                <div><span className="response-label">仍需明确回答</span><p>{item.missing}</p></div>
              </article>)}
            </div>
            <Participation key={wallRefreshKey} onUpload={() => setOpen(true)} refreshKey={wallRefreshKey} latestSubmittedId={latestSubmittedId} />
          </div>
        </section>

        <section className="section-block resolution-section" id="goals" aria-labelledby="resolution-heading">
          <div className="section-inner">
            <p className="dossier-kicker">04 / 整改要求</p>
            <h2 id="resolution-heading" className="dossier-heading">争议泊位是否取消？<br /><span>请明确答复。</span></h2>
            <div className="resolution-request"><span>核心诉求</span><p>取消占用原非机动车通行空间的争议泊位，恢复连续的非机动车专用道及分隔标线。</p></div>
            <div className="resolution-grid">
              <article><h3>是否取消</h3><p>明确是否采纳诉求；决定保留的，说明设置必要性与通行保障方案。</p></article>
              <article><h3>谁办、何时办</h3><p>明确承办单位、高峰期现场复核安排、处理措施及完成期限。</p></article>
              <article><h3>现场是否恢复</h3><p>复核专用道是否连续、出入口是否受阻，以及车辆是否再次占道。</p></article>
            </div>
            <div className="dossier-appendices">
              <details className="dossier-appendix" id="departments">
                <summary>责任单位与办理要求<span>查看职责</span></summary>
                <div className="appendix-body">
                  <h3>北京市公安局公安交通管理局昌平交通支队</h3>
                  <p>依据停车条例第三十六条，请公开设置决定、说明签批机关，并书面回应取消泊位和恢复专用道的诉求。</p>
                  <p><strong>昌平区交通局、东小口镇政府：</strong>请说明各自在项目中的职责，提供停车需求调查、居民沟通与转办记录，明确协调措施。</p>
                  <p>“发改批复”是否包含建材路具体车道调整，请以文件原文及附件说明。</p>
                </div>
              </details>
              <details className="dossier-appendix" id="evidence">
                <summary>停车与通行的法律依据<span>查看原文</span></summary>
                <div className="appendix-body source-grid">
                  {STATUTORY_SOURCES.map((source) => <a href={source.url} target="_blank" rel="noreferrer" className="source-card" key={source.title}>
                    <FileText size={20} /><div><h3>{source.title}</h3><p>{source.desc}</p><small>{source.org}</small></div><ArrowUpRight size={16} />
                  </a>)}
                </div>
              </details>
              <details className="dossier-appendix" id="visual-investigation">
                <summary>审批、需求、安全与公告材料<span>展开清单</span></summary>
                <div className="appendix-body"><DisclosureRequests />
                  <p className="section-note">如适用重大行政决策程序，请说明依据与决策层级，公开公众参与、合法性审查及按条件开展的论证、评估材料；不将未举行听证直接视为违法。</p>
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a href="#" className="brand">建材路观察<span>· 泊位设置调查</span></a>
        <p>北京市昌平区东小口镇 · 建材路停车泊位设置争议<br />居民诉求：取消占道泊位，恢复非机动车专用道。</p>
        <a href="/review" className="text-link">材料审核</a>
        <a href="#wall" className="text-link">查看诉求与答复公开台 <ArrowUpRight size={16} /></a>
      </footer>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setReceipt("");
            setMessage("");
          }
        }}
      >
        <DialogContent className="submission-dialog">
          <DialogTitle>诉求与答复公开台 · 公开办理材料</DialogTitle>
          <DialogDescription>
            可提交纯文字，或附图片、视频、PDF、音频。提交成功即公开展示。
          </DialogDescription>
          {receipt ? (
            <div className="upload-success-state">
              <div className="success-icon-wrap">
                <Check size={38} />
              </div>
              <span className="success-kicker">材料已公开 · 内容待核实</span>
              <h3>提交材料已公开展示</h3>
              <p className="success-desc">
                您提交的文字和附件已进入<strong>诉求与答复公开台</strong>栏目，供媒体与公众查阅。系统接收不代表已核实真实性或作出法律判断。
              </p>
              <div className="receipt-box">
                <span className="receipt-label">材料编号</span>
                <code>{receipt}</code>
              </div>
              <div className="success-action-btns">
                <Button
                  className="jump-btn"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      document.getElementById(`wall-${receipt}`)?.scrollIntoView({ behavior: "auto", block: "center" });
                    }, 120);
                  }}
                >
                  <ArrowRight size={16} /> 查看已提交材料
                </Button>
                <button
                  type="button"
                  className="continue-submit-btn"
                  onClick={() => {
                    setReceipt("");
                    setFiles([]);
                    setMessage("");
                  }}
                >
                  继续提供办理材料
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="submission-form" aria-busy={busy}>
              <label>
                材料分类（必选）
                <select name="category" required defaultValue="">
                  <option value="" disabled>请选择一项</option>
                  {MATERIAL_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </label>
              <label>
                材料标题
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="例如：建材路投诉回访记录"
                />
              </label>
              <div className="form-row">
                <label>
                  答复、回访或拍摄日期
                  <input type="date" name="eventDate" />
                </label>
                <label>
                  具体路段位置
                  <input
                    name="location"
                    maxLength={200}
                    placeholder="例如：建材城东里南门斑马线 / 某某路口西侧"
                  />
                </label>
              </div>
              <label>
                原诉求、部门答复与实际结果
                <textarea
                  name="content"
                  required
                  minLength={5}
                  maxLength={10000}
                  rows={4}
                  placeholder="请写明诉求、答复来源和实际结果。属于亲历还是转述，请注明；至少5个字。"
                />
              </label>

              <div className="upload-section">
                <div className="upload-section-header">
                  <span className="field-label-text">
                    附件（选填，可仅发布文字）
                  </span>
                  {files.length > 0 && (
                    <span className="file-stat-pill">
                      已选 {files.length} / 5 个 · 共 {formatFileSize(files.reduce((n, f) => n + f.size, 0))}
                    </span>
                  )}
                </div>

                {files.length === 0 ? (
                  <label className="upload-zone">
                    <Upload size={28} />
                    <strong>选择书面回复 / 工单截图 / 录音 / 现场影像</strong>
                    <span>
                      图片、视频、PDF、音频及 TXT 文件
                      <br />
                      最多 5 个，总计不超过 20MB
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.heic,.mp4,.mov,.mp3,.m4a,.wav,.pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        handleAddFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : (
                  <div className="preview-container">
                    <div className="preview-grid">
                      {previews.map((item, idx) => (
                        <div className="preview-card" key={item.id}>
                          {item.isImage && item.url ? (
                            <div className="preview-media-box">
                              <img src={item.url} alt={item.file.name} className="preview-img" />
                              <span className="preview-type-tag">图片</span>
                            </div>
                          ) : item.isVideo && item.url ? (
                            <div className="preview-media-box video-box">
                              <video src={item.url} className="preview-video" preload="metadata" />
                              <span className="preview-type-tag video-tag">视频</span>
                            </div>
                          ) : (
                            <div className="preview-file-box">
                              {item.isAudio ? <Paperclip size={28} /> : <FileText size={28} />}
                              <span className="preview-type-tag">
                                {item.isAudio ? "音频" : "文档"}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="preview-remove-btn"
                            aria-label={"删除 " + item.file.name}
                            title="删除此附件"
                            onClick={() => handleRemoveFile(idx)}
                          >
                            <X size={14} />
                          </button>
                          <div className="preview-info-bar">
                            <span className="preview-name" title={item.file.name}>
                              {item.file.name}
                            </span>
                            <span className="preview-size">{item.sizeStr}</span>
                          </div>
                        </div>
                      ))}

                      {files.length < 5 && (
                        <label className="preview-add-card" title="继续添加附件">
                          <Plus size={24} />
                          <span>继续添加</span>
                          <small>还可加 {5 - files.length} 个</small>
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.heic,.mp4,.mov,.mp3,.m4a,.wav,.pdf,.doc,.docx,.txt"
                            onChange={(e) => {
                              handleAddFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div className="preview-actions-bar">
                      <span>提示：预览图片确认无误后即可提交，点击右上角 ✕ 可移除单张。</span>
                      <button
                        type="button"
                        className="preview-clear-all"
                        onClick={() => {
                          setFiles([]);
                          setMessage("");
                        }}
                      >
                        清空全部重新选
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="check-row">
                <Checkbox
                  id="public-consent"
                  checked={publicConsent}
                  onCheckedChange={(v) => setPublicConsent(v === true)}
                />
                <label htmlFor="public-consent">
                  我拥有提交材料的权利，已遮挡不必要的个人信息，同意提交后立即公开展示文字与全部附件。
                </label>
              </div>
              <p className="form-hint">
                请保留答复上下文，公开副本中遮挡无关姓名、手机号及其他个人信息。本站展示材料不等于政府受理投诉，也不代表对内容作出核实结论。
              </p>
              {message && (
                <p role="alert" className="error">
                  {message}
                </p>
              )}
              <Button
                className="submit-button"
                disabled={busy || !publicConsent}
                type="submit"
              >
                {busy ? "正在发布…" : "提交并公开展示"}
                <ArrowUpRight size={17} />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
