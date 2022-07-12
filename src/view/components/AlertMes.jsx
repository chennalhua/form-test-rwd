import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap'
const AlertMes = (props) => {
    let style = {
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px',
        zIndex: '10000'
    }
    return (
        <>
            <Alert show={props.show} variant={props.color}
                className='mx-auto text-center position-fixed fw-bolder col-8 col-md-6 col-lg-4' style={style}>
                {props.mes}
            </Alert>
        </>
    )
}
export default AlertMes