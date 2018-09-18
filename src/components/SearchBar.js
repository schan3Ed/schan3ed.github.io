import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import MenuItem from '@material-ui/core/MenuItem';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import { SearchIcon, LocationIcon } from './Icons'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { ExpansionPanelActions } from '@material-ui/core';
import { FoodOptions } from '../core/core';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';


const styles = theme => ({
    root: {
        background: '#3dd28f',
        color: 'white'
    },
})

@inject('searchStore')
@observer
class SearchBar extends Component {
    constructor(props) {
        super(props); 
        this.detailOptions = {
            isOrganic: 'Organic',
            isLocal: 'Local',
            delivery: 'Delivery',
            pickup: 'Pickup'
        };
      }
    
    state = Object.assign(
        {},
        Object.values(FoodOptions).reduce((o, key) => Object.assign(o, {[key]: false}), {}),
        {expanded: false},
        {sortBy: 'name-asc'},
        {query:''},
        {visibility:'all'}
    )

    componentDidMount(){
        this.props.searchStore.resetSearch();
    }

    createSortBy = (mobile) => {
        return (
            <div className={`sort-by-container ${mobile ? 'mobile' : 'web'}`}>
                <Typography className="sort-label">
                    Sort By
                </Typography>
                <Select
                    name="sortBy"
                    value={this.state.sortBy}
                    onChange={this.handleChange}
                    className="sort-box"
                    displayEmpty
                    disableUnderline={true}
                >
                    <MenuItem value='name-asc'>Name (A-Z)</MenuItem>
                    <MenuItem value='name-desc'>Name (Z-A)</MenuItem>
                    <MenuItem value='use-by-date-asc'>Use By Date Ascending</MenuItem>
                    <MenuItem value='use-by-date-desc'>Use By Date Descending</MenuItem>
                </Select>
            </div>
        )
    }

    checkboxChange = name => event => {
        this.setState({ [name]: event.target.checked });
        this.props.searchStore.onCheckboxChange(name,event.target.checked);
    }

    radioChange = event => {
        switch(event.target.value){
            case 'public':
                this.props.searchStore.onRadioChange('Public',true,true);
                this.setState({ visibility: 'public' });
                break;
            case 'private':
                this.props.searchStore.onRadioChange('Public',false,true);
                this.setState({ visibility: 'private' });
                break;
            default:
                this.props.searchStore.onRadioChange('Public',true,false);
                this.setState({ visibility: 'all' });
                break;
        }
    }

    createCheckbox = (label) => (
        <FormControlLabel
            key={`${label}-checkbox`}
            control={
                <Checkbox 
                    value = {label}
                    checked = {this.state[label]}
                    onChange = {this.checkboxChange(label)}
                />
            } 
            label={label}
            className="checkbox-label" 
        />
    )

    createFilterGrid = (visibility) => {
        return (
            <Grid container item direction="column">
                <Grid container item justify="center">
                    <Grid item xs={10} className="checkbox-group-label">
                        <Typography variant="subheading" className="text" >Details</Typography>
                    </Grid>
                    <Grid container item xs={10} className="checkbox-wrapper">
                    {Object.values(this.detailOptions).map((label)=>this.createCheckbox(label))}
                    </Grid>
                </Grid>
                <Grid container item justify="center">
                    <Grid item xs={10} className="checkbox-group-label">
                        <Typography variant="subheading" className="text">Categories</Typography>
                    </Grid>
                    <Grid container item xs={10} className="checkbox-wrapper">
                        {Object.values(FoodOptions).map((label)=>this.createCheckbox(label))}
                    </Grid>
                </Grid>
                {
                    visibility?
                    (
                        <Grid container item justify="center">
                            <Grid item xs={10} className="checkbox-group-label">
                                <Typography variant="subheading" className="text">Visibility</Typography>
                            </Grid>
                            <Grid container item xs={10} className="checkbox-wrapper">
                            <RadioGroup
                                className="radio-wrapper"
                                value={this.state.visibility}
                                onChange={this.radioChange}
                                row={true}
                            >
                                <FormControlLabel value="all" control={<Radio />} label="All" />
                                <FormControlLabel value="public" control={<Radio />} label="Public" />
                                <FormControlLabel value="private" control={<Radio />} label="Restricted" />
                            </RadioGroup>
                            </Grid>
                        </Grid>
                    )
                    :
                    ''
                }
            </Grid>
        )
    }

    handleExpand = () => {
        this.setState({ expanded: !this.state.expanded });
    };

    handleChange = event => {
        this.props.searchStore.updateSort(event.target.value)
        this.setState({ [event.target.name]: event.target.value });
    };

    handleQueryChange = event => {
        this.props.searchStore.updateQuery(event.target.value);
        this.setState({query: event.target.value})
    }

    searchIfPressEnter = event => {
        if ((document.body.clientWidth <= 549) && (event.key === 'Enter')) {
            this.setState({ expanded: false });
        }
    }

    render() {
        return (
            <div className="deals-search">
                <div className="search-wrapper">
                    <div className="expansion-container">
                        <ExpansionPanel className="input-container" expanded={this.state.expanded}>
                            <ExpansionPanelSummary expandIcon={<Icon className="filter-dropdown" onClick={() => this.handleExpand()}>expand_more</Icon>} className="expansion-top">
                                <Icon className="search-icon">
                                    search
                                </Icon>
                                <input
                                    type="text"
                                    ref={(searchQuery) => this.searchQuery = searchQuery}
                                    onKeyPress={this.searchIfPressEnter}
                                    value={this.state.query}
                                    placeholder="Search..."
                                    onChange={(e) => this.handleQueryChange(e)}
                                    className={this.state.expanded? 'opened':''}
                                />
                                <Typography className="filter-label" onClick={() => this.handleExpand()}>
                                    Filter
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className="expansion-bottom">
                                {this.createSortBy(true)}
                                {this.createFilterGrid(this.props.visibility)}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </div>
                    {this.createSortBy()}
                </div>
                <div className="filter-wrapper">
                    <div className="filter-container">
                        <div className="header">
                            <Typography className="text">
                                Filter
                            </Typography>
                        </div>
                        <div className="body">
                            {this.createFilterGrid(this.props.visibility)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(SearchBar);
