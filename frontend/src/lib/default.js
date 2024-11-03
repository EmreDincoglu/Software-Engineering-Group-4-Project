import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Wraps a component to have search params from the url
export const withRouter = WrappedComponent => props => {
    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();

    return (<WrappedComponent {...props} params={searchParams}/>);
};