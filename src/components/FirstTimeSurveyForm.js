import React, { Component, PropTypes } from 'react';
import {
    Link,
    withRouter,
} from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import MaskedInput from 'react-text-mask';
import TextField from "@material-ui/core/TextField";
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import { FoodOptions, PaymentOptions, ReasonForPostOptions, CommunicationOptions, States } from '../core/core'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
// import logoTitle from '../assets/FreshSpire-Brandmark_Combination-Green.png';
// import DealStore from '../stores/DealStore';
// import './FirstTimeSurveyForm.css'
// import MenuAppBar from './AppBarMenu'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { message } from 'antd';
import IntlCurrencyInput from "react-intl-currency-input"
import { userStore } from '../stores';
import MenuItem from '@material-ui/core/MenuItem';
import Dropzone from './atomic/Dropzone';
import Grid from '@material-ui/core/Grid';
import { firstTimeSurveyStore } from '../pages/common/FirstTimeSurvey';
import Button from '@material-ui/core/Button';
import { FoodUnits } from '../core/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';


function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={inputRef}
            mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            placeholderChar={'\u2000'}
        // showMask
        />
    );
}

@inject(() => ({
    store: firstTimeSurveyStore
}))

@observer
export class FTSF1 extends Component {
    state = Object.assign(
        {},
        Object.values(PaymentOptions).reduce((o, key) => Object.assign(o, { [key]: false }), {}),
        { state: '' },
        { phone: '' });

    //regions = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID", "IL","IN","KS","KY","LA","MA","MD","ME","MH","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY", "OH","OK","OR","PA","PR","PW","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"]
    //regions = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

    createMenuItem = label => (
        <MenuItem key={`${label}-menu`} value={label}>
            {label}
        </MenuItem>
    )

    createMenuItems = (arr) => (
        arr.map(this.createMenuItem)
    )

    handleCheckboxChange = label => event => {
        this.setState({ [label]: event.target.checked });
        if (label != 'Other') {
            this.props.store.onCheckboxChange('paymentOptions', label);
        } else {
            // this.props.store.onCheckboxChange('paymentOptions', null);
            this.props.store.onFieldChange('paymentOptionsOther', '');
            // Reset the error
            this.props.store.form.fields.paymentOptions.error = null;
        }
    }

    createCheckbox = label => (
        <Grid key={`${label}-checkbox`} item container justify="center" xs={6}>
            <FormControlLabel
                control={
                    <Checkbox
                        value={label}
                        checked={this.state[label]}
                        onChange={this.handleCheckboxChange(label)}
                    />
                }
                className="label"
                style={{ "display": "flex" }}
                label={label}
            />
        </Grid>
    )
    onDrop = file  => {
        // Currenlty returns BLOBs
        this.props.store.onFieldChange('picture', file[0]);
    }
    onClearDrop = event  => {
        // Currenlty returns BLOBs
        event.stopPropagation();
        this.props.store.onFieldChange('picture', null);
    }
    changeStateValue = event => {
        const { name, value } = event.target
        console.log(value)
        this.setState({ [name]: value });
        this.props.store.onFieldChange([name], value);
    }

    createCheckboxes = () => {
        return Object.values(PaymentOptions).map(this.createCheckbox);
    }

    render() {
        let { store } = this.props;
        let other = this.props.store.form.fields.paymentOptionsOther.value;
        return (
            <div className="form__group">
                <div className="form__control">
                    <Grid container justify="center" direction="column">
                        <Grid container item justify="center">
                            <Dropzone onDrop={this.onDrop} onClearDrop={this.onClearDrop} source={store.form.fields.picture.value ? store.form.fields.picture.value.preview : null}/>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth='true'>
                                <InputLabel required error={store.form.fields.name.error !== null}>Business Name</InputLabel>
                                <Input
                                    name="name"
                                    value={store.form.fields.name.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.name.error !== false && store.form.fields.name.error != null}
                                />
                                <FormHelperText error >{store.form.fields.name.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth='true'>
                                <InputLabel required error={store.form.fields.streetAddress.error !== null}>Street Address</InputLabel>
                                <Input
                                    name="streetAddress"
                                    value={store.form.fields.streetAddress.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.streetAddress.error !== false && store.form.fields.streetAddress.error != null}
                                />
                                <FormHelperText error >{store.form.fields.streetAddress.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth='true'>
                                <InputLabel required error={store.form.fields.city.error !== null}>City</InputLabel>
                                <Input
                                    name="city"
                                    value={store.form.fields.city.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.city.error !== false && store.form.fields.city.error != null}
                                />
                                <FormHelperText error >{store.form.fields.city.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid container item justify="space-between">
                            <Grid container direction="column" justify="center" alignItems="stretch" xs={5} item>
                                <FormControl fullWidth={true}>
                                    <InputLabel required error={store.form.fields.state.error !== null}>State</InputLabel>
                                    <Select
                                        name="state"
                                        value={this.state.state}
                                        onChange={(e) => this.changeStateValue(e)}
                                        error={store.form.fields.state.error !== null}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>State</em>
                                        </MenuItem>
                                        {this.createMenuItems(States)}
                                    </Select>
                                    <FormHelperText error >{store.form.fields.state.error}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid container direction="column" justify="center" alignItems="stretch" xs={5} item>
                                <FormControl fullWidth={true}>
                                    <InputLabel required error={store.form.fields.zipcode.error !== false && store.form.fields.zipcode.error != null}>Zipcode</InputLabel>
                                    <Input
                                        name="zipcode"
                                        value={store.form.fields.zipcode.value}
                                        onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                        error={store.form.fields.zipcode.error !== false && store.form.fields.zipcode.error != null}
                                    />
                                    <FormHelperText error >{store.form.fields.zipcode.error}</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth={true}>
                                <InputLabel required error = {store.form.fields.phone.error !== null}>Phone</InputLabel>
                                <Input
                                    name="phone"
                                    placeholder="(201) 555-5555"
                                    value={this.state.phone}
                                    onChange={(e) => this.changeStateValue(e)}
                                    inputComponent={TextMaskCustom}
                                    error = {store.form.fields.phone.error !== null}
                                />
                                <FormHelperText error >{store.form.fields.phone.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth={true}>
                                <InputLabel required error = {store.form.fields.email.error !== null}>Business Email</InputLabel>
                                <Input
                                    name="email"
                                    value={store.form.fields.email.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error = {store.form.fields.email.error !== null}
                                />
                                <FormHelperText>{`This is the email that will be displayed to ${userStore.isSeller?'buyers':'sellers'} if they want to contact your business.`}</FormHelperText>
                                <FormHelperText error >{store.form.fields.email.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid container item>
                            <FormControl fullWidth={true}>
                                <FormLabel component="legend" >Business Hours</FormLabel>
                                <FormGroup>
                                    <Grid container alignItems="flex-start" justify="space-between">
                                        <Grid container item xs={5}>
                                            <FormControl fullWidth={true}>
                                                <TextField
                                                    name="opening"
                                                    label="Opening"
                                                    type="time"
                                                    defaultValue="07:30"
                                                    value={store.form.fields.opening.value}
                                                    className={"time"}
                                                    error={store.form.fields.opening.error !== null}
                                                    InputLabelProps={{
                                                        shrink: true
                                                    }}
                                                    inputProps={{
                                                        step: 300 // 5 min
                                                    }}
                                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                                />
                                                <FormHelperText error >{store.form.fields.opening.error}</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid container item xs={5}>
                                            <FormControl fullWidth={true}>
                                                <TextField
                                                    name="closing"
                                                    label="Closing"
                                                    type="time"
                                                    defaultValue="18:00"
                                                    value={store.form.fields.closing.value}
                                                    className={"time"}
                                                    error={store.form.fields.closing.error !== null}
                                                    InputLabelProps={{
                                                        shrink: true
                                                    }}
                                                    inputProps={{
                                                        step: 300 // 5 min
                                                    }}
                                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                                />
                                                <FormHelperText error >{store.form.fields.closing.error}</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid container item>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" style={{ "paddingTop": "2em" }} required error = {store.form.fields.paymentOptions.error !== null}>Payment Methods</FormLabel>
                                <FormGroup>
                                    <Grid container justify="center">
                                        <Grid container item className="checkbox-grid-container">
                                            {this.createCheckboxes()}
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                                <FormHelperText>Select which payment methods you accept for orders.</FormHelperText>
                                <FormHelperText error>{store.form.fields.paymentOptions.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} className={this.state['Other']? '':'hidden'} otherOption>
                            <FormControl fullWidth={true}>
                                <InputLabel error={store.form.fields.paymentOptionsOther.error !== null}>Other</InputLabel>
                                <Input
                                    name="paymentOptionsOther"
                                    value={other? other:''}
                                    onChange={(e) => this.props.store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    placeholder="Please Specify"
                                    error={store.form.fields.paymentOptionsOther.error !== null}
                                />
                                <FormHelperText error >{store.form.fields.paymentOptionsOther.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item>
                            <FormControl fullWidth={true}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    required
                                    multiline
                                    rows="5"
                                    placeholder="Write a description of your business here."
                                    value={store.form.fields.description.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.description.error !== false && store.form.fields.description.error != null}
                                />
                                <FormHelperText>{`Write a short description telling your ${userStore.isSeller?'buyers':'sellers'} what you're about!`}</FormHelperText>
                                <FormHelperText error >{store.form.fields.description.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                </div>
            </div>

        )
    }
}

@inject(() => ({
    store: firstTimeSurveyStore
}))

@observer
export class FTSF2 extends React.Component {
    state = Object.keys(CommunicationOptions).reduce((o, key) => Object.assign(o, { [key]: false }), {});

    handleCheckboxChange = name => event => {
        this.setState({ [name]: event.target.checked });
        if (name != 'Other') {
            this.props.store.onCheckboxChange('communicationOptions', name);
        } else {
            // this.props.store.onCheckboxChange('communicationOptions', null);
            this.props.store.onFieldChange('communicationOptionsOther', '');
            // Reset the error
            this.props.store.form.fields.communicationOptions.error = null;
        }
    };
    createCheckbox = label => (
        <Grid key={`${label}-checkbox`} item container justify="center" xs={6}>
            <FormControlLabel
                control={
                    <Checkbox
                        value={label}
                        checked={this.state[label]}
                        onChange={this.handleCheckboxChange(label)}
                    />
                }
                className="label"
                label={label}
            />
        </Grid>
    )
    createCheckboxes = () => (
        Object.values(CommunicationOptions).map(this.createCheckbox)
    )
    render() {
        let { store } = this.props;
        let other = this.props.store.form.fields.communicationOptionsOther.value;
        return (
            <div className="form__group">
                <div className="form__control">
                    <Grid container justify="center" direction="column">
                        <Grid item>
                            <FormControl fullWidth='true'>
                                <InputLabel required error={store.form.fields.firstName.error !== null}>First Name</InputLabel>
                                <Input
                                    name="firstName"
                                    value={store.form.fields.firstName.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.firstName.error !== false && store.form.fields.firstName.error != null}
                                />
                                <FormHelperText error >{store.form.fields.firstName.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth='true'>
                                <InputLabel required error={store.form.fields.lastName.error !== null}>Last Name</InputLabel>
                                <Input
                                    name="lastName"
                                    value={store.form.fields.lastName.value}
                                    onChange={(e) => store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    error={store.form.fields.lastName.error !== false && store.form.fields.lastName.error != null}
                                />
                                <FormHelperText error >{store.form.fields.lastName.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid container item>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" style={{ "paddingTop": "2em" }} required error={store.form.fields.communicationOptions.error !== null}>What is your preferred method of communication?</FormLabel>
                                <FormGroup>
                                    <Grid container justify="center" xs={12}>
                                        <Grid container item className="checkbox-grid-container">
                                            {this.createCheckboxes()}
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                                <FormHelperText>Select which methods you prefer.</FormHelperText>
                                <FormHelperText error >{store.form.fields.communicationOptions.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} className={this.state['Other'] ? '' : 'hidden'} otherOption>
                            <FormControl fullWidth={true}>
                                <InputLabel error={store.form.fields.communicationOptionsOther.error !== null}>Other</InputLabel>
                                <Input
                                    name="communicationOptionsOther"
                                    value={other? other:''}
                                    onChange={(e) => this.props.store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    placeholder="Please Specify"
                                    error={store.form.fields.communicationOptionsOther.error !== null}
                                />
                                <FormHelperText error >{store.form.fields.communicationOptionsOther.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </div>
        )
    }
}

@inject(() => ({
    store: firstTimeSurveyStore
}))

@observer
export class FTSF3 extends React.Component {
    state = Object.assign({}, Object.keys(FoodOptions).reduce((o, key) => Object.assign(o, { [key]: false }), {}));

    handleCheckboxChange = name => event => {
        this.setState({ [name]: event.target.checked });
        if (name != 'Other') {
            this.props.store.onCheckboxChange('foodOptions', name);
        } else {
            // this.props.store.onCheckboxChange('foodOptions', null);
            this.props.store.onFieldChange('foodOptionsOther', '');
            // Reset the error
            this.props.store.form.fields.foodOptions.error = null;
        }
    };

    handleAgreement = name => event => {
        this.setState({ [name]: event.target.checked });
        this.props.store.onFieldChange('TOSAgreement', event.target.checked? event.target.checked:null);
    };

    createCheckbox = label => (
        <Grid key={`${label}-checkbox`} item container justify="center" xs={6}>
            <FormControlLabel
                control={
                    <Checkbox
                        value={label}
                        checked={this.state[label]}
                        onChange={this.handleCheckboxChange(label)}
                    />
                }
                className="label"
                label={label}
            />
        </Grid>
    )
    createCheckboxes = () => (
        Object.values(FoodOptions).map(this.createCheckbox)
    )

    render() {
        let { store } = this.props;
        let other = this.props.store.form.fields.foodOptionsOther.value;
        return (
            <div className="form__group">
                <div className="form__control">
                    <Grid container justify="center" direction="column">
                        <Grid container item>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" required error={store.form.fields.foodOptions.error !== null}>{`What do you primarily ${userStore.isSeller?'sell':'buy'}?`}</FormLabel>
                                <FormGroup>
                                    <Grid container justify="center" xs={12}>
                                        <Grid container item className="checkbox-grid-container">
                                            {this.createCheckboxes()}
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                                <FormHelperText>{`Select the types of food you ${userStore.isSeller?'sell':'buy'}.`}</FormHelperText>
                                <FormHelperText error >{store.form.fields.foodOptions.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} className={this.state['Other'] ? '' : 'hidden'} otherOption>
                            <FormControl fullWidth={true}>
                                <InputLabel error={store.form.fields.foodOptionsOther.error !== null}>Other</InputLabel>
                                <Input
                                    name="foodOptionsOther"
                                    value={other? other:''}
                                    onChange={(e) => this.props.store.onFieldChange(e.target.getAttribute('name'), e.target.value)}
                                    placeholder="Please Specify"
                                    error={store.form.fields.foodOptionsOther.error !== null}
                                />
                                <FormHelperText error >{store.form.fields.foodOptionsOther.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid container="true" justify="center" item xs={12}>
                            <FormControl component="fieldset">
                                <FormGroup>
                                    <Grid container justify="center" xs={12}>
                                        <Grid container item justify="center" className="terms-container" xs={12} style={{alignItems: 'center'}}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        value="TOSAgreement"
                                                        checked={this.state["TOSAgreement"]}
                                                        onChange={this.handleAgreement("TOSAgreement")}
                                                    />
                                                }
                                                style={{marginRight: '-2px'}}
                                            />
                                            <Typography variant="subheading" className="terms-text" style={{fontSize: '1em'}}>
                                                {'I agree to Freshspire\'s'}
                                                {<a href="//www.google.com">&nbsp; Terms of Service</a>}
                                            </Typography>
                                        </Grid>
                                        <FormHelperText error style={{marginTop: '-5px'}}>{store.form.fields.TOSAgreement.error}</FormHelperText>
                                    </Grid>
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </div>
        )
    }
}