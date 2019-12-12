import {mouseClosest} from 'shared/utils';
/**
 *
 * @param {x:number, y:number|null} position current position of cursor
 * @param {'x' | 'y'} guidesDirection guides direction, x or y
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 *
 */
export default function guidesTargetIndex(position, guidesDirection, allDraggableElements) {
  if (!guidesDirection || allDraggableElements.length <= 1) {
    return null;
  }
  const mouseCloseTarget = mouseClosest({x: position.x, y: position.y}, allDraggableElements);
  const mouseCloseTargetRect = mouseCloseTarget.getBoundingClientRect();
  const mouseClosestTargetIndex = allDraggableElements.indexOf(mouseCloseTarget);
  let isLastElement = false;
  if (mouseClosestTargetIndex < 0) {
    return null;
  }
  if (mouseClosestTargetIndex === allDraggableElements.length - 1) {
    isLastElement = true;
  }
  const mouseCloseTargetCentrePos =
    guidesDirection === 'y'
      ? mouseCloseTargetRect.left + mouseCloseTargetRect.width / 2
      : mouseCloseTargetRect.top + mouseCloseTargetRect.height / 2;
  const mousePos = guidesDirection === 'y' ? position.x : position.y;
  if (mousePos < mouseCloseTargetCentrePos) {
    return mouseClosestTargetIndex;
  } else if (isLastElement) {
    return mousePos > mouseCloseTargetCentrePos ? mouseClosestTargetIndex + 1 : mouseClosestTargetIndex;
  } else {
    return mouseClosestTargetIndex + 1;
  }
}
