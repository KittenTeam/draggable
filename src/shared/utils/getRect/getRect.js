/**
 *
 * @param {x:number, y:number|null} position current position of cursor
 * @param {'x' | 'y'} guidesDirection guides direction, x or y
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 *
 */
// 修复在 foreignobject 中的问题，会影响到鼠标位置以及 getClientBoundingRect
export default function getRect(ele, isInForeignObject = false) {
  if (isInForeignObject) {
    const ratioScale = window.devicePixelRatio;
    const rect = ele.getBoundingClientRect();
    return {
      x: rect.x / ratioScale,
      y: rect.y / ratioScale,
      width: rect.width / ratioScale,
      height: rect.height / ratioScale,
      top: rect.top / ratioScale,
      right: rect.right / ratioScale,
      bottom: rect.bottom / ratioScale,
      left: rect.left / ratioScale,
    };
  }
  return ele.getBoundingClientRect();
}
