
/**
 * 判断两个线段是否相交（解参数方程法）
 * @param {Coordinate} a 线段1起点坐标
 * @param {Coordinate} b 线段1终点坐标
 * @param {Coordinate} c 线段2起点坐标
 * @param {Coordinate} d 线段2终点坐标
 * @returns {Boolean} ture->相交；false->不相交
 */
function isIntersect(a, b, c, d) {
  let deno = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
  let mem1 = (a[1] - c[1]) * (d[0] - c[0]) - (a[0] - c[0]) * (d[1] - c[1])
  let mem2 = (a[1] - c[1]) * (b[0] - a[0]) - (a[0] - c[0]) * (b[1] - a[1])
  let r = mem1 / deno
  let s = mem2 / deno
  if (r > 1 || r < 0) return false
  if (s > 1 || s < 0) return false
  return true
}

export default {
  isIntersect
}