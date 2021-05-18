import _ from 'lodash'
import ngeohash from 'ngeohash'
import { Feature, getUid } from 'ol'
import Geometry from 'ol/geom/Geometry'
import {
  Point,
  LineString,
  MultiLineString,
} from 'ol/geom'
import utils from '../utils'
import relation from '../relation/index'

/**
 * 简单点过滤器
 * @param {any} geom 
 * @returns 如果geom是Point,返回真；否则返回假
 */
function _simplePointFilter (geom) {
  // 过滤多点
  if(!geom || !geom.getType) {
    return false
  }
  if(geom.getType() === 'MultiPoint') {
    console.log('暂不支持MultiPoint拓扑')
    return false
  } 
  // 过滤非点类型
  if(geom.getType() !== 'Point') {
    return false
  }
  return true
}

function _lineFilter (geom) {
  // 过滤多线
  if(!geom || !geom.getType) {
    return false
  }
  // if(geom.getType() === 'MultiLineString') {
  //   console.log('暂不支持MultiLineString拓扑')
  //   return false
  // } 
  // 过滤非点类型
  if(geom.getType() !== 'LineString' && geom.getType() !== 'MultiLineString') {
    return false
  }
  return true
}

/**
 * 获取几何对象的最大外接geohash
 * @param {Geometry} geom 
 * @returns 
 */
function getGeomMaxGeohash (geom) {
  let extent = geom.getExtent()
  if (extent) {
    let p = 10
    let lb = ngeohash.encode(extent[1], extent[0], 10)
    let lt = ngeohash.encode(extent[3], extent[0], 10)
    let rb = ngeohash.encode(extent[1], extent[2], 10)
    let rt = ngeohash.encode(extent[3], extent[2], 10)
    let i = 0
    while (i < p) {
      let a = lb[i],
        b = lt[i],
        c = rb[i],
        d = rt[i]
      if (a === b && a === c && a === d) {
        i++
      } else {
        break
      }
    }
    let maxGeohash = lb.slice(0,i)
    return maxGeohash
  }
  return ''
}

/**
 * 获取线的所有节点坐标
 * @param {LineString} line 
 * @returns {Array<coordinate>} 返回节点坐标数组
 */
function getLineNodes (line) {
  let nodeList = []
  if (line instanceof LineString) {
    nodeList = line.getCoordinates()
  } else if (line instanceof MultiLineString) {
    line.getLineStrings().forEach((item) => {
      nodeList = nodeList.concat(item.getCoordinates())
    })
  }
  return nodeList
}

/**
 * 获取线的端点
 * @param {LineString || MultiLineString} line 
 * @returns {Array<coordinate>} 返回线端点（起点和终点）坐标
 */
function getLineBoundPoint (line) {
  let ExtremeList = []
  if (line instanceof LineString) {
    let coords = line.getCoordinates()
    ExtremeList.push(coords[0], coords[coords.length - 1])
  } else if (line instanceof MultiLineString) {
    line.getLineStrings().forEach((item) => {
      let coords = item.getCoordinates()
      ExtremeList.push(coords[0], coords[coords.length - 1])
    })
  }
  return ExtremeList
}


/**
 * 判断两条线是否相同
 * @param {LineString | MultiLineString} line1 
 * @param {LineString | MultiLineString} line2 
 */
function isEqualLine (line1, line2) {
  // 判断类型是否相等
  if(line1.getType() !== line1.getType()) {
    return false
  }

  // 判断长度是否相等
  if(line1.getLength() !== line2.getLength()) {
    return false
  }

  let isEqual = true
  let line1Nodes = getLineNodes(line1)
  let line2Nodes = getLineNodes(line2)
  if (line1Nodes.length > 0 && line1Nodes.length === line2Nodes.length) {
    isEqual = utils.isEqualCoordList(line1Part, line2Part)
  }
  return isEqual
}

/**
 * 将点集合按geohash编码分组
 * @param {Array<Feature>} pointFeatures 
 * @param {Number} precision 
 * @returns {Object} 返回一个对象，对象的属性为geohash编码，属性值是由feature组成的数组
 */
function pointsGroupByHash (pointFeatures, precision) {
  let groupObj = _.groupBy(pointFeatures, (item) => {
    let geom = item.getGeometry()
    let key = 'none'
    if(!_simplePointFilter(geom)) {
      return key
    }
    let coordinate = geom.getCoordinates()
    if(coordinate) {
      key = ngh.encode(coordinate[1], coordinate[0], precision)
    }
    return key
  })
  return groupObj
}

/**
 * 检查重复点
 * @param {Array<Feature>} pointFeatures 输入点集
 * @param {Number}} precision 判断为重复点的精度
 * @returns {object} 返回一个对象，按geohash对点进行分组，且过滤调分组长度为1的geohash。
 * 属性为一个geohash，值为Feature数组。当geohash精度较小时，结果误差比较大。
 */
function testRepeatPointByHash (pointFeatures, precision) {
  let result = {}
  if (pointFeatures && pointFeatures.length) {
    if(!precision) {
      precision = 12
    }
    let pointsGroup = pointsGroupByHash(pointFeatures, precision)
    delete pointsGroup.none
    result = _.pickBy(pointsGroup, (value) => {
      return value.length > 1
    })
  }
  console.log(result)
  return result
}

/**
 * 检查重复线（数据量少时可以用）
 * @param {Array<Feature>} lines 
 * @returns {object} 返回一个对象，对象的每个属性名为一个Feature的ol_uid，属性值为数组，里面包含重复的线。
 * 属性名为属性值数组中第一个Feature的ol_uid
 */
function testRepeatLineSlow (lines) {
  let result = {}

  // 保留重复点的id
  let repeatLineIds = new Set()
  
  // 两层遍历，每给对象都与它其它对象比对一次
  for(let i = 0; i < lines.length - 1; i++) {
    let line = lines[i]
    let lineID = getUid(line)
    let copy = _.slice(lines, i + 1)

    // 过滤掉已经被识别为重复线的对象
    copy = _.filter(copy, (item) => {
      let id = getUid(item)
      return ![...repeatLineIds].includes(id)
    })

    // 比对
    for (let j = 0; j < copy.length; j++) {
      let otherLine = copy[j]
      let geom1 = line.getGeometry()
      let geom2 = otherLine.getGeometry()
      if (isEqualLine(geom1, geom2)) {
        if(result[lineID]) {
          result[lineID].push(otherLine)
        } else {
          result[lineID] = [line, otherLine]
        }
        repeatLineIds.add(lineID)
        repeatLineIds.add(getUid(otherLine))
      }
    }
  }
  return result
}


/**
 * 检查重复线
 * @param {Array<Feature>} lineFeatures 
 * @returns {object} 返回一个对象，对象的每个属性名为一个Feature的ol_uid，属性值为数组，里面包含重复的线。
 * 属性名为属性值数组中第一个Feature的ol_uid。
 */
function testRepeatLine (lineFeatures) {
  let result = {}
  if(lineFeatures && lineFeatures.length) {
    // 第一次过滤，快速按出同长线、同点数、同part分组
    let groupObj = _.groupBy(lineFeatures, (item) => {
      let geom = item.getGeometry()
      let key = 'none'
      if (!_lineFilter(geom)) {
        return key
      }

      let lineStringList = geom
      if(geom.getType() === 'MultiLineString') {
        lineStringList = geom.getLineStrings()
      }
      let len = 0
      let pointCount = 0
      lineStringList.forEach((item) => {
        len += item.getLength()
        pointCount += item.getCoordinates().length
      })
      let part = lineStringList.length
      return `${part}-${pointCount}-${len}`
    })

    delete groupObj.none

    // 过滤分组结果
    let firstResult = _.pickBy(groupObj, (value) => {
      return value.length > 1
    })

    // 二次过滤
    _.forEach(firstResult, (equalLenFeatureList) => {
      let r = checkDuplicateLine(equalLenFeatureList)
      result = Object.assign(result, r)
    })
  }
  return result
}

/**
 * 检查两个单线是否交叉(交叉点经过节点的不算交叉)
 * @param {LineString} line1 
 * @param {LineString} line2 
 * @returns {Boolean} ture ->相交；false->不相交
 */
function testSingleLineIntersect (line1, line2) {
  if (!(line1 instanceof LineString) || !(line2 instanceof LineString)) return false

  let line1Nodes = getLineNodes(line1)
  let line2Nodes = getLineNodes(line2)
  
  if (!line1Nodes.length === 0 || line2Nodes.length === 0) {
    return false
  }
  for(let i = 0; i < line1Nodes.length - 1; i++) {
    let l1a = line1Nodes[i]
    let l1b = line1Nodes[i + 1]
    for(let j = 0; j < line2Nodes.length - 1; j++) {
      let l2a = line2Nodes[i]
      let l2b = line2Nodes[i + 1]
      if (relation.intersect(l1a, l1b, l2a, l2b)) {
        return true
      }
    }
  }
  return false
}

/**
 * 判断单线和多线是否相交
 * @param {LineString} singleLine 
 * @param {MultiLineString} multiLine 
 * @returns {Boolean} ture ->相交；false->不相交
 */
function testLineIntersectMultiLine(singleLine, multiLine) {
  if (singleLine instanceof LineString && multiLine instanceof MultiLineString) {
    let lines = multiLine.getLineStrings()
    for (let i = 0; i < lines.length; i++) {
      let sLine = lines[i]
      let r = testSingleLineIntersect(singleLine, sLine)
      if (r) {
        return true
      }
    }
  }
  return false
}

/**
 * 判断两个线是否相交
 * @param {LineString || MultiLineString} line1 
 * @param {LineString || MultiLineString} line2 
 * @returns {Boolean} ture ->相交；false->不相交
 */
function testLineIntersect(line1, line2) {
  if (line1 instanceof LineString && line2 instanceof LineString) {
    return testSingleLineIntersect(line1, line2)
  } else if (line1 instanceof LineString && line2 instanceof MultiLineString) {
    return testLineIntersectMultiLine(line1, line2)
  } else if (line1 instanceof MultiLineString && line1 instanceof LineString) {
    return testLineIntersectMultiLine(line2, line1)
  } else if (line1 instanceof MultiLineString && line2 instanceof MultiLineString) {
    let lines = line1.getLineStrings()
    for (let i = 0; i < lines.length; i++) {
      let sLine = lines[i]
      let r = testLineIntersectMultiLine(sLine, line2)
      if (r) {
        return true
      }
    }
    return false
  } else {
    return false
  }
}

/**
 * 检查相交线（效率较高）
 * @param {Array<Feature>} lineFeatures 
 * @returns {Array<Array<Feature, Feature>>}返回相交的线对
 */
function testCrossesLines (lineFeatures) {
  let obj = {}
  let format = new GeoJSON()
  
  // 1.编码，分组
  lineFeatures.forEach((ft) => {
    let maxGeohash = getGeomMaxGeohash(ft.getGeometry())
    if (obj[maxGeohash]) {
      obj[maxGeohash].push(ft)
    } else {
      obj[maxGeohash] = [ft]
    }
  })

  // 2.根据分组，判断
  let result = []

  Object.keys(obj).forEach((key) => {
    let lines = obj[key]
    for(let i = 0; i < lines.length; i++) {
      let line1 = lines[i].getGeometry()

      // 检查子
      Object.keys(obj).forEach((otherKey) => {
        if (otherKey === key) {
          return
        }
        if (otherKey.startsWith(key)) {
          let otherLines = obj[otherKey]
          otherLines.forEach((other) => {
            let line2 = other.getGeometry()
            if (testLineIntersect(line1, line2)) {
              result.push([line1, line2])
            }
          })
        }
        k++
      })
      
      if (lines.length < 2 || i === lines.length - 1) {
        return
      }
      
      // 检查兄弟
      for(let j = i + 1; j < lines.length; j++) {
        let line2 = lines[j].getGeometry()
        if (testLineIntersect(line1, line2)) {
          result.push([line1, line2])
        }
        k++
      }
    }
  })
  return result
}

/**
 * 将点按geohash编码分组
 * @param {import('ol/coordinate').Coordinate} coord 
 * @param {Map} map ES6 Map实例
 */
function groupPointByGeohash (coord, map) {
  let geohash = ngh.encode(coord[1], coord[0], 12)
  if (map.get(geohash)) {
    map.get(geohash).push(coord)
  } else {
    map.set(geohash, [coord])
  }
}
/**
   * 孤立管点检查（判断条件,没有和任何管线端点(不包含线中间的节点)连接）
   * @param {*} points 
   * @param {*} lineFeatures 
   */
function _testIsolatedPoint (points, lineFeatures, getLinePointFunc) {
  let linePoints = new Map() // 所有线的端点
  if (lineFeatures && lineFeatures.length > 0) {
    // 获取所有端点
    lineFeatures.forEach((item) => {
      let line = item.getGeometry()
      let extremePoints = getLinePointFunc(line)
      extremePoints.forEach((item) => {
        groupPointByGeohash(item, linePoints)
      })
    })
  }
  if (linePoints.size === 0) {
    // 所有的都孤立
    return points
  }
  let isolatedPoints = points.filter((p) => {
    let geom = p.getGeometry()
    if (!geom instanceof Point) {
      return
    }
    let coord = geom.getCoordinates()
    let geohash = ngh.encode(coord[1], coord[0], 12) // 精度要与上面保持一直
    // 编码不存在则一定是孤立点
    if (!linePoints.get(geohash)) {
      return true
    } else {
      let allPointsSameCode = linePoints.get(geohash)
      // 存在坐标相同的，则非孤立点;反之是孤立点
      let r = allPointsSameCode.some((p) => {
        return isEqualCoord(p, coord)
      })
      return !r
    }
  })
  console.log('孤立点', isolatedPoints)
  return isolatedPoints
}

/**
 * 检查孤立的点（条件：点不再任何线的顶点上）
 * @param {*} points 
 * @param {*} lines 
 * @returns 
 */
function testPointsNotTouchLineNodes(points, lines) {
  return _testIsolatedPoint(points, lines, getLineNodes)
}

/**
 * 检查孤立的点(条件：点不在任何线的起点和终点上)
 * @param {*} points 
 * @param {*} lines 
 * @returns 
 */
function testPointsNotTouchLineBound(points, lines) {
  return _testIsolatedPoint(points, lines, getLineBoundPoint)
}





export default {
  getGeomMaxGeohash,
  getLineNodes,
  getLineBoundPoint,
  isEqualLine,
  pointsGroupByHash,
  testRepeatPointByHash,
  testRepeatLineSlow,
  testRepeatLine,
  testSingleLineIntersect,
  testLineIntersectMultiLine,
  testLineIntersect,
  testCrossesLines,
  testPointsNotTouchLineNodes,
  testPointsNotTouchLineBound
}