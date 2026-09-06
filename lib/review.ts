/**
 * @deprecated 改用 lib/access.ts — isReviewer 现在是异步，调用点已更新
 * 本文件保留 re-export 以兼容老调用方
 */
export { crossSite, isReviewer, reviewerEmail } from './access'