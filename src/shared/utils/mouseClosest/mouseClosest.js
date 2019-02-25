
/**
 * 
 * @param {x:number, y:number|null} position current position of cursor
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 * 
 */
export default function mouse_closest(position, draggableElements) {
  if (!position) { return; }
  let element = null;
  let min_dis = Infinity;

  const getDistance = (el) => {
    const { left, top } = el.getBoundingClientRect();
    return (Math.abs(position.x - left) + Math.abs(position.y - top));
  }

  draggableElements.forEach((_element) => {
    const dis = getDistance(_element);
    if (dis < min_dis) {
      min_dis = dis;
      element = _element;
    }
  });

  return element;
}