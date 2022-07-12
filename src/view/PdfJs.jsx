import React, { useState } from 'react';
import PDFJS from 'pdfjs'
import file from '../assets/document/人身.pdf'
const PDFjs = () => {
    return (
        <>
            <iframe src={file}></iframe>
        </>
    )
}
export default PDFjs