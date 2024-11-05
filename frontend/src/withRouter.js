import React from 'react';
import { useSearchParams } from 'react-router-dom';

const withRouter = WrappedComponent => props => {
  const [searchParams, _] = useSearchParams();

  return (
    <WrappedComponent
      {...props}
      params={searchParams}
    />
  );
};

export default withRouter;