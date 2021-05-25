import assert from 'assert'
import LineString from 'ol/geom/Linestring.js'
import Point from 'ol/geom/Point.js'
import olt from '../../lib/ol/index.js'
import { expect } from 'chai'

describe('getGeomMaxGeohash函数', () => {
  it('point', () => {
    let pt = new Point([1,1])
    let code = olt.getGeomMaxGeohash(pt)
    expect(code).to.be.equal('s00twy01mt')
  })

  it('LineString', () => {
    let pt = new LineString([[1,1], [1, 2]])
    let code = olt.getGeomMaxGeohash(pt)
    expect(code).to.be.equal('s0')
  })
})