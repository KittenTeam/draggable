import {mouseClosest} from 'shared/utils';
import getRect from '../getRect';
/**
 *
 * @param {x:number, y:number|null} position current position of cursor
 * @param {'x' | 'y'} guidesDirection guides direction, x or y
 * @param {HTMLElement[]} draggableElements all elements that can be drag, in other word, all positions available
 *
 */
export default function guidesTarget(position, guidesDirection, allDraggableElements, isInForeignObject = false) {
  const draggableElementLength = allDraggableElements.length;
  if (!guidesDirection || allDraggableElements.length <= 1) {
    return null;
  }
  const mouseCloseTarget = mouseClosest({x: position.x, y: position.y}, allDraggableElements, isInForeignObject);
  const mouseCloseTargetRect = getRect(mouseCloseTarget, isInForeignObject);
  const isLastElement = mouseCloseTarget === allDraggableElements[draggableElementLength - 1];
  const mouseCloseTargetCentrePos =
    guidesDirection === 'y'
      ? mouseCloseTargetRect.left + mouseCloseTargetRect.width / 2
      : mouseCloseTargetRect.top + mouseCloseTargetRect.height / 2;
  const mousePos = guidesDirection === 'y' ? position.x : position.y;
  if (mousePos < mouseCloseTargetCentrePos) {
    return {nextTarget: mouseCloseTarget, isLastElement};
  } else if (isLastElement) {
    return mousePos > mouseCloseTargetCentrePos
      ? {nextTarget: null, isLastElement}
      : {nextTarget: mouseCloseTarget, isLastElement};
  } else {
    return {nextTarget: mouseCloseTarget.nextElementSibling, isLastElement};
  }
}
