import { Record } from "../commonTypes";
import { StatFuncName, simpleAggregate, stdAggregate, stdAggregateFromCuboid } from "../statistics";
export interface ComplexRecord {
    [key: string]: {
        [key: string]: number 
    } | string | null | undefined | number | boolean
}

const DEFAULT_OPS: StatFuncName[] = ['max', 'min', 'sum', 'mean', 'count'];

interface CuboidProps {
    dimensions: string[];
    measures: string[];
    ops?: StatFuncName[];
}
export class Cuboid {
    public dimensions: string[];
    public measures: string[];
    public ops: StatFuncName[];
    private state: ComplexRecord[];
    public constructor (props: CuboidProps) {
        const { dimensions, measures, ops = DEFAULT_OPS } = props;
        this.dimensions = dimensions;
        this.measures = measures;
        this.ops = ops;
        this.state = [];
    }
    public setData(dataSource: Record[]): Record[] {
        this.state = stdAggregate({
            dimensions: this.dimensions,
            measures: this.measures,
            ops: this.ops,
            dataSource
        })
        return this.state
    }
    public computeFromCuboid(cuboid: Cuboid): Record[] {
        const { ops, measures, dimensions } = this;
        this.state = stdAggregateFromCuboid({
            dimensions, 
            measures,
            ops,
            dataSource: cuboid.getRawState()
        })
        return this.state;
    }
    public get size () {
        return this.state.length;
    }
    public getState(measures: string[], operatorOfMeasures: StatFuncName[]) {
        let data: Record[] = [];
        const { state, dimensions } = this;
        for (let row of state) {
            let newRow: Record = {};
            for (let dim of dimensions) {
                newRow[dim] = row[dim]
            }
            for (let i = 0; i < measures.length; i++) {
                const mea = measures[i];
                const op = operatorOfMeasures[i];
                newRow[mea] = row[mea][op];
            }
            data.push(newRow);
        }
        return data;
    }
    public getRawState() {
        return this.state;
    }
}