import { sanitizeNodeText } from '../../../../shared/helpers.mjs';

const createShape = (template) => ({
  replace(marker, value) {
    if (marker === '{}') {
      const sanitized = sanitizeNodeText(value, { wrap: false });
      return template.replace('{}', sanitized);
    }
    return template.replace(marker, value);
  },
  toString() {
    return template;
  },
  valueOf() {
    return template;
  }
});

export const shapes = {
  // VTU shapes
  start: '(["start"])',
  end: '(["end"])',
  process: createShape('["{}"]'),
  decision: createShape('{"{}"}'),
  io: createShape('[/"{}"/]'),
  return: createShape('>["{}"]'),
  function: createShape('[["{}"]]')
};