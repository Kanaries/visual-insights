# Visual-Insights

![](https://travis-ci.org/kanaries/visual-insights.svg?branch=master)
![](https://img.shields.io/npm/v/visual-insights?color=blue)
[![Coverage Status](https://coveralls.io/repos/github/Kanaries/visual-insights/badge.svg?branch=master)](https://coveralls.io/github/Kanaries/visual-insights?branch=master)

Visual-Insights is an automated data analysis and visualization recommendation pipeline tool. It can find patterns in your datasets and choosen a efficiency way to express it with a visual design.

[Rath](https://github.com/Kanaries/Rath) is a augmented analytic and automated data analysis tools built based on `visual-insights`.


## API
![](https://camo.githubusercontent.com/48fe8a7c761aaa0102fc32e4070dec6eca7af366/68747470733a2f2f636873706163652e6f73732d636e2d686f6e676b6f6e672e616c6979756e63732e636f6d2f76697375616c2d696e7369676874732f726174682d6172632e706e67)

[Docs](https://kanaries.github.io/visual-insights/#/./API/engine)

```js
import { VIEngine } from 'visual-insights';

const vie = new VIEngine();

vie.setDataSource(dataSource);
    .setFieldKeys(keys);
```

`VIEngine` does not auto info analytic type of fields(dimension or measure), analytic types can only be controled by user through `setDimensions` and `setMeasures`


### buildFieldsSummary
VIEngine stores field informatiion, which contains
```typescript
interface IField {
    key: string;
    name?: string;
    analyticType: IAnalyticType;
    semanticType: ISemanticType;
    dataType: IDataType;
}
```

analyticType is set by `setDimensions/Measures`, while semanticType and dataType are automated infered through data.

```js
const fields = vie.buildFieldsSummary()
    .fields;
```
`buildFieldsSummary` computes fields and fieldDictonary and store them in vi engine. While those two property can be infered from each other, we still store both of them for the reason that they will be frequently used in future.

after get fields, you can get details of them in vi engine, according to which you can use to decide which of them are dimensions and measures. 
```js
vie.setDimensions(dimensions);
    .setMeasures(measures);
```

### buildGraph
```ts
vie.buildGraph();
```

+ result will be stored at vie.dataGraph.
+ you should make sure vie.(dimensions, measures, dataSource) are defined so as to use buildGraph.

### clusterFields
-> 
+ dataGraph.DClusters
+ dataGraph.MClusters


### buildCube

buildCube will build a kylin-like cube. it uses the cluster result as base cuboids which save a lot of costs.

### getCombinationFromClusterGroups

it gets the clustering result and generates combination in each cluster. It is an internal API mainly be used by buildSubspaces.

### buildSubspaces
`buildSubspaces` generate all subspaces(dimensions&measurs). VIEngine has a algorithm which reduce the size of all answer space, so you don't need to worry about it.


```ts
public buildSubspaces(
    DIMENSION_NUM_IN_VIEW: ConstRange = this.DIMENSION_NUM_IN_VIEW,
    MEASURE_NUM_IN_VIEW: ConstRange = this.MEASURE_NUM_IN_VIEW
): VIEngine

interface ConstRange {
    MAX: number;
    MIN: number;
}
```

examples
```ts
vie.buildSubspaces();
vie.buildSubspaces({ MAX: 5, MIN: 2}, {MAX: 2, MIN: 1});
```

`buildSubspaces` depends on dataGraph, so make sure `buildDataGraph` and `clusterFields` are called before you use `buildSubspaces`.

### insightExtraction

It enumerates all subspaces generated before, it checks the significance of different patterns or insights. it is a async methods, for some of the pattern checker can be run on different threads or machine.
```ts
public async insightExtraction(viewSpaces: ViewSpace[] = this.subSpaces): Promise<IInsightSpace[]>
```

```ts
vie.insightExtraction()
    .then(spaces => {
        console.log(spaces)
    })
```

### setInsightScores

insight scoring algorithm, which set final scores for item in insightSpaces.
```ts
vie.setInsightScores();
```

### specification


map a insightSpace into visual specification. it will recommanded encoding based on expressiveness and effectiveness.

```ts
public specification(insightSpace: IInsightSpace)
```




### 0.0.1 API

#### specification(dataSource, dimensions, measures): schema
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ dimensions: `string[]` collections of keys which are independent variables.
+ measures: `string[]` collections of keys which are dependent variables.

return a chart specification schema, example:
```js
{
  position: [ 'Count', 'Age(group)' ],
  'adjust&color': [ 'Parch(group)' ],
  facets: [ 'Pclass', 'Embarked' ],
  size: [ 'Survived(group)' ],
  opacity: [ 'Sex' ],
  geomType: [ 'interval' ]
}
```
You can use this schema to generate visual chart with any visualization library you prefer.

#### fieldsAnalysis(rawData, dimensions, measures): dimScores
+ rawData: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ dimensions: `string[]` collections of keys which are independent variables.
+ measures: `string[]` collections of keys which are dependent variables.

return dimension score list: `Array<[dimension, impurity, maxImpurity]>`
```js
[
  [ 'Ticket(group)', 0.31438663168300657, 2.584962500721156 ],
  [ 'Fare(group)', 0.47805966268354355, 2.321928094887362 ],
  [ 'SibSp(group)', 0.5668299600894294, 2.321928094887362 ],
  [ 'Cabin(group)', 0.8964522768552765, 2.584962500721156 ],
  [ 'Sex', 0.9362046432498521, 1 ],
  [ 'Survived(group)', 0.9607079018756469, 1 ],
  [ 'Embarked', 1.117393450740606, 2 ],
  [ 'Parch(group)', 1.1239601233166567, 2.584962500721156 ],
  [ 'Pclass', 1.4393214704441286, 1.584962500721156 ],
  [ 'Age(group)', 2.1763926737318022, 2.584962500721156 ],
  [ 'Name', 9.79928162152199, 9.799281621521923 ],
  [ 'PassengerId', 9.79928162152199, 9.799281621521923 ]
]
```

#### isFieldCategory(dataSource, field): boolean
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`

#### isFieldContinous(dataSource, field): boolean
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`

#### aggregate({ dataSource, fields, bys, method = 'sum' }): aggregated dataSource
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string[]`. usually known as dimensions.
+ bys: `string[]`. usually known as measures.

return aggregated dataSource, which for the `index` key is the unique key for each record.
```typescript
Array<{
  [key: string]: string | number | null;
  index: string
}>
```

example:
```js
aggregate({
  dataSource: [...],
  fields: [ 'Sex', 'Pclass' ],
  bys: [ 'Count' ],
  method: 'sum'
})

// returns.
[
  { index: '["male","3"]', Count: 347, Sex: 'male', Pclass: '3' },
  { index: '["female","1"]', Count: 94, Sex: 'female', Pclass: '1' },
  { index: '["female","3"]', Count: 144, Sex: 'female', Pclass: '3' },
  { index: '["male","1"]', Count: 122, Sex: 'male', Pclass: '1' },
  { index: '["female","2"]', Count: 76, Sex: 'female', Pclass: '2' },
  { index: '["male","2"]', Count: 108, Sex: 'male', Pclass: '2' }
]
```

#### memberCount(dataSource, field): Array<[memberName, count]>
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`

example:
```js
memberCount(dataSource, 'Sex')
// returns
[ [ 'male', 577 ], [ 'female', 314 ] ]
```

#### groupContinousField({ dataSource, field, newField, groupNumber })
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`
+ newField: `string`
+ groupNumber: number (no less than 1)

example of field 'Age':
```js
// ungrouped
[
  [ 22, 27 ],  [ 38, 11 ],  [ 26, 18 ],  [ 35, 18 ],  [ 0, 177 ],
  [ 54, 8 ],   [ 2, 10 ],   [ 27, 18 ],  [ 14, 6 ],   [ 4, 10 ],
  [ 58, 5 ],   [ 20, 15 ],  [ 39, 14 ],  [ 55, 2 ],   [ 31, 17 ],
  [ 34, 15 ],  [ 15, 5 ],   [ 28, 25 ],  [ 8, 4 ],    [ 19, 25 ],
  [ 40, 13 ],  [ 66, 1 ],   [ 42, 13 ],  [ 21, 24 ],  [ 18, 26 ],
  [ 3, 6 ],    [ 7, 3 ],    [ 49, 6 ],   [ 29, 20 ],  [ 65, 3 ],
  [ 28.5, 2 ], [ 5, 4 ],    [ 11, 4 ],   [ 45, 12 ],  [ 17, 13 ],
  [ 32, 18 ],  [ 16, 17 ],  [ 25, 23 ],  [ 0.83, 2 ], [ 30, 25 ],
  [ 33, 15 ],  [ 23, 15 ],  [ 24, 30 ],  [ 46, 3 ],   [ 59, 2 ],
  [ 71, 2 ],   [ 37, 6 ],   [ 47, 9 ],   [ 14.5, 1 ], [ 70.5, 1 ],
  [ 32.5, 2 ], [ 12, 1 ],   [ 9, 8 ],    [ 36.5, 1 ], [ 51, 7 ],
  [ 55.5, 1 ], [ 40.5, 2 ], [ 44, 9 ],   [ 1, 7 ],    [ 61, 3 ],
  [ 56, 4 ],   [ 50, 10 ],  [ 36, 22 ],  [ 45.5, 2 ], [ 20.5, 1 ],
  [ 62, 4 ],   [ 41, 6 ],   [ 52, 6 ],   [ 63, 2 ],   [ 23.5, 1 ],
  [ 0.92, 1 ], [ 43, 5 ],   [ 60, 4 ],   [ 10, 2 ],   [ 64, 2 ],
  [ 13, 2 ],   [ 48, 9 ],   [ 0.75, 2 ], [ 53, 1 ],   [ 57, 2 ],
  [ 80, 1 ],   [ 70, 2 ],   [ 24.5, 1 ], [ 6, 3 ],    [ 0.67, 1 ],
  [ 30.5, 2 ], [ 0.42, 1 ], [ 34.5, 1 ], [ 74, 1 ]
]
// grouped with a group number = 6
[
  [ '[13.333333333333334, 26.666666666666668)', 248 ],
  [ '[26.666666666666668, 40)', 232 ],
  [ '[-Infinity, 13.333333333333334)', 248 ],
  [ '[53.333333333333336, 66.66666666666667)', 43 ],
  [ '[40, 53.333333333333336)', 113 ],
  [ '[66.66666666666667, Infinity)', 7 ]
]
```

#### groupCategoryField({ dataSource, field, newField, groupNumber })
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`
+ newField: `string`
+ groupNumber: number (no less than 1)

example of field 'Parch':
```js
// ungrouped
[
  [ 0, 678 ],
  [ 1, 118 ],
  [ 2, 80 ],
  [ 5, 5 ],
  [ 3, 5 ],
  [ 4, 4 ],
  [ 6, 1 ]
]

// grouped
[ [ 0, 678 ], [ 1, 118 ], [ 2, 80 ], [ 'others', 15 ] ]
```
#### normalize(frequencyList: number[]): number[]
```js
frequencyList => probabilityList
```

#### isUniformDistribution(dataSource, field): boolean
+ dataSource: `Array<{ [key: string]: string | number | null }>` json style format dataset.
+ field: `string`

### Impurity Measures

+ entropy(probabilityList: number[]): number
+ gini(probabilityList: number[]): number

