gis-topology

这是一个gis前端的空间拓扑分析库

# 安装使用
## 安装

```cmd
npm i gis-topology
```
# API

## utils模块

### 1、坐标比对方法

  1) isEqualCoord   
  判断是否是相同的坐标

  2) compareCoord  
  对比两个坐标，返回一个布尔值。方法接受一个容差值，当两个坐标直接差距小于容差，则返回真；否则返回假

  3) coordsIsEqualGeoHash  
  判断两对坐标是否具有相同的geohash编码
  
  4) isEqualCoordList  
  判断两组坐标是否完全相等

## relation模块
  1) isIntersect  
  判断两个线是否相交

## ol模块
  这个模块是对openlayers的空间运算的扩展, 方法的输入以openlayers中的feature和geometry对象为主  

  1) getGeomMaxGeohash  
  获取geometry对象的最大外接geohashBox

  2) getLineNodes  
  获取线的所有节点坐标  

  3) getLineBoundPoint  
  获取线的端点

  4) isEqualLine  
  判断两条线是否相同

  5) pointsGroupByHash  
  将点集合按geohash编码分组

  6) testRepeatPointByHash  
  检查重复点，基于geohash，编码相同的点被视为重复点

  7) testRepeatLineSlow  
  检查重复线（数据量少时可以用）

  8) testRepeatLine  
  检查重复线

  9) testSingleLineIntersect  
  检查两个单线是否交叉(交点经过线上节点的情况除外)

  10) testLineIntersectMultiLine  
  判断单线和多线是否相交

  11) testLineIntersect  
  判断两个线是否相交

  12) testCrossesLines  
  检查相交线（效率较高）

  13) groupPointByGeohash  
  将坐标进行geohash编码，并存储到一个Map对象里

  14) testPointsNotTouchLineNodes  


  15) testShortLines

