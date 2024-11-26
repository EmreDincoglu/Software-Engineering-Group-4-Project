import React from 'react';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';

// Given a birthdate, calculates an age as of today 
export function calculate_age(birthdate){
    let years = moment(Date.now()).diff(moment(new Date(birthdate)), 'years');
    return Math.floor(years);
}

// Wraps a component to have search params from the url
export const withParams = WrappedComponent => props => {
    // eslint-disable-next-line
    const [searchParams, setSearchParams] = useSearchParams();

    return (<WrappedComponent {...props} params={searchParams} setParams={setSearchParams}/>);
};

// Component to call a method during rendering without react complaining
export class MethodCaller extends React.Component{
    constructor(props){
        super(props);
        (this.props.method??(()=>{}))();
    }
    render(){return <></>;}
}