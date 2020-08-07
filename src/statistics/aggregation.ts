import { min, max, sum, mean } from 'simple-statistics';
import { Record } from '../commonTypes';

const SPLITOR = '_join_'
export type StatFuncName = 'sum' | 'mean' | 'max' | 'min' | 'count';
export type StatFunc = (values: number[]) => number;
const count = function (x: number[]): number {
    return x.length;
}
export const SFMapper: { [key: string]: StatFunc } = {
    sum,
    max,
    mean,
    min,
    count
}
export function getAggregator (op: StatFuncName) {
    const func = SFMapper[op] || sum;
    return func;
}
export interface ISimpleAggregateProps {
    dataSource: Record[];
    dimensions: string[];
    measures: string[];
    ops: StatFuncName[];
}
export function simpleAggregate(props: ISimpleAggregateProps): Record[] {
    const { dataSource, dimensions, measures, ops } = props;
    const groups: Map<string, any[]> = new Map();
    for (let record of dataSource) {
        const key = dimensions.map(d => record[d]).join(SPLITOR);
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key).push(record);
    }
    const result: Record[] = [];
    for (let [key, group] of groups) {
        const aggs: Record = {};
        measures.forEach((mea, meaIndex) => {
            const opFunc = getAggregator(ops[meaIndex]);
            aggs[mea] = opFunc(group.map(r => r[mea]));
        })
        const dimValues = key.split(SPLITOR);
        dimensions.forEach((dim, dimIndex) => {
            aggs[dim] = dimValues[dimIndex]
        })
        result.push(aggs)
    }
    return result;
}
export interface ISTDAggregateProps {
    dataSource: Record[];
    dimensions: string[];
    measures: string[];
    ops: StatFuncName[];
}
export function stdAggregate(props: ISTDAggregateProps): Record[] {
    const { dataSource, dimensions, measures, ops } = props;
    const groups: Map<string, any[]> = new Map();
    for (let record of dataSource) {
        const key = dimensions.map((d) => record[d]).join(SPLITOR);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(record);
    }
    const result: Record[] = [];
    for (let [key, group] of groups) {
        const aggs: Record = {};
        measures.forEach((mea, meaIndex) => {
            aggs[mea] = {};
            ops.forEach(op => {
                const opFunc = getAggregator(op);
                aggs[mea][op] = opFunc(group.map((r) => r[mea]));
            })
        });
        const dimValues = key.split(SPLITOR);
        dimensions.forEach((dim, dimIndex) => {
            aggs[dim] = dimValues[dimIndex];
        });
        result.push(aggs);
    }
    return result;
}

export function stdAggregateFromCuboid(props: ISTDAggregateProps): Record[] {
    const { dataSource, dimensions, measures, ops } = props;
    const groups: Map<string, any[]> = new Map();
    for (let record of dataSource) {
        const key = dimensions.map((d) => record[d]).join(SPLITOR);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(record);
    }
    const result: Record[] = [];
    for (let [key, group] of groups) {
        const aggs: Record = {};
        measures.forEach((mea, meaIndex) => {
            aggs[mea] = {};
            // TODO: need a formal solution for distributive\algebraic\holistic aggregators.
            ops.filter(op => !(['sum', 'count', 'mean'].includes(op))).forEach((op) => {
                const opFunc = getAggregator(op);
                aggs[mea][op] = opFunc(group.map((r) => r[mea][op]));
            });
            aggs[mea]["sum"] = getAggregator("sum")(group.map((r) => r[mea]["sum"]));
            aggs[mea]["count"] = getAggregator("sum")(group.map((r) => r[mea]['count']));
            aggs[mea]["mean"] = aggs[mea]['sum'] / aggs[mea]['count'];
        });
        const dimValues = key.split(SPLITOR);
        dimensions.forEach((dim, dimIndex) => {
            aggs[dim] = dimValues[dimIndex];
        });
        result.push(aggs);
    }
    return result;
}