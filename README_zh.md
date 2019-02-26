
## 目录
- [简介](#简介)
- [功能与用法](#功能与用法)
- [已知问题](#已知问题)
- [需求与bug提交](#需求与bug提交)
- [开发指南](#开发指南)

## 简介

这是一个在开源项目[@shopify/draggable](https://github.com/Shopify/draggable)的基础上，添加和定制了一些功能（以达到产品经理要求）的拖拽插件。
相对于此前kitten中使用的dragula/react-draggable，其优势主要有：
- 便捷地获得排序前后的index
- 拖动到边缘时自动滚动容器
- 不影响被绑定拖拽对象的focus功能
- 限制拖动范围功能

## 功能与用法

### 主要定制功能

至fork时，原始版本为`v1.0.0-beta.8`。还是半成品，连index.d.ts都还有小问题。可在原版readme中找到其功能介绍。
本版本从`v1.0.0`开始。从原始版本新增的功能如下：

**限制镜像移动范围**

镜像即拖拽时随鼠标移动的dom实例。原始库中，可限制镜像的移动范围为x或y方向。
为了拓展该功能，在Mirror插件下增加`dragInContainer`参数，可传入string作为selector，或直接传入HTMLElement作为限制范围，且可手动设置范围的padding，在不限制鼠标移动范围的同时将镜像的移动限制在矩形区域中。

**在源容器外实现排序**

在原版（及大多数开源拖拽/排序插件）中，当鼠标移动到源容器外后，镜像可继续跟随移动，但目标位置无法改变。
因此在draggable的初始化设置中增加参数`dragInSourceOnly`，当该项被设置为true时，认为被拖拽对象只应在源容器中被排序，即不会出现跨容器排列的情况。在该情境下，即使鼠标在源容器外，依然判断及更新最近的目标位置，实现鼠标位置在全屏皆可排序的目的。
此外，原版的scrollable插件中，计算被滚动容器的方式为“通过鼠标当前target向其父级查找可滚动对象”，要滚动源容器，只有将鼠标悬浮在源容器内最边缘有overflow的元素才能达到。为了与全屏排序功能保持一致，更新了滚动事件触发的条件及被滚动容器的计算方式。在scrollable的设置下增加`onlyScrollIn`参数，可传入string作为selector或直接传入HTMLElement，用于指定被滚动容器。将被滚动容器指定为源容器即可实现全屏都能排序+滚动的功能。

**兼容性**

更改了原版中Object.values的应用使之支持到chrome 49。

### 安装

通过yarn安装

```
yarn add @cmao/draggable
```

### 官方demo

1. 打包当前插件
```
yarn
```
该操作将在 examples/ 下生成 package/ 目录，作为demo的依赖。

2. 转到对应demo目录
```
cd examples
```

3. 安装依赖
```
yarn
```

4. 运行demo
```
yarn start
```
具体demo及控制地址可从控制台信息中获得。

### 项目中的用法示例

以react为例，在componentWillMount这个生命周期初始化插件：

```javascript
componentWillMount() {
  const sortable = new Sortable(ref_of_source_container, {
    draggable: '.class_name_of_draggable_elements',
    delay: 300,
    dragInSourceOnly: true,
    mirror: {
      constrainDimensions: true,
      dragInContainer: {
        dragIn: '#id_of_drag_area',
        padding: 15,
      },
    },
    scrollable: {
      onlyScrollIn: '#id_of_scrollable_area',
    },
  });

  sortable.on('sortable:stop', (e:SortableStopEvent) => {
    do_sort(e.oldIndex, e.newIndex);
  });
}
```

**说明**

- Mirror, Scrollable为draggable自带插件，但Sortable为扩展功能，因此需要初始化Sortable实例。
- 此处主要演示常用及新添加参数。详细参数见：
  - [Draggable](src/Draggable/README.md)
  - [Sortable](src/Sortable/README.md)

## 已知问题

**开始拖拽事件的判定问题**

目前可以在初始化时为插件设置延迟，即鼠标按下到进入拖拽状态的等待时间。延迟时间默认为100ms。该时间若设置过短，点击立即触发拖拽，则可拖拽对象上的功能按钮会失效；若设置过长，用户体验极差。
可能的解决方案：
- 更改开始拖拽事件的判定：点击 -> 按住后的首次移动
- 允许在可拖拽对象上设置不触发拖拽事件的范围

**拖动时的滚动/排序问题**

由全屏排序/滚动带来的问题。当指定被滚动容器为源容器，且鼠标悬停在源容器一侧滚动时，目标位置不会被更新，必须在鼠标移动之后才会更新。原因是更新目标位置的事件被绑定在`drag:move`事件里。
可能的解决方案：
- 将更新目标位置的事件同时绑定给scroll事件（同时避免重复触发）
- 将更新目标位置的事件单独提出，触发条件为鼠标与容器的相对位置改变（大概是想想而已）

**排序过渡问题**

在目标位置改变时，其他可拖拽对象的位置改变是即时的，没有过渡动画。

**兼容性问题**

为了在保持拓展性的同时保持兼容，需添加polyfill。

## 需求与bug提交

``提交到 Phabricator的Ponder中，并通知相关人员。``

## 开发指南

### 测试

每次提交之前，都需要运行

1. 代码规范测试
```
yarn lint --fix
```
后缀`--fix`会自动修正简单的空格问题。

2. 保证新增的功能不破坏原有功能的单元测试
```
yarn test
```
目前测试用例只有原库自带的基础功能部分。

### 发布

1. 更新 package.json 中的版本号，并在版本号修改的提交加上附注tag以标明对应版本号，可以使用
```
npm version major|minor|patch
```

2. 将版本号的修改提交与tag推入远端

3. 通知发版负责人进行发版（如没有权限，请直接钉钉联系绿豆）