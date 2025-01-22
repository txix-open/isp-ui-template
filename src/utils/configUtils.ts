export const getConfigProperty = (property: string, defaultValue: any) =>
  window.config && Object.prototype.hasOwnProperty.call(window.config, property)
    ? window.config[property]
    : defaultValue
