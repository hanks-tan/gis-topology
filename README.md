gis-topology

这是一个gis前端的空间拓扑分析库

# 功能

## utils模块

### 1、坐标比对方法

  1) isEqualCoord

  2) compareCoord

  3) coordsIsEqualGeoHash

# 运行测试
## 处理ol

由于ol是采用的是esm语法导入导出，不能在node中直接导入。
根据node新版本功能，按以下方法解决，将node知道模块使用的是esm语法。
1、进入node_modules/ol目录,修改package.json文件
2、在顶级属性中添加,"type": "module"
修改前
```json
{
  ...
  "version": "6.5.0"
}
```

修改后
```json
{
  ...
  "version": "6.5.0",
  "type": "module",
}
```