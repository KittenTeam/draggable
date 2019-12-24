/* eslint-disable prefer-rest-params */
/* eslint-disable consistent-this */
import AbstractPlugin from 'shared/AbstractPlugin';
import {mouseClosest, guidesTargetIndex, getRect} from 'shared/utils';

import {
  GuidesCreateEvent,
  GuidesCreatedEvent,
  GuidesAttachedEvent,
  GuidesMoveEvent,
  GuidesDestroyEvent,
} from './GuidesEvent';

export const onDragStart = Symbol('onDragStart');
export const onDragMove = Symbol('onDragMove');
export const onDragStop = Symbol('onDragStop');
export const onGuidesCreated = Symbol('onGuidesCreated');
export const onGuidesMove = Symbol('onGuidesMove');
export const getAppendableContainer = Symbol('getAppendableContainer');

/**
 * Guides default options
 * @property {Object} defaultOptions
 * @property {'x' | 'y'} defaultOptions.guideDir
 * @type {Object}
 */
export const defaultOptions = {
  guidesDir: 'x',
};

/**
 * Guides plugin which controls the guides positioning while dragging
 * @class Guides
 * @module Guides
 * @extends AbstractPlugin
 */
export default class Guides extends AbstractPlugin {
  /**
   * Guides constructor.
   * @constructs Guides
   * @param {Draggable} draggable - Draggable instance
   */
  constructor(draggable) {
    super(draggable);

    /**
     * Guides options
     * @property {Object} options
     * @property {'x' | 'y'} options.guidesDir
     * @type {Object}
     */
    this.options = {
      ...defaultOptions,
      ...this.getOptions(),
    };

    this[onDragStart] = this[onDragStart].bind(this);
    this[onDragMove] = this[onDragMove].bind(this);
    this[onDragStop] = this[onDragStop].bind(this);
    this[onGuidesCreated] = this[onGuidesCreated].bind(this);
    this[onGuidesMove] = this[onGuidesMove].bind(this);
  }

  /**
   * Attaches plugins event listeners
   */
  attach() {
    this.throttleGuidesMove = throttle(this[onGuidesMove], 20);
    this.draggable
      .on('drag:start', this[onDragStart])
      .on('drag:move', this[onDragMove])
      .on('drag:stop', this[onDragStop])
      .on('guides:created', this[onGuidesCreated])
      .on('guides:move', this.throttleGuidesMove);
  }

  /**
   * Detaches plugins event listeners
   */
  detach() {
    this.draggable
      .off('drag:start', this[onDragStart])
      .off('drag:move', this[onDragMove])
      .off('drag:stop', this[onDragStop])
      .off('guides:created', this[onGuidesCreated])
      .off('guides:move', this.throttleGuidesMove);
  }

  /**
   * Returns options passed through draggable
   * @return {Object}
   */
  getOptions() {
    return this.draggable.options.guides || {};
  }

  [onDragStart](dragEvent) {
    if (dragEvent.canceled()) {
      return;
    }

    const {source, originalSource, sourceContainer, sensorEvent} = dragEvent;

    const guidesCreateEvent = new GuidesCreateEvent({
      source,
      originalSource,
      sourceContainer,
      sensorEvent,
      dragEvent,
    });

    this.draggable.trigger(guidesCreateEvent);

    if (isNativeDragEvent(sensorEvent) || guidesCreateEvent.canceled()) {
      return;
    }

    this.guides = document.createElement('div');
    this.guides.style.top = 0;
    this.guides.style.left = 0;
    this.guides.style.margin = 0;
    this.guides.style.display = 'none';
    this.guides.style.position = 'fixed';
    this.guides.style.pointerEvents = 'none';

    if (this.options.guidesDir === 'y') {
      this.guides.style.height = `${this.options.height || source.clientHeight}px`;
    } else {
      this.guides.style.width = `${this.options.width || source.clientWidth}px`;
    }

    const guidesCreatedEvent = new GuidesCreatedEvent({
      source,
      originalSource,
      sourceContainer,
      sensorEvent,
      dragEvent,
      guides: this.guides,
    });

    const guidesAttachedEvent = new GuidesAttachedEvent({
      source,
      originalSource,
      sourceContainer,
      sensorEvent,
      dragEvent,
      guides: this.guides,
    });

    this.draggable.trigger(guidesCreatedEvent);
    document.body.appendChild(this.guides);
    this.draggable.trigger(guidesAttachedEvent);
  }

  [onDragMove](dragEvent) {
    if (!this.guides || dragEvent.canceled()) {
      return;
    }

    const {source, originalSource, sourceContainer, sensorEvent} = dragEvent;

    const guidesMoveEvent = new GuidesMoveEvent({
      source,
      originalSource,
      sourceContainer,
      sensorEvent,
      dragEvent,
      guides: this.guides,
    });

    this.draggable.trigger(guidesMoveEvent);
  }

  [onDragStop](dragEvent) {
    if (!this.guides) {
      return;
    }

    const {source, sourceContainer, sensorEvent} = dragEvent;

    const guidesDestroyEvent = new GuidesDestroyEvent({
      source,
      guides: this.guides,
      sourceContainer,
      sensorEvent,
      dragEvent,
    });

    this.draggable.trigger(guidesDestroyEvent);

    if (!guidesDestroyEvent.canceled()) {
      this.guides.parentNode.removeChild(this.guides);
    }
  }

  [onGuidesCreated]({guides}) {
    const guidesClass =
      this.options.guidesDir === 'x'
        ? this.draggable.getClassNameFor('guidesX')
        : this.draggable.getClassNameFor('guidesY');
    guides.classList.add(guidesClass);
  }

  /**
   * Guides move handler
   * @param {GuidesMoveEvent} guidesEvent
   * @return {Promise|null}
   * @private
   */
  [onGuidesMove](guidesEvent) {
    if (guidesEvent.canceled()) {
      return null;
    }

    const initialState = {
      guides: guidesEvent.guides,
      source: guidesEvent.source,
      sensorEvent: guidesEvent.sensorEvent,
      options: this.options,
      scrollInElement: this.draggable.onlyScrollInElement,
      draggableElements: this.draggable.getDraggableElements(),
    };

    return Promise.resolve(initialState).then(
      positionGuides({
        raf: true,
      }),
    );
  }
}

/**
 * Positions guides with translate3d
 * @param {Object} state
 * @param {HTMLElement} state.guides
 * @param {HTMLElement} state.source
 * @param {SensorEvent} state.sensorEvent
 * @param {Object} state.options
 * @return {Promise}
 * @private
 */
function positionGuides({withFrame = false} = {}) {
  return ({guides, source, sensorEvent, scrollInElement, options, draggableElements, ...args}) => {
    return withPromise(
      (resolve) => {
        const result = {
          guides,
          sensorEvent,
          options,
          ...args,
        };
        if (!options.guidesDir) {
          return;
        }

        const x = sensorEvent.clientX;
        const y = sensorEvent.clientY;

        const sourceElementRect = getRect(source, options.isInForeignObject);
        const allDraggableElements = draggableElements;
        const guidesDir = options.guidesDir;
        // 设定滚动元素 container
        const container = scrollInElement ? scrollInElement : source.parentNode;
        if (!container) {
          return;
        }
        const containerRect = getRect(container, options.isInForeignObject);
        const padding = options.padding || 0;

        const newTargetIndex = guidesTargetIndex(
          {
            x,
            y,
          },
          guidesDir,
          allDraggableElements,
          options.isInForeignObject,
        );
        if (newTargetIndex === null) {
          return;
        }
        let guidesXpos = sourceElementRect.left;
        let guidesYpos = sourceElementRect.top;
        if (guidesDir === 'x') {
          // 用于垂直方向排序，显示水平参考线,水平参考线宽度默认为被拖拽元素的宽度,根据 index 设置参考线位置
          if (options.width) {
            guidesXpos = sourceElementRect.left + (sourceElementRect.width - options.width) / 2;
          }
          if (newTargetIndex < allDraggableElements.length) {
            guidesYpos = getRect(allDraggableElements[newTargetIndex], options.isInForeignObject).top;
          } else {
            const lastEleRect = getRect(allDraggableElements[newTargetIndex - 1], options.isInForeignObject);
            guidesYpos = lastEleRect.top + lastEleRect.height + padding;
            if (guidesYpos > getRect(source.parentNode, options.isInForeignObject).bottom) {
              guidesYpos -= padding;
            }
          }
          // 当参考线位置高于滑动元素时，向上滑动，低于滑动元素时，向下滑动
          if (guidesYpos < containerRect.top + 50) {
            const distance = containerRect.top - guidesYpos + sourceElementRect.height;
            container.scrollTop -= distance > 10 ? 10 : distance;
          } else if (guidesYpos > containerRect.bottom - 60) {
            const distance = guidesYpos + sourceElementRect.height * 2 - containerRect.bottom;
            container.scrollTop += distance > 10 ? 10 : distance;
          }
          if (guidesYpos < containerRect.top || guidesYpos > containerRect.bottom + 10) {
            return;
          }
          guidesYpos -= guides.clientHeight / 2 + padding;
        } else {
          const guidesPos = getGuidesXYPosition(
            {
              x,
              y,
              padding,
            },
            newTargetIndex,
            allDraggableElements,
          );
          guidesXpos = guidesPos.guidesXpos;
          guidesYpos = guidesPos.guidesYpos;
          if (guidesYpos < containerRect.top + 30) {
            const distance = containerRect.top - guidesYpos + sourceElementRect.height;
            // smoothScroll(container, -(containerRect.top - guidesYpos + sourceElementRect.height));
            container.scrollTop -= distance > 10 ? 10 : distance;
          } else if (guidesYpos + sourceElementRect.height > containerRect.bottom) {
            const distance = guidesYpos + sourceElementRect.height * 2 - containerRect.bottom;
            // smoothScroll(container, guidesYpos + sourceElementRect.height * 2 - containerRect.bottom);
            container.scrollTop += distance > 10 ? 10 : distance;
          }
          if (guidesYpos < containerRect.top || guidesYpos + sourceElementRect.height > containerRect.bottom) {
            return;
          }
          guidesXpos -= guides.clientWidth / 2 + padding;
        }
        guides.style.display = 'block';
        guides.style.transform = `translate3d(${guidesXpos}px, ${guidesYpos}px, 0)`;
        resolve(result);
      },
      {
        frame: withFrame,
      },
    );
  };
}

// 鼠标位置在最左侧但目标元素在下一行
function isSpecialPosition(newTargetIndex, mouseClosestTargetIndex, allDraggableElements) {
  return (
    newTargetIndex > 0 &&
    newTargetIndex < allDraggableElements.length &&
    newTargetIndex !== mouseClosestTargetIndex &&
    allDraggableElements[newTargetIndex - 1].getBoundingClientRect().top !==
      allDraggableElements[newTargetIndex].getBoundingClientRect().top
  );
}

/**
 * Wraps functions in promise with potential animation frame option
 * @param {Function} callback
 * @param {Object} options
 * @param {Boolean} options.raf
 * @return {Promise}
 * @private
 */
function withPromise(callback, {raf = false} = {}) {
  return new Promise((resolve, reject) => {
    if (raf) {
      requestAnimationFrame(() => {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}

/**
 * Returns true if the sensor event was triggered by a native browser drag event
 * @param {SensorEvent} sensorEvent
 */
function isNativeDragEvent(sensorEvent) {
  return /^drag/.test(sensorEvent.originalEvent.type);
}

// 用于棋盘式布局，显示垂直的参考线, 需要计算离鼠标最近的元素，判断参考线位置
function getGuidesXYPosition(position, newTargetIndex, allDraggableElements) {
  const mouseCloseTarget = mouseClosest(
    {
      x: position.x,
      y: position.y,
    },
    allDraggableElements,
  );
  const mouseClosestTargetIndex = allDraggableElements.indexOf(mouseCloseTarget);
  const mouseCloseTargetRect = mouseCloseTarget.getBoundingClientRect();
  let guidesXpos;
  let guidesYpos;
  if (newTargetIndex < allDraggableElements.length) {
    guidesXpos = allDraggableElements[newTargetIndex].getBoundingClientRect().left;
    guidesYpos = allDraggableElements[newTargetIndex].getBoundingClientRect().top;
  } else {
    guidesXpos = allDraggableElements[newTargetIndex - 1].getBoundingClientRect().right + position.padding * 2;
    guidesYpos = allDraggableElements[newTargetIndex - 1].getBoundingClientRect().top;
  }
  if (isSpecialPosition(newTargetIndex, mouseClosestTargetIndex, allDraggableElements)) {
    guidesYpos = mouseCloseTargetRect.top;
    guidesXpos = mouseCloseTargetRect.right + position.padding * 2;
  }
  return {
    guidesXpos,
    guidesYpos,
  };
}

function throttle(fn, wait) {
  const callback = fn;
  let timerId = null;
  // 是否是第一次执行
  let firstInvoke = true;
  function throttled() {
    // eslint-disable-next-line consistent-this
    // eslint-disable-next-line babel/no-invalid-this
    const context = this;
    const args = arguments;
    // 如果是第一次触发，直接执行
    if (firstInvoke) {
      callback.apply(context, args);
      firstInvoke = false;
      return;
    }
    // 如果定时器已存在，直接返回。
    if (timerId) {
      return;
    }
    timerId = setTimeout(() => {
      // 注意这里 将 clearTimeout 放到 内部来执行了
      clearTimeout(timerId);
      timerId = null;
      callback.apply(context, args);
    }, wait);
  }
  // 返回一个闭包
  return throttled;
}
