gis-topology

这是一个gis前端的空间拓扑分析库

# 安装使用
## 安装

```cmd
npm i gis-topology
```
## 使用

```cmd
import gt from 'gis-topology'
```
# 功能

## utils模块

### 1、坐标比对方法

  1) isEqualCoord 
  判断是否是相同的坐标

  2) compareCoord 
  对比两个坐标，返回一个布尔值。方法接受一个容差值，当两个坐标直接差距小于容差，则返回真；否则返回假

  3) coordsIsEqualGeoHash 
  判断两对坐标是否具有相同的geohash编码
  
  4) coordsIsEqualGeoHash
  判断两组坐标是否完全相等