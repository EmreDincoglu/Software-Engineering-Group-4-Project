import React from 'react';

class MessageBox extends React.Component {
    render() {
        return (
            <li className={`message ${this.props.appearance} appeared`}>
                <div className="text_wrapper">
                    <div className="text">{this.props.message}</div>
                </div>
            </li>
        );
    }
}

class MessagesContainer extends React.Component {
    render() {
        return (
            <ul className="messages">
                {this.props.messages.map((msg, index) => (
                    <MessageBox
                        key={index}
                        appearance={msg.sender === this.props.userId ? "sent" : "received"}
                        message={msg.message}
                    />
                ))}
            </ul>
        );
    }
}

class MessageTextBox extends React.Component {
    render() {
        return (
            <div className="message-input-container">
                <input
                    id="msg-input"
                    className="message_input"
                    value={this.props.message}
                    onChange={this.props.onChange}
                    placeholder="Type a message..."
                />
            </div>
        );
    }
}

class SendButton extends React.Component {
    render() {
        return (
            <div className="send" onClick={this.props.handleClick}>
                <div className="text">Send</div>
            </div>
        );
    }
}

class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            currentMessage: "",
        };

        this.fetchMessages = this.fetchMessages.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async fetchMessages() {
        try {
            const response = await fetch('/message/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient: this.props.recipientId })
            });
            const data = await response.json();
            if (data.success) {
                this.setState({ messages: data.messages });
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }

    async handleSend() {
        if (this.state.currentMessage.trim() === "") return;

        try {
            const response = await fetch('/message/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: this.props.recipientId,
                    message: this.state.currentMessage,
                }),
            });
            const data = await response.json();
            if (data.success) {
                this.setState((prevState) => ({
                    messages: [...prevState.messages, data.message],
                    currentMessage: "",
                }));
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    }

    // Handle input changes
    handleChange(e) {
        this.setState({ currentMessage: e.target.value });
    }

    componentDidMount() {
        this.fetchMessages();
    }

    render() {
        return (
            <div className="chat_window">
                <MessagesContainer
                    messages={this.state.messages}
                    userId={this.props.userId}
                />
                <div className="bottom_wrapper clearfix">
                    <MessageTextBox
                        message={this.state.currentMessage}
                        onChange={this.handleChange}
                    />
                    <SendButton handleClick={this.handleSend} />
                </div>
            </div>
        );
    }
}

export default Messages;
