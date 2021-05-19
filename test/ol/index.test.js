import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import chai from 'chai'
import assert from 'assert'

let expect = chai.expect;

describe('ol导入测试', () => {
  it('测试导入成', () => {
    let point = new Feature({
      geometry: new Point([1,1])
    })
    assert.ok(point instanceof Feature, '')
  })
})