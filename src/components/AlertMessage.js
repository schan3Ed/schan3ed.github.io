import React, { Component, Fragment } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from './atomic/Button';
import Typography from '@material-ui/core/Typography';

function nullDefault() {
  return null;
}

export function AlertMessage(title, message, confirmClick=nullDefault, cancelClick=nullDefault) {
  const options = {
    title: 'Title',
    message: 'Message',
    customUI: ({ onClose }) => {
      return (
        <div>
          <Card className='alert-box'>
            <CardHeader title={title} className='alert-header'/>
            <CardContent>
              <Typography component="p" variant="subheading">
                {message}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" onClick={() => {
                confirmClick()
                onClose()
                }}>Yes
              </Button>
              <Button size="small" color="primary" onClick={() => {
                cancelClick()
                onClose()
                }}>No
              </Button>
            </CardActions>
          </Card>
        </div>
      )
    },
  }
  confirmAlert(options);
}