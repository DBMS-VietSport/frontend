let _id = 1000;
export const nextId = (): number => ++_id;

let _guidCounter = 1;
export const nextGuid = (): string => `mock-guid-${_guidCounter++}`;
