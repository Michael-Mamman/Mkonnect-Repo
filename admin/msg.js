import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [filter, setFilter] = useState('');
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted!', filter, message, messageType);
    try {
      await axios.post('/send', {
        messageType,
        filter,
        message,
        file,
      })
      .then(response => {
        console.log('Response from API:', response.data);
        if (response.data == true) {
          setSuccessMessage("Message sent successfully");
        } else {
          setErrorMessage("Message not sent successfully");
        }

        // Handle response data here if needed
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        setErrorMessage('Error occurred while sending message. Please try again.');
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Error occurred while sending message. Please try again.');
    }
  };
  



// message type
return  React.createElement('div', { style: {  padding: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)' } },

  React.createElement('label', { htmlFor: 'messageType', style: { display: 'block', marginBottom: '10px' } }, 'Type:'),
  React.createElement('select', {
    id: 'messageType',
    value: messageType,
    onChange: (e) => setMessageType(e.target.value),
    style: {width: '77%',  borderRadius: '5px', padding: '10px',marginBottom: '10px', border: '1px solid #ccc' } // Full width for the dropdown
  },
    React.createElement('option', { value: 'message' }, 'Message'),
    React.createElement('option', { value: 'template' }, 'Template Message'),
    React.createElement('option', { value: 'image' }, 'Image'),
    React.createElement('option', { value: 'video' }, 'Video'),

  ),


  
  // filter

  
  React.createElement('div', { style: { marginBottom: '20px' } },
    React.createElement('label', { htmlFor: 'filter', style: { display: 'block', marginBottom: '10px' } }, 'Filter:'),
    React.createElement('input', {
      type: 'text',
      id: 'filter',
      value: filter,
      onChange: (e) => setFilter(e.target.value),
      style: { width: '75%', borderRadius: '5px', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' } // Full width for the message input
    })
  ),

//   file url
    React.createElement('div', { style: { marginBottom: '20px' } },
    React.createElement('label', { htmlFor: 'file', style: { display: 'block', marginBottom: '10px' } }, 'Media Url:'),
    React.createElement('input', {
    type: 'text',
    id: 'file',
    value: file,
    onChange: (e) => setFile(e.target.value),
    style: { width: '75%', borderRadius: '5px', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' } // Full width for the message input
    })
    ),
  
//   message
  
  React.createElement('form', { onSubmit: handleSubmit,  },
    errorMessage && React.createElement('div', { style: { color: 'red', marginBottom: '10px', textAlign: 'center' } }, errorMessage),

    successMessage && React.createElement('div', { style: { color: 'green', marginBottom: '10px', } }, successMessage),
    React.createElement('div', { style: { marginBottom: '20px' } },
      React.createElement('label', { htmlFor: 'message', style: { display: 'block', marginBottom: '5px' } }, 'Message:'),
      React.createElement('textarea', {
        id: 'message',
        value: message,
        onChange: (e) => setMessage(e.target.value),
        required: true,
        rows: '5',
        cols: '30',
        style: { width: '75%', height: '150px', borderRadius: '5px', padding: '10px', border: '1px solid #ccc' } // Larger height for the filter input
      })
    ),


    // button
    React.createElement('button', { type: 'submit', style: { width: '77.1%', borderRadius: '5px', padding: '10px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' } }, 'Submit')
  )
)
};

export default Login;
