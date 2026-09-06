"use client";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  FileText,
  Upload,
  MapPin,
  ShieldCheck,
  Clock3,
  Check,
  Paperclip,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Participation } from "./participation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Turnstile } from "./TurnstileWidget";
const sources = [
  {
    title: "北京市机动车停车条例",
    org: "北京市公安局交通管理局",
    desc: "第36条 · 道路停车泊位设置、调整与通行保障",
    url: "https://jtgl.beijing.gov.cn/jgj/jgxx/flfg/xzfg/744068777/index.html",
  },
  {
    title: "昌平交通管理支队",
    org: "北京市交通管理服务地图",
    desc: "公开职责、办公地址及联系方式",
    url: "https://map.beijing.gov.cn/jgjmap/place?categoryId=jtzdd&placeId=5b7fb59cd7f3bd728d2cff1d",
  },
  {
    title: "违法停车严格管理路段公告",
    org: "北京市公安局交通管理局",
    desc: "2026年7月 · 本专题路段是否在列，待核对",
    url: "https://jtgl.beijing.gov.cn/jgj/jgxx/gsgg/wsgs/744065966/index.html",
  },
];
const questions = [
  [
    "谁作出了设置决定？",
    "需要停车泊位设置决定、发文机关、文号及涉及本路段的附件。",
  ],
  [
    "非机动车应该从哪里通行？",
    "需要调整前后的交通组织图、实测通行宽度和安全审查材料。",
  ],
  [
    "什么时候、在哪里公告？",
    "需要公告原文、发布时间和原始网址，核对是否包含本路段。",
  ],
  [
    "是否需要撤除或调整？",
    "需要结合高峰交通与现场风险的核查结果，以及明确的整改安排。",
  ],
];
export default function Home() {
  const [open, setOpen] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [receipt, setReceipt] = useState(""),
    [publicConsent, setPublicConsent] = useState(false),
    [tsToken, setTsToken] = useState(""),
    [wallRefreshKey, setWallRefreshKey] = useState(0);
  const [items, setItems] = useState<any[]>([]),
    [loadError, setLoadError] = useState(false);
  async function refresh() {
    try {
      const r = await fetch("/api/materials");
      if (!r.ok) throw Error();
      const d = await r.json();
      setItems(d.items);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (files.length < 1) {
      setMessage("上传附件是必须的，请至少选择1个图片、视频、录音或文件。");
      return;
    }
    if (
      files.length > 5 ||
      files.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024
    ) {
      setMessage("请上传1—5个附件，总大小不超过20MB。");
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
      setFiles([]);
      setPublicConsent(false);
      form.reset();
      await refresh();
      setWallRefreshKey((k) => k + 1);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "提交失败，内容已保留。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="site-header">
        <a href="#" className="brand">
          建材路<span>· 居民反馈</span>
        </a>
        <nav aria-label="主导航">
          <a href="#voices">居民心声</a>
          <a href="#wall">现场证据</a>
          <a href="#replies">回访记录</a>
          <a href="#goals">居民诉求</a>
          <a href="#departments">相关部门</a>
          <a href="#evidence">资料依据</a>
        </nav>
        <button className="header-cta" onClick={() => setOpen(true)}>
          提交文字 / 附件 <Plus size={18} />
        </button>
      </header>
      <main>
        <section className="hero" aria-labelledby="headline">
          <img
            src="/road-editorial.png"
            alt="自行车、路侧停车与绕行路线的黑白红视觉示意，并非建材路现场照片"
            className="hero-art"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">北京昌平 · 东小口 / 居民反馈专题</p>
            <h1 id="headline">
              车位画上了。
              <span>
                非机动车道
                <br className="mobile-break" />
                去哪了？
              </span>
            </h1>
            <p className="hero-description">
              居民反映：原非机动车道被改划停车位，骑行被迫绕入机动车流。
              <br />
              新增泊位不能以骑行安全为代价。请公开依据、现场核查、明确整改。
            </p>
            <a href="#issues" className="hero-link">
              查看问题与居民追问 <ArrowRight size={18} />
            </a>
          </div>
          <span className="art-caption">视觉示意 · 非现场照片</span>
        </section>
        <div className="question-banner">
          <a href="#issues">划线是否合理？</a>
          <a href="#evidence">公示是否到位？</a>
          <a href="#replies">回应是否解决问题？</a>
          <span>建材路 · 居民在追问</span>
        </div>
        <div className="content">
          <Participation
            onUpload={() => setOpen(true)}
            refreshKey={wallRefreshKey}
          />
          <section className="issues section" id="issues">
            <div className="section-heading">
              <h2>
                车位增加了，<span>安全谁来保障？</span>
              </h2>
              <p>
                根据居民提供的聊天记录整理
                <br />
                现场影像与回复原件待补充
              </p>
            </div>
            <div className="issue-grid">
              {[
                [
                  "01",
                  "通行空间被挤压",
                  "原有分隔线被清除，路侧画上停车位。停车后，自行车和电动车从哪里走？",
                  "请核查：剩余通行宽度、绕行与开门风险",
                ],
                [
                  "02",
                  "公示依据不明",
                  "回访称“网上公示过”，但居民尚未获得具体网址、公告原文及本路段方案。",
                  "请提供：公告原文、发布时间、路段范围",
                ],
                [
                  "03",
                  "答复不能止于“合规”",
                  "“已经批复”“机非混行”“向上反馈”反复出现，具体设置依据与整改安排仍待明确。",
                  "请答复：文件依据、核查结果、处理时限",
                ],
              ].map(([n, t, d, f]) => (
                <article className="issue" key={n}>
                  <span className="issue-number">{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                    <small>{f}</small>
                  </div>
                </article>
              ))}
            </div>
            <div className="resident-line">
              <span>居民的疑问</span>
              <p>“原来有非机动车道，为什么画了停车位，反而要和机动车混行？”</p>
              <small>根据居民反馈归纳</small>
            </div>
          </section>
          <section id="replies" className="section replies">
            <div className="section-heading">
              <h2>
                回复说了什么，
                <br className="mobile-break" />
                <span>问题解决了吗？</span>
              </h2>
            </div>
            <p className="section-note">
              以下为居民转述的回访内容，尚未取得原始录音或书面回复；不作为部门正式答复原文。
            </p>
            <div className="reply-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      回访说法 <small>（居民转述）</small>
                    </TableHead>
                    <TableHead>居民继续追问</TableHead>
                    <TableHead className="status-col">材料状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    [
                      "“已经立项批复，属于合规。”",
                      "哪份文件批准了本路段？请提供批复文号、设置决定及交通组织图。",
                      "批复待提供",
                    ],
                    [
                      "“这里属于机非混行。”",
                      "允许混行，不等于本路段适合改成混行。取消原非机动车道后，如何保障骑行安全？",
                      "论证待提供",
                    ],
                    [
                      "“居民反映停车难，才画的车位。”",
                      "停车需求如何调查？是否同时考虑骑行居民的通行需求和周边停车设施？",
                      "调查待提供",
                    ],
                    [
                      "“网上公示过，会继续向上反馈。”",
                      "公告具体在哪里？反馈由谁处理、何时答复？请说明本路段的核查与整改安排。",
                      "具体答复待提供",
                    ],
                  ].map(([q, a, b]) => (
                    <TableRow key={q}>
                      <TableCell className="quote">{q}</TableCell>
                      <TableCell className="followup">{a}</TableCell>
                      <TableCell className="status-col">
                        <span className="red-tag">{b}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="reply-foot">
              <span>批复不能代替安全核查，“向上反馈”之后必须有具体答复。</span>
              <button className="text-link" onClick={() => setOpen(true)}>
                我也收到过回复，补充记录 <Plus size={17} />
              </button>
            </div>
          </section>
          <section className="action-grid section" id="goals">
            <div className="demands">
              <div className="section-heading">
                <h2>我们的诉求</h2>
              </div>
              {[
                [
                  "01",
                  "撤除不合理泊位，恢复非机动车道",
                  "保障连续、安全的骑行空间，避免非机动车被迫绕入车流。",
                ],
                [
                  "02",
                  "公开设置决定、图纸与公告",
                  "明确谁作出决定，依据什么标准，何时履行公告程序。",
                ],
                [
                  "03",
                  "开展高峰现场核查，治理违法停车",
                  "现场测量通行空间、核查安全风险，并明确整改措施与安排。",
                ],
              ].map(([n, t, d]) => (
                <article key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </article>
              ))}
            </div>
            <aside className="contribution">
              <Paperclip size={42} strokeWidth={1.6} />
              <h2>
                你拍到的，
                <br />
                你收到的，
                <br />
                <span>都可以补充进来。</span>
              </h2>
              <p>
                现场照片、视频、投诉回复、公示文件，
                <br />
                或者一段真实经历。
              </p>
              <button className="primary" onClick={() => setOpen(true)}>
                补充居民反馈 <Plus size={20} />
              </button>
              <small>
                附件必须上传 · 提交后立即公开展示
                <br />
                本页提交不代替向政府部门正式投诉。
              </small>
            </aside>
          </section>
          <section id="departments" className="section departments">
            <div className="section-heading">
              <h2>
                谁决定，谁解释；<span>谁承办，谁落实。</span>
              </h2>
              <p>
                先明确事项与职责
                <br />
                具体决定机关以文件为准
              </p>
            </div>
            <div className="dept-grid">
              {[
                [
                  "昌平交通支队",
                  "泊位与交通组织",
                  "请说明泊位设置及车道调整依据，开展通行安全核查，处理违法停车。",
                  "公开办公电话：010-69742193",
                ],
                [
                  "昌平区交通局",
                  "停车项目情况",
                  "居民称该单位参与回访。请明确是否组织本次项目，以及方案与实施单位。",
                  "本项目具体角色待核实",
                ],
                [
                  "东小口镇政府",
                  "需求与属地协调",
                  "请说明是否组织停车需求调查、居民意见征集及现场协调。",
                  "实际参与事项待核实",
                ],
                [
                  "相关发改部门",
                  "项目批复范围",
                  "请核实回访所称批复的发文机关、批准事项及是否涉及该路段调整。",
                  "尚未取得所称批复",
                ],
              ].map(([t, b, d, f]) => (
                <article key={t}>
                  <span className="dept-label">{b}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                  <small>{f}</small>
                </article>
              ))}
            </div>
            <p className="section-note">
              昌平交通支队与昌平区交通局为不同单位。回访人员不等于审批负责人；尚无材料确认具体审批人员。
            </p>
          </section>
          <section className="section evidence" id="evidence">
            <div className="section-heading">
              <h2>
                有依据地问，<span>拿出文件来答。</span>
              </h2>
              <p>
                法规与公开信息可点击查阅
                <br />
                具体路段是否合规仍需结合现场与文件
              </p>
            </div>
            <div className="legal-lead">
              <span>关键依据</span>
              <div>
                <h3>设置道路停车泊位，应优先保障步行、非机动车、公共交通。</h3>
                <p>
                  《北京市机动车停车条例》第36条还要求，结合交通运行等情况及时调整或者取消已有道路停车泊位。
                </p>
              </div>
              <a
                href={sources[0].url}
                target="_blank"
                rel="noreferrer"
                aria-label="查阅北京市机动车停车条例"
              >
                <ArrowUpRight size={28} />
              </a>
            </div>
            <div className="source-grid">
              {sources.map((s) => (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="source-card"
                  key={s.title}
                >
                  <FileText size={21} />
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <small>{s.org}</small>
                  </div>
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </div>
            <div className="missing-evidence">
              <h3>目前仍缺少的关键材料</h3>
              <div>
                <span>原非机动车道照片</span>
                <span>施划后现场视频</span>
                <span>泊位设置决定</span>
                <span>交通组织图</span>
                <span>公告原文</span>
                <span>正式办理回复</span>
              </div>
              <button className="text-link" onClick={() => setOpen(true)}>
                我有相关材料 <Plus size={17} />
              </button>
            </div>
          </section>
          <section className="section updates" id="updates">
            <div className="section-heading">
              <h2>
                居民反馈，<span>继续补充。</span>
              </h2>
              <button className="text-link" onClick={refresh}>
                刷新提交记录 <ArrowRight size={17} />
              </button>
            </div>
            <div className="progress-requests">
              {[
                [
                  "现场核查",
                  "请组织早晚高峰实测，说明非机动车实际通行空间。",
                  "本站尚未取得核查结果",
                ],
                [
                  "设置依据",
                  "请公开本路段设置决定、交通组织图及适用标准。",
                  "本站尚未取得决定原件",
                ],
                [
                  "公告程序",
                  "请提供公告原文、网址与实施前的发布时间。",
                  "本站尚未取得公告原文",
                ],
                [
                  "整改安排",
                  "请明确承办单位、处理措施与预计完成时间。",
                  "本站尚未取得整改安排",
                ],
              ].map(([t, d, status]) => (
                <article key={t}>
                  <h3>{t}</h3>
                  <small>{status}</small>
                  <p>{d}</p>
                </article>
              ))}
            </div>
            <div className="updates-grid">
              <article className="current-status">
                <span className="red-kicker">当前掌握的情况</span>
                <h3>
                  安全问题不能在回访中空转。
                  <br />
                  请给出核查结果与整改安排。
                </h3>
                <p>
                  本页尚未取得原始批复、公示原文及现场视频。已有材料来源为居民提供的聊天记录与公开法规。
                </p>
                <small>
                  资料核对截至 2026.09.06
                  <br />
                  官方自动监测尚未接入，新提交记录每分钟刷新。
                </small>
              </article>
              <div className="inbox">
                <h3>本页新收材料</h3>
                <p>提交成功后立即公开，以图片或视频为主图，连同文字说明一并展示。</p>
                {loadError ? (
                  <div className="notice">暂时无法读取，请稍后刷新。</div>
                ) : items.length ? (
                  <div className="latest-materials">
                    {items.slice(0, 6).map((i) => {
                      const cover = i.files?.[0];
                      return (
                        <article className="latest-material" key={i.id}>
                          <div className="latest-media">
                            {cover?.type.startsWith("image/") ? (
                              <img src={cover.url} alt={i.title} loading="lazy" />
                            ) : cover?.type.startsWith("video/") ? (
                              <video src={cover.url} controls preload="metadata" playsInline />
                            ) : (
                              <a href={cover?.url} target="_blank" rel="noreferrer">
                                <FileText size={30} />
                                查看附件
                              </a>
                            )}
                          </div>
                          <div className="latest-copy">
                            <span className="red-kicker">新收材料 · 未经独立核实</span>
                            <h4>{i.title}</h4>
                            <p>{i.content}</p>
                            <small>
                              {i.location || "位置未注明"} · {i.file_count} 个附件 · {new Date(i.created_at).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}
                            </small>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-material">
                    <Upload size={26} />
                    <span>暂未收到通过本页提交的材料。</span>
                    <button onClick={() => setOpen(true)} className="text-link">
                      提交第一份记录 <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <a href="#" className="brand">
          建材路<span>· 居民反馈</span>
        </a>
        <p>
          居民反馈专题 · 非政府官方网站
          <br />
          涉及本路段的具体事实，持续接受补充与更正。
        </p>
        <a href="/review" className="text-link">
          材料审核
        </a>
        <button onClick={() => setOpen(true)} className="text-link">
          提交补充 / 更正 <ArrowUpRight size={16} />
        </button>
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
          <DialogTitle>补充你的现场记录或办理回复。</DialogTitle>
          <DialogDescription>
            上传至少一个附件并填写说明，提交成功后将立即公开展示。
          </DialogDescription>
          {receipt ? (
            <div className="success">
              <Check size={36} />
              <h3>材料已公开展示</h3>
              <p>已进入“新收材料”和现场材料墙。请保存编号，后续补充时注明。</p>
              <code>{receipt}</code>
              <Button
                onClick={() => {
                  setOpen(false);
                  window.location.hash = "wall";
                }}
              >
                查看已展示材料
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="submission-form">
              <label>
                材料标题
                <input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="例如：建材路东段早高峰骑行情况"
                />
              </label>
              <div className="form-row">
                <label>
                  发生或拍摄日期
                  <input type="date" name="eventDate" />
                </label>
                <label>
                  具体位置
                  <input
                    name="location"
                    maxLength={200}
                    placeholder="路口 / 小区门口 / 行驶方向"
                  />
                </label>
              </div>
              <label>
                情况说明
                <textarea
                  name="content"
                  required
                  minLength={5}
                  maxLength={10000}
                  rows={4}
                  placeholder="请写下亲眼看到的情况，或注明消息来源。时间不确定可直接说明。"
                />
              </label>
              <label className="upload-zone">
                <Upload size={23} />
                <strong>点击选择附件（必填）</strong>
                <span>
                  图片、视频、录音、PDF、Word、TXT
                  <br />
                  至少1个，最多5个，总计不超过20MB
                </span>
                <input
                  type="file"
                  required
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.heic,.mp4,.mov,.mp3,.m4a,.wav,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    setFiles(Array.from(e.target.files || []));
                    setMessage("");
                  }}
                />
              </label>
              {files.length > 0 && (
                <ul className="file-list">
                  {files.map((f, i) => (
                    <li key={i}>
                      <Paperclip size={14} />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        aria-label={"移除" + f.name}
                        onClick={() =>
                          setFiles(files.filter((_, j) => i !== j))
                        }
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
                请先遮挡不必要的个人信息。请勿提交与道路问题无关的个人信息。本站收存材料不等于已向政府部门提交投诉。
              </p>
              {message && (
                <p role="alert" className="error">
                  {message}
                </p>
              )}
              <Button
                className="submit-button"
                disabled={busy || files.length < 1 || !publicConsent}
                type="submit"
              >
                {busy ? "正在上传，请勿关闭…" : "提交并公开展示"}
                <ArrowUpRight size={17} />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
