import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const EventName = {
    onSubmitBroadcastMessage: 'onSubmitBroadcastMessage',
    // onChangeBroadcastMessage: 'onChangeBroadcastMessage',
    onStopAll: 'onStopAll',
    onResetAll: 'onResetAll',
} as const
