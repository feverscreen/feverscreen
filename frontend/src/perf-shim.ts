const p = {
  mark: (arg: string) => {},
  measure: (arg0: string, arg1: string, arg2: string) => {},
  now: () => {}
};
export const performance = process ? p : window.performance;
