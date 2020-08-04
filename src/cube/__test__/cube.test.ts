import { Cube } from '../index';
import { simpleAggregate } from '../../statistics/aggregation';
import fs from 'fs';
import path from 'path';
const dataset = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../test/dataset/titanic.json')).toString())
const {
    dataSource,
    config: {
        Dimensions: dimensions,
        Measures: measures
    }
} = dataset;
test('cube', () => {
    // let t0 = new Date().getTime();
    const cube = new Cube({
        dataSource,
        dimensions,
        measures,
        // ops: measures.map(() => 'sum')
    });
    // let t0 = new Date().getTime()
    cube.buildBaseCuboid();
    const Aggs1 = cube.getCuboid(['PClass', 'Sex', 'Embarked']).getState(measures, measures.map(() => 'sum'))
    const Aggs2 = cube.getCuboid(["Sex"]).getState(
        measures,
        measures.map(() => "sum")
    );
    // let t1 = new Date().getTime();
    // console.log('cube', t1 - t0)
    // t0 = new Date().getTime()
    simpleAggregate({
      dataSource,
      dimensions,
      measures,
      ops: measures.map(() => 'sum'),
    })
    const Aggs1Expected = simpleAggregate({
      dataSource,
      dimensions: ['PClass', 'Sex', 'Embarked'],
      measures,
      ops: measures.map(() => 'sum'),
    })
    const Aggs2Expected = simpleAggregate({
      dataSource,
      dimensions: ['Sex'],
      measures,
      ops: measures.map(() => 'sum'),
    })
    // t1 = new Date().getTime()
    // console.log('aggs', t1 - t0)
    expect(Aggs1.length > 0).toBe(true);
    expect(Aggs2.length > 0).toBe(true);
    expect(Aggs2.length).toBe(2);
    expect(Aggs1).toEqual(Aggs1Expected);
    expect(Aggs2).toEqual(Aggs2Expected)
})