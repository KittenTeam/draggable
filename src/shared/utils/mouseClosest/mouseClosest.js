import {getRect} from 'shared/utils';
/**
 *
 * @param {x:number, y:number|null} position current position of cursor
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 *
 */
export default function mouseClosest(position, draggableElements, isInForeignObject = false) {
  if (!position) {
    return null;
  }
  let element = null;
  let minDis = Infinity;

  function getDistance(el) {
    const {left, top, height, width} = getRect(el, isInForeignObject);
    return Math.pow(position.x - left - width / 2, 2) + Math.pow(position.y - top - height / 2, 2);
  }

  draggableElements.forEach((_element) => {
    const dis = getDistance(_element);
    if (dis < minDis) {
      minDis = dis;
      element = _element;
    }
  });

  return element;
}
