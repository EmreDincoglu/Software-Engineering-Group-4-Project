import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Wraps a component to have search params from the url
export const withParams = WrappedComponent => props => {
    // eslint-disable-next-line
    const [searchParams, setSearchParams] = useSearchParams();

    return (<WrappedComponent {...props} params={searchParams} setParams={setSearchParams}/>);
};
export const withNavigate = WrappedComponent => props => {
    const navigate = useNavigate();
    return <WrappedComponent {...props} navigate={navigate}/>;
};

// Component to call a method during rendering without react complaining
export class MethodCaller extends React.Component{
    constructor(props){
        super(props);
        (this.props.method??(()=>{}))();
    }
    render(){return <></>;}
}