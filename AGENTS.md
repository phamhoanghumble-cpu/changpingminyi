# 项目协作规范

## 文案宪法

修改本项目的公开文案、媒体材料和内容规范前，必须阅读并遵循 [CONSTITUTION.md](CONSTITUTION.md)。

禁止独白式、个人控诉式叙事。文案面向媒体与社会公众，以调查报道追查非机动车通行空间为何调整为泊位，以及决定主体、依据、程序、安全评估和整改情况；全文按“事情经过、核心争议、诉求与答复、整改要求”四段组织；决定、依据、程序、安全四问作为折叠核查内容。记者视角追溯事实，法律法规视角核查权责，履职监督视角追问处理断点与整改结果；所有判断以证据为基础。

编辑旁白和工作计划同样属于禁止的独白，例如“沿着……追查”“本站将……”“先核查……”。正文只交代事实、呈现矛盾、提出要求。编辑规则保留于内部文档。

居民上传入口仅保留于“诉求与答复公开台”瀑布流栏目，支持图片、视频、PDF和音频直接浏览或播放；其他板块不设置上传入口或提交引导。

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
