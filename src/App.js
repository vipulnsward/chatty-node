// This assumes you have https://github.com/vipulnsward/actioncable-examples running as well as the AC backend.
import 'whatwg-fetch';
import React, { Component, PropTypes } from 'react'
const ActionCable = require('vipul_actioncable');
const ACApp = {};
ACApp.cable = ActionCable.createConsumer('ws://localhost:28080');


const messageEndPoint = "http://localhost:3000/messages/";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { message: null, message_id: 1 }; // Yup, I haz hardcode message_id for now
  }

  render() {
    const message = this.state.message;
    if (message) {
      let comments = message.comments.map((comment) => {
        return this.renderComment(comment);
      });

      return (
          <div>
            <h1>{message.title}</h1>
            <p>{message.content}</p>
            <div>{comments}</div>
          </div>
      );
    } else {
      return (<div>
        <h1>Loading them Message details</h1>
      </div>);
    }
  }

  renderComment(comment) {
    return (
        <article key={comment.id}>
          <h3>Comment by { comment.user.name } </h3>
          <p>{ comment.content }</p>
        </article>
    );
  }

  componentDidMount() {
    this.fetchMessageData();
    this.setupSubscription();
  }

  fetchMessageData(){
    fetch(`${messageEndPoint}${this.state.message_id}.json`)
        .then(function (res) {
          return res.json();
        }).then(this.setInitialStateForMessage.bind(this));
  }

  setInitialStateForMessage(json) {
    this.setState({ message: json });
  }

  setupSubscription() {

    ACApp.comments = ACApp.cable.subscriptions.create("CommentsChannel", {
      message_id: this.state.message_id,
      connected: function () {
        setTimeout(() => this.perform('follow', { message_id: this.message_id }), 1000);
      },
      received: function (data) {
        this.updateCommentList(data.comment);
      },
      updateCommentList: this.updateCommentList.bind(this)
    });
  }
  updateCommentList(comment) {
    let message = JSON.parse(comment);
    this.setState({ message: message });
  }

}

module.exports = App;
