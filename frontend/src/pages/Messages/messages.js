import React from 'react';

class SendButton extends React.Component {
    handleClick(){
        console.log('clicked');
    }
    render(){
        return(
            <div className={'send'}>
                onClick={this.props.handleClick}
                <div className={'text'}>send</div>
            </div>
        )
    }
}

class MessageTextBox extends React.Component {
    render(){
        return(
            <div className={'message-input-container'}>
                <input id={'msg-input'}
                       className={'message_input'}
                       />
            </div>
        )
    }
}

class MessageBox extends React.Component {
    render(){
        return (
            <li className={`message ${this.props.appearance} appeared`}>
                <Avatar></Avatar>
                <div className="text_wrapper">
                    <div className="text">{this.props.message}</div>
                </div>
            </li>
        )
    }
}

class Messages extends React.Component {


        render() {
            return (
                <div className="chat_window">
                    <MessagesContainer messages={this.state.messages}/>
                    <div className="bottom_wrapper clearfix"> .
                        <MessageTextBoxContainer
                            _handleKeyPress={this._handleKeyPress}
                            onChange={this.onChange}
                            message={this.state.current_message}> .
                        </MessageTextBoxContainer>
                        <SendButton handleClick={this.handleClick}/>
                    </div>
                </div>
            );}
}
