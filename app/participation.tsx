"use client";
import {useEffect,useState} from 'react';
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
  MessageCircleQuestion
} from 'lucide-react';

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

export function Participation({onUpload,refreshKey=0}:{onUpload:()=>void;refreshKey?:number}){
  const [wall,setWall]=useState<any[]>([]);
  const [wallError,setWallError]=useState(false);

  async function refreshWall(){
    try{
      const r=await fetch('/api/evidence');
      if(!r.ok)throw Error();
      setWall((await r.json()).items);
      setWallError(false);
    }catch{
      setWallError(true);
    }
  }

  useEffect(()=>{
    refreshWall();
    const timer=setInterval(refreshWall,30000);
    return()=>clearInterval(timer);
  },[refreshKey]);

  return (
    <>
      {/* 居民心声 / 真实多视角反馈（替代原投票） */}
      <section className="section voices-section" id="voices">
        <div id="vote" style={{position:'relative',top:'-50px',visibility:'hidden'}} />
        <div className="section-heading">
          <h2>车位怎么划，<span>听听现场居民怎么说。</span></h2>
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
                    <div className="voice-avatar">{v.author.slice(0,1)}</div>
                    <div className="voice-author-info">
                      <span className="voice-author-name">{v.author} <small>({v.perspective})</small></span>
                      <span className="voice-author-desc">{v.identity}</span>
                    </div>
                  </div>
                  <div className="voice-keywords">
                    {v.keywords.map((k,i)=>(
                      <span className="voice-kw" key={i}>{k}</span>
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
            <p>我们收集来自骑行者、行人、商户及车主的真实遭遇。欢迎提供您的观点、照片、视频或官方回复记录。</p>
          </div>
          <button onClick={onUpload} className="primary voice-callout-btn">
            提交我的现场经历 / 上传材料 <Plus size={18} />
          </button>
        </div>
      </section>

      {/* 现场材料证据墙 */}
      <section className="section photo-wall" id="wall">
        <div className="section-heading">
          <h2>现场什么样，<span>材料直接展示。</span></h2>
          <button onClick={onUpload} className="primary">上传附件并发布 <Plus size={18}/></button>
        </div>
        <p className="section-note">居民提交后直接展示。附件必须上传；发布者须先遮挡手机号、人脸、车牌、住址等个人信息。页面展示不等同于本站已独立核实全部事实，请勿据此认定个人责任。</p>
        
        {wallError ? <p className="notice">证据墙暂时无法更新，请稍后刷新。</p> : null}
        
        {wall.length ? (
          <div className="wall-grid">
            {wall.map((item) => (
              <article className="wall-card" key={item.id}>
                {item.files.length ? (
                  <div className="wall-media">
                    {item.files[0].type.startsWith('image/') ? (
                      <a href={item.files[0].url} target="_blank" rel="noreferrer">
                        <img src={item.files[0].url} alt={item.title} loading="lazy" />
                      </a>
                    ) : item.files[0].type.startsWith('video/') ? (
                      <video controls preload="metadata" playsInline src={item.files[0].url} />
                    ) : (
                      <div className="wall-text-icon">
                        <FileText size={38} />
                        <a href={item.files[0].url}>查看附件</a>
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="wall-card-body">
                  <span className="red-kicker">居民提交 · 未经独立核实</span>
                  <h3>{item.title}</h3>
                  <p className="wall-description">{item.content}</p>
                  <small>{item.location || '位置未注明'} · {item.event_date || '发生时间未注明'}</small>
                  {item.files.length > 1 && (
                    <div className="wall-attachments">
                      {item.files.slice(1).map((f: any, i: number) => (
                        <a href={f.url} key={i} target="_blank" rel="noreferrer">
                          附件 {i + 2}：{f.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <small>发布：{new Date(item.created_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</small>
                </div>
              </article>
            ))}
          </div>
        ) : !wallError ? (
          <div className="wall-empty">
            <h3>等待第一份居民现场材料。</h3>
            <p>提交至少一个图片、视频、录音或文件，发布后立即展示。</p>
            <button onClick={onUpload} className="text-link">提交并展示 <Plus size={18} /></button>
          </div>
        ) : null}
      </section>
    </>
  );
}
