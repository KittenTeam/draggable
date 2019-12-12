import AbstractEvent from 'shared/AbstractEvent';

/**
 * Base guides event
 * @class GuidesEvent
 * @module GuidesEvent
 * @extends AbstractEvent
 */
export class GuidesEvent extends AbstractEvent {
  /**
   * Draggables source element
   * @property source
   * @type {HTMLElement}
   * @readonly
   */
  get source() {
    return this.data.source;
  }

  /**
   * Draggables original source element
   * @property originalSource
   * @type {HTMLElement}
   * @readonly
   */
  get originalSource() {
    return this.data.originalSource;
  }

  /**
   * Draggables source container element
   * @property sourceContainer
   * @type {HTMLElement}
   * @readonly
   */
  get sourceContainer() {
    return this.data.sourceContainer;
  }

  /**
   * Sensor event
   * @property sensorEvent
   * @type {SensorEvent}
   * @readonly
   */
  get sensorEvent() {
    return this.data.sensorEvent;
  }

  /**
   * Drag event
   * @property dragEvent
   * @type {DragEvent}
   * @readonly
   */
  get dragEvent() {
    return this.data.dragEvent;
  }

  /**
   * Original event that triggered sensor event
   * @property originalEvent
   * @type {Event}
   * @readonly
   */
  get originalEvent() {
    if (this.sensorEvent) {
      return this.sensorEvent.originalEvent;
    }

    return null;
  }
}

/**
 * Guides create event
 * @class GuidesCreateEvent
 * @module GuidesCreateEvent
 * @extends GuidesEvent
 */
export class GuidesCreateEvent extends GuidesEvent {
  static type = 'guides:create';
}

/**
 * Guides created event
 * @class GuidesCreatedEvent
 * @module GuidesCreatedEvent
 * @extends GuidesEvent
 */
export class GuidesCreatedEvent extends GuidesEvent {
  static type = 'guides:created';

  /**
   * Draggables guides element
   * @property guides
   * @type {HTMLElement}
   * @readonly
   */
  get guides() {
    return this.data.guides;
  }
}

/**
 * Guides attached event
 * @class GuidesAttachedEvent
 * @module GuidesAttachedEvent
 * @extends GuidesEvent
 */
export class GuidesAttachedEvent extends GuidesEvent {
  static type = 'guides:attached';

  /**
   * Draggables guides element
   * @property guides
   * @type {HTMLElement}
   * @readonly
   */
  get guides() {
    return this.data.guides;
  }
}

/**
 * Guides move event
 * @class GuidesMoveEvent
 * @module GuidesMoveEvent
 * @extends GuidesEvent
 */
export class GuidesMoveEvent extends GuidesEvent {
  static type = 'guides:move';
  static cancelable = true;

  /**
   * Draggables guides element
   * @property guides
   * @type {HTMLElement}
   * @readonly
   */
  get guides() {
    return this.data.guides;
  }
}

/**
 * Guides destroy event
 * @class GuidesDestroyEvent
 * @module GuidesDestroyEvent
 * @extends GuidesEvent
 */
export class GuidesDestroyEvent extends GuidesEvent {
  static type = 'guides:destroy';
  static cancelable = true;

  /**
   * Draggables guides element
   * @property guides
   * @type {HTMLElement}
   * @readonly
   */
  get guides() {
    return this.data.guides;
  }
}
