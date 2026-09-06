"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  AlertTriangle,
  EyeOff,
  Bike,
  ShieldAlert,
  Car,
  Scale,
  Quote,
  MessageCircleQuestion,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Calendar,
  MapPin,
} from "lucide-react";

interface VoiceItem {
  id: string;
  tag: string;
  title: string;
  perspective: string;
  content: string;
  author: string;
  identity: string;
  keywords: string[];
  icon: any;
}

const VOICES: VoiceItem[] = [
  {
    id: 'safety-kids',
    tag: '通行安全 · 骑行被逼抢道',
    title: '非机动车道被占满，逼得孩子每天跟大货车和公交抢道',
    perspective: '每日骑车接送孩子的家长',
    content: '每天早晚高峰骑电动车送小孩上学，原本属于非机动车的专属车道现在全停满了机动车。我们骑车的被硬生生挤到机动车主道上，身边大客车、泥头车呼啸而过，稍有刮擦后果不堪设想！这几个车位确实方便了停小汽车，但谁来对路上成百上千孩子和老人的生命安全负责？',
    author: '陈女士',
    identity: '周边小学就读家长 · 每日双向骑行',
    keywords: ['#被逼走机动车道', '#儿童老人安全隐患', '#还路于慢行'],
    icon: Bike,
  },
  {
    id: 'procedure-notice',
    tag: '程序合规 · 涉嫌先斩后奏',
    title: '未见任何法定形式公示，一夜之间突击划线',
    perspective: '居住12年的老住户',
    content: '按照《道路交通安全法》及北京市相关规定，改动道路慢行系统、施划路侧机动车停放泊位，必须提前进行必要性与安全性论证，并在现场张贴公告听取利害关系人意见。我们在这里住了十几年，没见过网前公示，没见过现场告示牌，早上一出门线就全划完了！这种完全绕开公众参与的做法，程序正当性何在？',
    author: '张先生',
    identity: '建材城东里老业主 · 业委会成员',
    keywords: ['#未经合法公示', '#剥夺居民知情权', '#程序违法违规'],
    icon: Scale,
  },
  {
    id: 'vision-blindspot',
    tag: '视线盲区 · 路口鬼探头',
    title: '路口停满SUV和商务车，推婴儿车过斑马线如开盲盒',
    perspective: '常推婴儿车出行的老人与家长',
    content: '很多高大的SUV、MPV直接贴着人行道和路口停车，把左右两侧的行车视线遮挡得严严实实。推着婴儿车走到路口根本看不见拐弯来车，每次都得把车头先探出去一米多冒险看路，‘鬼探头’险象环生！这不是简单的停车位，这是在主干道路口人为制造高危视觉盲区！',
    author: '刘阿姨',
    identity: '常推婴儿车老人 · 附近小区居民',
    keywords: ['#致命视线盲区', '#斑马线路口被挡', '#鬼探头险象环生'],
    icon: EyeOff,
  },
  {
    id: 'traffic-congestion',
    tag: '交通拥堵 · 倒车别死整条路',
    title: '早晚高峰一把方向倒不进去，整条路经常被别死十几分钟',
    perspective: '沿街便民商户与通勤骑手',
    content: '建材路本来就是连接几个大社区的核心动脉，上下班本来车就多。划了路侧泊位后，经常有新手司机在路中间反复倒车、揉库，后方车辆瞬间排成长龙，喇叭声震耳欲聋。非机动车被迫在人行道缝隙里乱窜，商铺门口装卸货进出也全是摩擦，整条街的通行秩序被搞得一团糟！',
    author: '赵店长',
    identity: '沿街商户店主 · 外卖取餐点',
    keywords: ['#加剧早晚拥堵', '#反复揉库倒车别路', '#通行秩序瘫痪'],
    icon: AlertTriangle,
  },
  {
    id: 'car-owner-view',
    tag: '车主理性视角 · 饮鸩止渴',
    title: '靠牺牲主路安全换几十个车位，根本解决不了缺口还激化矛盾',
    perspective: '持车业主 · 同样有停车需求',
    content: '我自己天天开车上下班，也非常清楚老旧小区停车确实难。但这几十个路侧车位对于整个片区成百上千辆的缺口而言，根本就是杯水车薪！为了解决这零星几十辆车的停放，牺牲整条干道的通行安全和几万行人的路权，不仅解决不了停车难，反而人为制造了开车与骑车人的尖锐对立，完全是本末倒置。',
    author: '王先生',
    identity: '持车业主 · 每日驾车通勤',
    keywords: ['#治标不治本', '#杯水车薪', '#激化邻里矛盾'],
    icon: Car,
  },
  {
    id: 'policy-violation',
    tag: '城市规划 · 逆向倒退',
    title: '公然违背北京市“慢行优先”总体战略，开历史倒车',
    perspective: '交通规划关注者 · 法律从业邻居',
    content: '北京市近年来多次出台城市交通发展专项规划，三令五申‘以人为本、慢行优先、绿色出行’，明确严禁随意压缩非机动车道宽度设置机动车泊位。建材路原本是回天地区慢行系统的重要一环，这一划不仅把路权强行拱手让给汽车，更是公然背离市级重大交通战略导向，必须严肃复核并彻底纠偏！',
    author: '孙女士',
    identity: '法务工作者 · 城市慢行倡导者',
    keywords: ['#违背慢行优先战略', '#侵害法定通行路权', '#依法纠偏撤销'],
    icon: ShieldAlert,
  },
];

export function Participation({
  onUpload,
  refreshKey = 0,
  latestSubmittedId = "",
}: {
  onUpload: () => void;
  refreshKey?: number;
  latestSubmittedId?: string;
}) {
  const [wall, setWall] = useState<any[]>([]);
  const [wallError, setWallError] = useState(false);
  const [lightbox, setLightbox] = useState<{
    item: any;
    activeFileIndex: number;
  } | null>(null);

  async function refreshWall() {
    try {
      const r = await fetch("/api/evidence");
      if (!r.ok) throw Error();
      setWall((await r.json()).items);
      setWallError(false);
    } catch {
      setWallError(true);
    }
  }

  useEffect(() => {
    refreshWall();
    const timer = setInterval(refreshWall, 30000);
    return () => clearInterval(timer);
  }, [refreshKey]);

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
      {/* 居民心声 / 真实多视角反馈（替代原投票） */}
      <section className="section voices-section" id="voices">
        <div
          id="vote"
          style={{ position: "relative", top: "-50px", visibility: "hidden" }}
        />
        <div className="section-heading">
          <h2>
            车位怎么划，<span>听听现场居民怎么说。</span>
          </h2>
          <p>多重视角 · 真实心声 · 关乎每天的通行安全与路权</p>
        </div>

        <div className="voice-grid">
          {VOICES.map((v) => {
            const Icon = v.icon;
            return (
              <article className="voice-card" key={v.id}>
                <div>
                  <div className="voice-header">
                    <span className="voice-tag">{v.tag}</span>
                    <Icon size={20} className="voice-icon" />
                  </div>
                  <h3 className="voice-title">{v.title}</h3>
                  <div className="voice-quote-wrapper">
                    <Quote size={20} className="voice-quote-mark" />
                    <p className="voice-quote">{v.content}</p>
                  </div>
                </div>

                <div className="voice-footer">
                  <div className="voice-author">
                    <div className="voice-avatar">{v.author.slice(0, 1)}</div>
                    <div className="voice-author-info">
                      <span className="voice-author-name">
                        {v.author} <small>({v.perspective})</small>
                      </span>
                      <span className="voice-author-desc">{v.identity}</span>
                    </div>
                  </div>
                  <div className="voice-keywords">
                    {v.keywords.map((k, i) => (
                      <span className="voice-kw" key={i}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* 底部号召行动条 */}
        <div className="voice-callout">
          <div className="voice-callout-text">
            <div className="voice-callout-title">
              <MessageCircleQuestion size={22} />
              <h4>您在建材路也遇到通行困扰或掌握第一手现场情况吗？</h4>
            </div>
            <p>
              我们收集来自骑行者、行人、商户及车主的真实遭遇。欢迎提供您的观点、现场照片、行车记录仪或回复记录。
            </p>
          </div>
          <button onClick={onUpload} className="primary voice-callout-btn">
            提交我的现场经历 / 上传材料 <Plus size={18} />
          </button>
        </div>
      </section>

      {/* 现场材料证据瀑布流展示模块 */}
      <section className="section photo-wall" id="wall">
        <div className="section-heading wall-section-heading">
          <div>
            <div className="live-status-pill">
              <span className="live-dot" /> 居民直接提交 · 免审秒通公示 · 实时展示
            </div>
            <h2>
              现场什么样，<span>证据瀑布流直接展示。</span>
            </h2>
            <p>真实还原建材路通行、划线及安全现状 · 所有照片与影像实时可见</p>
          </div>
          <div className="wall-header-actions">
            <span className="wall-count-badge">
              已展示 <strong>{wall.length}</strong> 份现场证据
            </span>
            <button onClick={onUpload} className="primary">
              上传附件并展示 <Plus size={18} />
            </button>
          </div>
        </div>
        <p className="section-note">
          居民提交后免审秒通直接展示。附件必须上传；发布者须先遮挡手机号、人脸、车牌、住址等隐私信息。页面展示不等同于本站已独立核实全部事实，请勿据此认定个人责任。
        </p>

        {wallError ? (
          <p className="notice">证据瀑布流暂时无法更新，请稍后刷新。</p>
        ) : null}

        {wall.length ? (
          <div className="masonry-wall-container">
            {wall.map((item) => {
              const isHighlighted = item.id === latestSubmittedId;
              const imageFiles = (item.files || []).filter((f: any) =>
                f.type.startsWith("image/")
              );
              const otherFiles = (item.files || []).filter(
                (f: any) => !f.type.startsWith("image/")
              );
              const primaryFile = item.files?.[0];

              return (
                <article
                  className={`wall-card ${
                    isHighlighted ? "wall-card-highlighted" : ""
                  }`}
                  key={item.id}
                  id={`wall-${item.id}`}
                >
                  {/* 多媒体瀑布流展示 */}
                  {primaryFile ? (
                    primaryFile.type.startsWith("image/") ? (
                      <div className="wall-masonry-media-wrap">
                        <div
                          className="wall-masonry-media"
                          onClick={() =>
                            setLightbox({ item, activeFileIndex: 0 })
                          }
                          title="点击全屏浏览大图"
                        >
                          <img
                            src={primaryFile.url}
                            alt={item.title}
                            loading="lazy"
                            className="wall-masonry-img"
                          />
                          <div className="wall-media-hover-overlay">
                            <Maximize2 size={16} /> 点击大图浏览
                          </div>
                          {imageFiles.length > 1 && (
                            <span className="wall-badge-pill">
                              <ImageIcon size={12} /> 共 {imageFiles.length} 张图片
                            </span>
                          )}
                        </div>

                        {/* 多张图片时的缩略图条 */}
                        {imageFiles.length > 1 && (
                          <div className="wall-sub-thumbnails">
                            {imageFiles.map((f: any, fIdx: number) => (
                              <div
                                key={fIdx}
                                className={`sub-thumb-item ${
                                  fIdx === 0 ? "active" : ""
                                }`}
                                onClick={() =>
                                  setLightbox({ item, activeFileIndex: fIdx })
                                }
                                title={`查看第 ${fIdx + 1} 张图片`}
                              >
                                <img src={f.url} alt={f.name} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : primaryFile.type.startsWith("video/") ? (
                      <div className="wall-media video-wall-media">
                        <video
                          controls
                          preload="metadata"
                          playsInline
                          src={primaryFile.url}
                        />
                      </div>
                    ) : (
                      <div className="wall-text-icon">
                        <FileText size={38} />
                        <a
                          href={primaryFile.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          查看附件：{primaryFile.name}
                        </a>
                      </div>
                    )
                  ) : null}

                  <div className="wall-card-body">
                    <div className="wall-card-meta-top">
                      <span className="auto-pass-pill">
                        <CheckCircle2 size={12} /> 免审秒通 · 实时公开
                      </span>
                      <time className="wall-card-time">
                        {formatTimeAgo(item.created_at)}
                      </time>
                    </div>

                    <h3 className="wall-card-title">{item.title}</h3>
                    <p className="wall-description">{item.content}</p>

                    <div className="wall-card-meta-bottom">
                      <span className="meta-chip">
                        <MapPin size={13} /> {item.location || "位置未注明"}
                      </span>
                      <span className="meta-chip">
                        <Calendar size={13} />{" "}
                        {item.event_date
                          ? `拍摄于 ${item.event_date}`
                          : "拍摄时间未注"}
                      </span>
                    </div>

                    {otherFiles.length > 0 && (
                      <div className="wall-attachments">
                        <span className="attachments-title">附带文件：</span>
                        {otherFiles.map((f: any, i: number) => (
                          <a
                            href={f.url}
                            key={i}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={12} /> {f.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : !wallError ? (
          <div className="wall-empty">
            <h3>等待第一份居民现场证据。</h3>
            <p>
              提交至少一个现场图片、行车记录仪、录音或文件，免审秒通直接在此处瀑布流呈现。
            </p>
            <button onClick={onUpload} className="text-link">
              提交第一份证据 <Plus size={18} />
            </button>
          </div>
        ) : null}
      </section>

      {/* 大图灯箱浏览组件 */}
      {lightbox && (
        <div
          className="lightbox-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
        >
          <div className="lightbox-header">
            <div className="lightbox-title-wrap">
              <span className="lightbox-title">{lightbox.item.title}</span>
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

            {lightbox.item.files[lightbox.activeFileIndex]?.type?.startsWith(
              "video/"
            ) ? (
              <video
                controls
                autoPlay
                className="lightbox-media"
                src={lightbox.item.files[lightbox.activeFileIndex].url}
              />
            ) : (
              <img
                src={lightbox.item.files[lightbox.activeFileIndex]?.url}
                alt={lightbox.item.title}
                className="lightbox-media"
              />
            )}

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
                {lightbox.item.files.map((f: any, idx: number) => (
                  <div
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
