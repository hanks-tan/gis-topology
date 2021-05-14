var assert = require('assert')
var gtl = require('../index')

describe('isEqualCoord函数', function() {
  var isEqualCoord = gtl.utils.isEqualCoord
  it('不相等测试', function() {
    let coord1 = [1, 1]
    let coord2 = [1, 2]
    let r = isEqualCoord(coord1, coord2)
    assert.ok(r === false, '')
  })
  it('相等测试', function() {
    let coord1 = [1, 1]
    let coord2 = [1, 1]
    let r = isEqualCoord(coord1, coord2)
    assert.ok(r === true, '')
  })
  it('精度测试', function() {
    let coord1 = [1.23231223222, 1.23231223222]
    let coord2 = [1.23231223222, 1.23231223222]
    let r = isEqualCoord(coord1, coord2)
    assert.ok(r === true, '')
  })
  it('精度不相等测试', function() {
    let coord1 = [1.23231223222, 1.23231223222]
    let coord2 = [1.23231223221, 1.23231223222]
    let r = isEqualCoord(coord1, coord2)
    assert.ok(r === false, '')
  })
})

describe('compareCoord函数', function() {
  var compareCoord = gtl.utils.compareCoord
  it('容差值测试', function() {
    let coord1 = [1.1, 1.2]
    let coord2 = [1.1, 1.1] 
    // dis = 0.1
    let r = compareCoord(coord1, coord2, 1)
    assert.ok(r === true, '容差值大于未通过')
    r = compareCoord(coord1, coord2, 0.01)
    assert.ok(r === false, '容差值小于未通过')
    r = compareCoord(coord1, coord2, 0.01)
    assert.ok(r === false, '容差值等于未通过')
  })
  it('相等测试', function() {
    let coord1 = [1.1111111111111, 1.0000000001]
    let coord2 = [1.1111111111112, 1.0000000001]
    let dis = coord1[0] - 1.111111111111
    let r = compareCoord(coord1, coord2, dis * 10)
    assert.ok(r === true, '')
    r = compareCoord(coord1, coord2, dis / 10)
    assert.ok(r === false, '')
  })
})