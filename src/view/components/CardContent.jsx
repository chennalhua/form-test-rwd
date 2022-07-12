import React, { useState } from 'react';
const CardContent = (props) => {
    console.log(props)
    return (
        <div className={`mb-5 ${props.className || ''}`}>
            {
                props.title === '' ? '' :
                    <h3 className='fw-bolder text-center'>{props.title}</h3>
            }
            {props.children}
        </div>
    )
}
export default CardContent