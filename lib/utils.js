import ngh from 'ngeohash'

/**
 * 判断两个坐标点是否相同
 * @param {coordinate} coord1 
 * @param {coordinate} coord2 
 */
function isEqualCoord (coord1, coord2) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1]
}

/**
 * 对比两个坐标，返回一个布尔值
 * @param {coordinate} coord1 
 * @param {coordinate} coord2 
 * @param {Number} tolerance 
 * @returns {Boolean} 真，代表两个坐标间距小于容差；否则反之
 */
function compareCoord (coord1, coord2, tolerance) {
  let ox = coord1[0] - coord2[0]
  let oy = coord1[1] - coord2[1]
  let dis = Math.sqrt(ox * ox + oy * oy)
  return tolerance > dis
}

/**
 * 判断两个坐标点是否具有相同的geohash编码
 * @param {*} coord1 
 * @param {*} coord2 
 * @param {*} precision 默认精度为10
 */
function coordsIsEqualGeoHash (coord1, coord2, precision) {
  if(!precision) {
    precision = 10 // 精度误差大概在分米级
  }
  let key1 = ngh.encode(coord1[1], coord1[0], precision) // encode 参数是纬度在前，经度在后
  let key2 = ngh.encode(coord2[1], coord2[0], precision)
  return key1 === key2
}

/**
 * 判断两组坐标是否相等
 * @param {Array[coordinate]} coordList1 
 * @param {Array[coordinate]} coordList2 
 * @param {function} coordEqualFunc 坐标判断函数
 */
function isEqualCoordList (coordList1, coordList2, coordEqualFunc) {
  if(coordList1.length !== coordList2.length) {
    return false
  }
  let isEqual = true
  if(!coordEqualFunc) {
    coordEqualFunc = isEqualCoord
  }
  for(let i = 0; i < coordList1.length; i++) {
    isEqual = coordEqualFunc(coordList1[i], coordList2[i])
    if(!isEqual) {
      break
    }
  }
  return isEqual
}

export default {
  isEqualCoord,
  compareCoord,
  coordsIsEqualGeoHash,
  isEqualCoordList
}