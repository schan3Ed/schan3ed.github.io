import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import logoTitle from '../../assets/FreshSpire-Brandmark_Combination-Green.png';
import {FTSF1, FTSF2, FTSF3} from '../../components/FirstTimeSurveyForm';
import { observer, inject } from 'mobx-react';
import { userStore, surveyStore} from '../../stores';
import { message } from 'antd';
import Button from '@material-ui/core/Button';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'recompose';
import {LoadingSpinnerButton} from '../../components/LoadingSpinner'
import DatabaseClient from '../../core/DatabaseClient';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
});

export const firstTimeSurveyStore = surveyStore;

@inject(() => ({
    store: firstTimeSurveyStore
}))
@observer
class FirstTimeSurvey extends React.Component {
  state = {
    value: 0,
    buttonValue: "Next",
    pending: false
  };

  async componentDidMount() {
    if (!userStore.user) {
      message.error('No user is logged in!');
      this.props.history.push('/login');
      return;
    }

    let user = await DatabaseClient.getUser(userStore.user.uid);
    
    if (user.initialized) {
      this.props.history.push('/login');
      return;
    }

    this.props.store.resetForm();
  }

  handleChange = (event, value) => {
    this.setState({ value: value });
    if (value == 2) {
      this.state.buttonValue = "Submit"
    } else {
      this.state.buttonValue = "Next"
    }
  };

  async logout() {
    userStore.removeUser();
    await userStore.logout();
  }

  handleChangeIndex = index => {
    this.setState({ value: index });
    if (index == 2) {
       this.state.buttonValue = "Submit"
    } else {
      this.state.buttonValue = "Next"
    }
  };

  handleButtonClick = event => {
    if (this.state.value < 2)
    this.setState({value: this.state.value + 1})
    if (this.state.value == 2) {
      this.setState({pending: true});
      this.props.store.createEntity()
        .then(() => {
          this.setState({pending: false});
          message.success('Form submitted successfully!')
          this.props.history.push('/login')
        })
        .catch( (e) => {
          this.setState({pending: false});
          message.error(`${e} Please fix the highlighted fields.`)
        })
    } else if (this.state.value == 1) {
      this.state.buttonValue = "Submit"
    } else {
     this.state.buttonValue = "Next"
    }
    window.scroll(0, 0);
  }

  componentDidUpdate() {
    this.swipeableActions.updateHeight();
  }
  
  render() {
    const { classes, theme } = this.props;

    return (
      <div className="survey-container">
      <div className="form-container">
        {/* <img src={logoTitle} alt="FreshSpire" className="img-format-sign"/> */}
        <div className="title-wrapper">
          <Typography variant="title" color="primary" className="survey-head">
            {`Tell Us About Your Company`}
          </Typography>
        </div>
        <div className="sign-up-wrapper">
          <AppBar position="static" color="green">
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              indicatorColor={"secondary"}
              textColor={"secondary"}
              fullWidth
            >
              <Tab label="Business Info"/>
              <Tab label="About" />
              <Tab label="Logistics" />
            </Tabs>
          </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={this.state.value}
            onChangeIndex={this.handleChangeIndex}
            action={actions => {
              this.swipeableActions = actions;
            }}
            style={{overflow:'hidden'}}
            animateHeight
          >
            <TabContainer dir={theme.direction}><FTSF1/></TabContainer>
            <TabContainer dir={theme.direction}><FTSF2/></TabContainer>
            <TabContainer dir={theme.direction}><FTSF3/></TabContainer>
          </SwipeableViews>
        </div>
        <div className="btn-submit-sign ">
          <Button className="action" variant="contained" color="primary" disabled={this.state.pending} onClick={this.handleButtonClick}> {this.state.pending ? LoadingSpinnerButton() : this.state.buttonValue} </Button>
          <Link to="/login" onClick={this.logout}>
            <Button className="logout-web-ft" disabled={this.state.pending} onClick={this.handleButtonClick}> ...Logout </Button>
          </Link>
        </div>
      </div>
      </div>
    );
  }
}

FirstTimeSurvey.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default compose(withRouter,withStyles(styles, { withTheme: true }))(FirstTimeSurvey);
