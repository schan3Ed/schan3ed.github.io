import DatabaseClient from '../core/DatabaseClient'
import { message } from 'antd'
import { observer, inject } from 'mobx-react'
import React, { Component } from 'react'

@inject('errorStore')
@observer
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    async componentDidCatch(error, info) {
        // TODO: Display fallback UI
        this.setState({ hasError: true });
    
        message.error('An error occured. Please clear your cache and reload the page.')
        await this.props.errorStore.reportError(error, info.componentStack);
    }

    render() {
        return this.props.children;
    }
}