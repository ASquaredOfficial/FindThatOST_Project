import React, { useState } from 'react';
import './comments.css';

const CommentForm = ({
    submitLabel,
    placeholderLabel,
    handleSubmit, 
    cancelable = false,
    initialText = ""}) => {

    const [ text, setText ] = useState(initialText);
    const isTextareaDiabled = (text.length === 0);

    const onSubmit = (event) => {
        event.preventDefault();
        handleSubmit(text);
        setText("");
    }

    const onCancel = (event) => {
        event.preventDefault();
        handleSubmit(null);
    }

    /**
     * Handles keydown events in a textarea, triggering a specific action on Enter key press.
     * Prevents default behavior to avoid submitting the form unintentionally.
     * @param {Event} event - The keydown event object.
     * @returns {void}
     */
    const textareaOnKeyDown = (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            // Enter Key pressed
            event.preventDefault();
            onSubmit(event);
        }
    }

	return (
		<div className='fto__comments-form'>
            <form onSubmit={onSubmit}>
                <textarea 
                    className='fto_input'
                    placeholder={placeholderLabel}
                    value={text}
                    onChange={(e) => setText(e.target.value)} 
                    onKeyDown={(e) => textareaOnKeyDown(e)}
                    autoFocus
                />
                <div className='fto__comments-form-submit_button_section'>
                    {cancelable && (
                        <button className='fto__button__pink' onClick={onCancel}>Cancel</button>
                    )}
                    
                    <button className='fto__button__pink' disabled={isTextareaDiabled}>{submitLabel}</button>
                </div>
            
            </form>
		</div>
	)
}

export default CommentForm