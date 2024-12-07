import React from 'react';
import { 
  UserDisplay, getMessages, MethodCaller,
  loggedInPage, sendMessage, withParams 
} from '../../lib/default';
import './messages.css';

function renderUserList(list, onClick) {
  return <>{list.map((id, i) => (<div key={i}><UserDisplay 
    user={id}
    alt="User"
    fallback="/default_user.png"
    clickable={true}
    onClick={onClick(id)}
  /></div>))}</>;
}

class MessagePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadState: 0,
      recipient: null,
      messages: [],
      current_message: ""
    };
    this.setRecipient = this.setRecipient.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.send = this.send.bind(this);
    this.renderFollowers = this.renderFollowers.bind(this);
    this.renderFollowing = this.renderFollowing.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
  }
  setRecipient(){
    this.setState({
      loadState: 0, 
      recipient: this.props.params.get('user')??null, 
      messages: []
    });
  }
  loadMessages(){
    this.setState({loadState: 1});
    let recipient = this.state.recipient;
    getMessages(recipient).then((result) => {
      if (this.state.recipient !== recipient) {return;}
      this.setState({
        loadState: 2, 
        recipient: recipient, 
        messages: result.data??[]
      });
    });
  }
  send(){
    if (this.state.current_message.trim() === "") {return;}
    sendMessage(this.state.recipient, this.state.current_message).then((result) => {
      this.setState({loadState: 0, current_message: ""});
    });
  }
  renderFollowers(){
    return <div className='message-follows'>
      <h1>Followers</h1>
      {renderUserList(
        this.props.user.profile.followers??[],
        (user) => (() => {this.props.setParams({user: user});})
      )}
    </div>;
  }
  renderFollowing(){
    return <div className='message-follows'>
      <h1>Followed Users</h1>
      {renderUserList(
        this.props.user.profile.following??[],
        (user) => (() => {this.props.setParams({user: user});})
      )}
    </div>;
  }
  renderMessages(){
    return <div className='message-list'>{
      this.state.messages.map((msg, i) => (
        <div 
          className='message'
          key={i}
          id={msg.sender===this.state.recipient? "recieved":"sent"}
        >
          {msg.message}
        </div>
      ))
    }</div>;
  }
  render(){
    if (this.state.recipient!==(this.props.params.get('user')??null)){
      return <MethodCaller method={this.setRecipient}/>;
    }else if (this.state.loadState===0){
      return <MethodCaller method={this.loadMessages}/>;
    }
    const loading = this.state.loadState!==2;
    const userSelected = this.state.recipient!==null;
    return <div className='message-page'>
      {this.renderFollowing()}
      {this.renderFollowers()}
      {!loading&&userSelected&&<div className='messaging-window'>
        <UserDisplay 
          user={this.state.recipient}
          alt="User"
          fallback="/default_user.png"
          clickable={true}
        />
        {this.renderMessages()}
        <div className='message-input'>
          <input
            value={this.state.current_message}
            onChange={(e) => {this.setState({current_message: e.target.value});}}
            placeholder="Type a message..."
          />
          <button onClick={this.send}>Send</button>
        </div>
      </div>}
    </div>;
  }
}
export default loggedInPage(withParams(MessagePage));
