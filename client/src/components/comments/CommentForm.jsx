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
        event.preventDefault()
        handleSubmit(text);
        setText("");
    }

    const onCancel = (event) => {
        event.preventDefault()
        handleSubmit(null);
    }

	return (
		<div className='fto__comments-form'>
            <form onSubmit={onSubmit}>
                <textarea 
                    className='fto_input'
                    placeholder={placeholderLabel}
                    value={text}
                    onChange={(e) => setText(e.target.value)} 
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