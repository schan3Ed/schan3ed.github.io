import React from 'react';
import Menu from '../../components/Menu';
import Popup from 'reactjs-popup';
import TextField from "@material-ui/core/TextField";
import PropTypes from 'prop-types';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import logoTitle from '../assets/FreshSpire-Brandmark_Combination-Green.png';
import { observer, inject } from 'mobx-react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
// import DealStore from '../stores/DealStore';
// import './FirstTimeSurveyForm.css'
// import MenuAppBar from './AppBarMenu'
import { ReasonForPostOptions, FoodOptions } from '../../core/core';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { message } from 'antd';
import IntlCurrencyInput from "react-intl-currency-input"
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dropzone from '../../components/atomic/Dropzone';
import Grid from '@material-ui/core/Grid';
import { withRouter} from 'react-router-dom'
import Button from '../../components/atomic/Button';
import { FoodUnits } from '../../core/core';
import Icon from '@material-ui/core/Icon';
import {LoadingSpinnerButton} from '../../components/LoadingSpinner'
import Topbar from '../../components/CommonTopBar'
import Typography from '@material-ui/core/Typography';

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (

    <IntlCurrencyInput
        {...other}
        ref={inputRef}
        id="price"
        name="price"
        currency="USD"
        onChange={(event, value, maskedValue) => {
            onChange({
              target: {
                value: value,
              },
            });
        }}
        config={{
            locale: "US",
            formats: {
                number: {
                    USD: {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    },
                },
            },
        }}
    /> 
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

@inject('inventoryStore')
@observer
class AddDeal extends React.Component {
    state = Object.assign(
        {}, 
        Object.keys(ReasonForPostOptions).reduce((o, key) => Object.assign(o, {[key]: false}), {}),
        {nothingWrong: false},
        {category: ''},
        {quantityUnit: ''},
        {foodOptionOther: ''},
        {numberformat: 0},
        {priceUnit: ''},
        {radioValue: false});

        componentWillUnmount() {
            this.props.inventoryStore.resetErrors();
        }
        
        componentDidMount() {
            window.scroll(0, 0);
        }

        handleReasonCheckboxChange = name => event => {
            this.setState({ [name]: event.target.checked });
            if (name !== 'OTHER') {
                if (name === 'nothingWrong') {
                    Object.keys(ReasonForPostOptions).map((label) => {
                        this.setState({ [label]: false });
                        this.props.inventoryStore.onFieldChangeAddDeal('reasonForPost', ["Nothing Wrong"]);
                    })
                } else {
                    if (this.props.inventoryStore.form.fields.reasonForPost.value.indexOf('Nothing Wrong') !== -1){
                        this.props.inventoryStore.onFieldChangeAddDeal('reasonForPost', []);
                    }
                    this.props.inventoryStore.onCheckboxChange('reasonForPost', ReasonForPostOptions[name]);
                }
            }
        }
        createCheckbox = (label) => (
            <Grid item xs={6}>
                <FormControlLabel
                  control={
                        <Checkbox
                            value = {label}
                            checked = {this.state[label]}
                            onChange = {this.handleReasonCheckboxChange(label)}
                        />
                    }
                    className = "label"
                    label = {ReasonForPostOptions[label]}
                    disabled = {this.state["nothingWrong"]}
                />
            </Grid>
        )
        createDetailCheckbox = (name, label) => (
            <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                        name = {name}
                        onChange = {this.handleDetailChange(name)}
                    />
                  }
                  className="label"
                  label={label}
                />
            </Grid>
        )
        createCheckboxes = () => (
            Object.keys(ReasonForPostOptions).map(this.createCheckbox)
        )
        handleFoodOptionChange = event => {
            let {value, name} = event.target;
            this.setState({ category: value });
            if (value !== 'Other') {
                this.props.inventoryStore.onFieldChangeAddDeal(name, value);
            } else {
                this.props.inventoryStore.onFieldChangeAddDeal(name, null);

                // Reset the error
                this.props.inventoryStore.form.fields.foodOption.error = null;
            }

        }
        checkInterger = (evt) => {
            console.log('click');
            if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
                evt.preventDefault();
        }
        createMenuItem = label => (
            <MenuItem value={label}>
                {label}
            </MenuItem>
        )
        handleFoodOptionOther = event => {
            this.setState({ foodOptionOther: event.target.value });
            this.props.inventoryStore.onFieldChangeAddDeal(event.target.name, event.target.value);
        }
        handlePriceUnitChange = event => {
            // Quantity and Price unit are set to the same things
            this.setState({ priceUnit: event.target.value });
            this.setState({ quantityUnit: event.target.value });
            this.props.inventoryStore.onFieldChangeAddDeal('priceUnit', event.target.value);
            this.props.inventoryStore.onFieldChangeAddDeal('quantityUnit', event.target.value);
        }
        handleDetailChange = name => event => {
            this.props.inventoryStore.onFieldChangeAddDeal(name, event.target.checked);
        }
        createMenuItems = (obj) => (
            Object.values(obj).map(this.createMenuItem)
        )
        handleRadioChange = event => {
            this.setState({ radioValue: event.target.value });
            this.props.inventoryStore.onFieldChangeAddDeal('public', event.target.value === 'true');
        }
        handleDealSubmit = async (event) => {
            const { history } = this.props
            event.preventDefault();
            let fields = this.props.inventoryStore.form.fields;
            console.log(fields['reasonForPost'].value.length,fields['reasonForPostOther'].value)
            if(fields['reasonForPost'].value.length === 0 && !fields['reasonForPostOther'].value){
                this.props.inventoryStore.onFieldChangeAddDeal('reasonForPost', ["Nothing Wrong"]);
            }
            //this.checkInvalid()
            try {
                await this.props.inventoryStore.createDeal()
                history.push('/deals')
            }
			catch (e) {
                message.error(`${e} Please fix the highlighted fields.`)
            }
        }
        onDrop = file  => {
            // Currenlty returns BLOBs
            this.props.inventoryStore.onFieldChangeAddDeal('pictures', file[0]);
        }
        onClearDrop = event  => {
            // Currenlty returns BLOBs
            event.stopPropagation();
            console.log('clear')
            this.props.inventoryStore.onFieldChangeAddDeal('pictures', null);
        }
        checkInvalid = () => {
            this.props.inventoryStore.validateAll();
            //['name','quantity', 'quantityUnit', 'useByDate','price','priceUnit','foodOption'].map(this.props.inventoryStore.validateField);
            /* In case an error shows up when choosing "Other" for foodOptions, use this logic and
               change the "Other" value to be ' ' instead of null when calling handleFoddOptionChange
            ['name','quantity','useByDate','price','priceUnit'].map(this.props.inventoryStore.validateField);
            if(this.props.inventoryStore.form.fields.foodOption.value === ' ' || this.props.inventoryStore.form.fields.foodOption.value === null) {
                this.props.inventoryStore.onFieldChangeAddDeal('foodOption', null);
            }
            */
        }
        handleChange = name => event => {
            this.setState({[name]: event.target.value});
            this.props.inventoryStore.onFieldChangeAddDeal('price', event.target.value +'');
        };

    render() {
        let {inventoryStore} = this.props;
        const tabs = [
			{
				name: 'Inventory',
				child: false,
				path: '/deals'
            },
            {
				name: 'Add Item',
				child: true,
				path: '/deals/adddeal'
			},
        ];
        return (
            <React.Fragment>
            <Menu/>
            <Topbar title="Add Item" tabs={tabs} sub="Add a new item to your inventory." tabIndex={1} isChildPath={true}/>
            <div className="deals-container">
            <form>
               <div className="form-container">
                <div className="deal-form-wrapper">
                    <div className="form__group">
                    <div className="form__control">
                    <Grid container justify="center" direction="column" spacing={10}>
                        <Grid container item justify="center">
                            <Dropzone onDrop={this.onDrop} onClearDrop={this.onClearDrop} source={inventoryStore.form.fields.pictures.value ? inventoryStore.form.fields.pictures.value.preview : null}/>
                        </Grid>
                    <Grid item>
                        <FormControl fullWidth='true'>
                            <InputLabel required error={inventoryStore.form.fields.name.error !== null}>Product Name</InputLabel>
                            <Input
                                id="name"
                                name="name"
                                value={inventoryStore.form.fields.name.value}
                                onChange={(e) => inventoryStore.onFieldChangeAddDeal(e.target.getAttribute('name'), e.target.value)}
                                error={inventoryStore.form.fields.name.error !== null}
                            />
                            <FormHelperText error >{inventoryStore.form.fields.name.error}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item justify="space-between" >
                        <Grid container direction="column" justify="center" alignItems="stretch" xs={6} item>
                        <FormControl fullWidth={true}>
                            {/* TODO: prices ending in zero fails  */}
                            <TextField
                              value={this.state.numberformat}
                              onChange={this.handleChange('numberformat')}
                              label="Price *"
                              error={inventoryStore.form.fields.price.error !== null}
                              InputProps={{
                                inputComponent: NumberFormatCustom,
                              }}
                            />
                            <FormHelperText error >{inventoryStore.form.fields.price.error}</FormHelperText>
                        </FormControl>
                        </Grid>
                        <Grid container justify="center" alignItems="center" item xs={2}> 
                            per
                        </Grid>
                        <Grid container direction="column" justify="center" alignItems="stretch" xs={3} item>
                            <FormControl>
                                <InputLabel required error={inventoryStore.form.fields.priceUnit.error !== null}>Unit</InputLabel>
                                <Select
                                    name="priceUnit"
                                    value={this.state.priceUnit}
                                    onChange={(e) => this.handlePriceUnitChange(e)}
                                    error={inventoryStore.form.fields.priceUnit.error !== null}
                                >
                                    <MenuItem value="" disabled>
                                        <em>Unit</em>
                                    </MenuItem>
                                    {this.createMenuItems(FoodUnits)}
                                </Select>
                                <FormHelperText error >{inventoryStore.form.fields.priceUnit.error}</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container item  alignItems="flex-start" justify="space-between">
                        <Grid container direction="column" justify="center" alignItems="stretch" xs={5} item>
                        <FormControl fullWidth={true}>
                            <InputLabel required error={inventoryStore.form.fields.quantity.error !== null}>Quantity Available</InputLabel>
                            <Input
                                name="quantity"
                                type="number"
                                onKeyPress={(e) => this.checkInterger(e)}
                                value={inventoryStore.form.fields.quantity.value}
                                onChange={(e) => inventoryStore.onFieldChangeAddDeal(e.target.getAttribute('name'), e.target.value)}
                                error={inventoryStore.form.fields.quantity.error !== null}
                            />
                            <FormHelperText error >{inventoryStore.form.fields.quantity.error}</FormHelperText>
                        </FormControl>
                        </Grid>
                        <Grid container justify="left" alignItems="left" item xs={7}> 
                            <Typography variant="subheading" className="unit-label">
                                {this.state.quantityUnit ? this.state.quantityUnit + '(s)' : ''}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container item  alignItems="flex-start" justify="space-between">
                        <Grid container direction="column" justify="center" alignItems="stretch" xs={5} item>
                        <FormControl>
                            <InputLabel required error={inventoryStore.form.fields.foodOption.error !== null}>Category</InputLabel>
                            <Select
                                name="foodOption"
                                value={this.state.category}
                                onChange={(e) => this.handleFoodOptionChange(e)}
                                error={inventoryStore.form.fields.foodOption.error !== null}
                            >
                                <MenuItem value="" disabled>
                                    <em>Category</em>
                                </MenuItem>
                                {this.createMenuItems(FoodOptions)}
                            </Select>
                            {this.state.category !== 'Other'? (<FormHelperText error >{inventoryStore.form.fields.foodOption.error}</FormHelperText>):''}
                        </FormControl>
                        </Grid>
                        <Grid container direction="column" justify="center" alignItems="stretch" xs={5} item>
                        <FormControl>
                            <TextField
                                name="useByDate"
                                label="Expiration Date"
                                type="date"
                                required
                                value={inventoryStore.form.fields.useByDate.value}
                                onChange={(e) => inventoryStore.onFieldChangeAddDeal(e.target.getAttribute('name'), e.target.value)}
                                error={inventoryStore.form.fields.useByDate.error !== null}
                                InputLabelProps={{
                                shrink: true,
                                }}
                            />
                            <FormHelperText error >{inventoryStore.form.fields.useByDate.error}</FormHelperText>
                        </FormControl>
                        </Grid>
                    </Grid>
                    {(() => {
                        if (this.state.category == 'Other') {
                            return (
                                <Grid item xs={12}>
                                <FormControl fullWidth={true}>
                                <InputLabel>Other Category</InputLabel>
                                <Input
                                    name="foodOption"
                                    value={this.state.foodOptionOther}
                                    onChange={(e) => this.handleFoodOptionOther(e)}
                                    error={inventoryStore.form.fields.foodOption.error !== null}
                                />
                                <FormHelperText error >{inventoryStore.form.fields.foodOption.error}</FormHelperText>
                                </FormControl>
                                </Grid>
                            ); 
                        }
                    })()}
                    <Grid container item>
                        <FormControl fullWidth={true}>
                            <FormLabel component="legend">Details</FormLabel>
                            <FormGroup>
                            <Grid container justify="center" xs={12}>
                                <Grid container item className="checkbox-grid-container">
                                    {this.createDetailCheckbox("isOrganic","Organic")}
                                    {this.createDetailCheckbox("isLocallyGrown","Locally Grown")}
                                    {this.createDetailCheckbox("delivery","Delivery")}
                                    {this.createDetailCheckbox("pickup","Pickup")}
                                </Grid>
                            </Grid>
                            </FormGroup>
                            <FormHelperText className="helper-text" error={(inventoryStore.form.fields.delivery.error || inventoryStore.form.fields.pickup.error)} >{(inventoryStore.form.fields.delivery.error || inventoryStore.form.fields.pickup.error)?(inventoryStore.form.fields.delivery.error || inventoryStore.form.fields.pickup.error):'Item must be available for either pickup, delivery, or both'}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item>
                        <FormControl fullWidth={true}>
                            <FormLabel component="legend">Reason for Post?</FormLabel>
                            <FormGroup>
                                <Grid container justify="center" xs={12}>
                                <Grid container item className="checkbox-grid-container">
                                    {this.createCheckboxes()}
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                        control={
                                            <Checkbox
                                                value = "Nothing Wrong"
                                                checked = {this.state.nothingWrong}
                                                onChange = {this.handleReasonCheckboxChange("nothingWrong")}
                                            />
                                        }
                                        className="label"
                                        label="Nothing Wrong"
                                        />
                                    </Grid>
                                </Grid>
                                </Grid>
                            </FormGroup>
                            <FormHelperText error >{inventoryStore.form.fields.reasonForPost.error}</FormHelperText>
                        </FormControl>
                    </Grid>
                    {(() => {
                        if (this.state['OTHER'] == true) {
                            return (
                                <Grid item xs={12}>
                                <FormControl fullWidth={true}>
                                <InputLabel>Reason for post</InputLabel>
                                <Input
                                    name="reasonForPostOther"
                                    value={this.props.inventoryStore.form.fields.reasonForPostOther.value}
                                    onChange={(e) => this.props.inventoryStore.onFieldChangeAddDeal(e.target.getAttribute('name'), e.target.value)}
                                    placeholder="Reason For Post"
                                    error={inventoryStore.form.fields.reasonForPostOther.error !== null}
                                />
                                <FormHelperText error >{inventoryStore.form.fields.reasonForPostOther.error}</FormHelperText>
                                </FormControl>
                                </Grid>
                            ); 
                        }
                        else {
                            if (this.props.inventoryStore.form.fields.reasonForPostOther.value != '') {
                                this.props.inventoryStore.onFieldChangeAddDeal('reasonForPostOther', '');
                            }
                        }
                    })()}
                    <Grid container item justify="center">
                        <Grid item>
                        <FormControl >
                            <FormLabel>Who is able to view this item?</FormLabel>
                            <RadioGroup
                                name="privacyOptions"
                                row={true}
                                value={inventoryStore.form.fields.public.value}
                                onChange={this.handleRadioChange}
                            >
                                <FormControlLabel value ={false} control={<Radio />} label="Only Current Buyers" />
                                <FormControlLabel disabled={true} value ={true} control={<Radio />} label="Anyone"/>
                            </RadioGroup>
                            <FormHelperText error >{inventoryStore.form.fields.public.error}</FormHelperText>
                        </FormControl>
                        </Grid>
                    </Grid>
                    <Grid item>
                    <FormControl fullWidth="true">
                        <TextField
                            name="notes"
                            label="Other notes"
                            multiline
                            rows="2"
                            rowsMax="5"
                            placeholder="Other notes"
                            margin="normal"
                            fullWidth="true"
                            value={inventoryStore.form.fields.notes.value}
                            onChange={(e) => inventoryStore.onFieldChangeAddDeal(e.target.getAttribute('name'), e.target.value)}
                            error={inventoryStore.form.fields.notes.error !== null}
                            style={{"padding-top":"0.5em"}}
                        />
                        <FormHelperText>Write a short description about your item!</FormHelperText>
                        <FormHelperText error >{inventoryStore.form.fields.notes.error}</FormHelperText>
                    </FormControl>
                    </Grid>
                    </Grid>
                    </div>
                    </div>
                    <div className="btn-submit-sign ">
                        <Button variant="contained" color="primary" className="submit-button" onClick={async (e) => await this.handleDealSubmit(e)}>
                            Add Item
                        </Button>
                        <Typography variant="subheading" className="notice">
                            {
                                //Buyers will be automatically notified of your new item!
                            }
                        </Typography>
                    </div>
                </div>
                </div>
                </form>
            </div>
            </React.Fragment>
        );
    }
}

export default withRouter(AddDeal)
