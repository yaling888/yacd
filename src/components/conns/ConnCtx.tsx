import * as React from 'react';

const ref = {
  hasProcessPath: false,
  hasRuleGroup: false,
};

export const MutableConnRefCtx = React.createContext(ref);
