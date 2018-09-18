import React, { Component } from 'react'
import MUIButton from '@material-ui/core/Button';
import { LoadingSpinnerButton } from '../LoadingSpinner'

export default class Button extends Component {
    constructor(props) {
        super(props);
        this.state = { pending: false};
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    render() {
        let {onClick, disabled = false, ...other} = this.props;
        // Modify onClick
        if (onClick) {
            let newOnClick = async (...args) => {
                try {
                    this.setState({pending: true});
                    //await this.sleep(1000);
                    await onClick(...args);
                }
                finally {
                    this.setState({pending: false});
                }
            }
            return (
                <MUIButton disabled={this.state.pending || disabled} onClick={newOnClick} {...other}>
                    {(this.state.pending ? LoadingSpinnerButton() : this.props.children)}
                </MUIButton>
            );
        }
        else {
            return (
                <MUIButton {...other}>
                    {this.props.children}
                </MUIButton>
            );
        }
        

        
    }
}