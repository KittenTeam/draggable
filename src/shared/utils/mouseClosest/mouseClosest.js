/**
 *
 * @param {x:number, y:number|null} position current position of cursor
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 *
 */
export default function mouseClosest(position, draggableElements) {
  if (!position) {
    return null;
  }
  let element = null;
  let minDis = Infinity;

  function getDistance(el) {
    const {left, top} = el.getBoundingClientRect();
    return Math.abs(position.x - left) + Math.abs(position.y - top);
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
